const Organization = require('../models/organization');

module.exports.reductionToOrganization= async()=>{
    let organizations = await Organization.find()
    console.log(`reductionToOrganization: ${organizations.length}`)
    for(let i = 0; i<organizations.length;i++){
        organizations[i].cities = ['Бишкек']
        await organizations[i].save();
    }
}