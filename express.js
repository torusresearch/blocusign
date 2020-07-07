const express = require('express')
const multer = require('multer')
const fs = require('fs')
// const https = require('https')
const http = require('http')
var bodyParser = require('body-parser')
const app = express()
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname + '-' + Date.now())
  }
})
var upload = multer({ storage: storage })
// const port = process.env.PORT || 443

const ipfsClient = require('ipfs-http-client')
const { globSource } = ipfsClient

// connect to ipfs daemon API server
const ipfs = ipfsClient('http://ipfs:5001')

// app.all('*', ensureSecure)
app.use(express.static('dist'))
app.post('/upload/post', upload.single('contract'), async (req, res) => {
  console.log('Got: ' + req.file.filename + ' from ' + req.ip)
  for await (const ipfsRes of ipfs.add(globSource(req.file.path))) {
    console.log('Submitted ' + req.file.filename + ' to ipfs under ' + ipfsRes.cid)
    res.status(201).send(ipfsRes.cid + '')
  }
})
app.post('/upload/signature-request', bodyParser.json(), async (req, res) => {
  console.log('Got Sig Request: ' + JSON.stringify(req.body) + ' from ' + req.ip)
  var fileName = 'uploads/signature-request/' + req.body.documentHash
  fs.writeFile(fileName, JSON.stringify(req.body), async function(err) {
    if (err) {
      console.log(err)
    }
    for await (const ipfsRes of ipfs.add(globSource(fileName))) {
      console.log('Submitted signature to ipfs under ' + ipfsRes.cid)
      res.status(201).send(ipfsRes.cid + '')
    }
  })
})

app.post('/upload/signature', bodyParser.json(), async (req, res) => {
  console.log('Got Sig: ' + JSON.stringify(req.body) + ' from ' + req.ip)
  var fileName = 'uploads/signature/' + req.body.signatureRequestHash + '-' + req.body.name
  fs.writeFile(fileName, JSON.stringify(req.body), async function(err) {
    if (err) {
      console.log(err)
    }
    for await (const ipfsRes of ipfs.add(globSource(fileName))) {
      console.log('Submitted signature to ipfs under ' + ipfsRes.cid)
      res.status(201).send(ipfsRes.cid + '')
    }
  })
})

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html')
})

http.createServer(app).listen(3040)

// https
//   .createServer(
//     {
//       key: fs.readFileSync("./ssl/server.key"),
//       cert: fs.readFileSync("./ssl/server.crt")
//     },
//     app
//   )
//   .listen(port, () => console.log(`Server listening on port ${port}!`))

// if (port === 443) {
//   console.log('Server also listening on 80')
//   http.createServer(app).listen(80)
// }

// function ensureSecure(req, res, next) {
//   if (req.secure) {
//     // OK, continue
//     return next()
//   }
//   // handle port numbers if you need non defaults
//   // res.redirect('https://' + req.host + req.url); // express 3.x
//   res.redirect("https://" + req.hostname + req.url) // express 4.x
// }
