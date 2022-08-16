const AgentRouteAzyk = require('../models/agentRouteAzyk');

module.exports.reductionToAgentRoute = async() => {
    let agentRoutes = await AgentRouteAzyk
        .find()
        .populate({path: 'district', select: '_id client'})
        .populate({path: 'organization', select: 'name'})
        .lean()
    let err = false
    for(let i = 0; i<agentRoutes.length;i++){
        err = false
        for(let i1=0; i1<7; i1++) {
            for(let i2=0; i2<agentRoutes[i].clients[i1].length; i2++) {
                if (!agentRoutes[i].district.client.toString().includes(agentRoutes[i].clients[i1][i2].toString())) {
                    err = true
                    agentRoutes[i].clients[i1].splice(i2, 1)
                    i2 -= 1
                }
            }
        }
        if(err){
            await AgentRouteAzyk.updateOne({_id: agentRoutes[i]._id}, {clients: agentRoutes[i].clients})
            console.log(`reductionToAgentRoute: ${i}`)
        }
    }
}