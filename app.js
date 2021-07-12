const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { createProxyMiddleware } = require('http-proxy-middleware')
require('dotenv').config()

const PORT = process.env.PORT || 5000
const app = express()
const apiTestRouter = require('./routes/api-test')
const clientRouter = require('./routes/client')
const tradingRouter = require('./routes/trade')
const historyRouter = require('./routes/history')
const userRouter = require('./routes/user')

const corsOptions = {
    origin: process.env.CORS_FRONTEND_ORIGIN,
    optionsSuccessStatus: 200
}

app.set('strict routing', false)
//app.use(cors(corsOptions)) // { credentials: true, origin: 'http://localhost:3000' }
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(express.json()) // json api
app.use(cookieParser())

//app.use('/', apiTestRouter)
app.use('/client', clientRouter)
app.use('/trade', tradingRouter)
app.use('/history', historyRouter)
app.use('/user', userRouter)


async function dbConnection() {
    const mongoConnectOpt = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    }
    await mongoose.connect(process.env.MONGO_DB_URL, mongoConnectOpt)
}

// connect to mongodb
dbConnection()
    .then(() => {
        console.log('connected to db')
        app.listen(PORT, () => {
            console.log(`Listening on Port: ${PORT}`)
            console.log(`FRONTEND HOST: ${process.env.CORS_FRONTEND_ORIGIN}`)
        })
    })
    .catch(err => console.log(err))

//app.use('/', createProxyMiddleware({target: 'http://localhost:3000'}))
