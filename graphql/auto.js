const Auto = require('../models/auto');
const Employment = require('../models/employment');

const type = `
  type Auto {
    _id: ID
    number: String
    tonnage: Float
    size: Float
    employment: Employment
    organization: Organization
    createdAt: Date
  }
`;

const query = `
    autos(organization: ID!, search: String!, sort: String!): [Auto]
    auto(_id: ID!): Auto
    autoByEcspeditor(_id: ID!): Auto
    sortAuto: [Sort]
    filterAuto: [Filter]
`;

const mutation = `
    addAuto(number: String!, tonnage: Float!, size: Float!, employment: ID, organization: ID): Auto
    setAuto(_id: ID!, number: String, tonnage: Float, size: Float, employment: ID): Data
    deleteAuto(_id: [ID]!): Data
`;

const resolvers = {
    autos: async(parent, {organization, search, sort}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'агент', 'admin'].includes(user.role)){
            let _employments;
            if(search.length>0){
                _employments = await Employment.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id').lean()
            }

                let autos = await Auto.find({
                    organization: user.organization?user.organization:organization==='super'?null:organization,
                    ...(search.length>0?{
                            $or: [
                                {number: {'$regex': search, '$options': 'i'}},
                                {employment: {$in: _employments}},
                            ]
                        }
                        :{})
                })
                    .populate({
                        path: 'employment',
                        select: 'name _id'
                    })
                    .sort(sort)
                    .lean()
                return autos
        }
    },
    auto: async(parent, {_id}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'агент', 'admin'].includes(user.role)) {
            return await Auto.findOne({
                $or: [{_id: _id}, {employment: _id}],
                ...user.organization ? {organization: user.organization} : {},
            })
                .populate({
                    path: 'employment',
                    select: 'name _id'
                })
                .populate({
                    path: 'organization',
                    select: 'name _id'
                })
                .lean()
        }
    },
    sortAuto: async() => {
        return [
            {
                name: 'Тоннаж',
                field: 'tonnage'
            },
            {
                name: 'Кубатура',
                field: 'size'
            },
        ]
    },
};

const resolversMutation = {
    addAuto: async(parent, {number, tonnage, size, organization, employment}, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)){
            let _object = new Auto({
                number: number,
                tonnage: Math.round(tonnage),
                size: Math.round(size),
                organization: user.organization?user.organization:organization==='super'?null:organization,
                employment: employment
            });
            _object = await Auto.create(_object)
            return _object
        }
    },
    setAuto: async(parent, {_id, number, tonnage, size, employment}, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)) {
            let object = await Auto.findById(_id)
            if(number)object.number = number
            if(tonnage)object.tonnage = tonnage
            if(size)object.size = size
            if(employment)object.employment = employment
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteAuto: async(parent, { _id }, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)){
            await Auto.deleteMany({
                _id: {$in: _id},
                ...user.organization?{organization: user.organization}:{}
            })
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;