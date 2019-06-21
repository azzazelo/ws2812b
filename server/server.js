import express from 'express'
import morgan from 'morgan'
import logger from '../config/winston'
import { join } from 'path'
import { Strip } from 'node-pixel'
import { Board, Led } from 'johnny-five'
import { platform, release, arch } from 'os'
import { onHex, off, testing, rainbow } from './effects'

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const board = new Board()

logger.info(`Platform: , ${platform()}`)
logger.info(`Release: ${release()}`)
logger.info(`Arch: ${arch()}`)

io.on('connection', function (client) {
  logger.info('Client connected...')

  // Johnny-five //
  board.on('ready', function () {
    var opts = {}
    opts.port = process.argv[2] || ''
    logger.debug(`Process.argv ${process.argv}`)
    const strip = new Strip({
      board: this,
      controller: 'FIRMATA',
      strips: [{ pin: 6, length: 160 }] // this is preferred form for definition
    })
    let led = new Led(13)

    strip.on('ready', function () {
      logger.info('Strip ready!')
      client.on('color', function (data) {
        console.log([data.r, data.g, data.b])
        // do stuff with the strip here.
        strip.color([data.r, data.g, data.b]) // sets strip to green using rgb values
        strip.show()
      })

      client.on('messages', function (msg) {
        var isHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(msg)
        if (isHex) {
          onHex(strip, msg)
        }

        switch (msg) {
          case 'off':
            off(strip)
            break
          case 'blink':
            led.blink(500)
            break
          case 'blinkoff':
            led.stop()
            break
          case 'test':
            testing()
            break
          case 'rainbow':
            rainbow(strip)
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
    logger.info(`Message from client: ${msg}`)
    client.emit('broad', msg)
    client.broadcast.emit('broad', msg)
  })
})

app.use(morgan('combined', { stream: logger.stream }))

app.use(express.static(join(__dirname, '../node_modules')))

app.use(express.static(join(__dirname, '../dist')))

app.get('/', function (req, res, next) {
  res.sendFile(join(__dirname, '../index.html'))
})

app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // include winston logging
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

server.listen(4200)
