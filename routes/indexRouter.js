const express=require('express')
const router=express.Router()

const {registerInvestor, loginInvestor, currentInvestor}=require('../controllers/indexController')
const { isAuthenticated } = require('../middlewares/auth')

router.post('/register',registerInvestor)

router.post('/login',loginInvestor)

router.post('/currentInvestor',isAuthenticated,currentInvestor)

module.exports=router