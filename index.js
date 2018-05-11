const express = require('express')
const app = express()

app.get('/', (req, res) => res.json({
  greeting: 'Hello world from API'
  env: process.env
}))

app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'))