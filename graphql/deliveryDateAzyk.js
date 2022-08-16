const DeliveryDate = require('../models/deliveryDateAzyk');
const SubBrandAzyk = require('../models/subBrandAzyk');

const type = `
  type DeliveryDate {
    _id: ID
    createdAt: Date
    client: ID
    days: [Boolean]
    organization: ID
    priority: Int
  }
`;

const query = `
    deliveryDates(clients: [ID]!, organization: ID!): [DeliveryDate]
    deliveryDate(client: ID!, organization: ID!): DeliveryDate
`;

const mutation = `
    setDeliveryDates(clients: [ID]!, organization: ID!, days: [Boolean]!, priority: Int!): Data
`;

const resolvers = {
    deliveryDates: async(parent, {clients, organization}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'агент', 'admin'].includes(user.role)) {
            return await DeliveryDate.find({client: {$in: clients}, organization:user.organization?user.organization: organization==='super'?null:organization}).lean()
        }
    },
    deliveryDate: async(parent, {client, organization}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'агент', 'admin', 'client'].includes(user.role)) {
            if(user.organization)
                organization = user.organization
            else {
                let subbrand = await SubBrandAzyk.findOne({_id: organization}).select('organization').lean()
                if(subbrand)
                    organization = subbrand.organization
            }
            return await DeliveryDate.findOne({client, organization}).lean()
        }
    }
};

const resolversMutation = {
    setDeliveryDates: async(parent, {clients, organization, days, priority}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'агент', 'admin'].includes(user.role)){
            for(let i=0; i<clients.length; i++){
                let deliveryDate = await DeliveryDate.findOne({client: clients[i], organization: user.organization?user.organization:organization==='super'?null:organization});
                if(!deliveryDate){
                    let _object = new DeliveryDate({
                        days: days,
                        priority: priority,
                        client: clients[i],
                        organization: organization==='super'?null:organization
                    });
                    await DeliveryDate.create(_object)
                }
                else {
                    deliveryDate.days = days;
                    deliveryDate.priority = priority;
                    await deliveryDate.save();
                }
            }

        }
        return {data: 'OK'};
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;