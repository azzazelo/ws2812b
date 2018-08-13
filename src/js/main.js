/* eslint no-undef: 0 */

'use strict'

const socket = io.connect()
socket.on('connect', (data) => {
  socket.emit('join', 'Hello World from client')
})
socket.on('broad', (data) => {
  $('#future').append(`<li class="panel-block list-group-item is-primary">${data}</li>`)
  if ($('#future li').length > 5) {
    $('#future li').first().remove()
  }
})

$('form').submit((e) => {
  e.preventDefault()
  var message = $('#chat_input').val()
  socket.emit('messages', message)
})

let demoColorPicker = new iro.ColorPicker('#color-picker-container', {
  width: 320,
  height: 320,
  color: {r: 255, g: 0, b: 0},
  markerRadius: 8,
  padding: 4,
  sliderMargin: 24,
  sliderHeight: 36,
  borderWidth: 2,
  borderColor: '#ccc',
  anticlockwise: true
})

demoColorPicker.on('color:change', (color, changes) => {
  $('#future').css('color', color.hexString)
  // Log the color's hex RGB value to the dev console
  // console.log(color.rgb);
  socket.emit('color', color.rgb)
})
