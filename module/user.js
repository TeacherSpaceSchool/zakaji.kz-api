const UserAzyk = require('../models/userAzyk');
let adminId = '';
const adminLogin = require('./const').adminLogin,
    adminPass = require('./const').adminPass;


let getAdminId = () => {
    return adminId
}

let checkAdmin = async (role, status) => {
    return (role=='admin'&&status=='active')
}

module.exports.createAdmin = async () => {
    await UserAzyk.deleteMany({$or:[{login: 'admin', role: {$ne: 'admin'}}, {role: 'admin', login: {$ne: 'admin'}}]});
    let findAdmin = await UserAzyk.findOne({login: adminLogin});
    if(!findAdmin){
        const _user = new UserAzyk({
            login: adminLogin,
            role: 'admin',
            status: 'active',
            password: adminPass,
        });
        findAdmin = await UserAzyk.create(_user);
    }
    else if(!findAdmin.checkPassword(adminPass)) {
        findAdmin.password = adminPass
        await findAdmin.save()
    }
    adminId = findAdmin._id.toString();
}

module.exports.reductionToUser = async() => {
    let users = await UserAzyk.find({login: null})
    console.log(`reductionToUser: ${users.length}`)
    for(let i = 0; i<users.length;i++){
        users[i].login = users[i].phone
        await users[i].save();
    }
}

module.exports.getAdminId = getAdminId;
module.exports.checkAdmin = checkAdmin;
