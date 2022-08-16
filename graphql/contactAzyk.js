const ContactAzyk = require('../models/contactAzyk');
const { saveImage, deleteFile, urlMain } = require('../module/const');

const type = `
  type Contact {
    name: String
    image: String
    address: [String]
    email: [String]
    phone: [String]
    info: String
    social: [String]
    warehouse: String
  }
`;

const query = `
    contact: Contact
`;

const mutation = `
    setContact(warehouse: String!, name: String!, image: Upload, address: [String]!, email: [String]!, phone: [String]!, info: String!, social: [String]!): Data
`;

const resolvers = {
    contact: async() => {
        let contact = await ContactAzyk.findOne().lean()
        return !contact ? {
            name: '',
            image: '',
            address: [],
            email: [],
            phone: [],
            info: '',
            social: ['', '', '', '']
        } : contact
    }
};

const resolversMutation = {
    setContact: async(parent, {warehouse, name, image, address, email, phone, info, social}, {user}) => {
        if(user.role==='admin') {
            let object = await ContactAzyk.findOne()
            if(!object){
                object = new ContactAzyk({
                    warehouse: warehouse,
                    name: name,
                    info: info,
                    phone: phone,
                    email: email,
                    address: address,
                    social: social,
                });
                if(image) {
                    let {stream, filename} = await image;
                    object.image = urlMain+(await saveImage(stream, filename))
                }
                else
                    object.image = ''
                await ContactAzyk.create(object)
            }
            else {
                if (image) {
                    let {stream, filename} = await image;
                    if(object.image)
                        await deleteFile(object.image)
                    filename = await saveImage(stream, filename)
                    object.image = urlMain + filename
                }
                object.warehouse = warehouse
                object.name = name
                object.info = info
                object.phone = phone
                object.email = email
                object.address = address
                object.social = social
                await object.save();
            }
        }
        return {data: 'OK'}
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;