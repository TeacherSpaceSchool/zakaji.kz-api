const SingleOutXMLAds = require('../models/singleOutXMLAds');
const District = require('../models/district');
const Organization = require('../models/organization');


const type = `
  type OutXMLAdsShoro {
    _id: ID
    createdAt: Date
    guid: String
    organization: Organization
    district: District
  }
`;

const query = `
    outXMLAdsShoros(organization: ID!, search: String!): [OutXMLAdsShoro]
    districtsOutXMLAdsShoros(organization: ID!): [District]
`;

const mutation = `
    addOutXMLAdsShoro(organization: ID!, district: ID!, guid: String!): OutXMLAdsShoro
    setOutXMLAdsShoro(_id: ID!, district: ID, guid: String): Data
    deleteOutXMLAdsShoro(_id: [ID]!): Data
`;

const resolvers = {
    districtsOutXMLAdsShoros: async(parent, {organization}, {user}) => {
        if (user.role === 'admin') {
            let districts = await SingleOutXMLAds.find({}).distinct('district').lean()
            districts = await District.find({
                organization: organization,
                _id: {$nin: districts}
            })
                .lean()
            return districts
        }
    },
    outXMLAdsShoros: async(parent, {organization, search}, {user}) => {
        if (user.role === 'admin') {
            let _districts;
            if (search.length > 0) {
                _districts = await District.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id')
                    .lean()
            }
            return await SingleOutXMLAds.find({
                organization: organization, ...(search.length > 0?{district: {'$in': _districts}}:{})
            })
                .populate('district')
                .sort('-name')
                .lean()
        }
    }
};

const resolversMutation = {
    addOutXMLAdsShoro: async(parent, {organization, district, guid}, {user}) => {
        organization = await Organization.findOne({_id: organization})
        if(user.role==='admin'&&organization.pass){
            let _object = new SingleOutXMLAds({
                guid: guid,
                organization: organization._id,
                pass: organization.pass,
                district: district
            });
            _object = await SingleOutXMLAds.create(_object)
            return _object
        }
    },
    setOutXMLAdsShoro: async(parent, {_id, district, guid}, {user}) => {
        if(user.role==='admin') {
            let object = await SingleOutXMLAds.findById(_id)
            if(district)object.district = district
            if(guid)object.guid = guid
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteOutXMLAdsShoro: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            await SingleOutXMLAds.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;