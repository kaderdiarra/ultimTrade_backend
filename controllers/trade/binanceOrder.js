const { axiosInstance, axiosError } = require('../../utils/axios-utils')
const { decrypt } = require('../../utils/secure-data')
const createSignature = require('../../utils/create-signature')

const sendOrderResult = (client, status) => {
    return {
        userId: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        status,
    }
}

const makeOrder = async (orderInfo, secretKey, apiKey) => {
    const newOrderInfo = {...orderInfo}
    newOrderInfo.timestamp = new Date().getTime()
    newOrderInfo.signature = createSignature(secretKey, newOrderInfo)
    const result = await axiosInstance.post('order', null, {
        params: {...newOrderInfo},
        headers: {
            'Content-Type': 'application/json',
            'X-MBX-APIKEY': apiKey
        }
    })
    return result.data
}

const binanceOrder = async (client, orderInfo) => {
    try {
        const apiKey = decrypt(client.apiKey)
        const secretKey = decrypt(client.secretKey)
        const orderResponse = await makeOrder(orderInfo, secretKey, apiKey)
        console.log('SUCCESS:', orderResponse)
        return sendOrderResult(client, true)

    } catch (error) {
        console.log('FAIL:')
        console.log(`id: ${client._id} name: ${client.firstName} ${client.lastName}`)
        axiosError(error)
        return sendOrderResult(client, false)
    }
}

module.exports = binanceOrder