const OrganizationAzyk = require('../models/organizationAzyk');
const SingleOutXMLAzyk = require('../models/singleOutXMLAzyk');
const SingleOutXMLReturnedAzyk = require('../models/singleOutXMLReturnedAzyk');
const ClientAzyk = require('../models/clientAzyk');
const SingleOutXMLAdsAzyk = require('../models/singleOutXMLAdsAzyk');
const OutXMLShoroAzyk = require('../models/integrate/shoro/outXMLShoroAzyk');
const OutXMLReturnedShoroAzyk = require('../models/integrate/shoro/outXMLReturnedShoroAzyk');
const OutXMLAdsAShoroAzyk = require('../models/integrate/shoro/outXMLAdsShoroAzyk');

module.exports.reductionSingleOutXMLAzyk = async() => {
    let organization = await OrganizationAzyk
        .findOne({name: 'ЗАО «ШОРО»'})
    organization.pass = 'shoro'
    await organization.save()
    let integrates = await OutXMLShoroAzyk.find({status: {$ne: 'check'}})
    console.log(`reduction SingleOutXMLAzyk: ${integrates.length}`)
    for(let i = 0; i<integrates.length;i++){
        if(!await SingleOutXMLAzyk.findOne({guid: integrates[i].guid})){
            let newIntagrate = new SingleOutXMLAzyk({
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
            await SingleOutXMLAzyk.create(newIntagrate);
        }
    }
    integrates = await OutXMLReturnedShoroAzyk.find({status: {$ne: 'check'}})
    console.log(`reduction SingleOutXMLReturnedAzyk: ${integrates.length}`)
    for(let i = 0; i<integrates.length;i++){
        if(!await SingleOutXMLReturnedAzyk.findOne({guid: integrates[i].guid})) {
            let newIntagrate = new SingleOutXMLReturnedAzyk({
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
            await SingleOutXMLReturnedAzyk.create(newIntagrate);
        }
    }
    integrates = await ClientAzyk.find()
    console.log(`reduction ClientAzyk: ${integrates.length}`)
    for(let i = 0; i<integrates.length;i++){
        if(integrates[i].sync.length){
            integrates[i].sync = [organization._id.toString()]
            await integrates[i].save()
        }
    }
    integrates = await OutXMLAdsAShoroAzyk.find()
    console.log(`reduction SingleOutXMLAdsAzyk: ${integrates.length}`)
    for(let i = 0; i<integrates.length;i++){
        if(!await SingleOutXMLAdsAzyk.findOne({guid: integrates[i].guid})) {
            let newIntagrate = new SingleOutXMLAdsAzyk({
                guid: integrates[i].guid,
                district: integrates[i].district,
                organization: organization._id,
                pass: organization.pass,

            });
            await SingleOutXMLAdsAzyk.create(newIntagrate);
        }
    }

}