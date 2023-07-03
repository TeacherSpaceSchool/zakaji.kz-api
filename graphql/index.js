const { gql, ApolloServer,  } = require('apollo-server-express');
const { RedisPubSub } = require('graphql-redis-subscriptions');
const pubsub = new RedisPubSub();
module.exports.pubsub = pubsub;
const Ads = require('./ads');
const File = require('./file');
const DiscountClient = require('./discountClient');
const IntegrateOutShoro = require('./integrateOutShoro');
const Distributer = require('./distributer');
const Blog = require('./blog');
const SpecialPriceClient = require('./specialPriceClient');
const OutXMLAds = require('./outXMLAds');
const Category = require('./category');
const SubCategory = require('./subCategory');
const Returned = require('./returned');
const Organization = require('./organization');
const AgentHistoryGeo = require('./agentHistoryGeo');
const Contact = require('./contact');
const Faq = require('./faq');
const Merchandising = require('./merchandising');
const Client = require('./client');
const Employment = require('./employment');
const Auto = require('./auto');
const Item = require('./item');
const SubBrand = require('./subBrand');
const Form = require('./form');
const Basket = require('./basket');
const Order = require('./order');
const Equipment = require('./equipment');
const Passport = require('./passport');
const Route = require('./route');
const NotificationStatistic = require('./notificationStatistic');
const Statistic = require('./statistic');
const Subscriber = require('./subscriber');
const AgentRoute = require('./agentRoute');
const ReceiveData = require('./receiveData');
const Review = require('./review');
const ConnectionApplication = require('./connectionApplication');
const Lottery = require('./lottery');
const District = require('./district');
const Integrate1C = require('./integrate1C');
const Error = require('./error');
const DeliveryDate = require('./deliveryDate');
const { verifydeuserGQL } = require('../module/passport');
const { GraphQLScalarType } = require('graphql');
const ModelsError = require('../models/error');

const typeDefs = gql`
    scalar Date
    type Data {
       data: String
    }
    type Sort {
        name: String
        field: String
    }
    type Filter {
        name: String
        value: String
    }
    type Social {
        url: String
        image: String
    }
    ${District.type}
    ${Review.type}
    ${ConnectionApplication.type}
    ${Lottery.type}
    ${DeliveryDate.type}
    ${Error.type}
    ${AgentRoute.type}
    ${Distributer.type}
    ${Integrate1C.type}
    ${Ads.type}
    ${File.type}
    ${DiscountClient.type}
    ${ReceiveData.type}
    ${IntegrateOutShoro.type}
    ${Subscriber.type}
    ${NotificationStatistic.type}
    ${Faq.type}
    ${Merchandising.type}
    ${Auto.type}
    ${Equipment.type}
    ${Client.type}
    ${Organization.type}
    ${AgentHistoryGeo.type}
    ${Blog.type}
    ${SpecialPriceClient.type}
    ${OutXMLAds.type}
    ${Passport.type}
    ${Category.type}
    ${SubCategory.type}
    ${Returned.type}
    ${Employment.type}
    ${Item.type}
    ${SubBrand.type}
    ${Form.type}
    ${Contact.type}
    ${Basket.type}
    ${Order.type}
    ${Route.type}
    ${Statistic.type}
    type Mutation {
        ${Integrate1C.mutation}
        ${District.mutation}
        ${Review.mutation}
        ${ConnectionApplication.mutation}
        ${Lottery.mutation}
        ${DeliveryDate.mutation}
        ${Error.mutation}
        ${AgentRoute.mutation}
        ${Distributer.mutation}
        ${Ads.mutation}
        ${File.mutation}
        ${DiscountClient.mutation}
        ${ReceiveData.mutation}
        ${IntegrateOutShoro.mutation}
        ${Subscriber.mutation}
        ${NotificationStatistic.mutation}
        ${Faq.mutation}
        ${Merchandising.mutation}
        ${Auto.mutation}
        ${Equipment.mutation}
        ${Client.mutation}
        ${Organization.mutation}
        ${AgentHistoryGeo.mutation}
        ${Category.mutation}
        ${SubCategory.mutation}
        ${Returned.mutation}
        ${Blog.mutation}
        ${SpecialPriceClient.mutation}
        ${OutXMLAds.mutation}
        ${Passport.mutation}
        ${Employment.mutation}
        ${Item.mutation}
        ${SubBrand.mutation}
        ${Form.mutation}
        ${Contact.mutation}
        ${Basket.mutation}
        ${Order.mutation}
        ${Route.mutation}
        ${Statistic.mutation}
    }
    type Query {
        ${Integrate1C.query}
        ${District.query}
        ${Review.query}
        ${ConnectionApplication.query}
        ${Lottery.query}
        ${DeliveryDate.query}
        ${Error.query}
        ${AgentRoute.query}
        ${Distributer.query}
        ${Client.query}
        ${Faq.query}
        ${Merchandising.query}
        ${Auto.query}
        ${Equipment.query}
        ${Organization.query}
        ${AgentHistoryGeo.query}
        ${Ads.query}
        ${File.query}
        ${DiscountClient.query}
        ${ReceiveData.query}
        ${IntegrateOutShoro.query}
        ${Subscriber.query}
        ${NotificationStatistic.query}
        ${Category.query}
        ${SubCategory.query}
        ${Returned.query}
        ${Blog.query}
        ${SpecialPriceClient.query}
        ${OutXMLAds.query}
        ${Passport.query}
        ${Employment.query}
        ${Item.query}
        ${SubBrand.query}
        ${Form.query}
        ${Contact.query}
        ${Basket.query}
        ${Order.query}
        ${Route.query}
        ${Statistic.query}
    }
    type Subscription {
        ${Order.subscription}
        ${Returned.subscription}
    }
`;

const resolvers = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return new Date(value).getTime();
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(ast.value)
            }
            return null;
        },
    }),
    Query: {
        ...Integrate1C.resolvers,
        ...District.resolvers,
        ...Review.resolvers,
        ...ConnectionApplication.resolvers,
        ...Lottery.resolvers,
        ...DeliveryDate.resolvers,
        ...Error.resolvers,
        ...AgentRoute.resolvers,
        ...Distributer.resolvers,
        ...Faq.resolvers,
        ...Merchandising.resolvers,
        ...Auto.resolvers,
        ...Equipment.resolvers,
        ...Client.resolvers,
        ...Organization.resolvers,
        ...AgentHistoryGeo.resolvers,
        ...Blog.resolvers,
        ...SpecialPriceClient.resolvers,
        ...OutXMLAds.resolvers,
        ...Ads.resolvers,
        ...File.resolvers,
        ...DiscountClient.resolvers,
        ...ReceiveData.resolvers,
        ...IntegrateOutShoro.resolvers,
        ...Subscriber.resolvers,
        ...NotificationStatistic.resolvers,
        ...Passport.resolvers,
        ...Category.resolvers,
        ...Employment.resolvers,
        ...SubCategory.resolvers,
        ...Returned.resolvers,
        ...Item.resolvers,
        ...SubBrand.resolvers,
        ...Form.resolvers,
        ...Contact.resolvers,
        ...Basket.resolvers,
        ...Order.resolvers,
        ...Route.resolvers,
        ...Statistic.resolvers,
    },
    Mutation: {
        ...Integrate1C.resolversMutation,
        ...AgentRoute.resolversMutation,
        ...Review.resolversMutation,
        ...ConnectionApplication.resolversMutation,
        ...Lottery.resolversMutation,
        ...District.resolversMutation,
        ...DeliveryDate.resolversMutation,
        ...Error.resolversMutation,
        ...Distributer.resolversMutation,
        ...Faq.resolversMutation,
        ...Merchandising.resolversMutation,
        ...Client.resolversMutation,
        ...Auto.resolversMutation,
        ...Equipment.resolversMutation,
        ...Organization.resolversMutation,
        ...AgentHistoryGeo.resolversMutation,
        ...Category.resolversMutation,
        ...SubCategory.resolversMutation,
        ...Returned.resolversMutation,
        ...Blog.resolversMutation,
        ...SpecialPriceClient.resolversMutation,
        ...OutXMLAds.resolversMutation,
        ...Ads.resolversMutation,
        ...File.resolversMutation,
        ...DiscountClient.resolversMutation,
        ...ReceiveData.resolversMutation,
        ...IntegrateOutShoro.resolversMutation,
        ...Subscriber.resolversMutation,
        ...NotificationStatistic.resolversMutation,
        ...Employment.resolversMutation,
        ...Passport.resolversMutation,
        ...Item.resolversMutation,
        ...SubBrand.resolversMutation,
        ...Form.resolversMutation,
        ...Contact.resolversMutation,
        ...Basket.resolversMutation,
        ...Order.resolversMutation,
        ...Route.resolversMutation,
        ...Statistic.resolversMutation,
    },
    Subscription: {
        ...Order.resolversSubscription,
        ...Returned.resolversSubscription
    }
};

const run = (app)=>{
    const server = new ApolloServer({
        playground: false,
        typeDefs,
        resolvers,
        subscriptions: {
            keepAlive: 1000,
            onConnect: async (connectionParams) => {
                if (connectionParams&&connectionParams.authorization) {
                    let user = await verifydeuserGQL({headers: {authorization: connectionParams.authorization}}, {})
                    return {
                        user: user,
                    }
                }
                else return {
                    user: {}
                }
                //throw new Error('Missing auth token!');
            },
            onDisconnect: (webSocket, context) => {
                // ...
            },
        },
        context: async (ctx) => {
            //console.log(ctx)
            if (ctx.connection) {
                return ctx.connection.context;
            }
            else if(ctx&&ctx.req) {
                ctx.res.header('ACCEPT-CH', 'UA-Full-Version, UA-Mobile, UA-Model, UA-Arch, UA-Platform, ECT, Device-Memory, RTT');
                let user = await verifydeuserGQL(ctx.req, ctx.res)
                return {req: ctx.req, res: ctx.res, user: user};
            }
        },
        formatError: (err) => {
            console.error(err)

            let _object = new ModelsError({
                err: `gql: ${err.message}`,
                path: JSON.stringify(err.path)
            });
            ModelsError.create(_object)

            return err;
        }
    })
    server.applyMiddleware({ app, path : '/graphql', cors: false })
    return server
    //server.listen().then(({ url }) => {console.log(`🚀  Server ready at ${url}`);});
}

module.exports.run = run;
