const { matchedData } = require('express-validator')
const Client = require('../../models/client')
const { axiosInstance } = require('../../utils/axios-utils')
const { createHistory } = require('../../controllers/history/history')
const binanceOrder = require('./binanceOrder')
const getClientAmountPercentage = require('./getClientAmountPercentage')


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

async function getSymbolePrice(symbolName) {
    try {
        const result = await axiosInstance.get('/ticker/price', {
            params: {symbol: symbolName},
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (result.data)
            return result.data.price
        throw new Error('Cannot get symbol price')
    } catch (error) {
        console.log(error)
    }
}

exports.trade = async (req, res) => {
    const body = matchedData(req, { locations: ['body'] })
    const clientsId = body.clientsId
    const { amountType, amountPercentage, symbol } = body
    const orderInfo = {
        symbol: symbol.name,
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
            /** */
            const sideOrderInfo = {
                symbol,
                amountPercentage,
                side: body.side,
                symbolPrice: 0,
            }
            if (orderInfo.side === 'SELL') {
                // get base price in quote
                sideOrderInfo.symbolPrice = await getSymbolePrice(symbol.name)
            }
            const newClients = await getClientAmountPercentage(clients, amountPercentage, sideOrderInfo)
            /** */
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

        const time = new Date().getTime()
        await createHistory({
            data: ordersResponse,
            info: {
                side: orderInfo.side,
                symbol: orderInfo.symbol,
                time,
                successQuantity: getSucessQuantity(ordersResponse),
            }
        })
        res.status(200).send({
            data: ordersResponse,
            info: {
                side: orderInfo.side,
                symbol: orderInfo.symbol,
                time,
                successQuantity: getSucessQuantity(ordersResponse),
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).end()
    }
}