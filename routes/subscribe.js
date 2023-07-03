const express = require('express');
const router = express.Router();
const randomstring = require('randomstring');
const Subscriber = require('../models/subscriber');
const Client = require('../models/client');
const passportEngine = require('../module/passport');
const ModelsError = require('../models/error');

router.post('/register', async (req, res) => {
    await passportEngine.getuser(req, res, async (user)=> {
        try {
            let subscriptionModel;
            let number = req.body.number
            subscriptionModel = await Subscriber.findOne({$or: [{number: number}, {endpoint: req.body.endpoint}]})
            if (subscriptionModel) {
                if (user) subscriptionModel.user = user._id
                subscriptionModel.endpoint = req.body.endpoint
                subscriptionModel.keys = req.body.keys
            }
            else {
                number = randomstring.generate({length: 20, charset: 'numeric'});
                while (await Subscriber.findOne({number: number}).select('_id').lean())
                    number = randomstring.generate({length: 20, charset: 'numeric'});
                subscriptionModel = new Subscriber({
                    endpoint: req.body.endpoint,
                    keys: req.body.keys,
                    number: number,
                });
                if (user) subscriptionModel.user = user._id
            }
            if (user.role === 'client') {
                let client = await Client.findOne({user: user._id})
                client.notification = true
                await client.save()
            }
            subscriptionModel.save((err) => {
                if (err) {
                    console.error(`Error occurred while saving subscription. Err: ${err}`);
                    res.status(500).json({
                        error: 'Technical error occurred'
                    });
                } else {
                    console.log('Subscription saved');
                    res.send(subscriptionModel.number)
                }
            });
        } catch (err) {
            let _object = new ModelsError({
                err: err.message,
                path: 'register subscribe'
            });
            ModelsError.create(_object)
            console.error(err)
            res.status(501);
            res.end('error')
        }
    })
});

router.post('/unregister', async (req, res) => {
    try{
        let subscriptionModel = await Subscriber.findOne({number: req.body.number}).populate({ path: 'user'})
        if(subscriptionModel&&subscriptionModel.user&&subscriptionModel.user.role==='client'&&(await Subscriber.find({user: subscriptionModel.user._id}).select('_id').lean()).length===1){
            let client = await Client.findOne({user: subscriptionModel.user._id})
            if(client) {
                client.notification = false
                await client.save()
            }
            subscriptionModel.user = null
            await subscriptionModel.save()
        }
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'unregister subscribe'
        });
        ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/delete', async (req, res) => {
    try{
        let subscriptionModel = await Subscriber.findOne({number: req.body.number}).populate({ path: 'user'}).lean()
        if(subscriptionModel&&subscriptionModel.user&&subscriptionModel.user.role==='client'&&(await Subscriber.find({user: subscriptionModel.user._id}).select('_id').lean()).length===1){
            let client = await Client.findOne({user: subscriptionModel.user._id})
            if(client) {
                client.notification = false
                await client.save()
            }
        }
        await Subscriber.deleteMany({number: req.body.number})
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'delete subscribe'
        });
        ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/check', async(req, res) => {
    try{
        await Subscriber.findOne()
        res.status(200);
        res.end('ok')
    } catch (err) {
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

module.exports = router;