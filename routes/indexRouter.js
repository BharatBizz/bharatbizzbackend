const express=require('express')
const router=express.Router()

const {registerInvestor, loginInvestor, currentInvestor, depositMoney,getHistory, requestWithdraw}=require('../controllers/indexController')
const { isAuthenticated } = require('../middlewares/auth')

router.post('/register',registerInvestor)

router.post('/login',loginInvestor)

router.post('/currentInvestor',isAuthenticated,currentInvestor)

router.post('/deposit/:userId',isAuthenticated,depositMoney)

router.get('/getHistory/:userId',isAuthenticated,getHistory)

router.post('/requestWithdraw',isAuthenticated,requestWithdraw)
module.exports=router