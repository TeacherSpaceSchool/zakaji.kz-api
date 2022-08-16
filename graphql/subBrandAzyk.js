const SubBrandAzyk = require('../models/subBrandAzyk');
const ItemAzyk = require('../models/itemAzyk');
const { saveImage, deleteFile, urlMain } = require('../module/const');

const type = `
  type SubBrand {
     _id: ID
     createdAt: Date
     image: String
     miniInfo: String
     name: String
     cities: [String]
     priotiry: Int
     organization: Organization
     status: String
 }
`;

const query = `
    subBrands(organization: ID, search: String!, city: String): [SubBrand]
`;

const mutation = `
    addSubBrand(image: Upload!, miniInfo: String!, priotiry: Int, organization: ID!, cities: [String]!, name: String!): SubBrand
    setSubBrand(_id: ID!, image: Upload, miniInfo: String, priotiry: Int, cities: [String], name: String): Data
    onoffSubBrand(_id: [ID]!): Data
    deleteSubBrand(_id: [ID]!): Data
`;

const resolvers = {
    subBrands: async(parent, {organization, search, city}, {user}) => {
        if(['admin', 'суперагент', 'экспедитор', 'суперорганизация', 'организация', 'менеджер', 'агент', 'client'].includes(user.role)){
            if(user.organization) organization = user.organization
            return await SubBrandAzyk.find({
                del: {$ne: 'deleted'},
                miniInfo: {'$regex': search, '$options': 'i'},
                ...organization?{organization}:{},
                ...(city?{cities: city}:{}),
            })
                .populate({
                    path: 'organization',
                    select: '_id name'
                })
                .sort('-priotiry')
                .lean()
        }
    }
};

const resolversMutation = {
    addSubBrand: async(parent, {image, miniInfo, priotiry, organization, cities, name}, {user}) => {
        if('admin'===user.role){
            let { stream, filename } = await image;
            filename = await saveImage(stream, filename)
            let _object = new SubBrandAzyk({
                image: urlMain+filename,
                priotiry: priotiry,
                miniInfo,
                organization,
                cities,
                name,
                status: 'active'
            });
            _object = await SubBrandAzyk.create(_object)
            return _object
        }
        return {data: 'OK'};
    },
    setSubBrand: async(parent, {_id, image, miniInfo, priotiry, cities, name}, {user}) => {
        if('admin'===user.role){
            let object = await SubBrandAzyk.findOne({
                _id: _id
            })
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(miniInfo)object.miniInfo = miniInfo
            if(name)object.name = name
            object.cities = cities
            if(priotiry!=undefined) object.priotiry = priotiry
            await object.save();
        }
        return {data: 'OK'}
    },
    onoffSubBrand: async(parent, { _id }, {user}) => {
        if('admin'===user.role) {
            let objects = await SubBrandAzyk.find({_id: {$in: _id}})
            for (let i = 0; i < objects.length; i++) {
                objects[i].status = objects[i].status === 'active' ? 'deactive' : 'active'
                await objects[i].save()
            }
        }
        return {data: 'OK'}
    },
    deleteSubBrand: async(parent, { _id }, {user}) => {
        if('admin'===user.role){
            await SubBrandAzyk.updateMany({_id: {$in: _id}}, {del: 'deleted'})
            await ItemAzyk.updateMany({subBrand: {$in: _id}}, {subBrand: undefined})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;