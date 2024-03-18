require('dotenv').config();
const express = require("express");
const cors = require('cors')
const {connectDB} = require('./db/connectDB')

const app = express();

app.use(cors({
    origin:"*",
}))

app.use(express.json()); // parse body
// routes
app.use('/api', require('./route/auth.js'));

app.use('/',(req,res)=>{
    res.json()
})
const PORT = 3000

//set up mongoDB connection
const main = async() => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => {
            console.log("mongoDB connected")
          console.log("listen on 3000.");
        });
    } catch (error) {
      console.log(error)
    }
  }
  
  main()
