const AgentRoute = require('../models/agentRoute');
const District = require('../models/district');
const mongoose = require('mongoose');

const type = `
  type AgentRoute {
      _id: ID
      createdAt: Date
      organization: Organization
      clients: [[ID]],
      name: String
      district: District
  }
`;

const query = `
    agentRoutes(organization: ID, search: String!): [AgentRoute]
    agentRoute(_id: ID!): AgentRoute
    districtsWithoutAgentRoutes(organization: ID): [District]
`;

const mutation = `
    addAgentRoute(organization: ID, clients: [[ID]]!, name: String!, district: ID): Data
    setAgentRoute(_id: ID!, clients: [[ID]], name: String): Data
    deleteAgentRoute(_id: [ID]!): Data
`;

const resolvers = {
    agentRoutes: async(parent, {organization, search}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'admin' ].includes(user.role)) {
            let _districts;
            if (search.length > 0) {
                _districts = await District.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id').lean()
            }
            let districts
            if ('менеджер' === user.role) {
                districts = await District
                    .find({manager: user.employment})
                    .distinct('_id')
                    .lean()
            }
            return await AgentRoute
                .find({
                    organization: user.organization ? user.organization : organization === 'super' ? null : organization,
                    ...'менеджер' === user.role ? {district: {$in: districts}} : {},
                    ...(search.length > 0 ? {
                            $or: [
                                {name: {'$regex': search, '$options': 'i'}},
                                {district: {$in: _districts}},
                            ]
                        }
                        : {})
                })
                .select('_id createdAt organization name district')
                .populate({
                    path: 'district',
                    select: 'name _id'
                })
                .populate({
                    path: 'organization',
                    select: 'name _id'
                })
                .lean()
        }
    },
    districtsWithoutAgentRoutes: async(parent, { organization }, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'admin' ].includes(user.role)) {
            let districts = await AgentRoute
                .find({organization: organization === 'super' ? null : organization})
                .distinct('district')
                .lean()
            districts = await District
                .find({
                    ...'менеджер' === user.role ? {manager: user.employment} : {},
                    _id: {$nin: districts},
                    organization: user.organization ? user.organization : organization === 'super' ? null : organization
                })
                .select('_id createdAt organization client name ')
                .populate({path: 'client', select: '_id image createdAt name address lastActive device notification city phone user', populate: [{path: 'user', select: 'status'}]})
                .populate({path: 'organization', select: 'name _id'})
                .sort('-name')
                .lean()
            return districts
        }
    },
    agentRoute: async(parent, {_id}, {user}) => {
        if(['суперорганизация', 'организация', 'агент', 'суперагент', 'менеджер', 'admin', ].includes(user.role)) {
            let districts
            if ('менеджер' === user.role) {
                districts = await District
                    .find({manager: user.employment})
                    .distinct('_id')
                    .lean()
            }
            else if (['агент', 'суперагент'].includes(user.role)) {
                districts = await District
                    .findOne({agent: user.employment})
                    .select('_id')
                    .lean()
            }
            return await AgentRoute.findOne({
                ...mongoose.Types.ObjectId.isValid(_id)?{_id: _id}:{},
                ...user.organization ? {organization: user.organization} : {},
                ...'менеджер' === user.role ?
                    {district: {$in: districts}}
                    :
                    ['агент', 'суперагент'].includes(user.role) ?
                        {district: districts._id}
                        :
                        {}
            })
                .populate({path: 'district', select: 'name _id client', populate: [{path: 'client', select: '_id image createdAt name address lastActive device notification city phone user category', populate: [{path: 'user', select: 'status'}]}]})
                .populate({path: 'organization', select: 'name _id'})
                .lean()
        }
    }
};

const resolversMutation = {
    addAgentRoute: async(parent, {organization, clients, name, district}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер'].includes(user.role)) {
            let _object = new AgentRoute({
                name: name,
                district: district,
                organization: organization!=='super'?organization:undefined,
                clients: clients,
            });
            await AgentRoute.create(_object)
        }
        return {data: 'OK'};
    },
    setAgentRoute: async(parent, {_id, clients, name}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(user.role)) {
            let object = await AgentRoute.findById(_id)
            if(name)object.name = name
            if(clients)object.clients = clients
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteAgentRoute: async(parent, { _id }, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер'].includes(user.role))
            await AgentRoute.deleteMany({_id: {$in: _id}, ...user.organization?{organization: user.organization}:{}})
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;