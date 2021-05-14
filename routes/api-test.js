const express = require('express')

const router = express.Router()

const apiTestController = require('../controllers/api-test')

//const Client = require('../models/client')
router.get('/test-api', apiTestController.apiTest)
/*router.get('/newClient', (req, res) => {
    const client = new Client({
        firstName: "Kader",
        lastName: "Diarra",
        email: "kader.dev@gmail.com",
        apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxx",
        secretKey: "xxxxxxxxxxxxxxxxxxxxxxxxxx"
    })

    client.save()
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(500)
            console.log(err)
        })
})*/

module.exports = router
