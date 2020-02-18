const express = require('express')
const multer = require('multer')
const fs = require('fs')
const https = require('https')
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



app.use(express.static('dist'))
app.post('/upload/post', upload.single('contract'), (req, res) => {
  console.log("got " + req.file)
  // here we should put ipfs
  res.redirect('/')
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
