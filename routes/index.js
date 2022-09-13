var express = require('express');
var router = express.Router();
var controller = require('../api/controller');
var config = require('../config');

const Account = require('../models/account');

// APIs for Chrome plugin 
// 1. verify-email, input: email, output: random number(6) in mail.
// 2. verify-email-num, input: email, random number, output: true or false.
// 3. verify-owner-mail, input email, output: true or false(judging if exists the wallet record).
// 4. save-wallet-address, input: email, wallet_address,[public-key(EOA address)], output: true or false.
// 5. add-recovery-record, input: email, wallet_address, output: true or false.
// 6. fetch-recovery-records, input: email, output: false or record structure.
// 7. add-guardians, input: email, guardian address, output: true or false

router.get('/', function(req, res, next) {
  res.json({"data": "Hello soulwallet! Welcome to here!"});
});
// 
// router.get('/verify-email', controller.verifyEmail);
router.get('/verify-email', function(req, res, next) {
  console.log("here111");
  controller.verifyEmail(req, res);
  // res.json({"data": "Hello soulwallet! Welcome to here!"});
});

// post to add
router.post('/add-account', async (req, res) => {
  const account = new Account({
      email: req.body.email,
      wallet_address: req.body.wallet_address
  })
  try {
      const accountToSave = await account.save();
      res.status(200).json(accountToSave)
  }
  catch (error) {
      res.status(400).json({ message: error.message })
  }
});


//Get all Method
router.get('/get-all-account', async (req, res, next) => {
  try {
      const data = await Account.find();
      res.json(data)
  }
  catch (error) {
      res.status(500).json({ message: error.message })
  }
});


module.exports = router;
