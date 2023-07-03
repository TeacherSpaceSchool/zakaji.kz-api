const Subscriber = require('../models/subscriber');
const NotificationStatistic = require('../models/notificationStatistic');
const q = require('q');
const webPush = require('web-push');
const keys = require((process.env.URL).trim()!=='http://localhost'?'./../config/keys_prod':'./../config/keys_dev');

module.exports.sendWebPush = async({title, message, tag, url, icon, user}) => {
    const payload = {
        title: title?title:title,
        message: message?message:message,
        url: url?url:'https://zakaji.kz',
        icon: icon?icon:'https://zakaji.kz/static/192x192.png',
        tag: tag?tag:'ZAKAJI.KZ'
    };
    let _object = new NotificationStatistic({
        tag: payload.tag,
        url: payload.url,
        icon: payload.icon,
        title: payload.title,
        text: payload.message,
        delivered: 0,
        failed: 0,
    });
    _object = await NotificationStatistic.create(_object)
    payload._id = _object._id
    if(user==='all'){
        Subscriber.find({}, (err, subscriptions) => {
            if (err) {
                console.error('Error occurred while getting subscriptions');
            } else {
                let parallelSubscriberCalls = subscriptions.map((subscription) => {
                    return new Promise((resolve, reject) => {
                        const pushSubscriber = {
                            endpoint: subscription.endpoint,
                            keys: {
                                p256dh: subscription.keys.p256dh,
                                auth: subscription.keys.auth
                            }
                        };

                        const pushPayload = JSON.stringify(payload);
                        const pushOptions = {
                            vapidDetails: {
                                subject: 'https://zakaji.kz',
                                privateKey: keys.privateKey,
                                publicKey: keys.publicKey
                            },
                            headers: {}
                        };
                        webPush.sendNotification(
                            pushSubscriber,
                            pushPayload,
                            pushOptions
                        ).then((value) => {
                            resolve({
                                status: true,
                                endpoint: subscription.endpoint,
                                data: value
                            });
                        }).catch((err) => {
                            reject({
                                status: false,
                                endpoint: subscription.endpoint,
                                data: err
                            });
                        });
                    });
                });
                q.allSettled(parallelSubscriberCalls).then(async(pushResults) => {
                    try{
                        let delivered = 0;
                        let failed = 0;
                        for(let i=0; i<pushResults.length; i++){
                            if(pushResults[i].state === 'rejected'||pushResults[i].reason)
                                failed+=1
                            else
                                delivered += 1
                        }
                        _object.delivered = delivered
                        _object.failed = failed
                        await _object.save()
                    } catch (err) {
                        console.error(err)
                    }
                });
            }
        }).lean();
    }
    else {
        Subscriber.find({user: user}, (err, subscriptions) => {
            if (err) {
                console.error('Error occurred while getting subscriptions');
            } else {
                let parallelSubscriberCalls = subscriptions.map((subscription) => {
                    return new Promise((resolve, reject) => {
                        const pushSubscriber = {
                            endpoint: subscription.endpoint,
                            keys: {
                                p256dh: subscription.keys.p256dh,
                                auth: subscription.keys.auth
                            }
                        };

                        const pushPayload = JSON.stringify(payload);
                        const pushOptions = {
                            vapidDetails: {
                                subject: 'https://zakaji.kz',
                                privateKey: keys.privateKey,
                                publicKey: keys.publicKey
                            },
                            headers: {}
                        };
                        webPush.sendNotification(
                            pushSubscriber,
                            pushPayload,
                            pushOptions
                        ).then((value) => {
                            resolve({
                                status: true,
                                endpoint: subscription.endpoint,
                                data: value
                            });
                        }).catch((err) => {
                            reject({
                                status: false,
                                endpoint: subscription.endpoint,
                                data: err
                            });
                        });
                    });
                });
                q.allSettled(parallelSubscriberCalls).then(async (pushResults) => {
                    try{
                        let delivered = 0;
                        let failed = 0;
                        for(let i=0; i<pushResults.length; i++){
                            if(pushResults[i].state === 'rejected'||pushResults[i].reason)
                                failed+=1
                            else
                                delivered += 1
                        }
                        _object.delivered = delivered
                        _object.failed = failed
                        await _object.save()
                    } catch (err) {
                        console.error(err)
                    }
                });
            }
        }).lean();
    }

 }
