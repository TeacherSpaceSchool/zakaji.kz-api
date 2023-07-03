const Distributer = require('../models/distributer');
const Organization = require('../models/organization');
const mongoose = require('mongoose');

const type = `
  type Distributer {
      _id: ID
      createdAt: Date
      distributer: Organization
      sales: [Organization]
      provider: [Organization]
  }
`;

const query = `
    distributers(sort: String!, search: String!): [Distributer]
    distributer(_id: ID!): Distributer
`;

const mutation = `
    addDistributer(distributer: ID!, sales: [ID], provider: [ID]): Data
    setDistributer(_id: ID!, sales: [ID], provider: [ID]): Data
    deleteDistributer(_id: [ID]!): Data
`;

const resolvers = {
    distributers: async(parent, {search, sort}, {user}) => {
        if(user.role==='admin'){
            let _organizations;
            if(search.length>0){
                _organizations = await Organization.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id').lean()
            }
            let distributers = await Distributer.find({
                distributer: {$in: _organizations}
            })
                .populate({
                    path: 'distributer',
                    select: 'name _id'
                })
                .populate({
                    path: 'sales',
                    select: 'name _id'
                })
                .sort(sort)
                .lean()
            return distributers
        }
    },
    distributer: async(parent, {_id}, {user}) => {
        if((mongoose.Types.ObjectId.isValid(_id)||_id==='super')){
            return await Distributer.findOne(
                _id!=='super'?
                    {$or:[{_id: user.organization?user.organization:_id}, {distributer: user.organization?user.organization:_id}]}
                    :
                    {distributer: null}
            )
                .populate({
                    path: 'distributer',
                    select: 'name _id'
                })
                .populate({
                    path: 'sales',
                    select: 'name _id'
                })
                .populate({
                    path: 'provider',
                    select: 'name _id'
                })
                .lean()
        }
        else return null
    },
};

const resolversMutation = {
    addDistributer: async(parent, {distributer, sales, provider}, {user}) => {
        if(['admin'].includes(user.role)){
            let _object = new Distributer({
                distributer: distributer!=='super'?distributer:null,
                sales: sales,
                provider: provider
            });
            await Distributer.create(_object)
        }
        return {data: 'OK'};
    },
    setDistributer: async(parent, {_id,  sales, provider}, {user}) => {
        let object = await Distributer.findById(_id)
        if(user.role==='admin') {
            if(sales)object.sales = sales
            if(provider)object.provider = provider
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteDistributer: async(parent, { _id }, {user}) => {
        if(user.role==='admin') {
            await Distributer.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;