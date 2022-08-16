let express = require('express');
let router = express.Router();
const {getSingleOutXMLClientAzyk, checkSingleOutXMLClientAzyk, getSingleOutXMLAzyk, checkSingleOutXMLAzyk, getSingleOutXMLReturnedAzyk, checkSingleOutXMLReturnedAzyk} = require('../module/singleOutXMLAzyk');
const ModelsErrorAzyk = require('../models/errorAzyk');
const ReceivedDataAzyk = require('../models/receivedDataAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const ItemAzyk = require('../models/itemAzyk');
const SubCategoryAzyk = require('../models/subCategoryAzyk');
const UserAzyk = require('../models/userAzyk');
const randomstring = require('randomstring');
const { checkFloat, checkInt } = require('../module/const');
const DistrictAzyk = require('../models/districtAzyk');

router.post('/:pass/put/item', async (req, res, next) => {
    let organization = await OrganizationAzyk.findOne({pass: req.params.pass}).select('_id cities').lean()
    res.set('Content+Type', 'application/xml');
    let subCategory = (await SubCategoryAzyk.findOne({name: 'Не задано'}).select('_id').lean())._id
    try{
        if(req.body.elements[0].elements) {
            let item, integrate1CAzyk
            for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                integrate1CAzyk = await Integrate1CAzyk.findOne({
                    organization: organization._id,
                    guid: req.body.elements[0].elements[i].attributes.guid
                })
                if(!integrate1CAzyk) {
                    item = new ItemAzyk({
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
                    item = await ItemAzyk.create(item);
                    integrate1CAzyk = new Integrate1CAzyk({
                        item: item._id,
                        client: null,
                        agent: null,
                        ecspeditor: null,
                        organization: organization._id,
                        guid: req.body.elements[0].elements[i].attributes.guid,
                    });
                    await Integrate1CAzyk.create(integrate1CAzyk)
                }
                else {
                    item = await ItemAzyk.findOne({_id: integrate1CAzyk.item, organization: organization._id})
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
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: 'integrate put item'
        });
        await ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/:pass/put/client', async (req, res, next) => {
    let organization = await OrganizationAzyk
        .findOne({pass: req.params.pass}).select('_id').lean()
    res.set('Content+Type', 'application/xml');
    try{
        let agent
        let _object
        let integrate1CAzyk
        if(req.body.elements[0].elements) {
            for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                integrate1CAzyk = await Integrate1CAzyk.findOne({
                    organization: organization._id,
                    guid: req.body.elements[0].elements[i].attributes.guid
                }).select('_id').lean()
                agent = await Integrate1CAzyk.findOne({
                    organization: organization,
                    guid: req.body.elements[0].elements[i].attributes.agent
                }).select('agent').lean()
                if (agent) {
                    let district = await DistrictAzyk.findOne({
                        agent: agent.agent
                    }).select('_id').lean()
                    if(district) {
                        _object = new ReceivedDataAzyk({
                            status: integrate1CAzyk ? 'изменить' : 'добавить',
                            organization: organization._id,
                            name: req.body.elements[0].elements[i].attributes.name,
                            guid: req.body.elements[0].elements[i].attributes.guid,
                            addres: req.body.elements[0].elements[i].attributes.address,
                            agent: agent.agent,
                            phone: req.body.elements[0].elements[i].attributes.tel,
                            type: 'клиент'
                        });
                        await ReceivedDataAzyk.create(_object)
                    }
                }
            }
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: 'integrate put client'
        });
        await ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/:pass/put/employment', async (req, res, next) => {
    let organization = await OrganizationAzyk.findOne({pass: req.params.pass}).select('_id').lean()
    res.set('Content+Type', 'application/xml');
    try{
        if(req.body.elements[0].elements) {
            let position = ''
            let _object
            if (req.body.elements[0].attributes.mode === 'forwarder')
                position = 'экспедитор'
            else
                position = 'агент'
            for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                _object = await Integrate1CAzyk.findOne({
                    organization: organization._id,
                    guid: req.body.elements[0].elements[i].attributes.guid
                }).select('_id agent ecspeditor').lean()
                if (_object) {
                    if (req.body.elements[0].elements[i].attributes.del === '1') {
                        await Integrate1CAzyk.deleteMany({_id: _object._id})
                        await EmploymentAzyk.updateMany({$or: [{_id: _object.agent}, {_id: _object.ecspeditor}]}, {del: 'deleted'})
                    }
                    else {
                        _object = await EmploymentAzyk.findOne({$or: [{_id: _object.agent}, {_id: _object.ecspeditor}]})
                        _object.name = req.body.elements[0].elements[i].attributes.name
                        await _object.save()
                    }
                }
                else {
                    _object = new UserAzyk({
                        login: randomstring.generate(20),
                        role: position,
                        status: 'active',
                        password: '12345678',
                    });
                    _object = await UserAzyk.create(_object);
                    _object = new EmploymentAzyk({
                        name: req.body.elements[0].elements[i].attributes.name,
                        email: '',
                        phone: '',
                        organization: organization._id,
                        user: _object._id,
                    });
                    await EmploymentAzyk.create(_object);
                    _object = new Integrate1CAzyk({
                        organization: organization._id,
                        guid: req.body.elements[0].elements[i].attributes.guid,
                        ...req.body.elements[0].attributes.mode === 'forwarder' ? {ecspeditor: _object._id} : {agent: _object._id}
                    });
                    _object = await Integrate1CAzyk.create(_object)
                }
            }
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: 'integrate put employment'
        });
        await ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/:pass/out/client', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getSingleOutXMLClientAzyk(req.params.pass))
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: 'integrate out client'
        });
        ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/:pass/out/returned', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getSingleOutXMLReturnedAzyk(req.params.pass))
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: 'integrate out returned'
        });
        ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/:pass/out/sales', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getSingleOutXMLAzyk(req.params.pass))
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: 'integrate out sales'
        });
        ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/:pass/put/returned/confirm', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        if(req.body.elements[0].elements) {
            for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                await checkSingleOutXMLReturnedAzyk(req.params.pass, req.body.elements[0].elements[i].attributes.guid, req.body.elements[0].elements[i].attributes.exc)
            }
        }
         await res.status(200);
        await res.end('success')
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: 'integrate returned confirm'
        });
        ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/:pass/put/sales/confirm', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        if(req.body.elements[0].elements) {
            for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                await checkSingleOutXMLAzyk(req.params.pass, req.body.elements[0].elements[i].attributes.guid, req.body.elements[0].elements[i].attributes.exc)
            }
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: 'integrate sales confirm'
        });
        ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/:pass/put/client/confirm', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        if(req.body.elements[0].elements) {
            for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                await checkSingleOutXMLClientAzyk(req.params.pass, req.body.elements[0].elements[i].attributes.guid, req.body.elements[0].elements[i].attributes.exc)
            }
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: 'integrate client confirm'
        });
        ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

module.exports = router;