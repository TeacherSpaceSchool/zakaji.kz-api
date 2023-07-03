const ReceivedData = require('../models/receivedData');
const District = require('../models/district');
const Integrate1C = require('../models/integrate1C');
const Client = require('../models/client');
const AgentRoute = require('../models/agentRoute');
const User = require('../models/user');
const Organization = require('../models/organization');
const randomstring = require('randomstring');

const type = `
  type ReceivedData {
    _id: ID
    createdAt: Date
    organization: Organization
    guid: String
    name: String
    addres: String
    agent: String
    phone: String
    type: String
    status: String
    position: String
  }
`;

const query = `
    receivedDatas(search: String!, filter: String!, organization: ID!): [ReceivedData]
    filterReceivedData: [Filter]
`;

const mutation = `
    clearAllReceivedDatas(organization: ID!): Data
    deleteReceivedData(_ids: [ID]!): Data
    addReceivedDataClient(_id: ID!): Data
`;

const resolvers = {
    receivedDatas: async(parent, {search, filter, organization}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'admin'].includes(user.role)) {
            return await ReceivedData.find({
                organization: user.organization?user.organization:organization,
                type: {'$regex': filter, '$options': 'i'},
                ...search.length ? {
                    $or: [
                        {name: {'$regex': search, '$options': 'i'}},
                        {addres: {'$regex': search, '$options': 'i'}}
                    ]
                } : {},
            })
                .sort('-createdAt')
                .lean()
        }
    },
    filterReceivedData: async() => {
        let filter = [
            {
                name: 'Все',
                value: ''
            },
            {
                name: 'Сотрудники',
                value: 'сотрудник'
            },
            {
                name: 'Клиенты',
                value: 'клиент'
            }
        ]
        return filter
    },
};

const resolversMutation = {
    clearAllReceivedDatas: async(parent, {organization}, {user}) => {
        if('admin'===user.role){
            await ReceivedData.deleteMany({organization: organization})
        }
        return {data: 'OK'}
    },
    deleteReceivedData: async(parent, { _ids }, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'admin'].includes(user.role)) {
            await ReceivedData.deleteMany({_id: {$in: _ids}})
        }
        return {data: 'OK'}
    },
    addReceivedDataClient: async(parent, { _id }, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'admin'].includes(user.role)) {
            let receivedData = await ReceivedData.findOne({_id: _id}).lean()
            let integrate1C = await Integrate1C.findOne({
                organization: receivedData.organization,
                guid: receivedData.guid
            }).select('_id client').lean()
            if(!integrate1C){
                let district = await District.findOne({
                    agent: receivedData.agent
                })
                if(district) {
                    let organization = await Organization.findOne({_id: receivedData.organization}).select('_id cities').lean()
                    let _client = new User({
                        login: randomstring.generate(20),
                        role: 'client',
                        status: 'active',
                        password: '12345678',
                    });
                    _client = await User.create(_client);
                    _client = new Client({
                        name: receivedData.name ? receivedData.name : 'Новый',
                        phone: receivedData.phone,
                        city: organization.cities[0],
                        address: [[receivedData.addres ? receivedData.addres : '', '', receivedData.name ? receivedData.name : '']],
                        user: _client._id,
                        notification: false
                    });
                    _client = await Client.create(_client);
                    let _object = new Integrate1C({
                        item: null,
                        client: _client._id,
                        agent: null,
                        ecspeditor: null,
                        organization: receivedData.organization,
                        guid: receivedData.guid,
                    });
                    await Integrate1C.create(_object)
                    district.client.push(_client._id)
                    district.markModified('client');
                    await district.save()
                    await ReceivedData.deleteMany({_id: _id})
                }
                else return
            }
            else {
                let _client = await Client.findOne({_id: integrate1C.client});
                if(receivedData.name)
                    _client.name = receivedData.name
                _client.phone = receivedData.phone
                _client.address = [[receivedData.addres?receivedData.addres:'', '', receivedData.name?receivedData.name:'']]
                await _client.save()

                let newDistrict = await District.findOne({
                    agent: receivedData.agent
                })
                if(newDistrict&&!newDistrict.client.toString().includes(_client._id.toString())){
                    let oldDistrict = await District.findOne({
                        client: _client._id
                    })
                    if(oldDistrict){
                        let objectAgentRoute = await AgentRoute.findOne({district: oldDistrict._id})
                        if(objectAgentRoute){
                            for(let i=0; i<7; i++) {
                                let index = objectAgentRoute.clients[i].indexOf(_client._id.toString())
                                if(index!==-1)
                                    objectAgentRoute.clients[i].splice(index, 1)
                            }
                            objectAgentRoute.markModified('clients');
                            await objectAgentRoute.save()
                        }
                        for(let i=0; i<oldDistrict.client.length; i++) {
                            if(oldDistrict.client[i].toString()===_client._id.toString()){
                                oldDistrict.client.splice(i, 1)
                                break
                            }
                        }
                        oldDistrict.markModified('client');
                        await oldDistrict.save()
                    }

                    newDistrict.client.push(_client._id)
                    newDistrict.markModified('client');
                    await newDistrict.save()
                }

                await ReceivedData.deleteMany({_id: _id})
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