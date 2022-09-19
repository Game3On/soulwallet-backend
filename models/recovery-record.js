const mongoose = require('mongoose');

const recoveryRecordSchema = new mongoose.Schema({
  email: {
    required: true,
    type: String,
    index: true,
    unique: true
  },
  recovery_records: [{
    guardian_address: {
      require: true,
      type: String,
    },
    signature: {
      require: true,
      type: String
    }
  }]
});

module.exports = mongoose.model('RecoveryRecord', recoveryRecordSchema);