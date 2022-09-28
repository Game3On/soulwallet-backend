var Guardian = require("../models/guardian");
const RecoveryRecord = require("../models/recovery-record");
var commUtils = require("../utils/comm-utils");

const addGuardianWatchListFunc = async (wallet_address, guardian_address) => {
    var guardianR = await Guardian.findOne({guardian_address: guardian_address});
    if (!guardianR) {
        guardianR = new Guardian({
            guardian_address: guardian_address,
            watch_wallet_list: [],
        });
    }

    var gIndex = (guardianR.watch_wallet_list).indexOf(wallet_address);
    if(gIndex > -1){
        msg = "The contract wallet address: "+wallet_address+ " you want to add has exists in your watch list."
        console.log(msg);
    } else {
        guardianR.watch_wallet_list.push(wallet_address);
        await guardianR.save();
    }

    console.log("saved");
};

const delGuardianWatchListFunc = async (wallet_address, guardian_address) => {
    var guardianR = await Guardian.findOne({guardian_address: guardian_address});
    if (!guardianR) {
        console.log("guardian_address not found " + guardian_address);
        return;
    }

    guardianR.watch_wallet_list = guardianR.watch_wallet_list.filter(w => w != wallet_address);
    await guardianR.save();
    console.log("deleted");
};


async function addGuardianWatchList(req, rsp, next) {
    var msg = "Oh no signal";
    const guardianR = await Guardian.findOne({guardian_address: req.body.guardian_address});
    console.log("Query and get a guardian:",guardianR);
    if(!guardianR)
        { // not exists, then insert new
                    const guardianAdd = new Guardian({
                        guardian_address: req.body.guardian_address,
                        watch_wallet_list: [req.body.wallet_address],
                    });
                    try{
                         guardianAdd.save();
                         console.log("try to Add one!",guardianAdd);
                         return commUtils.retRsp(rsp, 200, msg, guardianAdd);
                    }
                    catch(error){
                        msg = "Insert new error";
                        console.log("Add new guardian error", error);
                        return commUtils.retRsp(rsp, 502, msg, error);
                    }
            }else{
                // if exists guardian, then depends on the wallet address exists or not
                console.log("guardian has:",guardianR);
                var gIndex = (guardianR.watch_wallet_list).indexOf(req.body.wallet_address);
                console.log("gIndex:",gIndex);
                if(gIndex>-1){
                  msg ="The contract wallet address: "+req.body.wallet_address+ " you want to add has exists in your watch list."
                  return commUtils.retRsp(rsp, 200, msg, guardianR);
                }else{
                    guardianR.watch_wallet_list.push(req.body.wallet_address);
                    guardianR.save();
                    msg = "Add a new watch_wallet_list:"+req.body.wallet_address;
                    return commUtils.retRsp(rsp, 200, msg, guardianR);
                }
            }            
}

// to be discuss: query each wallet_address on recovery record
async function getPendingRecoveryRecord(req, rsp, next) {
    const guardian = await Guardian.findOne({guardian_address: req.body.guardian_address});
    // console.log("guardian:"+req.body.guardian_address,guardian);
    var rtData = [];
    if (!guardian) {
        return commUtils.retRsp(rsp, 200, "Has no guardian record.", rtData);
    }
    
    const watch_wallet_list =  guardian.watch_wallet_list;
    for(i = 0; i < watch_wallet_list.length; i++){
        console.log("Try to find wallet_address in every recovery record:",watch_wallet_list[i]);
        const rRecord = await RecoveryRecord.findOne({wallet_address: watch_wallet_list[i], status: "pending"});
        if(rRecord){
            console.log("rRecord", rRecord.wallet_address);
            console.log("watch_wallet_list[i]", watch_wallet_list[i]);
            var item = {
                wallet_address:watch_wallet_list[i],
                new_key: rRecord.new_key
            };
            // rRecord.recovery_records.forEach(r => {
            //     if (r.guardian_address === req.body.guardian_address) {
            //         if (r.signature) {
            //             item.signature = r.signature;
            //         }
            //     }
            // });

            for(j=0;j<rRecord.recovery_records.length;j++){
                if (rRecord.recovery_records[j].guardian_address === req.body.guardian_address) {
                    if (rRecord.recovery_records[j].signature) {
                        item.signature = rRecord.recovery_records[j].signature;
                    }
                }
            }

            rtData.push(item);
            // rtData.push({wallet_address:watch_wallet_list[i], recovery_records: rRecord.recovery_records});
        }
    }
    // It will return two dimension array like [0][recovery_record]
    var msg = rtData ? "Query successfully!" : "Query failed!";
    return commUtils.retRsp(rsp, 200, msg, rtData);
}

async function getHistoryRecoveryRecord(req, rsp, next) {
    const guardian = await Guardian.findOne({guardian_address: req.body.guardian_address});
    // console.log("guardian:"+req.body.guardian_address,guardian);
    var rtData = [];
    if (!guardian) {
        return commUtils.retRsp(rsp, 200, "Has no guardian record.", rtData);
    }

    const watch_wallet_list =  guardian.watch_wallet_list;
    for(i = 0; i < watch_wallet_list.length; i++){
        console.log("Try to find wallet_address in every recovery record:",watch_wallet_list[i]);
        const rRecords = await RecoveryRecord.find({wallet_address: watch_wallet_list[i], status: "finished"});
        rRecords.forEach(record => {
            rtData.push({
                wallet_address: watch_wallet_list[i],
                new_key: record.new_key
            })
        });
    }
    // It will return two dimension array like [0][recovery_record]
    var msg = rtData ? "Query successfully!" : "Query failed!";
    return commUtils.retRsp(rsp, 200, msg, rtData);
} 

async function getGuardianWatchList(req, rsp, next) {
const guardian = await Guardian.findOne( // unique guardian_address
    {guardian_address: req.body.guardian_address}
    );
console.log("get result:",guardian);

var msg = guardian ? "Find successfully!" : "Find failed!";
return commUtils.retRsp(rsp, 200, msg, guardian);
}

// Deprecated this function
// It will update with filter: email and wallet_address 
// and replace the database record by your specific post value
async function updateGuardianWatchList(req, rsp, next) {
    const wallet_address = req.body.wallet_address;
    const guardian = await Guardian.findOneAndUpdate(
        {guardian_address: req.body.guardian_address}, 
        {
            $addToSet:{ watch_wallet_list: wallet_address}
        });
    
    console.log("update result:",guardian);
    
    var msg = guardianSetting ? "Update successfully!" : "Update failed!";
    return commUtils.retRsp(rsp, 200, msg, {
        params: guardianSetting,
        update: guardianSetting ? true : false
    });
}


module.exports = {addGuardianWatchList, getGuardianWatchList,
    getPendingRecoveryRecord, getHistoryRecoveryRecord, updateGuardianWatchList,
    addGuardianWatchListFunc, delGuardianWatchListFunc};