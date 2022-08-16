const ErrorAzyk = require('../models/errorAzyk');

const type = `
  type Error {
    _id: ID
    createdAt: Date
    err: String
    path: String
  }
`;

const query = `
    errors: [Error]
`;

const mutation = `
    clearAllErrors: Data
`;

const resolvers = {
    errors: async(parent, ctx, {user}) => {
        if('admin'===user.role){
            return await ErrorAzyk.find().sort('-createdAt').lean()
        }
    }
};

const resolversMutation = {
    clearAllErrors: async(parent, ctx, {user}) => {
        if('admin'===user.role){
            await ErrorAzyk.deleteMany()
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;