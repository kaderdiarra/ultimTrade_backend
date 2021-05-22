//https://api.binance.com/api/v3/
//https://testnet.binance.vision/api/v3
//malik-lbssociety-lbs-mirror-test.zeet.app/

const obj = [1,2,3,4,5,6,7]

function myFunc(value) {
    const result = 0
    const tmp = obj.reduce((accumulator, currentValue) => {
        if (currentValue === 7)
            return currentValue
        return result
    }, result)
    return tmp
}

const axios = require('axios')

const apiTest = () => {
    const axiosInstance = axios.create({
        baseURL: 'https://api.binance.com/api/v3/',
        headers: {
            'Content-Type': 'application/json',
            //'X-MBX-APIKEY': process.env.API_KEY_TESTNET
        }
    })
    axiosInstance.get('/ticker/price')
        .then(response => {
            const str = new RegExp('/USDT/')
            const result = response.data
            const symbols = result.map(item => item.symbol)
            const usdt_symbols = symbols.filter(symbol => /USDT/.test(symbol))
            //console.log('SYMBOLS:', usdt_symbols)
            new_symbols = usdt_symbols.map(symbol => {
                const splited = symbol.split('USDT')
                if (splited.length === 2) {
                    return {
                        base: splited[0],
                        quote: 'USDT',
                        name: symbol,
                    }
                }
                return
            })
            const symbols_array = new_symbols.filter(symbol => (symbol.base !== '' && symbol.base !== 'USDT'))
            symbols_array.forEach(symbol => console.log(symbol, ','))
        })
        .catch(error => {
            console.log(error)
        })
}
