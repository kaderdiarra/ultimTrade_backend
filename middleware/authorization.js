const jwt = require('jsonwebtoken')
const jwtDecode = require('jwt-decode')

require('dotenv').config()

exports.authorization = async (req, res, next) => {
    //const token = req.cookies.token
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
        res.status(403).send()
    }
    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (error) {
        console.log(error)
        return res.status(401).send('Need authorization | Acces denied')
    }
}

exports.verifyTokenExpritation = (req, res) => {
    try {
        //const token = req.cookies?.token
        const token = req.headers.authorization?.split(" ")[1]

        if (token) {
            const decodedData = jwt.verify(token, process.env.JWT_SECRET)
            if (decodedData) {
                //console.log("token: ", token)
                tokenDuration = jwtDecode(token)
                if (tokenDuration.exp * 1000 > new Date().getTime()) {
                    res.status(200).send(true)
                    return
                }
            }
        }
        throw new Error('Invalid token')
    } catch (error) {
        console.log(error)
        res.clearCookie('token')
        res.status(400).send('Need authorization | Acces denied')
    }
}