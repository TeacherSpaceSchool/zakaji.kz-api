const mongoose = require('mongoose');
const Organization = require('../models/organization');
const Auto = require('../models/auto');
const RepairEquipment = require('../models/repairEquipment');
const Employment = require('../models/employment');
const SubBrand = require('../models/subBrand');
const DeliveryDate = require('../models/deliveryDate');
const Distributer = require('../models/distributer');
const District = require('../models/district');
const Integrate1C = require('../models/integrate1C');
const AgentRoute = require('../models/agentRoute');
const Item = require('../models/item');
const Basket = require('../models/basket');
const User = require('../models/user');
const Ads = require('../models/ads');
const Plan = require('../models/plan');
const ModelsError = require('../models/error');
const { saveImage, saveFile, deleteFile, urlMain } = require('../module/const');

const type = `
  type Organization {
    _id: ID
    createdAt: Date
    name: String
    address: [String]
    email: [String]
    phone: [String]
    info: String
    miniInfo: String
    catalog: String
    reiting: Int
    status: String
    type: String
    image: String
    warehouse: String
    minimumOrder: Int
    accessToClient: Boolean
    unite: Boolean
    addedClient: Boolean
    superagent: Boolean
    consignation: Boolean
    onlyDistrict: Boolean
    dateDelivery: Boolean
    onlyIntegrate: Boolean
    autoAcceptAgent: Boolean
    autoAcceptNight: Boolean
    cities: [String]
    del: String
    priotiry: Int
    pass: String
    autoIntegrate: Boolean
  }
`;

const query = `
    brandOrganizations(search: String!, filter: String!, city: String): [Organization]
    organizations(search: String!, filter: String!, city: String): [Organization]
    organizationsTrash(search: String!): [Organization]
    organization(_id: ID!): Organization
    filterOrganization: [Filter]
`;

const mutation = `
    addOrganization(cities: [String]!, autoIntegrate: Boolean!, catalog: Upload, pass: String, warehouse: String!, miniInfo: String!, priotiry: Int, minimumOrder: Int, image: Upload!, name: String!, address: [String]!, email: [String]!, phone: [String]!, info: String!, accessToClient: Boolean!, consignation: Boolean!, addedClient: Boolean!, unite: Boolean!, superagent: Boolean!, onlyDistrict: Boolean!, dateDelivery: Boolean!, onlyIntegrate: Boolean!, autoAcceptAgent: Boolean!, autoAcceptNight: Boolean!): Data
    setOrganization(cities: [String], pass: String, autoIntegrate: Boolean, catalog: Upload, warehouse: String, miniInfo: String, _id: ID!, priotiry: Int, minimumOrder: Int, image: Upload, name: String, address: [String], email: [String], phone: [String], info: String, accessToClient: Boolean, consignation: Boolean, addedClient: Boolean, unite: Boolean, superagent: Boolean, onlyDistrict: Boolean, dateDelivery: Boolean, onlyIntegrate: Boolean, autoAcceptAgent: Boolean, autoAcceptNight: Boolean): Data
    restoreOrganization(_id: [ID]!): Data
    deleteOrganization(_id: [ID]!): Data
    onoffOrganization(_id: [ID]!): Data
`;

const resolvers = {
    brandOrganizations: async(parent, {search, filter, city}, {user}) => {
        if(['admin', 'экспедитор', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент', 'суперэкспедитор', 'client'].includes(user.role)){
            let organizationsRes = [], subBrands = [], onlyIntegrate, onlyDistrict, organizationId
            let brandOrganizations = await Item.find({
                ...user.role==='admin'?{}:{status: 'active'},
                del: {$ne: 'deleted'}
            }).select('organization subBrand').lean()
            subBrands = brandOrganizations.map(elem=>elem.subBrand)
            brandOrganizations = brandOrganizations.map(elem=>{
                if(user.role!=='client'||!elem.subBrand) return elem.organization
            })
            if(user.organization){
                brandOrganizations = await Distributer.findOne({
                    distributer: user.organization
                }).distinct('sales').lean()
                brandOrganizations = [...brandOrganizations, user.organization]
            }
            const organizations = await Organization.find({
                _id: {$in: brandOrganizations},
                name: {'$regex': search, '$options': 'i'},
                status: 'admin'===user.role?filter.length===0?{'$regex': filter, '$options': 'i'}:filter:'active',
                ...city?{cities: city}:{},
                del: {$ne: 'deleted'},
                ...['суперагент', 'суперэкспедитор'].includes(user.role)?{superagent: true}:{},
                ...user.city?{cities: user.city}:{}
            })
                .select('name autoAcceptAgent _id image miniInfo unite onlyIntegrate onlyDistrict priotiry catalog')
                .sort('-priotiry')
                .lean()
            /*?*/if(/*!user.organization*/true) {
                subBrands = await SubBrand.find({
                    _id: {$in: subBrands},
                    name: {'$regex': search, '$options': 'i'},
                    status: 'admin'===user.role?filter.length===0?{'$regex': filter, '$options': 'i'}:filter:'active',
                    ...city?{cities: city}:{},
                    del: {$ne: 'deleted'},
                    ...user.city?{cities: user.city}:{},
                    /*?*/...user.organization?{organization: user.organization}:{}
                })
                    .populate({
                        path: 'organization',
                        select: 'onlyIntegrate onlyDistrict _id unite autoAcceptAgent'
                    })
                    .sort('-priotiry')
                    .lean()
                for(let i = 0; i<subBrands.length;i++){
                    subBrands[i].type = 'subBrand'
                    subBrands[i].unite = subBrands[i].organization.unite
                    subBrands[i].autoAcceptAgent = subBrands[i].organization.autoAcceptAgent
                }
                organizationsRes = [...subBrands, ...organizations]
                organizationsRes = organizationsRes.sort(function (a, b) {
                    return b.priotiry - a.priotiry
                });
                if(user.role==='client') {
                    for (let i = 0; i < organizationsRes.length; i++) {
                        onlyIntegrate =  organizationsRes[i].organization?organizationsRes[i].organization.onlyIntegrate:organizationsRes[i].onlyIntegrate
                        onlyDistrict = organizationsRes[i].organization?organizationsRes[i].organization.onlyDistrict:organizationsRes[i].onlyDistrict
                        organizationId = organizationsRes[i].organization?organizationsRes[i].organization._id:organizationsRes[i]._id
                        if (onlyIntegrate && onlyDistrict) {
                            let district = await District.findOne({
                                client: user.client,
                                organization: organizationId
                            }).select('_id').lean()
                            let integrate = await Integrate1C.findOne({
                                client: user.client,
                                organization: organizationId
                            }).select('_id').lean()
                            if(!integrate||!district) {
                                organizationsRes.splice(i, 1)
                                i -= 1
                            }
                        }
                        else if (onlyDistrict) {
                            let district = await District.findOne({
                                client: user.client,
                                organization: organizationId
                            }).select('_id').lean()
                            if (!district) {
                                organizationsRes.splice(i, 1)
                                i -= 1
                            }
                        }
                        else if (onlyIntegrate) {
                            let integrate = await Integrate1C.findOne({
                                client: user.client,
                                organization: organizationId
                            }).select('_id').lean()
                            if (!integrate) {
                                organizationsRes.splice(i, 1)
                                i -= 1
                            }
                        }
                    }
                }
                return organizationsRes
            }
            else return organizations
        }
    },
    organizations: async(parent, {search, filter, city}, {user}) => {
        return await Organization.find({
            name: {'$regex': search, '$options': 'i'},
            ...user.role!=='admin'?{status:'active'}:filter.length?{status: filter}:{},
            ...city?{cities: city}:{},
            del: {$ne: 'deleted'}
        })
            .select('name _id image miniInfo')
            .sort('-priotiry')
            .lean()
    },
    organizationsTrash: async(parent, {search}, {user}) => {
        if(user.role==='admin'){
            return await Organization.find({
                name: {'$regex': search, '$options': 'i'},
                del: 'deleted'
            })
                .select('name _id image miniInfo')
                .sort('-createdAt')
                .lean()
        }
    },
    organization: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            let subBrand = await SubBrand.findOne({_id: _id}).select('organization name minimumOrder').lean()
            let organization = await Organization.findOne({
                _id: subBrand?subBrand.organization:_id
            })
                .lean()
            if(subBrand) {
                organization.name = `${subBrand.name} (${organization.name})`
                if(subBrand.minimumOrder) organization.minimumOrder = subBrand.minimumOrder
            }
            return organization
        }
    },
    filterOrganization: async(parent, ctx, {user}) => {
        if(user.role==='admin')
            return await [
                {
                    name: 'Все',
                    value: ''
                },
                {
                    name: 'Активные',
                    value: 'active'
                },
                {
                    name: 'Неактивные',
                    value: 'deactive'
                }
            ]
        else
            return await []
    },
};

const resolversMutation = {
    addOrganization: async(parent, {cities, autoIntegrate, catalog, addedClient, autoAcceptAgent, autoAcceptNight, dateDelivery, pass, warehouse, superagent, unite, miniInfo, priotiry, info, phone, email, address, image, name, minimumOrder, accessToClient, consignation, onlyDistrict, onlyIntegrate}, {user}) => {
        if(user.role==='admin'){
            let { stream, filename } = await image;
            filename = await saveImage(stream, filename)
            let objectOrganization = new Organization({
                image: urlMain+filename,
                name: name,
                status: 'active',
                address: address,
                email: email,
                phone: phone,
                info: info,
                minimumOrder: minimumOrder,
                reiting: 0,
                accessToClient: accessToClient,
                consignation: consignation,
                priotiry: priotiry,
                onlyDistrict: onlyDistrict,
                unite: unite,
                superagent: superagent,
                onlyIntegrate: onlyIntegrate,
                miniInfo: miniInfo,
                warehouse: warehouse,
                cities: cities,
                autoAcceptAgent,
                autoAcceptNight,
                dateDelivery,
                addedClient,
                autoIntegrate
            });
            if(catalog){
                let { stream, filename } = await catalog;
                objectOrganization.catalog = urlMain+(await saveFile(stream, filename))
            }
            if(pass)
                objectOrganization.pass = pass
            objectOrganization = await Organization.create(objectOrganization)
        }
        return {data: 'OK'};
    },
    setOrganization: async(parent, {catalog, cities, addedClient, autoIntegrate, dateDelivery, autoAcceptAgent, autoAcceptNight, pass, warehouse, miniInfo, superagent, unite, _id, priotiry, info, phone, email, address, image, name, minimumOrder, accessToClient, consignation, onlyDistrict, onlyIntegrate}, {user}) => {
        if(user.role==='admin'||(['суперорганизация', 'организация'].includes(user.role)&&user.organization.toString()===_id.toString())) {
            let object = await Organization.findById(_id)
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(catalog){
                if(object.catalog)
                    await deleteFile(object.catalog)
                let { stream, filename } = await catalog;
                object.catalog = urlMain+(await saveFile(stream, filename))
            }
            if(pass!==undefined) object.pass = pass
            if(cities) object.cities = cities
            if(name) object.name = name
            if(info) object.info = info
            if(phone) object.phone = phone
            if(email) object.email = email
            if(address) object.address = address
            if(warehouse) object.warehouse = warehouse
            if(superagent!=undefined) object.superagent = superagent
            if(unite!=undefined) object.unite = unite
            if(onlyDistrict!=undefined) object.onlyDistrict = onlyDistrict
            if(autoAcceptAgent!=undefined) object.autoAcceptAgent = autoAcceptAgent
            if(autoAcceptNight!=undefined) {
                let _object = new ModelsError({
                    err: `autoAcceptNight: ${object.autoAcceptNight} => ${autoAcceptNight}`,
                    path: 'setOrganization'
                });
                ModelsError.create(_object)
                object.autoAcceptNight = autoAcceptNight
            }
            if(dateDelivery!=undefined) object.dateDelivery = dateDelivery
            if(onlyIntegrate!=undefined) object.onlyIntegrate = onlyIntegrate
            if(priotiry!=undefined) object.priotiry = priotiry
            if(consignation!=undefined) object.consignation = consignation
            if(accessToClient!=undefined) object.accessToClient = accessToClient
            if(minimumOrder!=undefined) object.minimumOrder = minimumOrder
            if(miniInfo!=undefined) object.miniInfo = miniInfo
            if(addedClient!=undefined) object.addedClient = addedClient
            if(autoIntegrate!=undefined) object.autoIntegrate = autoIntegrate
            await object.save();
        }
        return {data: 'OK'}
    },
    restoreOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            await Organization.updateMany({_id: {$in: _id}}, {del: null, status: 'active'})
        }
        return {data: 'OK'}
    },
    deleteOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            for(let i=0; i<_id.length; i++) {
                let items = await Item.find({organization: _id[i]}).distinct('_id').lean()
                await Basket.deleteMany({item: {$in: items}})
                await Item.updateMany({organization: _id[i]}, {del: 'deleted', status: 'deactive'})
                let users = await Employment.find({organization: _id[i]}).distinct('user').lean()
                await User.updateMany({_id: {$in: users}}, {status: 'deactive'})
                await Employment.updateMany({organization: _id[i]}, {del: 'deleted'})
                await SubBrand.deleteMany({organization: _id[i]})
                await Integrate1C.deleteMany({organization: _id[i]})
                await AgentRoute.deleteMany({organization: _id[i]})
                await District.deleteMany({organization: _id[i]})
                await Distributer.deleteMany({distributer: _id[i]})
                let distributers = await Distributer.find({
                    $or: [
                        {sales: _id[i]},
                        {provider: _id[i]}
                    ]
                })
                for(let i=0; i<distributers.length; i++){
                    distributers[i].sales.splice(_id[i], 1)
                    distributers[i].provider.splice(_id[i], 1)
                    await distributers[i].save()
                }
                await Auto.deleteMany({organization: _id[i]})
                await RepairEquipment.deleteMany({organization: _id[i]})
                await Organization.updateMany({_id: _id[i]}, {del: 'deleted', status: 'deactive'})
                await Ads.updateMany({organization: _id[i]}, {del: 'deleted'})
                await Plan.deleteMany({organization: _id[i]})
                await DeliveryDate.deleteMany({organization: _id[i]})
            }
        }
        return {data: 'OK'}
    },
    onoffOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await Organization.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                await SubBrand.updateMany({organization: objects[i]._id}, {status: objects[i].status})
                await Employment.updateMany({organization: objects[i]._id}, {status: objects[i].status})
                let items = await Item.find({organization: objects[i]._id}).distinct('_id').lean()
                await Basket.deleteMany({item: {$in: items}})
                await Item.updateMany({organization: objects[i]._id}, {status: objects[i].status})
                await objects[i].save()
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