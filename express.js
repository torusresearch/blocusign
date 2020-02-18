const express = require('express')
const multer = require('multer')
const fs = require('fs')
const https = require('https')
const app = express()
var upload = multer({ dest: 'uploads/' })
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
