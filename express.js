const express = require('express')
const multer = require('multer')
const fs = require('fs')
const https = require('https')
const app = express()
var upload = multer({ dest: 'uploads/' })
const port = 443

app.use(express.static('dist'))

app.post('/upload/post', upload.single('contract'), (req, res) => {
    console.log("got " + req.file)
    // here we should put ipfs
    res.redirect('/')
  })

https
  .createServer(
    {
      key: fs.readFileSync('./ssl/server.key'),
      cert: fs.readFileSync('./ssl/server.crt')
    },
    app
  )
  .listen(port, () => console.log(`Example app listening on port ${port}!`))
