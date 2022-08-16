const EmploymentAzyk = require('../models/employmentAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const mongoose = require('mongoose');
//'5e0176a378050b5ae1829ba0' '5e3ea2008c4ac54d873e8a89' '5e3ea2e4934d024d86c66b2a' '5e3fc975934d024d86c66bd9' '5f507f6fd011e72460fc7590' '5f8426c99c93da0feda4abc7' '5fa3d8d8f293a935ec29f9ef' '60c08c716f9f58018307d60d' '6139f291d0a3fa56b88fc3ec'
/*let deletedEmployment = [
    '5e0176a378050b5ae1829ba0',
    '5e3ea2008c4ac54d873e8a89',
    '5e3ea2e4934d024d86c66b2a',
    '5e3fc975934d024d86c66bd9',
    '5f507f6fd011e72460fc7590',
    '5f8426c99c93da0feda4abc7',
    '5fa3d8d8f293a935ec29f9ef',
    '60c08c716f9f58018307d60d',
    '6139f291d0a3fa56b88fc3ec'
]*/
const createdEmployment = [
    {
        email: '5e3ea2008c4ac54d873e8a89',
        phone: [],
        name: 'Бектеналиев Дастан 0702881118',
        organization: '5e00a5c0f2cd0f4f82eac3db',
        user: '5e3ea2008c4ac54d873e8a88'
    },
    {
        email: '5e3ea2e4934d024d86c66b2a',
        phone: [],
        name: 'Хусанбай уулу Алишер 0 700 08 78 04',
        organization: '5e00a5c0f2cd0f4f82eac3db',
        user: '5e3ea2e4934d024d86c66b29'
    },
    {
        email: '5f507f6fd011e72460fc7590',
        phone: [],
        name: 'Кудайбергенова Чолпонай',
        organization: '5e00a5c0f2cd0f4f82eac3db',
        user: '5f507f6fd011e72460fc758f'
    },
    {
        email: '5fa3d8d8f293a935ec29f9ef',
        phone: [],
        name: 'Шарыпов Акжол 0700694986',
        organization: '5e00a5c0f2cd0f4f82eac3db',
        user: '5fa3d8d8f293a935ec29f9ee'
    },
    {
        email: '60c08c716f9f58018307d60d',
        phone: [],
        name: 'Артыков Алмаз 0700686815',
        organization: '5e00a5c0f2cd0f4f82eac3db',
        user: '60c08c716f9f58018307d60c'
    }
]

module.exports.reductionToEmployment = async() => {
    let employment, count
    for(let i=0; i<createdEmployment.length; i++) {
        employment = await EmploymentAzyk.findOne({email: createdEmployment[i].email}).lean()
        if(!employment) {
            employment = new EmploymentAzyk({...createdEmployment[i], del: 'deleted'});
            employment = await EmploymentAzyk.create(employment);
            count = await InvoiceAzyk.countDocuments({agent: new mongoose.Types.ObjectId(employment.email)})
            await InvoiceAzyk.updateMany({agent: new mongoose.Types.ObjectId(employment.email)}, {agent: employment._id})
            console.log(`Восстановлен ${i+1}/${createdEmployment.length} Документов ${count}`)
        }
        else
            console.log(`Уже восстановлен ${i+1}/${createdEmployment.length}`)
    }
    console.log('Готово')
    /*let employment, notFindEmployment = []
    for(let i=0; i<deletedEmployment.length; i++) {
        employment = await EmploymentAzyk.findOne({_id: deletedEmployment[i]}).lean()
        if(employment)
            console.log(employment)
        else
            notFindEmployment.push(deletedEmployment[i])
    }
    console.log(notFindEmployment)*/
}