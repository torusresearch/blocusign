const express = require('express')
const multer = require('multer')
const fs = require('fs')
const https = require('https')
const app = express()
const port = 443
const upload = multer({
  dest: 'uploads/' // this saves your file into a directory called 'uploads'
})

app.use(express.static('dist'))
app.post('/upload', upload.single('pdf-document'), (req, res) => {
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
