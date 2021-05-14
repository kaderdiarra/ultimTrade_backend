const { matchedData } = require('express-validator')
const axios = require('axios')
const Client = require('../../models/client')
const { decrypt } = require('../../utils/secure-data')
const { axiosError } = require('../../utils/axios-utils')
const createSignature = require('../../utils/create-signature')
const { createHistory } = require('../../controllers/history/history')

const axiosInstance = axios.create({
    baseURL: process.env.BINANCE_API_URL,
    timeout: 5000,
})

function getUsdt(balances) {
    const result = balances.reduce((accumulator, currentValue) => {
        if (currentValue.asset === 'USDT' &&  currentValue.free >= 10)
            return currentValue.free
        return accumulator
    }, 0)
    return result
}

async function getUserBalance(client, percentage) {
    try {
        const apiKey = decrypt(client.apiKey)
        const secretKey = decrypt(client.secretKey)
        const timestamp = new Date().getTime()
        const signature = createSignature(secretKey, {timestamp})
        const result = await axiosInstance.get('account', {
            params: {
                timestamp,
                signature,
            },
            headers: {
                'Content-Type': 'application/json',
                'X-MBX-APIKEY': apiKey
            }
        })
        const balances = result.data?.balances
        const usdtBalance = getUsdt(balances)
        if (usdtBalance < 10)
            throw new Error('Insufficient usdt balance')
        const amount = Math.trunc((usdtBalance * percentage) / 100)
        return (amount)
    } catch (error) {
        console.log(error)
        return 0
    }
}

async function getClientWithPercentageBalance(clients, percentage) {
    try {
        promises = clients.map(async (client) => {
            return {
                client,
                amount: await getUserBalance(client, percentage),
            }
        })
        const result = await Promise.all(promises)
        return result
    } catch (error) {
        console.log(error)
    }
}

const binanceOrder = async (client, orderInfo) => {
    const clientInfoToSend = {
        userId: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
    }

    const newOrderInfo = {...orderInfo}

    const apiKey = decrypt(client.apiKey)
    const secretKey = decrypt(client.secretKey)
    try {
        newOrderInfo.timestamp = new Date().getTime()
        newOrderInfo.signature = createSignature(secretKey, newOrderInfo)
        const result = await axiosInstance.post('order', null, {
            params: {...newOrderInfo},
            headers: {
                'Content-Type': 'application/json',
                'X-MBX-APIKEY': apiKey
            }
        })
        return {
            ...clientInfoToSend,
            status: true,
        }

    } catch (error) {
        console.log('FAIL:')
        console.log(`id: ${client._id} name: ${client.firstName} ${client.lastName}`)
        axiosError(error)
        return {
            ...clientInfoToSend,
            status: false,
        }
    }
}


/**
 * if there are performance issues with the endpoint above, these API clusters are also available:
 *      https://api1.binance.com
 *      https://api2.binance.com
 *      https://api3.binance.com
 *
 */
// https://api.binance.com/api/v3/

function getSucessQuantity(results) {
    const reducer = (accumulaor, currentValue) => {
        if (currentValue.status)
            return (accumulaor + 1)
        return accumulaor
    }
    return ({
        total: results.length,
        successful: results.reduce(reducer, 0)
    })
}

exports.trade = async (req, res) => {
    const body = matchedData(req, { locations: ['body'] })
    const clientsId = body.clientsId
    const { amountType, amountPercentage } = body
    const orderInfo = {
        symbol: body.symbol,
        side: body.side,
        type: body.type,
        quoteOrderQty: body.quoteOrderQty,
    }
    let promises
    let ordersResponse
    // retrieve all clients
    try {
        const clients = await Client.find({'_id': {
            $in: clientsId,
        }})

        if (amountType === 'PERCENTAGE') {
            const newClients = await getClientWithPercentageBalance(clients, amountPercentage)
            promises = newClients.map(async elem => {
                const result = await binanceOrder(elem.client, {...orderInfo, quoteOrderQty: elem.amount})
                return result
            })
            ordersResponse = await Promise.all(promises)
        } else {
            promises = clients.map(async client => {
                const result = await binanceOrder(client, orderInfo)
                return result
            })
            ordersResponse = await Promise.all(promises)
        }

        await createHistory({
            data: ordersResponse,
            info: {
                side: orderInfo.side,
                symbol: orderInfo.symbol,
                successQuantity: getSucessQuantity(ordersResponse),
            }
        })
        res.status(200).send({
            data: ordersResponse,
            info: {
                side: orderInfo.side,
                symbol: orderInfo.symbol,
                time: new Date().getTime(),
                successQuantity: getSucessQuantity(ordersResponse),
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).end()
    }
}