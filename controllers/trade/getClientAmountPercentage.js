const { decrypt } = require('../../utils/secure-data')
const createSignature = require('../../utils/create-signature')
const { MINIMUM_PRICE } = require('../../constants/constant')
const { axiosInstance } = require('../../utils/axios-utils')

function getSymbolBalanceSell(balances, sideOrderInfo) {
    const result = balances.reduce((accumulator, currentValue) => {
        if (currentValue.asset === sideOrderInfo.symbol.base) {
            const value = currentValue.free * sideOrderInfo.symbolPrice
            if (value >= 10)
                return value
        }
        return accumulator
    }, 0)
    return result
}

function getSymbolBalanceBuy(balances, sideOrderInfo) {
    const result = balances.reduce((accumulator, currentValue) => {
        if (currentValue.asset === sideOrderInfo.symbol.quote && currentValue.free >= 10)
            return currentValue.free
        return accumulator
    }, 0)
    return result
}

function getSymbolBalance(balances, sideOrderInfo) {
    if (sideOrderInfo.side === 'SELL')
        return getSymbolBalanceSell(balances, sideOrderInfo)
    return getSymbolBalanceBuy(balances, sideOrderInfo)
}

async function getClientBalance(client, percentage, sideOrderInfo) {
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
        const symbolBalance = getSymbolBalance([...balances], sideOrderInfo)
        if (symbolBalance < 10)
            throw new Error('Insufficient usdt balance')
        let amount = Math.trunc((symbolBalance * percentage) / 100)
        if (amount < 10)
            amount = 10
        //console.log('BALANCE:', symbolBalance)
        //console.log('AMOUNT:', amount)
        //console.log('SYMBOLE PRICE:', sideOrderInfo.symbolPrice)
        return amount
    } catch (error) {
        console.log(error)
        return 0
    }
}

async function getClientAmountPercentage(clients, percentage, sideOrderInfo) {
    try {
        promises = clients.map(async (client) => {
            return {
                client,
                amount: await getClientBalance(client, percentage, sideOrderInfo),
            }
        })
        const result = await Promise.all(promises)
        return result
    } catch (error) {
        console.log(error)
    }
}

module.exports = getClientAmountPercentage