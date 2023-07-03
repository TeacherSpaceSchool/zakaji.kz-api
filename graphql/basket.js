const Basket = require('../models/basket');

const type = `
  type Basket {
    _id: ID
    createdAt: Date
    item: Item
    count: Int
    client: Client
    consignment: Int
  }
`;

const query = '';

const mutation = `
    addBasket(item: ID!, count: Int!, consignment: Int): Data
    deleteBasketAll: Data
`;

const resolvers = {
};

const resolversMutation = {
    addBasket: async(parent, {item, count, consignment}, {user}) => {
        if(['суперагент','суперорганизация', 'организация', 'менеджер', 'агент', 'client', 'экспедитор', 'суперэкспедитор'].includes(user.role)){
            let basket = await Basket.findOne(
                user.client?
                    {item: item, client: user.client}
                    :
                    {item: item, agent: user.employment}
                );
            if(!basket){
                let _object = new Basket({
                    item: item,
                    count: count
                });
                if(consignment)
                    _object.consignment = consignment
                if(user.client)
                    _object.client = user.client
                else
                    _object.agent = user.employment
                await Basket.create(_object)
            } else {
                basket.count = count;
                if(consignment)
                    basket.consignment = consignment
                await basket.save();
            }
        }
        return {data: 'OK'};
    },
    deleteBasketAll: async(parent, ctx, { user }) => {
        await Basket.deleteMany(
            user.client ?
                {client: user.client}
                    :
                { agent: user.employment})
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;