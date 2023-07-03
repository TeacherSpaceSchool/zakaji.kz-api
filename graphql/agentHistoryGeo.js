const AgentHistoryGeo = require('../models/agentHistoryGeo');
const Invoice = require('../models/invoice');
const Employment = require('../models/employment');
const User = require('../models/user');
const {getGeoDistance, pdDDMMYYHHMM} = require('../module/const');

const type = `
  type AgentHistoryGeo {
    _id: ID
    createdAt: Date
    geo: String
    client: Client
    agent: Employment
  }
`;

const query = `
    agentHistoryGeos(organization: ID, agent: ID, date: String): Statistic
    agentMapGeos(agent: ID!, date: String): [[String]]
`;

const mutation = `
    addAgentHistoryGeo(client: ID!, geo: String!): Data
`;

const resolvers = {
    agentHistoryGeos: async(parent, {organization, agent, date}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'admin' ].includes(user.role)) {
            let dateStart = date?new Date(date):new Date()
            dateStart.setHours(3, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            let data = []
            let agents = []
            if (!agent) {
                if (organization !== 'super')
                    agents = await Employment.find({organization: organization}).distinct('_id').lean()
                else {
                    agents = await User.find({role: 'суперагент'}).distinct('_id').lean()
                    agents = await Employment.find({user: {$in: agents}}).distinct('_id').lean()
                }
            }

            let agentHistoryGeos = await AgentHistoryGeo.find({
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                ...(agent ? {agent: agent} : {agent: {$in: agents}})
            })
                .select('agent client _id createdAt geo')
                .populate({
                    path: 'client',
                    select: '_id name address'
                })
                .populate({
                    path: 'agent',
                    select: '_id name'
                })
                .sort('-createdAt')
                .lean()
            if (!agent) {
                let dataKey = {}
                for (let i = 0; i < agentHistoryGeos.length; i++) {
                    if (!dataKey[agentHistoryGeos[i].agent._id])
                        dataKey[agentHistoryGeos[i].agent._id] = {
                            _id: agentHistoryGeos[i].agent._id,
                            count: 0,
                            name: agentHistoryGeos[i].agent.name,
                            cancel: 0,
                            order: 0
                        }
                    dataKey[agentHistoryGeos[i].agent._id].count += 1
                    if (await Invoice.findOne({
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                            client: agentHistoryGeos[i].client._id,
                            del: {$ne: 'deleted'},
                            taken: true
                        }).select('_id').lean())
                        dataKey[agentHistoryGeos[i].agent._id].order += 1
                    else
                        dataKey[agentHistoryGeos[i].agent._id].cancel += 1
                }
                const keys = Object.keys(dataKey)
                for (let i = 0; i < keys.length; i++) {
                    data.push({
                        _id: dataKey[keys[i]]._id,
                        data: [
                            dataKey[keys[i]].name,
                            dataKey[keys[i]].count,
                            dataKey[keys[i]].order,
                            dataKey[keys[i]].cancel,
                        ]
                    })
                }
                return {
                    columns: ['агент', 'посещений', 'заказов', 'отказов'],
                    row: data
                };
            }
            else {
                for (let i = 0; i < agentHistoryGeos.length; i++) {
                    data.push({
                        _id: agentHistoryGeos[i]._id,
                        data: [
                            pdDDMMYYHHMM(agentHistoryGeos[i].createdAt),
                            `${agentHistoryGeos[i].client.name}${agentHistoryGeos[i].client.address && agentHistoryGeos[i].client.address[0] ? ` (${agentHistoryGeos[i].client.address[0][2] ? `${agentHistoryGeos[i].client.address[0][2]}, ` : ''}${agentHistoryGeos[i].client.address[0][0]})` : ''}`,
                            agentHistoryGeos[i].client.address[0][1] ? `${getGeoDistance(...(agentHistoryGeos[i].geo.split(', ')), ...(agentHistoryGeos[i].client.address[0][1].split(', ')))} м` : '-',
                            agentHistoryGeos[i].agent.name,
                            await Invoice.findOne({
                                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                                client: agentHistoryGeos[i].client._id,
                                del: {$ne: 'deleted'},
                                taken: true
                            })
                                .select('_id')
                                .sort('-createdAt')
                                .lean() ? 'заказ' : 'отказ'
                        ]
                    })
                }
                return {
                    columns: ['дата', 'клиент', 'растояние', 'агент', 'статус'],
                    row: data
                };
            }
        }
    },
    agentMapGeos: async(parent, {agent, date}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'admin' ].includes(user.role)) {
            let dateStart = date?new Date(date):new Date()
            dateStart.setHours(3, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            let data = []
            let take
            let agentHistoryGeos = await AgentHistoryGeo.find({
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                agent: agent
            })
                .select('agent client _id createdAt geo')
                .populate({
                    path: 'client',
                    select: '_id name address'
                })
                .populate({
                    path: 'agent',
                    select: '_id name'
                })
                .sort('-createdAt')
                .lean()
            for (let i = 0; i < agentHistoryGeos.length; i++) {
                take = await Invoice.findOne({
                    $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                    client: agentHistoryGeos[i].client._id,
                    del: {$ne: 'deleted'},
                    taken: true
                })
                    .select('_id')
                    .sort('-createdAt')
                    .lean()
                if(take&&agentHistoryGeos[i].client.address[0][1]){
                    data.push([
                        `агент ${agentHistoryGeos[i].client.name}${agentHistoryGeos[i].client.address&&agentHistoryGeos[i].client.address[0]?` (${agentHistoryGeos[i].client.address[0][2] ? `${agentHistoryGeos[i].client.address[0][2]}, ` : ''}${agentHistoryGeos[i].client.address[0][0]})` : ''}`,
                        agentHistoryGeos[i].geo,
                        '#FFFF00'
                    ])
                    data.push([
                        `${agentHistoryGeos[i].client.name}${agentHistoryGeos[i].client.address&&agentHistoryGeos[i].client.address[0]?` (${agentHistoryGeos[i].client.address[0][2] ? `${agentHistoryGeos[i].client.address[0][2]}, ` : ''}${agentHistoryGeos[i].client.address[0][0]})` : ''}`,
                        agentHistoryGeos[i].client.address[0][1],
                        '#4b0082'
                    ])
                }
                }
                return data
        }
    },
};

const resolversMutation = {
    addAgentHistoryGeo: async(parent, {client, geo}, {user}) => {
        if(['агент', 'суперагент'].includes(user.role)){
            let dateStart = new Date()
            dateStart.setHours(3, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            let _object = await AgentHistoryGeo.findOne({
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                client: client,
                agent: user.employment
            })
                .select('_id')
                .lean()
            if(!_object) {
                _object = new AgentHistoryGeo({
                    agent: user.employment,
                    client: client,
                    geo: geo
                })
                await AgentHistoryGeo.create(_object)
            }
        }
        return {data: 'OK'};
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;