// Importing express module
const express = require('express');
const app = express();
//const IBM = require('ibm-cos-sdk');

/*var config = {
    endpoint: 'https://s3.us-south.cloud-object-storage.appdomain.cloud',
    apiKeyId: 'hhxR10zB8QZ1kTZ6Y-dTTfm0kPdKK2ITyqgijFYbVAnv',
    serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/e1088f762da34a8c97ec402e732b5b60:3bf39259-ef2b-4b16-9261-193d59371b90::',
    signatureVersion: 'iam',
};*/

// Getting Request
app.use(express.static('public'));

/*
app.get('/', (req, res) => {
 
    // Sending the response
    res.send('Hello World!')
    
    // Ending the response
    res.end()
})
 */

// Establishing the port
const PORT = process.env.PORT ||5000;
 
// Executing the server on given port number
app.listen(PORT, console.log(
  `Server started on port ${PORT}`));

/* MQTT Telemetria */
// const axios = require('axios');
// const mqtt = require('mqtt')
// const client  = mqtt.connect('mqtt://agrotools.qts-ar.com.ar')
// client.on('connect', function () {
//   client.subscribe('presence_frontend', function (err) {
//     if (!err) {
//       client.publish('presence_frontend', 'Hello mqtt')
//     }
//   })

//   client.subscribe('gateway/+/sensores', function (err) {
//     if (!err) {
//       console.log("Subscribed")
//     }
//   })
// })

// client.on('message', function (topic, message) {
//   // message is Buffer
//   console.log(topic, message.toString())
//   //client.end()
//   if(topic === ''){
//     // Post Telemetria  
//   }
    
  
// })



