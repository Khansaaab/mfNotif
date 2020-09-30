const express = require('express')
const mongoose = require('mongoose')
const amqp    = require('amqplib/callback_api')
const passport = require('passport');
const LocalStrategy = require("passport-local");
const  bodyParser = require("body-parser");
const session = require('express-session');

let amqpConnection;
const amqpUrl = 'amqps://pjmslrps:o2W4NNNppLIbWFWpeS6boA7OoJqUkzAs@grouse.rmq.cloudamqp.com/pjmslrps';

const Library = require('./server/sendnotif.server.library')

const app =  express();

console.log('Going to Start the application')


mongoose.connect('mongodb://localhost:27017/mfnotif', {useNewUrlParser : true})

require('./server/models/user.server.model')

amqp.connect(amqpUrl,(err, connection) => {
    if(err){
        console.log('Not able to connect with Amqp');
        process.exit(0)
    }
    console.log('Succesfully connected with Amqp');
    amqpConnection = connection;
})

app.listen(process.env.PORT || 8080, function () {
    console.log(`[SERVER:Producer] Listening on port ${process.env.PORT || 8080}.`);
});

app.set('views', __dirname + '/client/views/');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true })); 


app.use(passport.initialize()); 
app.use(passport.session()); 
  
passport.use(new LocalStrategy({
    passReqToCallback: true
},(req, username, password, done) => {
    return new Promise((resolve, reject) => {

        mongoose.model('userdetails').findOne({username : username})
            .then((user) => {
                if(!user)
                    return done(null, false);
                if(user.password != password) return done(null, false)
                req.user = user
                return done(null, user);
            })
        }).catch(done)

})); 

passport.serializeUser((user, done) => {
    console.log('checking forS')
    done(null,user)
}); 
passport.deserializeUser((user, done) => { 
    console.log('checking forS')
    done(null, user)
}); 


app.get('/',(req, res) => { 
    res.render("home")
})

app.post('/login', passport.authenticate("local",{
    successRedirect: "/userdetails",
    failureRedirect: "/",
}),(req, res)=> {
    console.log('ok')
})

app.get('/userdetails',(req, res) => {
    res.render("details",{
        username : 'farhan@mail.com'
    })
})

app.get('/sendNotif',(req, res) => {
    res.json({
        status : true
    })
    Library.callSendMsg(amqpConnection);
})