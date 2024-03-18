require('dotenv').config();
const mongoose = require("mongoose");

const express = require("express");
const app = express();
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io");
const cors = require('cors')
app.use(cors())

const io = new Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
  });

app.use(express.json()); // parse body


//set up mongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Successfully connected to mongo.");
})
.catch((err) => {
    console.log("Error connecting to mongo.", err);
});

// routes
app.use('/api', require('./route/auth.js'));

io.on('connection',(socket)=>{
    console.log("user connected")
    //khud ke alawa baki ko send krna ho tab
    socket.broadcast.emit('con',"new user connected")

    socket.on('send',(msg)=>{
        console.log(msg)
        io.emit('res',msg)
    })

    socket.on('disconnect',()=>{
        console.log("user disconnected")
    })
})

const PORT = 4000;
server.listen(PORT, () => {
     console.log("Listening on port: " + PORT);
}); 