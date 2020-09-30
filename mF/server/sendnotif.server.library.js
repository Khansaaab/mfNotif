
const twilio   = require('twilio')
const accountSid = 'ACecab89e3cfa547b1971555cfe8f365e0';
const authToken = '4c8cc72b7a78387393c61ebfebaebcdb';
const Promise   = require('bluebird');
const { resolve, reject } = require('bluebird');
const mongoose  = require('mongoose')
require('./models/user.server.model')
require('./models/notification.server.model')

const client  = twilio(accountSid, authToken);



function sendMsg(connection, details){
    console.log('Inside the Message Function');
    return new Promise((resolve, reject) => {
        client.messages
        .create(details).then(messages => {
            console.log(messages);
            let array = new Array()
            let objToUpdate  = new Object()
            objToUpdate   = {
                body: messages.body,
                dateCreated: messages.dateCreated,
                from: messages.from,
                to: messages.to
            }

            const userModel  = mongoose.model('notifdetails')
            userModel.create({
                username : 'farhan@mail.com',
                messageDetails : objToUpdate
            },(err , res) => {
                res.save();
                if(connection)
                    return pushToQueue(connection);
                return resolve();
            })
        }).catch((err) => {
            console.log(err)
            return reject();
        })
    })
}


exports.callSendMsg = function(connection){
    const details  = {
        body: 'Hi, Message From Farhan khan',
        from: '+16233994574',
        to: '+9163830 85078'
    }
    return sendMsg(connection, details)
}

function sendToQueue (connection,queueName,payload){
    return new Promise((resolve, reject) => {
        connection.createChannel(function(err, channel) {
            if (err) {
                return reject(err);
            }
            let queue = queueName;
            let msg = payload;
        
            channel.assertQueue(queue, {
              durable: false
            });
        
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
            console.log("Pushed To Queue", JSON.stringify(payload));
            return resolve()
          });
    })
}

const pushToQueue = function(connection){
    const queueName = 'notifs';
    const payload   = {
        status: 'Placed',
        recipientUser: 'farhan@mail.com',
        text:   'Your order placed and your order Id is 123',
        recipient : 'farhantheaven@gmail.com'
    };
    return sendToQueue(connection,queueName,payload);
}


exports.checkForQueue  = function(connection) {
    return new Promise((resolve, reject) => {
        connection.createChannel(function(error1, channel) {
            if (error1) {
              throw error1;
            }
            const queueName = 'notifs';
        
            channel.assertQueue(queueName, {
              durable: false
            });
            return fetchFromQueue(channel, queueName);
          });
    })    
}


function fetchFromQueue (channel,queueName){
    return new Promise((resolve, reject) => {
        console.log('Checking for queue');
        channel.consume(queueName, (payload) => {
            let objData = JSON.parse(payload.content); 
            console.log(payload.content.toString())
            return sendMailTo(objData);
        },{noAck: true})
    })
}


function sendMailTo (order){
    return new Promise((resolve, reject) => {
        let userName = order.recipientUser;
        const userModel  =  mongoose.model('userdetails');
        userModel.findOne({username : userName}).then((user) => {
            if(!user || (user && !user.subscribed))
                return reject('no user found')
            let text = 'Your Order placed now';
            if(order.status == 'Placed')
                text = 'Your Order placed now';
            
            const details  = {
                body: `Hi,${text}`,
                from: '+16233994574',
                to: '+9163830 85078'
            }
            return sendMsg('', details).then(() => {
                return resolve();
            });
        })
    }).catch((err) => {
        console.log(err)
        return reject();
    })
}