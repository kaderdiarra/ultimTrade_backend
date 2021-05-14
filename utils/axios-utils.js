require('dotenv').config()
const axios = require('axios')

function axiosError(error) {
    if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log('Error', error.message);
    }
    console.log(error.config);
}

function createAxiosInstance(apiKey = null, timeout = 5000) {
    const axiosInstance = axios.create({
        baseURL: process.env.BINANCE_API_URL,
        timeout,
        headers: {
            'Content-Type': 'application/json',
            'X-MBX-APIKEY': apiKey
        }
    })

    return axiosInstance
}

module.exports = {
    axiosError,
    createAxiosInstance,
}
