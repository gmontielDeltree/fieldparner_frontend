// Importing express module
const express = require('express');
const app = express();
 
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
const axios = require('axios');
const mqtt = require('mqtt')
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



