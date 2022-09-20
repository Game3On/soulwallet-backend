require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
var mongoose = require('mongoose');
var config = require('./config');
const commUtils = require('./utils/comm-utils');
var indexRouter = require('./routes/index');
const Account = require('./models/account');
const Guardian = require('./models/guardian');
const GuardianSetting = require('./models/guardian-setting');
const Verification = require('./models/verification');
const RecoveryRecord = require('./models/recovery-record');
const { verifyEmail, verifyEmailExists, verifyEmailNum } = require('./api/verify');

const { addRecoveryRecord, updateRecoveryRecord, fetchRecoveryRecords, clearRecoveryRecords } = require("./api/recovery-records");
const {addAccount, updateAccount, isWalletOwner, addAccountGuardian, getAccountGuardian, delAccountGuardian, updateAccountGuardian} = require("./api/account");

const {addGuardianSetting, updateGuardianSetting} = require('./api/guardian-setting');
const {addGuardianWatchList, getGuardianWatchList, getPendingRecoveryRecord, updateGuardianWatchList} = require('./api/guardian');

var port = process.env.PORT || 3000;

const main = async () => {
  console.log("mongodb uri now: " + config.mongodbURI);
  await mongoose.connect(config.mongodbURI, config.mongodbConfig);
  await Account.ensureIndexes();
  await Verification.ensureIndexes();
  await RecoveryRecord.ensureIndexes();
  await GuardianSetting.ensureIndexes();
  await Guardian.ensureIndexes();
  console.log("database connected");
  console.log("ENV:",process.env.MONGODB_URI);

  var app = express();
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.set('trust proxy', 2);

  // verify
  app.post('/verify-email', verifyEmail);
  app.post('/verify-email-num', verifyEmailNum);
  app.post('/verify-email-exists', verifyEmailExists);

  // acount
  app.post('/add-account', addAccount); // express produce a JWT and return
  app.post('/is-owner', isWalletOwner);
  app.post('/update-account', updateAccount); //update account's wallet_address and guardians
  // acount guardian
  app.post('/add-account-guardian', addAccountGuardian); // add new one, unique
  app.post('/get-account-guardian', getAccountGuardian); // get a array obj
  app.post('/del-account-guardian', delAccountGuardian); // get a array obj
  app.post('/update-account-guardian', updateAccountGuardian);// replace old one with new

  // guardian-setting
  app.post('/add-guardian-setting',addGuardianSetting);
  app.post('/update-guardian-setting',updateGuardianSetting);
  app.post('/get-guardian-setting',updateGuardianSetting); //todo

  // guardian, show the list guardians seen in the security center
  app.post('/add-guardian-watch-list', addGuardianWatchList);
  app.post('/get-guardian-watch-list', getGuardianWatchList);
  app.post('/get-pending-recovery-record', getPendingRecoveryRecord);
  app.post('/update-guardian-watch-list', updateGuardianWatchList);

  // recovery record
  app.post('/add-recovery-record', addRecoveryRecord); // express produce a JWT and return
  app.post('/update-recovery-record', updateRecoveryRecord);
  app.post('/fetch-recovery-records', fetchRecoveryRecords);
  app.post('/clear-recovery-records', clearRecoveryRecords);

  // test
  app.get('/', (req, rsp) => commUtils.retRsp(rsp, 200, "Hello soulwallet! Welcome!"));
  app.get('/ip', (req, rsp) => commUtils.retRsp(rsp, 200, "your ip", {ip: req.ip}));
  // app.use('/', indexRouter);

  // error handler
  app.use(function(err, req, res, next) {
    // only providing error in development
    return commUtils.retRsp(rsp, err.status || 500, err.message, {
      error: config.env == 'development' ? err : {}
    });
  });

  var server = http.createServer(app);
  server.listen(port, () => {
    console.log('Express server listening on port ' + port)
  });
};

main();