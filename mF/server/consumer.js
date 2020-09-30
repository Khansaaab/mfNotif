const amqp    = require('amqplib/callback_api');
const Mongoose  = require('mongoose');
let amqpConnection;
const amqpUrl = 'amqps://pjmslrps:o2W4NNNppLIbWFWpeS6boA7OoJqUkzAs@grouse.rmq.cloudamqp.com/pjmslrps';

const Library = require('./sendnotif.server.library')

require('./models/user.server.model')

Mongoose.connect('mongodb://localhost:27017/mfnotif', {useNewUrlParser : true})

amqp.connect(amqpUrl,(err, connection) => {
    if(err){
        console.log('Not able to connect with Amqp');
        process.exit(0)
    }
    console.log('Succesfully connected with Amqp');
    amqpConnection = connection;
    
    console.log('Trying to consume the messages and starting the consumer');
    Library.checkForQueue(amqpConnection);
})
