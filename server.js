var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var path = require('path')
var pixel = require('node-pixel')
var five = require('johnny-five')

var board = new five.Board()

board.on('ready', function () {
  let strip = new pixel.Strip({
    board: this,
    controller: 'FIRMATA',
    strips: [ {pin: 6, length: 120} ], // this is preferred form for definition
    gamma: 2.8 // set to a gamma that works nicely for WS2812
  })

  strip.on('ready', function () {
    io.on('connection', function (client) {
      console.log('Client connected...')
      client.on('join', function (data) {
        console.log(data)
      })
      client.on('color', function (data) {
        console.log([data.r, data.g, data.b])
        // do stuff with the strip here.
        strip.color([data.r, data.g, data.b]) // sets strip to green using rgb values
        strip.show()
      })
      client.on('messages', function (data) {
        client.emit('broad', data)
        client.broadcast.emit('broad', data)
      })
    })
  })
})

app.use(express.static(path.join(__dirname, '/node_modules')))

app.use(express.static(path.join(__dirname, '/dist')))

app.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '/index.html'))
})

server.listen(4200)
