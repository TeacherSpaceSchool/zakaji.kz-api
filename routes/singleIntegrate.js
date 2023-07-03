let express = require('express');
let router = express.Router();
const {getSingleOutXMLClient, checkSingleOutXMLClient, getSingleOutXML, checkSingleOutXML, getSingleOutXMLReturned, checkSingleOutXMLReturned} = require('../module/singleOutXML');
const ModelsError = require('../models/error');
const ReceivedData = require('../models/receivedData');
const Organization = require('../models/organization');
const Employment = require('../models/employment');
const AgentRoute = require('../models/agentRoute');
const Client = require('../models/client');
const Integrate1C = require('../models/integrate1C');
const Item = require('../models/item');
const SubCategory = require('../models/subCategory');
const User = require('../models/user');
const randomstring = require('randomstring');
const { checkFloat, checkInt } = require('../module/const');
const District = require('../models/district');

router.post('/:pass/put/item', async (req, res, next) => {
    let organization = await Organization.findOne({pass: req.params.pass}).select('_id cities').lean()
    res.set('Content-Type', 'application/xml');
    let subCategory = (await SubCategory.findOne({name: 'Не задано'}).select('_id').lean())._id
    try{
        if(req.body.elements[0].elements) {
            let item, integrate1C
            for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                integrate1C = await Integrate1C.findOne({
                    organization: organization._id,
                    guid: req.body.elements[0].elements[i].attributes.guid
                })
                if(!integrate1C) {
                    item = new Item({
                        name: req.body.elements[0].elements[i].attributes.name,
                        image: process.env.URL.trim()+'/static/add.png',
                        info: '',
                        price: checkFloat(req.body.elements[0].elements[i].attributes.price),
                        reiting: 0,
                        subCategory: subCategory,
                        organization: organization._id,
                        hit: false,
                        categorys: ['A','B','C','D','Horeca'],
                        packaging: checkInt(req.body.elements[0].elements[i].attributes.package),
                        latest: false,
                        status: 'active',
                        weight: checkFloat(req.body.elements[0].elements[i].attributes.weight),
                        size: 0,
                        priotiry: 0,
                        unit: 'шт',
                        city: organization.cities[0],
                        apiece: req.body.elements[0].elements[i].attributes.apiece=='1',
                        costPrice: 0
                    });
                    item = await Item.create(item);
                    integrate1C = new Integrate1C({
                        item: item._id,
                        client: null,
                        agent: null,
                        ecspeditor: null,
                        organization: organization._id,
                        guid: req.body.elements[0].elements[i].attributes.guid,
                    });
                    await Integrate1C.create(integrate1C)
                }
                else {
                    item = await Item.findOne({_id: integrate1C.item, organization: organization._id})
                    if(req.body.elements[0].elements[i].attributes.name)
                        item.name = req.body.elements[0].elements[i].attributes.name
                    if(req.body.elements[0].elements[i].attributes.price)
                        item.price = checkFloat(req.body.elements[0].elements[i].attributes.price)
                    if(req.body.elements[0].elements[i].attributes.package)
                        item.packaging = checkInt(req.body.elements[0].elements[i].attributes.package)
                    if(req.body.elements[0].elements[i].attributes.weight)
                        item.weight = checkFloat(req.body.elements[0].elements[i].attributes.weight)
                    if(req.body.elements[0].elements[i].attributes.apiece)
                        item.apiece = req.body.elements[0].elements[i].attributes.apiece=='1'
                    if(req.body.elements[0].elements[i].attributes.status)
                        item.status = req.body.elements[0].elements[i].attributes.status=='1'?'active':'deactive'
                    await item.save()
                }
            }
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'integrate put item'
        });
        await ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/:pass/put/client', async (req, res, next) => {
    let organization = await Organization
        .findOne({pass: req.params.pass}).select('_id autoIntegrate cities').lean()
    res.set('Content-Type', 'application/xml');
    try{
        let agent
        let _object
        let integrate1C
        if(req.body.elements[0].elements) {
            for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                integrate1C = await Integrate1C.findOne({
                    organization: organization._id,
                    guid: req.body.elements[0].elements[i].attributes.guid
                }).lean()
                agent = await Integrate1C.findOne({
                    organization: organization._id,
                    guid: req.body.elements[0].elements[i].attributes.agent
                }).select('agent').lean()
                if (agent) {
                    let district = await District.findOne({
                        agent: agent.agent
                    }).select('_id').lean()
                    if(district) {
                        if(organization.autoIntegrate) {
                            //новый клиент
                            if(!integrate1C){
                                //ищем район
                                district = await District.findOne({
                                    agent: agent.agent
                                })
                                //создаем клиента
                                let _client = new User({
                                    login: randomstring.generate(20),
                                    role: 'client',
                                    status: 'active',
                                    password: '12345678',
                                });
                                _client = await User.create(_client);
                                _client = new Client({
                                    name: req.body.elements[0].elements[i].attributes.name ? req.body.elements[0].elements[i].attributes.name : 'Новый',
                                    phone: req.body.elements[0].elements[i].attributes.tel,
                                    city: organization.cities[0],
                                    address: [[
                                        req.body.elements[0].elements[i].attributes.address ? req.body.elements[0].elements[i].attributes.address : '',
                                        '',
                                        req.body.elements[0].elements[i].attributes.name ? req.body.elements[0].elements[i].attributes.name : ''
                                    ]],
                                    user: _client._id,
                                    notification: false
                                });
                                _client = await Client.create(_client);
                                //создаем интеграцию
                                let _object = new Integrate1C({
                                    item: null,
                                    client: _client._id,
                                    agent: null,
                                    ecspeditor: null,
                                    organization: organization._id,
                                    guid: req.body.elements[0].elements[i].attributes.guid,
                                });
                                await Integrate1C.create(_object)
                                //добавляем клиента в район
                                district.client.push(_client._id)
                                district.markModified('client');
                                await district.save()
                            }
                            else {
                                //обновляем клиента
                                let _client = await Client.findOne({_id: integrate1C.client});
                                if(req.body.elements[0].elements[i].attributes.name)
                                    _client.name = req.body.elements[0].elements[i].attributes.name
                                _client.phone = req.body.elements[0].elements[i].attributes.tel
                                _client.address = [[
                                    req.body.elements[0].elements[i].attributes.address ? req.body.elements[0].elements[i].attributes.address : '',
                                    '',
                                    req.body.elements[0].elements[i].attributes.name ? req.body.elements[0].elements[i].attributes.name : ''
                                ]]
                                await _client.save()
                                //обновляем район
                                let newDistrict = await District.findOne({
                                    agent: agent.agent
                                })
                                //если клиент не добавлен в район
                                if(newDistrict&&!newDistrict.client.toString().includes(_client._id.toString())){
                                    let oldDistrict = await District.findOne({
                                        client: _client._id
                                    })
                                    if(oldDistrict){
                                        //очищаем старый маршрут агента
                                        let objectAgentRoute = await AgentRoute.findOne({district: oldDistrict._id})
                                        if(objectAgentRoute){
                                            for(let i=0; i<7; i++) {
                                                let index = objectAgentRoute.clients[i].indexOf(_client._id.toString())
                                                if(index!==-1)
                                                    objectAgentRoute.clients[i].splice(index, 1)
                                            }
                                            objectAgentRoute.markModified('clients');
                                            await objectAgentRoute.save()
                                        }
                                        //очищаем старый район
                                        for(let i=0; i<oldDistrict.client.length; i++) {
                                            if(oldDistrict.client[i].toString()===_client._id.toString()){
                                                oldDistrict.client.splice(i, 1)
                                                break
                                            }
                                        }
                                        oldDistrict.markModified('client');
                                        await oldDistrict.save()
                                    }
                                    //добавляем в новый район
                                    newDistrict.client.push(_client._id)
                                    newDistrict.markModified('client');
                                    await newDistrict.save()
                                }
                            }
                        }
                        else {
                            _object = new ReceivedData({
                                status: integrate1C ? 'изменить' : 'добавить',
                                organization: organization._id,
                                name: req.body.elements[0].elements[i].attributes.name,
                                guid: req.body.elements[0].elements[i].attributes.guid,
                                addres: req.body.elements[0].elements[i].attributes.address,
                                agent: agent.agent,
                                phone: req.body.elements[0].elements[i].attributes.tel,
                                type: 'клиент'
                            });
                            await ReceivedData.create(_object)
                        }
                    }
                }
            }
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'integrate put client'
        });
        await ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/:pass/put/employment', async (req, res, next) => {
    let organization = await Organization.findOne({pass: req.params.pass}).select('_id').lean()
    res.set('Content-Type', 'application/xml');
    try{
        if(req.body.elements[0].elements) {
            let position = ''
            let _object
            if (req.body.elements[0].attributes.mode === 'forwarder')
                position = 'экспедитор'
            else
                position = 'агент'
            for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                _object = await Integrate1C.findOne({
                    organization: organization._id,
                    guid: req.body.elements[0].elements[i].attributes.guid
                }).select('_id agent ecspeditor').lean()
                if (_object) {
                    if (req.body.elements[0].elements[i].attributes.del === '1') {
                        await Integrate1C.deleteMany({_id: _object._id})
                        await Employment.updateMany({$or: [{_id: _object.agent}, {_id: _object.ecspeditor}]}, {del: 'deleted'})
                    }
                    else {
                        _object = await Employment.findOne({$or: [{_id: _object.agent}, {_id: _object.ecspeditor}]})
                        _object.name = req.body.elements[0].elements[i].attributes.name
                        await _object.save()
                    }
                }
                else {
                    _object = new User({
                        login: randomstring.generate(20),
                        role: position,
                        status: 'active',
                        password: '12345678',
                    });
                    _object = await User.create(_object);
                    _object = new Employment({
                        name: req.body.elements[0].elements[i].attributes.name,
                        email: '',
                        phone: '',
                        organization: organization._id,
                        user: _object._id,
                    });
                    await Employment.create(_object);
                    _object = new Integrate1C({
                        organization: organization._id,
                        guid: req.body.elements[0].elements[i].attributes.guid,
                        ...req.body.elements[0].attributes.mode === 'forwarder' ? {ecspeditor: _object._id} : {agent: _object._id}
                    });
                    _object = await Integrate1C.create(_object)
                }
            }
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'integrate put employment'
        });
        await ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/:pass/out/client', async (req, res, next) => {
    res.set('Content-Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getSingleOutXMLClient(req.params.pass))
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'integrate out client'
        });
        ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/:pass/out/returned', async (req, res, next) => {
    res.set('Content-Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getSingleOutXMLReturned(req.params.pass))
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'integrate out returned'
        });
        ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/:pass/out/sales', async (req, res, next) => {
    res.set('Content-Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getSingleOutXML(req.params.pass))
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'integrate out sales'
        });
        ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/:pass/put/returned/confirm', async (req, res, next) => {
    res.set('Content-Type', 'application/xml');
    try{
        if(req.body.elements[0].elements) {
            for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                await checkSingleOutXMLReturned(req.params.pass, req.body.elements[0].elements[i].attributes.guid, req.body.elements[0].elements[i].attributes.exc)
            }
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'integrate returned confirm'
        });
        ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/:pass/put/sales/confirm', async (req, res, next) => {
    res.set('Content-Type', 'application/xml');
    try{
        if(req.body.elements[0].elements) {
            for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                await checkSingleOutXML(req.params.pass, req.body.elements[0].elements[i].attributes.guid, req.body.elements[0].elements[i].attributes.exc)
            }
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'integrate sales confirm'
        });
        ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/:pass/put/client/confirm', async (req, res, next) => {
    res.set('Content-Type', 'application/xml');
    try{
        if(req.body.elements[0].elements) {
            for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                await checkSingleOutXMLClient(req.params.pass, req.body.elements[0].elements[i].attributes.guid, req.body.elements[0].elements[i].attributes.exc)
            }
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'integrate client confirm'
        });
        ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

module.exports = router;