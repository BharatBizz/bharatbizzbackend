const express=require('express')
const router=express.Router()

const {registerAdmin, loginAdmin, currentAdmin, getAllTransactions, getAllWithdrawalRequests, updateWithdrawalStatus}=require('../controllers/adminController')
const { isAuthenticated } = require('../middlewares/auth')

router.post('/register',registerAdmin)

router.post('/login',loginAdmin)

router.post('/currentAdmin',isAuthenticated,currentAdmin)

router.get('/getAllTransactions',isAuthenticated,getAllTransactions)

router.get('/getAllWithDrawalRequests',isAuthenticated,getAllWithdrawalRequests)

router.patch('/updateWithdrawRequest/:id',isAuthenticated,updateWithdrawalStatus);

module.exports=router