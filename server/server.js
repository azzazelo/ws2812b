const express = require('express')
const app = express()
const server = require('http').createServer(app)
const path = require('path')
const io = require('socket.io')(server)
const pixel = require('node-pixel')
const five = require('johnny-five')
const board = new five.Board()
const os = require('os')
const effects = require('./effects')

console.log('-----------------------------------------------')
console.log(os.platform())
console.log(os.release())
console.log(os.arch())
console.log('-----------------------------------------------')

io.on('connection', function (client) {
  console.log('Client connected...')

  // Johnny-five //
  board.on('ready', function () {
    var opts = {}
    opts.port = process.argv[2] || ''
    console.log('-----------------------------------------------')
    console.log(process.argv)
    console.log('-----------------------------------------------')
    const strip = new pixel.Strip({
      board: this,
      controller: 'FIRMATA',
      strips: [{ pin: 6, length: 160 }] // this is preferred form for definition
    })
    let led = new five.Led(13)

    strip.on('ready', function () {
      console.log('-----------------------------------------------')
      console.log('Strip ready')
      console.log('-----------------------------------------------')
      client.on('color', function (data) {
        console.log([data.r, data.g, data.b])
        // do stuff with the strip here.
        strip.color([data.r, data.g, data.b]) // sets strip to green using rgb values
        strip.show()
      })

      client.on('messages', function (msg) {
        var isHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(msg)
        if (isHex) {
          effects.onHex(strip, msg)
        }

        switch (msg) {
          case 'off':
            effects.off(strip)
            break
          case 'blink':
            led.blink(500)
            break
          case 'blinkoff':
            led.stop()
            break
          case 'test':
            effects.testing()
            break
          case 'rainbow':
            effects.rainbow(strip)
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
