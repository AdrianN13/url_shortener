require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')
const urlparser = require('url')
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://bombel132:7zQo1xQj1LVjkRdH@cluster0.pgnwl.mongodb.net/Node-API?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
  console.log("Connected!")
}).catch(() => {
  console.log("Connection failed")
});

const shortId = require('shortid');
const { features } = require('process');

const db_schema = mongoose.Schema({
  original_url: {
    type: String,
    required: [true, "URL required"]
  },
  short_url: {
    type: String,
    required: true,
    default: shortId.generate
  }
})


const Record = mongoose.model("Record", db_schema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async function(req, res) {
  try{
    const url = new URL(req.body.url);
    const hostname = url.hostname;
    await dns.lookup(hostname, (err, address, family) => {
      if (err) {
        res.json({"error": "invalid url"});
      }
    })
    await Record.create({"original_url": req.body.url})
    const found = await Record.findOne({original_url: req.body.url})
    res.status(200).json({"original_url": req.body.url, "short_url": found.short_url});
  }catch (error){
    res.json({"error": "invalid url"})
  }
});

app.get('/api/shorturl/:shorturl', async function (req,res) {
  try{
  const found = await Record.findOne({short_url: req.params.shorturl})
  res.redirect(found.original_url)}
  catch(error){
    res.json({"error": "invalid url"})
  }
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
