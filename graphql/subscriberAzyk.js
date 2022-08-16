const ClientAzyk = require('../models/clientAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const SubscriberAzyk = require('../models/subscriberAzyk');

const type = `
  type Subscriber {
    _id: ID
    createdAt: Date
    user: String
    number: String
    status: String
  }
`;

const query = `
    subscribers: [Subscriber]
`;

const mutation = `
    deleteSubscriber(_id: [ID]!): Data
`;

const resolvers = {
    subscribers: async(parent, ctx, {user}) => {
        let res = []
        if('admin'===user.role){
            let findRes = await SubscriberAzyk
                .find({})
                .populate({ path: 'user' })
                .sort('-createdAt')
                .lean()
            for(let i=0; i<findRes.length; i++){
                res[i] = {
                    _id: findRes[i]._id,
                    createdAt: findRes[i].createdAt,
                    user: '',
                    number: findRes[i].number,
                    status: findRes[i].status
                }
                if(findRes[i].user){
                    if('admin'===findRes[i].user.role) {
                        res[i].user = 'admin'
                    }
                    else if('client'===findRes[i].user.role) {
                        let client = await ClientAzyk.findOne({user: findRes[i].user._id}).select('name address').lean()
                        if(client)
                            res[i].user=`${client.name}${client.address&&client.address[0]?` (${client.address[0][2]?`${client.address[0][2]}, `:''}${client.address[0][0]})`:''}`
                    }
                    else if(['суперагент', 'суперменеджер'].includes(findRes[i].user.role)) {
                        let employment = await EmploymentAzyk.findOne({user: findRes[i].user._id}).lean()
                        if(employment)
                            res[i].user = `${findRes[i].user.role} ${employment.name}`
                    }
                    else {
                        let employment = await EmploymentAzyk.findOne({user: findRes[i].user._id}).populate({ path: 'organization' }).lean()
                        if(employment)
                            res[i].user = `${employment.organization.name} ${findRes[i].user.role} ${employment.name}`
                    }
                }
                else {
                    res[i].user = 'неидентифицирован'
                }
            }
        }
        return res
    }
};

const resolversMutation = {
    deleteSubscriber: async(parent, { _id }, {user}) => {
        if('admin'===user.role){
            await SubscriberAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;