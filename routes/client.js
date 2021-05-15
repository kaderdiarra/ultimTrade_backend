const express = require('express')
const router = express.Router()
const { param } = require('express-validator')
const controllers = require('../controllers/client/client')
const { clientValidationRules, deletionByIdRules, clientUpdateRules, searchClientRules, validate } = require('../controllers/validator')
const { authorization } = require('../middleware/authorization')


// get all clients
router.get('/', /*authorization,*/ controllers.getAllClients)

// create new client
router.post('/create', clientValidationRules(), validate, authorization, controllers.createClient)

// https://stackabuse.com/get-query-strings-and-parameters-in-express-js/
// delete client
router.delete('/delete/:id', deletionByIdRules(), validate, authorization, controllers.deleteClient)

// update user
router.patch('/update/:_id', clientUpdateRules(), validate, authorization, controllers.updateUser)

router.get('/search', searchClientRules(), validate, controllers.searchClients)

module.exports = router