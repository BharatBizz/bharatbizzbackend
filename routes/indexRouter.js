const express=require('express')
const router=express.Router()

const {registerInvestor, loginInvestor, currentInvestor, depositMoney,getHistory, requestWithdraw, saveSelectedPackage, getActivePackages}=require('../controllers/indexController')
const { isAuthenticated } = require('../middlewares/auth')
const { getReferredUsers } = require('../controllers/adminController')

router.post('/register',registerInvestor)

router.post('/login',loginInvestor)

router.post('/currentInvestor',isAuthenticated,currentInvestor)

router.post('/deposit/:userId',isAuthenticated,depositMoney)

router.get('/getHistory/:userId',isAuthenticated,getHistory)

router.post('/requestWithdraw',isAuthenticated,requestWithdraw)

router.get('/getYourTeam/:userId', isAuthenticated,getReferredUsers);

router.post('/saveSelectedPackage',isAuthenticated,saveSelectedPackage)

router.get('/getActivePackages/:userId',isAuthenticated, getActivePackages);

module.exports=router