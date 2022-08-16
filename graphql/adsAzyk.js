const AdsAzyk = require('../models/adsAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const DistributerAzyk = require('../models/distributerAzyk');
const SubBrandAzyk = require('../models/subBrandAzyk');
const { saveImage, deleteFile, urlMain } = require('../module/const');

const type = `
  type Ads {
    _id: ID
    image: String
    url: String
    title: String
    xid: String
    createdAt: Date
    del: String
    item: Item
    count: Int
    organization: Organization
    targetItems: [TargetItem]
    targetPrice: Int
    multiplier: Boolean
    targetType: String
    xidNumber: Int
  }
  type TargetItem {
        xids: [ID]
        count: Int
        sum: Boolean
        type: String
        targetPrice: Int
  }
  input TargetItemInput {
        xids: [ID]
        count: Int
        sum: Boolean
        type: String
        targetPrice: Int
  }
`;

const query = `
    checkAdss(invoice: ID!): [ID]
    adss(search: String!, organization: ID!): [Ads]
    adssTrash(search: String!): [Ads]
    adsOrganizations: [Organization]
    ads: Ads
`;

const mutation = `
    addAds(xidNumber: Int, xid: String, image: Upload!, url: String!, title: String!, organization: ID!, item: ID, count: Int, targetItems: [TargetItemInput], targetPrice: Int, multiplier: Boolean, targetType: String): Ads
    setAds(xidNumber: Int, xid: String, _id: ID!, image: Upload, url: String, title: String, item: ID, count: Int, targetItems: [TargetItemInput], targetPrice: Int, multiplier: Boolean, targetType: String): Data
    restoreAds(_id: [ID]!): Data
    deleteAds(_id: [ID]!): Data
`;

const checkAdss = async(invoice) => {
    invoice = await InvoiceAzyk.findOne({_id: invoice})
        .select('returnedPrice organization allPrice orders')
        .populate({
            path: 'orders',
            select: 'count returned item allPrice'
        })
        .lean()
    let resAdss = []
    let idAds = {}
    let adss = await AdsAzyk.find({
        del: {$ne: 'deleted'},
        organization: invoice.organization
    })
        .sort('-createdAt')
        .lean()
    for(let i=0; i<adss.length; i++) {
        if(adss[i].targetType==='Цена'&&adss[i].targetPrice&&adss[i].targetPrice>0){
            if((invoice.allPrice-invoice.returnedPrice)>=adss[i].targetPrice) {
                if(!(adss[i].xid&&adss[i].xid.length>0)||!idAds[adss[i].xid]||idAds[adss[i].xid].xidNumber<adss[i].xidNumber){
                    if(adss[i].xid&&adss[i].xid.length>0) {
                        if(idAds[adss[i].xid])
                            resAdss.splice(idAds[adss[i].xid].index, 1)
                        idAds[adss[i].xid] = {xidNumber: adss[i].xidNumber, index: resAdss.length}
                    }
                    resAdss.push(adss[i]._id)
                }
            }
        }
        else if(adss[i].targetType==='Товар'&&adss[i].targetItems&&adss[i].targetItems.length>0){
            let check = true
            let checkItemsCount = []
            for(let i1=0; i1<adss[i].targetItems.length; i1++) {
                if(adss[i].targetItems[i1].sum){
                    checkItemsCount[i1] = 0
                    for(let i2=0; i2<invoice.orders.length; i2++) {
                        if(adss[i].targetItems[i1].xids.toString().includes(invoice.orders[i2].item.toString())) {
                            checkItemsCount[i1] += adss[i].targetItems[i1].type==='Количество'?
                                invoice.orders[i2].count-invoice.orders[i2].returned
                                :
                                (invoice.orders[i2].allPrice/invoice.orders[i2].count*(invoice.orders[i2].count-invoice.orders[i2].returned))
                        }
                    }
                    checkItemsCount[i1] = checkItemsCount[i1] >= (adss[i].targetItems[i1].type==='Количество'?adss[i].targetItems[i1].count:adss[i].targetItems[i1].targetPrice);
                 }
                else {
                    checkItemsCount[i1] = false
                    for(let i2=0; i2<invoice.orders.length; i2++) {
                        if(adss[i].targetItems[i1].type==='Количество')
                            checkItemsCount[i1] = (adss[i].targetItems[i1].xids.toString().includes(invoice.orders[i2].item.toString())&&(invoice.orders[i2].count-invoice.orders[i2].returned)>=adss[i].targetItems[i1].count)
                        else {
                            checkItemsCount[i1] = (
                                adss[i].targetItems[i1].xids.toString().includes(invoice.orders[i2].item.toString())
                                &&
                                (invoice.orders[i2].allPrice/invoice.orders[i2].count*(invoice.orders[i2].count-invoice.orders[i2].returned)) >= adss[i].targetItems[i1].targetPrice
                            )
                        }
                    }
                }
            }
            if(checkItemsCount.length) {
                for (let i1 = 0; i1 < checkItemsCount.length; i1++) {
                    if (!checkItemsCount[i1])
                        check = false
                }
            }
            else
                check = false
            if(check&&
                (
                    !(adss[i].xid&&adss[i].xid.length>0)
                    ||
                    !idAds[adss[i].xid]
                    ||
                    idAds[adss[i].xid].xidNumber<adss[i].xidNumber
                )) {
                if(adss[i].xid&&adss[i].xid.length>0) {
                    if(idAds[adss[i].xid])
                        resAdss.splice(idAds[adss[i].xid].index, 1)
                    idAds[adss[i].xid] = {xidNumber: adss[i].xidNumber, index: resAdss.length}
                }
                resAdss.push(adss[i]._id)
            }
        }
    }
    return resAdss
}

const resolvers = {
    checkAdss: async(parent, {invoice}) => await checkAdss(invoice),
    adssTrash: async(parent, {search}, {user}) => {
        if(user.role==='admin') {
            return await AdsAzyk.find({
                del: 'deleted',
                title: {'$regex': search, '$options': 'i'}
            })
                .populate({
                    path: 'item',
                    select: 'name _id'
                })
                .sort('-createdAt')
                .lean()
        }
    },
    adss: async(parent, {search, organization}, {user}) => {
        if(user.role) {
            let _organization = await SubBrandAzyk.findOne({_id: organization}).select('organization').lean()
            let res = await AdsAzyk.find({
                del: {$ne: 'deleted'},
                title: {'$regex': search, '$options': 'i'},
                organization: _organization?_organization.organization:organization
            })
                .populate({
                    path: 'item',
                    select: 'name _id'
                })
                .sort('-createdAt')
                .lean()
            return res
        }
    },
    adsOrganizations: async(parent, ctx, {user}) => {
        if(user.role) {
            if (user.organization) {
                let distributer = await DistributerAzyk.findOne({distributer: user.organization})
                    .select('distributer sales')
                    .populate({
                        path: 'sales',
                        select: 'image name miniInfo _id'
                    })
                    .populate({
                        path: 'distributer',
                        select: 'image name miniInfo _id'
                    })
                    .lean()
                if (distributer) {
                    return [distributer.distributer, ...distributer.sales]
                }
                else {
                    distributer = await OrganizationAzyk
                        .find({_id: user.organization})
                        .select('image name miniInfo _id')
                        .lean()
                    return distributer
                }
            }
            else {
                let organizations = await AdsAzyk.find({del: {$ne: 'deleted'}}).distinct('organization').lean()
                organizations = await OrganizationAzyk.find({
                    _id: {$in: organizations},
                    status: 'active',
                    ...user.city ? {cities: user.city} : {},
                    del: {$ne: 'deleted'}
                })
                    .select('image name miniInfo _id')
                    .sort('name')
                    .lean()
                return organizations
            }
        }
    },
    ads: async(parent, ctx, {user}) => {
        if(user.role) {
            let ads = await AdsAzyk.findRandom().limit(1).lean()
            return ads[0]
        }
    }
};

const resolversMutation = {
    addAds: async(parent, {xidNumber, xid, image, url, title, organization, item, count, targetItems, targetPrice, multiplier, targetType}, {user}) => {
        if(['суперорганизация', 'организация', 'admin'].includes(user.role)){
            let { stream, filename } = await image;
            filename = await saveImage(stream, filename)
            let _object = new AdsAzyk({
                image: urlMain+filename,
                url: url,
                title: title,
                organization: user.organization?user.organization:organization,
                item: item,
                targetItems: targetItems,
                targetPrice: targetPrice,
                multiplier: multiplier,
                xid: xid,
                targetType: targetType,
                xidNumber: xidNumber
            });
            if(count!=undefined)
                _object.count = count
            _object = await AdsAzyk.create(_object)
            return _object
        }
    },
    setAds: async(parent, {xidNumber, xid, _id, image, url, title, item, count, targetItems, targetPrice, multiplier, targetType}, {user}) => {
        if(['суперорганизация', 'организация', 'admin'].includes(user.role)){
            let object = await AdsAzyk.findById(_id)
            object.item = item
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(xid) object.xid = xid
            if(url) object.url = url
            if(title) object.title = title
            if(xidNumber!=undefined) object.xidNumber = xidNumber
            if(count!=undefined) object.count = count
            object.targetItems = targetItems
            if(targetPrice!=undefined) object.targetPrice = targetPrice
            if(multiplier!=undefined) object.multiplier = multiplier
            if(targetType) object.targetType = targetType
            await object.save();
        }
        return {data: 'OK'}
    },
    restoreAds: async(parent, { _id }, {user}) => {
        if('admin'===user.role){
            await AdsAzyk.updateMany({_id: {$in: _id}}, {del: null})
        }
        return {data: 'OK'}
    },
    deleteAds: async(parent, { _id }, {user}) => {
        if(['суперорганизация', 'организация', 'admin'].includes(user.role)){
            let objects = await AdsAzyk.find({_id: {$in: _id}}).select('image').lean()
            for(let i=0; i<objects.length; i++){
                await deleteFile(objects[i].image)
            }
            await AdsAzyk.updateMany({_id: {$in: _id}}, {del: 'deleted'})

        }
        return {data: 'OK'}
    }
};

module.exports.checkAdss = checkAdss;
module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;