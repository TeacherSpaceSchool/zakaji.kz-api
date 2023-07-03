const District = require('../models/district');
const Organization = require('../models/organization');
const mongoose = require('mongoose');
const Client = require('../models/client');
const Item = require('../models/item');
const Order = require('../models/order');
const AgentRoute = require('../models/agentRoute');
const Employment = require('../models/employment');
const User = require('../models/user');
const OutXMLAdsShoro = require('../models/integrate/shoro/outXMLAdsShoro');

const type = `
  type District {
      _id: ID
      createdAt: Date
      organization: Organization
      client: [Client]
      name: String
      agent: Employment
      ecspeditor: Employment
      manager: Employment
  }
`;

const query = `
    districts(organization: ID, search: String!, sort: String!): [District]
    district(_id: ID): District
    sortDistrict: [Sort]
    clientsWithoutDistrict(organization: ID, city: String): [Client]
`;

const mutation = `
    addDistrict(organization: ID, client: [ID]!, name: String!, agent: ID, manager: ID, ecspeditor: ID, city: String): Data
    setDistrict(_id: ID!, client: [ID], name: String, agent: ID, manager: ID, ecspeditor: ID): Data
    deleteDistrict(_id: [ID]!): Data
`;

const resolvers = {
    districts: async(parent, {organization, search, sort}, {user}) => {
        if(['суперорганизация', 'организация', 'admin', 'менеджер', 'агент', 'суперагент'].includes(user.role)) {
            let _organizations;
            let _clients;
            let _agents;
            if (search.length > 0) {
                _clients = await Client
                    .find({
                        $or: [
                            {name: {'$regex': search, '$options': 'i'}},
                            {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}}
                        ]
                    })
                    .distinct('_id')
                    .lean()
                _agents = await Employment.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id').lean()
                _organizations = await Organization.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id').lean()
            }
            return await District.find({
                organization: user.organization?user.organization: organization === 'super' ? null : organization,
                ...(search.length > 0 ? {
                    $or: [
                        {name: {'$regex': search, '$options': 'i'}},
                        {agent: {$in: _agents}},
                        {ecspeditor: {$in: _agents}},
                        {manager: {$in: _agents}},
                        {client: {$in: _clients}},
                        {organization: {$in: _organizations}}
                    ]
                } : {}),
                ...'менеджер' === user.role ? {manager: user.employment} : {},
                ...'агент' === user.role ? {agent: user.employment} : {},
            })
                .populate({
                    path: 'agent',
                    select: 'name _id'
                })
                .populate({
                    path: 'ecspeditor',
                    select: 'name _id'
                })
                .populate({
                    path: 'organization',
                    select: 'name _id'
                })
                .populate({
                    path: 'manager',
                    select: 'name _id'
                })
                .sort(sort)
                .lean()
        }
    },
    clientsWithoutDistrict: async(parent, { organization, city }, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(user.role)){
            let accessToClient = true
            let clients = []
            let usedClients = await District.find({organization: user.organization?user.organization:organization==='super'?null:organization}).distinct('client').lean()
            if(organization!=='super')
                accessToClient = (await Organization.findOne({_id: organization}).select('accessToClient').lean()).accessToClient
            if(!accessToClient){
                let items = await Item.find({organization: user.organization}).distinct('_id').lean()
                clients = await Order.find({item: {$in: items}}).distinct('client').lean()
            }

            clients = await Client
                .aggregate(
                    [
                        {
                            $match: {
                                $and: [
                                    {_id: { $nin: usedClients}},
                                    ...!accessToClient?[{_id: {$in: clients}}]:[],
                                    {name: {'$regex': '^((?!агент).)*$', '$options': 'i'}},
                                    {name: {'$regex': '^((?!agent).)*$', '$options': 'i'}}
                                ],
                                ...user.cities?{city: {$in: user.cities}}:{},
                                ...city ? {city: city} : {},
                                del: {$ne: 'deleted'},
                                address: {$elemMatch: {$elemMatch: {$ne: ''}}},
                            }
                        },
                        {
                            $lookup:
                                {
                                    from: User.collection.collectionName,
                                    let: {user: '$user'},
                                    pipeline: [
                                        {$match: {$expr: {$eq: ['$$user', '$_id']}}},
                                    ],
                                    as: 'user'
                                }
                        },
                        {
                            $unwind: {
                                preserveNullAndEmptyArrays: true, // this remove the object which is null
                                path: '$user'
                            }
                        },
                        {
                            $match: {
                                'user.status': 'active'
                            }
                        },
                    ])
            return clients

        }
    },
    district: async(parent, {_id}, {user}) => {
        if(['суперорганизация', 'организация', 'admin', 'менеджер', 'агент', 'суперагент'].includes(user.role)) {
            return await District.findOne({
                ...mongoose.Types.ObjectId.isValid(_id)?{_id: _id}:{},
                ...user.organization?{organization: user.organization}:{},
                ...'менеджер'===user.role?{manager: user.employment}:{},
                ...['агент', 'суперагент'].includes(user.role)?{agent: user.employment}:{},
            })
                .populate({
                    path: 'agent',
                    select: 'name _id'
                })
                .populate({path: 'client', select: '_id image createdAt name address lastActive device notification city phone user category', populate: [{path: 'user', select: 'status'}]})
                .populate({
                    path: 'ecspeditor',
                    select: 'name _id'
                })
                .populate({
                    path: 'organization',
                    select: 'name _id cities'
                })
                .populate({
                    path: 'manager',
                    select: 'name _id'
                })
                .lean()
        }
    },
    sortDistrict: async() => {
        let sort = [
            {
                name: 'Имя',
                field: 'name'
            }
        ]
        return sort
    },
};

const resolversMutation = {
    addDistrict: async(parent, {organization, client, name, agent, ecspeditor, manager}, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)){
            let _object = new District({
                name: name,
                client: client,
                agent: agent,
                ecspeditor: ecspeditor,
                organization: user.organization?user.organization:organization!=='super'?organization:undefined,
                manager: manager,
            });
            await District.create(_object)
        }
        return {data: 'OK'};
    },
    setDistrict: async(parent, {_id, client, ecspeditor, name, agent, manager}, {user}) => {
        let object = await District.findById(_id)
        if(object&&['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(user.role)){
            if(name)object.name = name
            if(client){
                let objectAgentRoute = await AgentRoute.findOne({district: object._id})
                if(objectAgentRoute){
                    for(let i=0; i<object.client.length; i++) {
                        if(!client.includes(object.client[i].toString())){
                            for(let i2=0; i2<7; i2++) {
                                let index = objectAgentRoute.clients[i2].indexOf(object.client[i].toString())
                                if(index!==-1)
                                    objectAgentRoute.clients[i2].splice(index, 1)
                            }
                            await objectAgentRoute.save()
                        }
                    }
                }
                object.client = client
                object.markModified('client');
            }
            if(agent)object.agent = agent
            if(ecspeditor)object.ecspeditor = ecspeditor
            if(manager)object.manager = manager
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteDistrict: async(parent, { _id }, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)) {
            let objects = await District.find({
                _id: {$in: _id},
                ...user.organization?{organization: user.organization}:{}
            }).select('_id').lean()
            for(let i=0; i<objects.length; i++){
                await District.deleteMany({_id: objects[i]._id})
                await AgentRoute.deleteMany({district: objects[i]._id})
                await OutXMLAdsShoro.deleteMany({district: objects[i]._id})
            }
        }

        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;