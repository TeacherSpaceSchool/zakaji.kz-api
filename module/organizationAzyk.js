const OrganizationAzyk = require('../models/organizationAzyk');

module.exports.reductionToOrganization= async()=>{
    let organizations = await OrganizationAzyk.find()
    console.log(`reductionToOrganization: ${organizations.length}`)
    for(let i = 0; i<organizations.length;i++){
        organizations[i].cities = ['Бишкек']
        await organizations[i].save();
    }
}