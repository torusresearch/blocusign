const express = require("express")
const fs = require("fs")
const https = require("https")
const app = express()
const port = 3000

app.use(express.static("dist"))

https
  .createServer(
    {
      key: fs.readFileSync("ssl/server.key"),
      cert: fs.readFileSync("ssl/server.cert")
    },
    app
  )
  .listen(port, () => console.log(`Example app listening on port ${port}!`))
