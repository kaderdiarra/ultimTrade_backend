const express = require('express')
const router = express.Router()

const controllers = require('../controllers/user/user')
const { verifyTokenExpritation } = require('../middleware/authorization')
const { userLoginValidationRules, userCreationValidationRules, validate } = require('../controllers/validator')

// update user
router.post('/login', userLoginValidationRules(), validate, controllers.userLogin)

router.post('/create', userCreationValidationRules(), validate, controllers.createUser)

router.get('/verifyToken', verifyTokenExpritation)

module.exports = router