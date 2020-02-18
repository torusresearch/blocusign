const express = require('express')
const multer = require('multer')
const fs = require('fs')
const https = require('https')
var bodyParser = require('body-parser')
const app = express()
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname + '-' + Date.now())
    }
  })
var upload = multer({storage:storage})
const port =  process.env.PORT || 443


const ipfsClient = require('ipfs-http-client')
const { globSource } = ipfsClient

// connect to ipfs daemon API server
const ipfs = ipfsClient('http://localhost:5001')


app.use(express.static('dist'))
app.post('/upload/post', upload.single('contract'), async (req, res) => {
  console.log("Got: " + req.file.filename + " from " + req.ip)
  for await (const ipfsRes of ipfs.add(globSource(req.file.path))) {
      console.log("Submitted " + req.file.filename + " to ipfs under " + ipfsRes.cid)
      res.status(201).send(ipfsRes.cid +"")
  }
})
app.post('/upload/signature-request',bodyParser.json(), async (req, res) => {
    console.log("Got Sig: " + JSON.stringify(req.body) + " from " + req.ip)
    var fileName = "uploads/signature-request/"+req.body.documentHash
    fs.writeFile(fileName, JSON.stringify(req.body), async function(err) {
        if (err) {
            console.log(err)
        }
        for await (const ipfsRes of ipfs.add(globSource(fileName))) {
            console.log("Submitted signature to ipfs under " + ipfsRes.cid)
            res.status(201).send(ipfsRes.cid +"")
        }
    })
  })

  app.post('/upload/signature',bodyParser.json(), async (req, res) => {
    console.log("Got Sig: " + JSON.stringify(req.body) + " from " + req.ip)
    var fileName = "uploads/signature/"+req.body.signingRequest.documentHash+"-"+req.body.name
    fs.writeFile(fileName, JSON.stringify(req.body), async function(err) {
        if (err) {
            console.log(err)
        }
        for await (const ipfsRes of ipfs.add(globSource(fileName))) {
            console.log("Submitted signature to ipfs under " + ipfsRes.cid)
            res.status(201).send(ipfsRes.cid +"")
        }
    })
  })

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html')
})

https
  .createServer(
    {
      key: fs.readFileSync('./ssl/server.key'),
      cert: fs.readFileSync('./ssl/server.crt')
    },
    app
  )
  .listen(port, () => console.log(`Server listening on port ${port}!`))
