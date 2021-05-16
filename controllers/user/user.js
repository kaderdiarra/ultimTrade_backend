const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { matchedData } = require('express-validator')
const User = require('../../models/user')
require('dotenv').config()

exports.userLogin = async(req, res) => {
    const { email, password } = matchedData(req, { locations: ['body'] })

    try {
        const existingUser = await User.findOne({ email }, { createdAt: 0, updatedAt: 0, __v: 0, firstName: 0, lastName: 0 })

        if (!existingUser)
            return res.status(404).send('User doesn\'t exist.')
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordCorrect)
            return res.status(400).send('Invalid password')

        const payload = {
            email: existingUser.email,
            _id: existingUser._id,
        }
        const options = { expiresIn: '1h' }
        const token = jwt.sign({...payload}, process.env.JWT_SECRET, options)

        res
            .status(202)
            /*.cookie('token', token, {
                httpOnly: true,
                //secure: true,
                //sameSite: 'strict', // sending cookie mode
                //maxAge: 10000,
                //signed: true,
            })*/
            .send({user: payload, token})
    } catch (error) {
        console.log(error)
        res.status(500).end()
    }
}

exports.createUser = async(req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = matchedData(req, { locations: ['body'] })
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(400).send('User already exists.')
        }

        if (password !== confirmPassword)
            return res.status(400).send('Password don\'t match')

        const hashedPassword = await bcrypt.hash(password, 12)
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
       })
       const payload = {
            email: newUser.email,
            _id: newUser._id,
       }
       const options = { expiresIn: '1h' }
       const token = jwt.sign(payload, process.env.JWT_SECRET, options)
       res.status(200).json({user: newUser, token})
    } catch (error) {
        console.log(error)
        res.status(500).end()
    }
}