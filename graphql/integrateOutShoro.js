const OutXMLShoro = require('../models/singleOutXML');
const OutXMLReturnedShoro = require('../models/singleOutXMLReturned');
const Integrate1C = require('../models/integrate1C');
const District = require('../models/district');
const Invoice = require('../models/invoice');
const Returned = require('../models/returned');

const type = `
  type OutXMLShoro{
    _id: ID
    createdAt: Date
    guid: String
    date: Date
    number: String
    client: String
    agent: String
    forwarder: String
    invoice: Invoice
    status: String
    organization: String
    exc: String
  }
  type OutXMLReturnedShoro{
    _id: ID
    createdAt: Date
    guid: String
    date: Date
    number: String
    client: String
    agent: String
     organization: String
   forwarder: String
    returned: Returned
    status: String
    exc: String
  }
`;

const query = `
    outXMLShoros(search: String!, filter: String!, skip: Int, organization: ID!): [OutXMLShoro]
    statisticOutXMLShoros(organization: ID!): [String]
    outXMLReturnedShoros(search: String!, filter: String!, skip: Int, organization: ID!): [OutXMLReturnedShoro]
    statisticOutXMLReturnedShoros(organization: ID!): [String]
    filterOutXMLShoro: [Filter]
`;

const mutation = `
    setDateOutXMLShoro(_id: ID!, date: String!): Data
    restoreOutXMLShoro(_id: ID!): OutXMLShoro
    deleteOutXMLShoro(_id: ID!): Data
    deleteOutXMLShoroAll(organization: ID!): Data
    setDateOutXMLReturnedShoro(_id: ID!, date: String!): Data
    restoreOutXMLReturnedShoro(_id: ID!): OutXMLReturnedShoro
    deleteOutXMLReturnedShoro(_id: ID!): Data
    deleteOutXMLReturnedShoroAll(organization: ID!): Data
`;

const resolvers = {
    outXMLShoros: async(parent, {search, filter, skip, organization}, {user}) => {
        if('admin'===user.role){
            let outXMLShoro = await OutXMLShoro
                .find({
                    status: {'$regex': filter, '$options': 'i'},
                    number: {'$regex': search, '$options': 'i'},
                    organization: organization
                })
                .sort('-createdAt')
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
            return outXMLShoro
        }
        else return []
    },
    statisticOutXMLShoros: async(parent, {organization}, {user}) => {
        if('admin'===user.role){
            let outXMLShoro = await OutXMLShoro
                .find({organization: organization}).lean()
            let procces = 0;
            let error = 0;
            let check = 0;
            for(let i=0; i<outXMLShoro.length; i++){
                if(outXMLShoro[i].status==='check')
                    check+=1
                else if(['update', 'create', 'del'].includes(outXMLShoro[i].status))
                    procces+=1
                else if(outXMLShoro[i].status==='error')
                    error+=1
            }

            return [check, procces, error]
        }
        else return []
    },
    statisticOutXMLReturnedShoros: async(parent, {organization}, {user}) => {
        if('admin'===user.role){
            let outXMLReturnedShoro = await OutXMLReturnedShoro
                .find({organization: organization})
                .select('status')
                .lean()
            let procces = 0;
            let error = 0;
            let check = 0;
            for(let i=0; i<outXMLReturnedShoro.length; i++){
                if(outXMLReturnedShoro[i].status==='check')
                    check+=1
                else if(['update', 'create', 'del'].includes(outXMLReturnedShoro[i].status))
                    procces+=1
                else if(outXMLReturnedShoro[i].status==='error')
                    error+=1
            }

            return [procces, check, error]
        }
        else return []
    },
    outXMLReturnedShoros: async(parent, {search, filter, skip, organization}, {user}) => {
        if('admin'===user.role){
            let outXMLShoro = await OutXMLReturnedShoro
                .find({
                    status: {'$regex': filter, '$options': 'i'},
                    number: {'$regex': search, '$options': 'i'},
                    organization: organization
                })
                .sort('-createdAt')
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?100:10000000000)
            return outXMLShoro
        }
        else return []
    },
    filterOutXMLShoro: async(parent, ctx, {user}) => {
        if('admin'===user.role)
            return [
                {
                    name: 'Все',
                    value: ''
                },
                {
                    name: 'Создан',
                    value: 'create'
                },
                {
                    name: 'Обновлен',
                    value: 'update'
                },
                {
                    name: 'На удаление',
                    value: 'del'
                },
                {
                    name: 'Выполнен',
                    value: 'check'
                },
                {
                    name: 'Ошибка',
                    value: 'error'
                }
            ]
        else return []
    }
};

const resolversMutation = {
    setDateOutXMLShoro: async(parent, {_id, date}, {user}) => {
        if('admin'===user.role){
            let object = await OutXMLShoro.findById(_id)
            object.date = new Date(date)
            object.status = 'update'
            await object.save();
        }
        return {data: 'OK'}
    },
    restoreOutXMLShoro: async(parent, { _id }, {user}) => {
        if('admin'===user.role){
            let object = await OutXMLShoro.findById(_id)
            let invoice = await Invoice.findOne({_id: object.invoice})
            let guidClient = await Integrate1C
                .findOne({client: invoice.client, organization: invoice.organization})
            if(guidClient) {
                let district = await District
                    .findOne({client: invoice.client, organization: invoice.organization})
                if(district) {
                    let guidAgent = await Integrate1C
                        .findOne({agent: district.agent})
                    let guidEcspeditor = await Integrate1C
                        .findOne({ecspeditor: district.ecspeditor})
                    if (guidAgent && guidEcspeditor) {
                        invoice.sync = 1
                        await invoice.save()
                        object.client = guidClient.guid
                        object.agent = guidAgent.guid
                        object.forwarder = guidEcspeditor.guid
                        object.status = 'update'
                    }
                }
            }
            await object.save();
            return object
        }
    },
    deleteOutXMLShoro: async(parent, { _id }, {user}) => {
        if('admin'===user.role){
            let object = await OutXMLShoro.findOne({_id: _id, status: {$ne: 'check'}})
            await Invoice.updateMany({_id: object._id}, {sync: 0});
            await OutXMLShoro.deleteMany({_id: _id})
        }
        return {data: 'OK'}
    },
    deleteOutXMLShoroAll: async(parent, {organization}, {user}) => {
        if('admin'===user.role){
            let objects = await OutXMLShoro.find({organization: organization, status: {$ne: 'check'}}).distinct('_id')
            await Invoice.updateMany({_id: {$in: objects}}, {sync: 0});
            await OutXMLShoro.deleteMany({status: {$ne: 'check'}})
        }
        return {data: 'OK'}
    },
    setDateOutXMLReturnedShoro: async(parent, {_id, date}, {user}) => {
        if('admin'===user.role){
            let object = await OutXMLReturnedShoro.findById(_id)
            object.date = new Date(date)
            object.status = 'update'
            await object.save();
        }
        return {data: 'OK'}
    },
    restoreOutXMLReturnedShoro: async(parent, { _id }, {user}) => {
        if('admin'===user.role){
            let object = await OutXMLReturnedShoro.findById(_id)
            let returned = await Returned.findOne({_id: object.returned})
            let guidClient = await Integrate1C
                .findOne({client: returned.client, organization: returned.organization})
            if(guidClient) {
                let district = await District
                    .findOne({client: returned.client, organization: returned.organization})
                if(district) {
                    let guidAgent = await Integrate1C
                        .findOne({agent: district.agent})
                    let guidEcspeditor = await Integrate1C
                        .findOne({ecspeditor: district.ecspeditor})
                    if (guidAgent && guidEcspeditor) {
                        returned.sync = 1
                        await returned.save()
                        object.client = guidClient.guid
                        object.agent = guidAgent.guid
                        object.forwarder = guidEcspeditor.guid
                        object.status = 'update'
                    }
                }
            }
            await object.save();
            return object
        }
    },
    deleteOutXMLReturnedShoro: async(parent, { _id }, {user}) => {
        if('admin'===user.role){
            let object = await OutXMLReturnedShoro.findOne({_id: _id, status: {$ne: 'check'}})
            await Returned.updateMany({_id: object._id}, {sync: 0});
            await OutXMLReturnedShoro.deleteMany({_id: _id})
        }
        return {data: 'OK'}
    },
    deleteOutXMLReturnedShoroAll: async(parent, {organization}, {user}) => {
        if('admin'===user.role){
            let objects = await OutXMLReturnedShoro.find({organization: organization, status: {$ne: 'check'}}).distinct('_id')
            await Returned.updateMany({_id: {$in: objects}}, {sync: 0});
            await OutXMLReturnedShoro.deleteMany({status: {$ne: 'check'}})
        }
        return {data: 'OK'}
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;