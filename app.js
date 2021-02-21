const express = require('express')
const nodemailer = require('nodemailer')
const Queue = require('bull')
const cron = require('node-cron')
var bodyParser = require('body-parser')
require('dotenv').config()

const PORT = process.env.PORT || 5000;
const app = express()
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const sendMailQueue = new Queue('sendMail', {
    redis: {
        host: '127.0.0.1',
        port: 6379,
}})

app.post('/send', function(req, res, next) {
    const data = req.body
    sendMailQueue.add(data, { repeat: { cron: '0 9 8-14 * Tuesday' } });
})

app.post('/sendMail', function(req, res, next) {
    sendMailQueue.process(async job => {
        return await sendMail(job.data.email)
    })
})

function sendMail (email) {
    return new Promise((resolve, reject) => {
    var mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: 'Newsletter',
        text: 'thank you for your time'
    }   
    var mailConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        service: 'gamil',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        }
    };  
    nodemailer.createTransport(mailConfig).sendMail(mailOptions, (error, info) => {
        if (error) {
            reject(error);
        } else {
            resolve('Email sent: ' + info.response)
        }
    })
})}

app.listen(PORT, () => {
console.log(`App listening on port ${PORT}`)
})