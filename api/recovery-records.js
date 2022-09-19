const RecoveryRecord = require("../models/recovery-record");
const Guardian_setting = require("../models/guardian-setting");
const commUtils = require("../utils/comm-utils");
const jwt = require("jsonwebtoken");
const config = require("../config");

async function addRecoveryRecord(req, rsp, next) {
    // TODO: verify email account exists
    // TODO: verify signature
    const result = await RecoveryRecord.findOneAndUpdate({
        email: req.body.email
    }, {}, {
        new: true,
        upsert: true
    });

    // TODO: this is not atomic
    updated = false;
    for (var i = 0; i < result.recovery_records.length; i++) {
        if (result.recovery_records[i].guardian_address === req.body.guardian_address) {
            // update signature
            result.recovery_records[i].signature = req.body.signature;
        }
    }
    if (!updated) {
        result.recovery_records.push({
            guardian_address: req.body.guardian_address,
            signature: req.body.signature
        })
    }
    await result.save();

    const jwtToken = jwt.sign({
        wallet_address: req.body.guardian_address // TODO: email?
    }, config.jwtKey, {expiresIn: config.jwtExpiresInSecond});
    return commUtils.retRsp(rsp, 200, "added", {
        jwtToken
    })
}


async function fetchRecoveryRecords(req, rsp, next) {
    const rrRecord = await RecoveryRecord.findOne({
        email: req.body.email
    });
    if (!rrRecord) {
        return commUtils.retRsp(rsp, 404, "wallet address not found");
    }
    const gsRecord = await Guardian_setting.findOne({email: req.body.email});
    const rtData = {
        total: gsRecord.total,
        min: gsRecord.min,
        signedNum: rrRecord.guardians.length
    };
    return commUtils.retRsp(rsp, 200, "success", {
        recovery_records: rtData
    });
}

module.exports = {addRecoveryRecord, fetchRecoveryRecords};