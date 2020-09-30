const mongoose = require('mongoose')
const Promise   = require('bluebird');

const userSchema = new mongoose.Schema({
    username: String,


    createdDate: {
        type: Date,
        default: Date.now()
    },

    registrationDate: {
        type: Date,
        default: Date.now()
    },
    password: {
        type: String,
    },

    subscribed:{
        type: Boolean,
        default: true
    }
})

mongoose.model('userdetails', userSchema);

