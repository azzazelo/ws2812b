const express = require('express')
const app = express()
const server = require('http').createServer(app)
const path = require('path')
const io = require('socket.io')(server)
const pixel = require('node-pixel')
const five = require('johnny-five')
const board = new five.Board()

console.log('-----------------------------------------------')
console.log(process.platform)
console.log('-----------------------------------------------')

io.on('connection', function (client) {
  console.log('Client connected...')

  // Johnny-five //
  board.on('ready', function () {
    let strip = new pixel.Strip({
      board: this,
      controller: 'FIRMATA',
      strips: [ {pin: 6, length: 120} ], // this is preferred form for definition
      gamma: 2.8 // set to a gamma that works nicely for WS2812
    })
    let led = new five.Led(13)

    strip.on('ready', function () {
      client.on('color', function (data) {
        console.log([data.r, data.g, data.b])
        // do stuff with the strip here.
        strip.color([data.r, data.g, data.b]) // sets strip to green using rgb values
        strip.show()
      })
      client.on('messages', function (msg) {
        console.log(msg)
        switch (msg) {
          case 'on':
            strip.color('#ff0000') // turns entire strip red using a hex colour
            strip.show()
            break
          case 'off':
            strip.off()
            break
          case 'blink':
            led.blink(500)
            break
          case 'blinkoff':
            led.stop()
            break
          default:
            break
        }
        client.emit('broad', msg)
        client.broadcast.emit('broad', msg)
      })
    })
  })
  client.on('messages', function (msg) {
    client.emit('broad', msg)
    client.broadcast.emit('broad', msg)
  })
})

app.use(express.static(path.join(__dirname, '../node_modules')))

app.use(express.static(path.join(__dirname, '../dist')))

app.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../index.html'))
})

server.listen(4200)
