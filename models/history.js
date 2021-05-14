const mongoose = require('mongoose')
const Schema = mongoose.Schema

const historySchema = new Schema({
    data: [
        {
            _id: false,
            userId: {type: mongoose.Types.ObjectId, required: true},
            firstName: {type: String, required: true},
            lastName: {type: String, required: true},
            email: {type: String, required: true},
            status: {type: Boolean, required: true},
        }
    ],
    info: {
        time: {type: Date, default: new Date().getTime()},
        side: {type: String, required: true},
        symbol: {type: String, required: true},
        successQuantity: {
            total: {type: Number, required: true},
            successful: {type: Number, required: true},
        },
    },
})

const History = mongoose.model('History', historySchema)
module.exports = History