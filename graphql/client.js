const Client = require('../models/client');
const User = require('../models/user');
const Order = require('../models/order');
const Basket = require('../models/basket');
const Item = require('../models/item');
const Organization = require('../models/organization');
const District = require('../models/district');
const AgentRoute = require('../models/agentRoute');
const Integrate1C = require('../models/integrate1C');
const { deleteFile, urlMain, saveImage } = require('../module/const');
const { createJwtGQL } = require('../module/passport');
const mongoose = require('mongoose')
const uuidv1 = require('uuid/v1');

const type = `
  type Client {
    _id: ID
    image: String
    name: String
    createdAt: Date
    updatedAt: Date
    lastActive: Date
    email: String
    city: String
    address: [[String]]
    phone: [String]
    info: String
    reiting: Int
    user: Status
    device: String
    category: String
    del: String
    organization: Organization
    notification: Boolean
  }
`;

const query = `
    clientsSimpleStatistic(search: String!, filter: String!, date: String, city: String): [String]
    clients(search: String!, sort: String!, filter: String!, date: String, skip: Int, city: String): [Client]
    clientsSync(search: String!, organization: ID!, skip: Int!, city: String): [Client]
    clientsSyncStatistic(search: String!, organization: ID!, city: String): String
    clientsTrashSimpleStatistic(search: String!): [String]
    clientsTrash(search: String!, skip: Int): [Client]
    client(_id: ID!): Client
    sortClient: [Sort]
    filterClient: [Filter]
`;

const mutation = `
    clearClientsSync(organization: ID!): Data
    addClient(category: String!, image: Upload, name: String!, email: String, city: String!, address: [[String]]!, phone: [String]!, info: String, password: String!, login: String!): Data
    setClient(category: String, _id: ID!, device: String, image: Upload, name: String, city: String, phone: [String], login: String, email: String, address: [[String]], info: String, newPass: String): Data
    deleteClient(_id: [ID]!): Data
    restoreClient(_id: [ID]!): Data
    onoffClient(_id: [ID]!): Data
`;

const resolvers = {
    clientsTrashSimpleStatistic: async(parent, {search}, {user}) => {
        if(user.role==='admin'){
            let clients = await Client
                .aggregate(
                    [
                        {
                            $match:{
                                del: 'deleted',
                                user: {$ne: null},
                                $or: [
                                    {name: {'$regex': search, '$options': 'i'}},
                                    {email: {'$regex': search, '$options': 'i'}},
                                    {info: {'$regex': search, '$options': 'i'}},
                                    {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                                ]
                            }
                        },
                        {
                            $count :  'clientCount'
                        }
                    ])
            return [clients[0]?clients[0].clientCount.toString():'0']
        }
    },
    clientsSimpleStatistic: async(parent, {search, date, filter, city}, {user}) => {
        if(['менеджер', 'экспедитор', 'агент', 'суперагент', 'admin', 'суперорганизация', 'организация'].includes(user.role)) {
            let dateStart;
            let dateEnd;
            let accessToClient = true
            if(date&&date!==''){
                dateStart = new Date(date)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            let clients
            if(['менеджер', 'экспедитор', 'агент', 'суперагент'].includes(user.role)) {
                clients = await District
                    .find({$or: [{manager: user.employment}, {ecspeditor: user.employment}, {agent: user.employment}]})
                    .distinct('client')
                    .lean()
                if(user.onlyIntegrate){
                    clients = await Integrate1C
                        .find({client: {$in: clients}, organization: user.organization})
                        .distinct('client')
                        .lean()
                }
            }
            else if(['суперорганизация', 'организация'].includes(user.role)) {
                accessToClient = (await Organization.findOne({_id: user.organization}).select('accessToClient').lean()).accessToClient
                if(!accessToClient){
                    let items = await Item.find({organization: user.organization}).distinct('_id').lean()
                    clients = await Order.find({item: {$in: items}}).distinct('client').lean()
                }
            }
            clients = await Client
                .aggregate(
                    [
                        {
                            $match:{
                                ...city?{city: city}:{},
                                ...user.cities?{city: {$in: user.cities}}:{},
                                ...(filter==='Выключенные'?{image: {$ne: null}}:{}),
                                ...(filter==='Без геолокации'?{address: {$elemMatch: {$elemMatch: {$eq: ''}}}}:{}),
                                ...(['A','B','C','D','Horeca'].includes(filter)?{category: filter}:{}),
                                ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                                del: {$ne: 'deleted'},
                                ...['менеджер', 'экспедитор', 'агент', 'суперагент'].includes(user.role)||['суперорганизация', 'организация'].includes(user.role)&&!accessToClient?{_id: {$in: clients}}:{},
                                $or: [
                                    {name: {'$regex': search, '$options': 'i'}},
                                    {email: {'$regex': search, '$options': 'i'}},
                                    {info: {'$regex': search, '$options': 'i'}},
                                    {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}}
                                ]
                            }
                        },
                        ...(['Без геолокации', 'Выключенные'].includes(filter)?[
                                    { $lookup:
                                        {
                                            from: User.collection.collectionName,
                                            let: { user: '$user' },
                                            pipeline: [
                                                { $match: {$expr:{$eq:['$$user', '$_id']}} },
                                            ],
                                            as: 'user'
                                        }
                                    },
                                    {
                                        $unwind:{
                                            preserveNullAndEmptyArrays : true, // this remove the object which is null
                                            path : '$user'
                                        }
                                    },
                                    {
                                        $match:{
                                            'user.status': filter==='Выключенные'?'deactive':'active'
                                        }
                                    }
                                ]
                                :
                                []
                        ),
                        {
                            $count :  'clientCount'
                        }
                    ])
            return [clients[0]?clients[0].clientCount.toString():'0']
        }
    },
    clientsTrash: async(parent, {search, skip}, {user}) => {
        if(user.role==='admin'){
            let clients = await Client
                .aggregate(
                    [
                        {
                            $match:{
                                del: 'deleted',
                                user: {$ne: null},
                                $or: [
                                    {name: {'$regex': search, '$options': 'i'}},
                                    {email: {'$regex': search, '$options': 'i'}},
                                    {info: {'$regex': search, '$options': 'i'}},
                                    {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}}
                                ]
                            }
                        },
                        { $sort : {'createdAt': -1} },
                        { $skip : skip!=undefined?skip:0 },
                        { $limit : skip!=undefined?15:10000000000 },
                        { $lookup:
                            {
                                from: User.collection.collectionName,
                                let: { user: '$user' },
                                pipeline: [
                                    { $match: {$expr:{$eq:['$$user', '$_id']}} },
                                ],
                                as: 'user'
                            }
                        },
                        {
                            $unwind:{
                                preserveNullAndEmptyArrays : true, // this remove the object which is null
                                path : '$user'
                            }
                        }
                    ])
            return clients
        }
    },
    clientsSyncStatistic: async(parent, {search, organization, city}, {user}) => {
        if(user.role==='admin'){
            let clients = await Client.find({
                sync: organization.toString(),
                ...city?{city}:{},
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {email: {'$regex': search, '$options': 'i'}},
                    {info: {'$regex': search, '$options': 'i'}},
                    {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}}
                ]
            })
                .distinct('_id')
                .lean()
            return clients.length.toString()
        }
    },
    clientsSync: async(parent, {search, organization, skip, city}, {user}) => {
        if(user.role==='admin'){
            let clients = await Client
                .aggregate(
                    [
                        {
                            $match:{
                                ...city?{city}:{},
                                sync: organization.toString(),
                                $or: [
                                    {name: {'$regex': search, '$options': 'i'}},
                                    {email: {'$regex': search, '$options': 'i'}},
                                    {info: {'$regex': search, '$options': 'i'}},
                                    {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}}
                                ]
                            }
                        },
                        { $skip : skip!=undefined?skip:0 },
                        { $limit : skip!=undefined?15:10000000000 },
                        { $lookup:
                            {
                                from: User.collection.collectionName,
                                let: { user: '$user' },
                                pipeline: [
                                    { $match: {$expr:{$eq:['$$user', '$_id']}} },
                                ],
                                as: 'user'
                            }
                        },
                        {
                            $unwind:{
                                preserveNullAndEmptyArrays : true, // this remove the object which is null
                                path : '$user'
                            }
                        }
                    ])
            return clients
        }
    },
    clients: async(parent, {search, sort, date, skip, filter, city}, {user}) => {
        let dateStart;
        let dateEnd;
        let accessToClient = true
        let clients
        let _sort = {}
        if(date&&date!==''){
            dateStart = new Date(date)
            dateStart.setHours(3, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
        }
        _sort[sort[0]==='-'?sort.substring(1):sort]=sort[0]==='-'?-1:1
        if(['менеджер', 'экспедитор', 'агент', 'суперагент'].includes(user.role)) {
            clients = await District
                .find({$or: [{manager: user.employment}, {ecspeditor: user.employment}, {agent: user.employment}]})
                .distinct('client')
                .lean()
            if(user.onlyIntegrate){
                clients = await Integrate1C
                    .find({client: {$in: clients}, organization: user.organization})
                    .distinct('client')
                    .lean()
            }
        }
        else if(['суперорганизация', 'организация', 'мерчендайзер'].includes(user.role)) {
            accessToClient = (await Organization.findOne({_id: user.organization}).select('accessToClient').lean()).accessToClient
            if(!accessToClient){
                let items = await Item.find({organization: user.organization}).distinct('_id').lean()
                clients = await Order.find({item: {$in: items}}).distinct('client').lean()
            }
        }
        if(skip != undefined||search.length>2) {
            return await Client
                .aggregate(
                    [
                        {
                            $match: {
                                ...(['A', 'B', 'C', 'D', 'Horeca'].includes(filter) ? {category: filter} : {}),
                                ...(filter === 'Выключенные' ? {image: {$ne: null}} : {}),
                                ...(filter === 'Без геолокации' ? {address: {$elemMatch: {$elemMatch: {$eq: ''}}}} : {}),
                                ...(!date || date === '' ? {} : {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}),
                                ...city ? {city: city} : {},
                                ...user.cities?{city: {$in: user.cities}}:{},
                                ...['менеджер', 'экспедитор'].includes(user.role)||['агент', 'суперагент'].includes(user.role)&&(clients.length||search.length<3)||['суперорганизация', 'организация', 'мерчендайзер'].includes(user.role)&&!accessToClient ? {_id: {$in: clients}} : {},
                                del: {$ne: 'deleted'},
                                $or: [
                                    {name: {'$regex': search, '$options': 'i'}},
                                    {email: {'$regex': search, '$options': 'i'}},
                                    {info: {'$regex': search, '$options': 'i'}},
                                    {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}}
                                ]
                            }
                        },
                        {$sort: _sort},
                        ...(['Без геолокации', 'Выключенные'].includes(filter) ? [
                                    {
                                        $lookup:
                                            {
                                                from: User.collection.collectionName,
                                                let: {user: '$user'},
                                                pipeline: [
                                                    {$match: {$expr: {$eq: ['$$user', '$_id']}}},
                                                ],
                                                as: 'user'
                                            }
                                    },
                                    {
                                        $unwind: {
                                            preserveNullAndEmptyArrays: true, // this remove the object which is null
                                            path: '$user'
                                        }
                                    },
                                    {
                                        $match: {
                                            'user.status': filter === 'Выключенные' ? 'deactive' : 'active'
                                        }
                                    },
                                    {$skip: skip != undefined ? skip : 0},
                                    {$limit: skip != undefined ? 15 : 10000000000},
                                ]
                                :
                                [
                                    {$skip: skip != undefined ? skip : 0},
                                    {$limit: skip != undefined ? 15 : 10000000000},
                                    {
                                        $lookup:
                                            {
                                                from: User.collection.collectionName,
                                                let: {user: '$user'},
                                                pipeline: [
                                                    {$match: {$expr: {$eq: ['$$user', '$_id']}}},
                                                ],
                                                as: 'user'
                                            }
                                    },
                                    {
                                        $unwind: {
                                            preserveNullAndEmptyArrays: true, // this remove the object which is null
                                            path: '$user'
                                        }
                                    }
                                ]
                        )
                    ])
        }
    },
    client: async(parent, {_id}, {user}) => {
        if (user.role === 'client')
            _id = user._id
        if(mongoose.Types.ObjectId.isValid(_id)) {
            return await Client.findOne({
                $or: [
                    {_id: _id},
                    {user: _id}
                ]
            }).populate({path: 'user'}).lean()
        }
        else return null
    },
    sortClient: async(parent, ctx, {user}) => {
        let sort = [
        ]
        if(['суперорганизация', 'организация', 'менеджер', 'admin'].includes(user.role)) {
            sort = [
                {
                    name: 'Имя',
                    field: 'name'
                },
                {
                    name: 'Регистрация',
                    field: 'createdAt'
                },
                {
                    name: 'Активность',
                    field: 'lastActive'
                },
                {
                    name: 'Уведомления',
                    field: 'notification'
                },
                {
                    name: 'Устройства',
                    field: 'device'
                }
            ]
        }
        return sort
    },
    filterClient: async() => {
            return await [
                {
                    name: 'Все',
                    value: ''
                },
                {
                    name: 'Без геолокации',
                    value: 'Без геолокации'
                },
                {
                    name: 'Выключенные',
                    value: 'Выключенные'
                },
                {
                    name: 'Horeca',
                    value: 'Horeca'
                },
                {
                    name: 'A',
                    value: 'A'
                },
                {
                    name: 'B',
                    value: 'B'
                },
                {
                    name: 'C',
                    value: 'C'
                },
                {
                    name: 'D',
                    value: 'D'
                }
            ]
    },
};

const resolversMutation = {
    addClient: async(parent, {image, name, email, city, address, phone, info, login, password, category}, {user}) => {
        if(user.role==='admin'||(user.addedClient&&['суперорганизация', 'организация', 'агент'].includes(user.role))) {
            let newUser = new User({
                login: login.trim(),
                role: 'client',
                status: 'active',
                password,
                category
            });
            newUser = await User.create(newUser);
            let client = {status: 'active', user: newUser._id, sync: []}
            if(name)client.name = name
            if(email)client.email = email
            if(city)client.city = city
            if(address)client.address = address
            if(phone)client.phone = phone
            if(info)client.info = info
            if (image) {
                let {stream, filename} = await image;
                filename = await saveImage(stream, filename)
                client.image = urlMain + filename
            }
            client.notification=false
            client = new Client(client);
            await Client.create(client);

            if(user.organization) {
                const integrate1C = new Integrate1C({
                    item: null,
                    client: client._id,
                    agent: null,
                    ecspeditor: null,
                    organization: user.organization,
                    guid: await uuidv1(),
                });
                await Integrate1C.create(integrate1C)
                if(user.role==='агент') {
                    const district = await District.findOne({
                        agent: user.employment
                    })
                    district.client.push(client._id)
                    district.markModified('client');
                    await district.save()
                }
            }
        }
        return {data: 'OK'}
    },
    setClient: async(parent, {_id, image, name, email, address, info, newPass, phone, login, city, device, category}, {user, res}) => {
        let object = await Client.findOne({_id: _id})
        if(
            ['суперорганизация', 'организация', 'агент', 'admin', 'суперагент', 'экспедитор'].includes(user.role)
        ) {
            if (image) {
                let {stream, filename} = await image;
                if(object.image&&object.image.includes(urlMain))
                    await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(name) object.name = name
            if(email) object.email = email
            if(address) object.address = address
            if(info) object.info = info
            if(city) object.city = city
            if(phone) object.phone = phone
            if(device) object.device = device
            if(category) object.category = category
            object.sync = []

            if(newPass||login){
                let objectUser = await User.findById(object.user)
                if(newPass)objectUser.password = newPass
                if(login)objectUser.login = login.trim()
                await objectUser.save()
                if(objectUser._id.toString()===user._id.toString())
                    await createJwtGQL(res, objectUser)
            }

            await object.save();
        }
        return {data: 'OK'}
    },
    deleteClient: async(parent, { _id }, {user}) => {
        let objects = await Client.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(user.role==='admin'){
                if(objects[i].image)
                    await deleteFile(objects[i].image)
                if(objects[i].user) {
                    let object = await User.findOne({_id: objects[i].user})
                    object.status = 'deactive'
                    await object.save()
                }
                objects[i].del = 'deleted'
                objects[i].sync = []
                await objects[i].save()
                let districts = await District.find({client: objects[i]._id})
                let index
                for(let i1=0; i1<districts.length; i1++) {
                    let agentRoutes = await AgentRoute.find({district: districts[i1]._id})
                    for(let i2=0; i2<agentRoutes.length; i2++) {
                        for(let i3=0; i3<7; i3++) {
                            index = agentRoutes[i2].clients[i3].indexOf(objects[i]._id.toString())
                            if(index!==-1)
                                agentRoutes[i2].clients[i3].splice(index, 1)
                        }
                        await agentRoutes[i2].save()
                    }
                    index = districts[i1].client.indexOf(objects[i]._id.toString())
                    if(index!==-1)
                        districts[i1].client.splice(index, 1)
                    await districts[i1].save()
                }
                await Basket.deleteMany({client: objects[i]._id})
                await Integrate1C.deleteMany({client: objects[i]._id})
            }
        }
        return {data: 'OK'}
    },
    clearClientsSync: async(parent, { organization }, {user}) => {
        if(user.role==='admin')
            await Client.updateMany({sync: organization.toString()}, {$pull: { sync: organization.toString()}});
        return {data: 'OK'}
    },
    restoreClient: async(parent, { _id }, {user}) => {
        let objects = await Client.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(
                user.role==='admin'
            ){
                if(objects[i].user) {
                    let object = await User.findOne({_id: objects[i].user})
                    object.status = 'active'
                    await object.save()
                }
                objects[i].del = null
                objects[i].sync = []
                await objects[i].save()
            }
        }
        return {data: 'OK'}
    },
    onoffClient: async(parent, { _id }, {user}) => {
        let objects = await Client.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(['агент', 'admin', 'суперагент', 'суперорганизация', 'организация'].includes(user.role)){
                let object = await User.findOne({_id: objects[i].user})
                object.status = object.status==='active'?'deactive':'active'
                object.sync = []
                await object.save()
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