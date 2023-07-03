const app = require('../app');
const {pdDDMMYYHHMM} = require('../module/const');
const fs = require('fs');
const path = require('path');
const dirs = ['images', 'xlsx']
const { deleteFile, urlMain } = require('../module/const');
const Client = require('../models/client');
const Blog = require('../models/blog');
const Contact = require('../models/contact');
const Category = require('../models/category');
const Ads = require('../models/ads');
const Organization = require('../models/organization');
const Item = require('../models/item');
const Faq = require('../models/faq');

const type = `
  type File {
    name: String
    url: String
    size: Float
    createdAt: String
    active: String
    owner: String
  }
`;

const query = `
    files(filter: String!): [File]
    filterFile: [Filter]
`;

const mutation = `
    clearAllDeactiveFiles: Data
`;

const resolvers = {
    files: async(parent, {filter}, {user}) => {
        if(user.role==='admin') {
            let data = [], res = [], filesUrl = [], stat, size, createdAt, url
            for (let i = 0; i < dirs.length; i++) {
                url = path.join(app.dirname, 'public', dirs[i])
                const files = fs.readdirSync(url, 'utf8');
                for (let name of files) {
                    url = path.join(app.dirname, 'public', dirs[i], name)
                    stat = fs.statSync(url)
                    createdAt = pdDDMMYYHHMM(stat.atime)
                    size = Math.round((stat.size/1000000) * 1000)/1000;
                    data.push({name, size, url: dirs[i], createdAt});
                    filesUrl.push(`${urlMain}/${dirs[i]}/${name}`)
                }
            }
            res = [
                ...(await Client.find({image: {$in: filesUrl}}).select('name image').lean()).map(element=>{return {...element, type: 'Клиент'}}),
                ...(await Blog.find({image: {$in: filesUrl}}).select('title image').lean()).map(element=>{return {...element, name: element.title, type: 'Блог'}}),
                ...(await Contact.find({image: {$in: filesUrl}}).select('image').lean()).map(element=>{return {...element, name: '.Store', type: 'Контакты'}}),
                ...(await Category.find({image: {$in: filesUrl}}).select('name image').lean()).map(element=>{return {...element, type: 'Категория'}}),
                ...(await Ads.find({image: {$in: filesUrl}}).select('title image').lean()).map(element=>{return {...element, name: element.title, type: 'Акция'}}),
                ...(await Organization.find({image: {$in: filesUrl}}).select('name image').lean()).map(element=>{return {...element, type: 'Организация'}}),
                ...(await Item.find({image: {$in: filesUrl}}).select('name image').lean()).map(element=>{return {...element, type: 'Товар'}}),
                ...(await Faq.find({url: {$in: filesUrl}}).select('title url').lean()).map(element=>{return {...element, name: element.title, type: 'Инструкция'}}),
            ]
            filesUrl = {}
            for (let i = 0; i < res.length; i++) {
                filesUrl[res[i].image?res[i].image:res[i].url?res[i].url:'lol'] = res[i]
            }
            res = []
            let fileUrl
            for (let i = 0; i < data.length; i++) {
                fileUrl = filesUrl[`${urlMain}/${data[i].url}/${data[i].name}`]
                data[i].active = fileUrl ? 'активен' : 'неактивен'
                data[i].owner = fileUrl? `${fileUrl.type} ${fileUrl.name}`: 'Отсутствует'
                if(!filter.length||(filter==='active'&&fileUrl)||(filter==='deactive'&&!fileUrl))
                    res.push(data[i])
            }
            res = res.sort(function (a, b) {
                return b.size - a.size
            });
            return res;
        }
    },
    filterFile: async(parent, ctx, {user}) => {
        let filter = [
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
        if(user.role)
            filter.push()
        return filter
    },
};

const resolversMutation = {
    clearAllDeactiveFiles: async(parent, ctx, {user}) => {
        if('admin'===user.role){
            let data = [], url
            for (let i = 0; i < dirs.length; i++) {
                url = path.join(app.dirname, 'public', dirs[i])
                const files = fs.readdirSync(url, 'utf8');
                for (let name of files) {
                    data.push(`${urlMain}/${dirs[i]}/${name}`)
                }
            }
            let filesUrl = [
                ...(await Client.find({image: {$in: data}}).distinct('image').lean()),
                ...(await Blog.find({image: {$in: data}}).distinct('image').lean()),
                ...(await Contact.find({image: {$in: data}}).distinct('image').lean()),
                ...(await Category.find({image: {$in: data}}).distinct('image').lean()),
                ...(await Ads.find({image: {$in: data}}).distinct('image').lean()),
                ...(await Organization.find({image: {$in: data}}).distinct('image').lean()),
                ...(await Item.find({image: {$in: data}}).distinct('image').lean()),
                ...(await Faq.find({url: {$in: data}}).distinct('url').lean()),
            ]
            for (let i = 0; i < data.length; i++) {
                if(!filesUrl.includes(data[i]))
                    await deleteFile(data[i])
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