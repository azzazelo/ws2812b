import logger from '../config/winston'

function testing () {
  return 'aaa'
}

function colorWheel (WheelPos) {
  var r, g, b
  WheelPos = 255 - WheelPos

  if (WheelPos < 85) {
    r = 255 - WheelPos * 3
    g = 0
    b = WheelPos * 3
  } else if (WheelPos < 170) {
    WheelPos -= 85
    r = 0
    g = WheelPos * 3
    b = 255 - WheelPos * 3
  } else {
    WheelPos -= 170
    r = WheelPos * 3
    g = 255 - WheelPos * 3
    b = 0
  }
  // returns a string with the rgb value to be used as the parameter
  return 'rgb(' + r + ',' + g + ',' + b + ')'
}

function dynamicRainbow (strip, delay) {
  logger.info('dynamicRainbow')

  var showColor
  var cwi = 0 // colour wheel index (current position on colour wheel)
  setInterval(function () {
    if (++cwi > 255) {
      cwi = 0
    }
    for (var i = 0; i < strip.length; i++) {
      showColor = colorWheel((cwi + i) & 255)
      strip.pixel(i).color(showColor)
    }
    strip.show()
  }, 1000 / delay)
}

function off (strip) {
  strip.off()
}

function onHex (strip, hex) {
  strip.color(hex)
  strip.show()
}

module.exports = {
  testing: testing,
  rainbow: dynamicRainbow,
  off: off,
  onHex: onHex
}
