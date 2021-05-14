require('dotenv').config()
const createSignature = require('./create-signature')
const { axiosError, createAxiosInstance } = require('./axios-utils')



async function isValidApiKey(apiKey) {
    const axiosInstance = createAxiosInstance(apiKey)

    const symbol = "BTCBUSD"
    const limit = 0

    try {
        await axiosInstance.get('historicalTrades', {
            params: {
                symbol,
                limit,
            }
        })
        return Promise.resolve()
    } catch (error) {
        axiosError(error)
        return Promise.reject()
    }
}

async function isValidSecretKey(secretKey, { req }) {
    const { apiKey } = req.body
    const axiosInstance = createAxiosInstance(apiKey)

    const timestamp = new Date().getTime()
    const signature = createSignature(secretKey, { timestamp })

    try {
        await axiosInstance.get('account', {
            params: {
                timestamp,
                signature,
            }
        })
        return Promise.resolve()
    } catch (error) {
        axiosError(error)
        return Promise.reject()
    }
}

// VERIFY API KEY AND SECRET KEY
/*function validateApiSecretKey(value, { req }) {
    const { secretKey, apiKey } = req.body
    const axiosInstance = createAxiosInstance(apiKey)

    const timestamp = Date.now()
    const signature = createSignature(secretKey, { timestamp })

    axiosInstance.get('account', {
        params: {
            timestamp,
            signature,
        }
    })
        .then(response => {
            return Promise.resolve()
        })
        .catch(error => {
            axiosError(error)
            return Promise.reject()
    })
}*/

module.exports = {
    isValidApiKey,
    isValidSecretKey,
}