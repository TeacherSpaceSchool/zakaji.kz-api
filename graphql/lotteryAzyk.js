const LotteryAzyk = require('../models/lotteryAzyk');
const { saveImage, deleteFile, urlMain } = require('../module/const');

const type = `
  type Lottery {
    _id: ID
    createdAt: Date
    image: String,
    organization: Organization
    status: String
    text: String
    date: Date
    prizes: [LotteryPrize]
    photoReports: [LotteryPhotoReport]
    tickets: [LotteryTicket]
  }
  type LotteryTicket {
        status: String
        number: String
        client: Client
        prize: String
  }
  input LotteryTicketInput {
        number: String
        client: ID
  }
  type LotteryPrize {
        _id: ID
        image: String
        name: String
        count:  Int
  }
  input LotteryPrizeInput {
        _id: ID
        image: Upload
        name: String
        count:  Int
  }
  type LotteryPhotoReport {
        _id: ID
        image: String
        text: String
  }
  input LotteryPhotoReportInput {
        _id: ID
        image: Upload
        text: String
  }
`;

const query = `
    lotterys: [Lottery]
    lottery(_id: ID!): Lottery
`;

const mutation = `
    addLottery(image: Upload, organization: ID, text: String, date: Date, prizes: [LotteryPrizeInput]): Data
    setLottery(_id: ID!, image: Upload, text: String, date: Date, tickets: [LotteryTicketInput], prizes: [LotteryPrizeInput], photoReports: [LotteryPhotoReportInput]): Data
    setLotteryTickets(_id: ID!): Data
    setLotteryPrizes(_id: ID!): Data
    setLotteryPhotoReport(_id: ID!): Data
    checkWinners(_id: ID!): Data
    deleteLottery(_id: [ID]!): Data
`;

const resolvers = {
    lotterys: async(parent, ctx, {user}) => {
        return await LotteryAzyk.find({
            ...user.organization ? {organization: user.organization} : {}
        })
            .select('image text date _id')
            .sort('-createdAt')
            .lean()
    },
    lottery: async(parent, {_id}, {user}) => {
        let res = await LotteryAzyk.findOne({
            _id: _id,
            ...user.organization?{organization: user.organization}:{}
        })
            .populate({
                path: 'organization',
                select: 'name _id'
            })
            .populate({
                path: 'tickets.client',
                select: 'name _id address'
            })
            .lean()
        return res
    }
};

const resolversMutation = {
    addLottery: async(parent, {image, organization, text, date, prizes}, {user}) => {
        if(['admin'].includes(user.role)){
            let { stream, filename } = await image;
            filename = await saveImage(stream, filename)
            let _prizes = []
            for(let i = 0; i<prizes.length;i++) {
                let { stream, filename } = await prizes[i].image;
                filename = await saveImage(stream, filename)
                _prizes.push({
                    image: urlMain+filename,
                    name: prizes[i].name,
                    count:  prizes[i].count
                })
            }
            let _object = new LotteryAzyk({
                image: urlMain+filename,
                organization: organization,
                status: 'розыгрыш',
                text: text,
                date: date,
                prizes: _prizes,
                photoReports: [],
                tickets: []
            });
            await LotteryAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setLottery: async(parent, {_id, image, text, date, tickets, prizes, photoReports}, {user}) => {
        if(['суперорганизация', 'организация', 'admin'].includes(user.role)){
            let object = await LotteryAzyk.findById(_id)
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(text) object.text = text
            object.date = date
            if(tickets) {
                let _tickets = []
                for (let i = 0; i < tickets.length; i++) {
                    _tickets.push({status: 'розыгрыш', number: tickets[i].number, client: tickets[i].client, prize: undefined})
                }
                object.tickets = _tickets
            }
            let _prizes = []
            for(let i = 0; i<prizes.length;i++) {
                if(prizes[i].image) {
                    let {stream, filename} = await prizes[i].image;
                    filename = await saveImage(stream, filename)
                    _prizes.push({
                        image: urlMain + filename,
                        name: prizes[i].name,
                        count: prizes[i].count
                    })
                }
                else {
                    for (let i1 = 0; i1 < object.prizes.length; i1++) {
                        if (object.prizes[i1]._id.toString() === prizes[i]._id.toString())
                            _prizes.push({
                                image: object.prizes[i1].image,
                                name: prizes[i].name,
                                count: prizes[i].count
                            })
                    }
                }
            }
            object.prizes = _prizes
            let _photoReports = []
            for(let i = 0; i<photoReports.length;i++) {
                if(photoReports[i].image) {
                    let {stream, filename} = await photoReports[i].image;
                    filename = await saveImage(stream, filename)
                    _photoReports.push({
                        image: urlMain + filename,
                        text: photoReports[i].text
                    })
                }
                else {
                    for (let i1 = 0; i1 < object.photoReports.length; i1++) {
                        if (object.photoReports[i1]._id.toString() === photoReports[i]._id.toString())
                            _photoReports.push({
                                image: object.photoReports[i1].image,
                                text: photoReports[i].text
                            })
                    }
                }
            }
            object.photoReports = _photoReports
            await object.save();
        }
        return {data: 'OK'}
    },
    checkWinners: async(parent, {_id}, {user}) => {
        if(['суперорганизация', 'организация', 'admin'].includes(user.role)){
            let object = await LotteryAzyk.findById(_id)
            if(object.status==='розыгрыш'){
                let shuffleTickets = []
                let winners = []

                let index = 0
                if(object.tickets.length) {
                    while(object.tickets.length){
                        index = Math.floor(Math.random() * (Math.floor(object.tickets.length) - Math.ceil(0))) + Math.ceil(0)
                        shuffleTickets.push(object.tickets[index])
                        object.tickets.splice(index, 1)
                    }
                    for (let i = 0; i < object.prizes.length; i++) {
                         for (let i1 = 0; i1 < object.prizes[i].count; i1++) {
                            if(shuffleTickets.length) {
                                index = Math.floor(Math.random() * (Math.floor(shuffleTickets.length) - Math.ceil(0))) + Math.ceil(0)
                                shuffleTickets[index].status = 'победитель'
                                shuffleTickets[index].prize = object.prizes[i].name
                                winners.push(shuffleTickets[index])
                                shuffleTickets.splice(index, 1)
                                for (let i2 = 0; i2 < shuffleTickets.length; i2++) {
                                    if(shuffleTickets[i2].client.toString()===winners[winners.length-1].client.toString()){
                                        shuffleTickets[i2].status = 'проигравший'
                                        object.tickets.push(shuffleTickets[i2])
                                        shuffleTickets.splice(i2, 1)
                                        i2 -= 1
                                    }
                                }
                            }
                        }
                    }
                }
                for (let i = 0; i < shuffleTickets.length; i++) {
                    shuffleTickets[i].status = 'проигравший'
                }
                object.tickets = [...winners, ...shuffleTickets, ...object.tickets]
                object.status = 'разыграна'
                await object.save();
            }
        }
        return {data: 'OK'}
    },
    deleteLottery: async(parent, { _id }, {user}) => {
        if(['суперорганизация', 'организация', 'admin'].includes(user.role)){
            let objects = await LotteryAzyk.find({_id: {$in: _id}}).select('image prizes photoReports').lean()
            for(let i=0; i<objects.length; i++){
                await deleteFile(objects[i].image)
                for(let i1=0; i1<objects[i].prizes.length; i1++) {
                    await deleteFile(objects[i].prizes[i1].image)
                }
                for(let i1=0; i1<objects[i].photoReports.length; i1++) {
                    await deleteFile(objects[i].photoReports[i1].image)
                }
            }
            await LotteryAzyk.deleteMany({_id: {$in: _id}})

        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;