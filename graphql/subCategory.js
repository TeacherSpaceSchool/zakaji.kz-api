const SubCategory = require('../models/subCategory');
const Item = require('../models/item');
const Basket = require('../models/basket');
const mongoose = require('mongoose');

const type = `
  type SubCategory {
    _id: ID
    category: Category
    name: String
    status: String
    createdAt: Date
  }
`;

const query = `
    subCategorys(category: ID!, search: String!, sort: String!, filter: String!): [SubCategory]
    subCategory(_id: ID!): SubCategory
    sortSubCategory: [Sort]
    filterSubCategory: [Filter]
`;

const mutation = `
    addSubCategory(name: String!, category: ID!): SubCategory
    setSubCategory(_id: ID!, name: String, category: ID): Data
    deleteSubCategory(_id: [ID]!): Data
    onoffSubCategory(_id: [ID]!): Data
`;

const resolvers = {
    subCategorys: async(parent, {category, search, sort, filter}, {user}) => {
        if(category==='all'||mongoose.Types.ObjectId.isValid(category)){
            if(user.role==='admin'){
                let subCategoryUndefined = await SubCategory.findOne({name: 'Не задано'}).lean()
                return [
                    subCategoryUndefined,
                    ...(await SubCategory.find({
                        $and: [
                            {name: {$ne: 'Не задано'}},
                            {name: {'$regex': search, '$options': 'i'}}
                        ],
                        ...category!=='all'?{category: category}:{},
                        status:  filter.length===0?{'$regex': filter, '$options': 'i'}:filter
                    }).populate('category').sort(sort).lean())
                ]
            }
            else if(['экспедитор', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(user.role)) {
                let subCategorys =  await Item.find({organization: user.organization, del: {$ne: 'deleted'}}).distinct('subCategory').lean()
                return await SubCategory.find({
                    _id: {$in: subCategorys},
                    $and: [
                        {name: {$ne: 'Не задано'}},
                        {name: {'$regex': search, '$options': 'i'}}
                    ],
                    ...category!=='all'?{category: category}:{},
                    status:  filter.length===0?{'$regex': filter, '$options': 'i'}:filter
                })
                    .populate('category')
                    .sort(sort)
                    .lean()
            }
            else {
                return await SubCategory.find({
                    $and: [
                        {name: {'$regex': search, '$options': 'i'}},
                        {name: {$ne: 'Не задано'},}
                    ],
                    ...category!=='all'?{category: category}:{},
                    status: 'active'
                })
                    .populate('category')
                    .sort(sort)
                    .lean()
            }
        }
        else return []
    },
    subCategory: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id))
            return await SubCategory.findOne({
                _id: _id
            }).populate('category').lean()
        return null
    },
    sortSubCategory: async(parent, ctx, {user}) => {
        let sort = [
            {
                name: 'Имя',
                field: 'name'
            }
        ]
        if(user.role==='admin') {
            sort = [
                ...sort,
                {
                    name: 'Статус',
                    field: 'status'
                }
            ]
        }
        return sort
    },
    filterSubCategory: async(parent, ctx, {user}) => {
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
    addSubCategory: async(parent, {category, name}, {user}) => {
        if(user.role==='admin'&&name!=='Не задано'){
            let _object = new SubCategory({
                category: category,
                name: name,
                status: 'active'
            });
            _object = await SubCategory.create(_object)
            return _object;
        }
    },
    setSubCategory: async(parent, {_id, name, category}, {user}) => {
        if(user.role==='admin'&&name!=='Не задано') {
            let object = await SubCategory.findById(_id)
            if(name&&name!=='Не задано')object.name = name
            if(category)object.category = category
            await object.save();
        }
        return {data: 'OK'}
    },
    onoffSubCategory: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await SubCategory.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                await objects[i].save()
            }
        }
        return {data: 'OK'}
    },
    deleteSubCategory: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let subCategoryUndefined = await SubCategory.findOne({name: 'Не задано'}).select('_id').lean();
            await Item.updateMany({subCategory: {$in: _id}}, {subCategory: subCategoryUndefined._id, status: 'deactive'})
            await SubCategory.deleteMany({_id: {$in: _id}, name: {$ne: 'Не задано'}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;