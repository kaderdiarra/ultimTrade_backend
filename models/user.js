const mongoose = require('mongoose')
const Schema = mongoose.Schema

// https://www.geeksforgeeks.org/upload-and-retrieve-picture-on-mongodb-using-mongoose/

const userSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User

