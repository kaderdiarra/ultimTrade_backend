const crypto = require('crypto')
const qs = require('qs')

function createSignature(secretKey, data) {
    const dataQueryString = qs.stringify(data)
    const signature = crypto.createHmac('sha256', secretKey)
        .update(dataQueryString)
        .digest('hex')
    return signature
}

module.exports = createSignature