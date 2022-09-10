const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        required: true,
        type: String
    },
    wallet_address: {
        required: true,
        type: String
    },
    key: {
        required: false,
        type: String
    }
})

module.exports = mongoose.model('User', userSchema);