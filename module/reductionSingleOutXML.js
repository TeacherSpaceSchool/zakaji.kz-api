const Organization = require('../models/organization');
const SingleOutXML = require('../models/singleOutXML');
const SingleOutXMLReturned = require('../models/singleOutXMLReturned');
const Client = require('../models/client');
const SingleOutXMLAds = require('../models/singleOutXMLAds');
const OutXMLShoro = require('../models/integrate/shoro/outXMLShoro');
const OutXMLReturnedShoro = require('../models/integrate/shoro/outXMLReturnedShoro');
const OutXMLAdsAShoro = require('../models/integrate/shoro/outXMLAdsShoro');

module.exports.reductionSingleOutXML = async() => {
    let organization = await Organization
        .findOne({name: 'ЗАО «ШОРО»'})
    organization.pass = 'shoro'
    await organization.save()
    let integrates = await OutXMLShoro.find({status: {$ne: 'check'}})
    console.log(`reduction SingleOutXML: ${integrates.length}`)
    for(let i = 0; i<integrates.length;i++){
        if(!await SingleOutXML.findOne({guid: integrates[i].guid})){
            let newIntagrate = new SingleOutXML({
                data: integrates[i].data,
                guid: integrates[i].guid,
                date: integrates[i].date,
                number: integrates[i].number,
                agent: integrates[i].agent,
                forwarder: integrates[i].forwarder,
                exc: integrates[i].exc,
                client: integrates[i].client,
                payment: integrates[i].payment,
                inv: integrates[i].inv,
                track: integrates[i].track,
                promo: integrates[i].promo,
                invoice: integrates[i].invoice,
                status: integrates[i].status,
                organization: organization._id,
                pass: organization.pass,

            });
            await SingleOutXML.create(newIntagrate);
        }
    }
    integrates = await OutXMLReturnedShoro.find({status: {$ne: 'check'}})
    console.log(`reduction SingleOutXMLReturned: ${integrates.length}`)
    for(let i = 0; i<integrates.length;i++){
        if(!await SingleOutXMLReturned.findOne({guid: integrates[i].guid})) {
            let newIntagrate = new SingleOutXMLReturned({
                data: integrates[i].data,
                guid: integrates[i].guid,
                date: integrates[i].date,
                number: integrates[i].number,
                client: integrates[i].client,
                agent: integrates[i].agent,
                forwarder: integrates[i].forwarder,
                exc: integrates[i].exc,
                returned: integrates[i].returned,
                track: integrates[i].track,
                status: integrates[i].status,
                organization: organization._id,
                pass: organization.pass,

            });
            await SingleOutXMLReturned.create(newIntagrate);
        }
    }
    integrates = await Client.find()
    console.log(`reduction Client: ${integrates.length}`)
    for(let i = 0; i<integrates.length;i++){
        if(integrates[i].sync.length){
            integrates[i].sync = [organization._id.toString()]
            await integrates[i].save()
        }
    }
    integrates = await OutXMLAdsAShoro.find()
    console.log(`reduction SingleOutXMLAds: ${integrates.length}`)
    for(let i = 0; i<integrates.length;i++){
        if(!await SingleOutXMLAds.findOne({guid: integrates[i].guid})) {
            let newIntagrate = new SingleOutXMLAds({
                guid: integrates[i].guid,
                district: integrates[i].district,
                organization: organization._id,
                pass: organization.pass,

            });
            await SingleOutXMLAds.create(newIntagrate);
        }
    }

}