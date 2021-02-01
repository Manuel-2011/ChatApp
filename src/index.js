const express = require('express')
const path = require('path')

const app = express()
const port = process.env.PORT
const publicDirectory = path.join(__dirname, '../public')

app.use(express.static(publicDirectory))

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})