const Blog = require('../models/blog');
const { saveImage, deleteFile, urlMain } = require('../module/const');

const type = `
  type Blog {
    _id: ID
    image: String
    text: String
    title: String
    createdAt: Date
  }
`;

const query = `
    blogs(search: String!): [Blog]
`;

const mutation = `
    addBlog(image: Upload!, text: String!, title: String!): Blog
    setBlog(_id: ID!, image: Upload, text: String, title: String): Data
    deleteBlog(_id: [ID]!): Data
`;

const resolvers = {
    blogs: async(parent, {search}) => {
        return await Blog.find({
            title: {'$regex': search, '$options': 'i'}
        })
            .sort('-createdAt')
            .lean()
    }
};

const resolversMutation = {
    addBlog: async(parent, {image, text, title}, {user}) => {
        if(user.role==='admin'){
            let { stream, filename } = await image;
            filename = await saveImage(stream, filename)
            let _object = new Blog({
                image: urlMain+filename,
                text: text,
                title: title
            });
            _object = await Blog.create(_object)
            return _object
        }
        return {data: 'OK'};
    },
    setBlog: async(parent, {_id, image, text, title}, {user}) => {
        if(user.role==='admin') {
            let object = await Blog.findById(_id)
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(text)object.text = text
            if(title)object.title = title
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteBlog: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await Blog.find({_id: {$in: _id}}).select('image').lean()
            for(let i=0; i<objects.length; i++){
                await deleteFile(objects[i].image)
            }
            await Blog.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;