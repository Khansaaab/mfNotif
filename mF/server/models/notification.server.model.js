const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    username: String,


    createdDate: {
        type: Date,
        default: Date.now()
    },

    messageDetails: {}

})

mongoose.model('notifdetails', userSchema);

