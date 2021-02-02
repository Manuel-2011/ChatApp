const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT
const publicDirectory = path.join(__dirname, '../public')

app.use(express.static(publicDirectory))

let count = 0

io.on('connection', (socket) => {
  

  socket.on('join', ({ username, room }) => {
    socket.join(room) //create the chat room

    socket.emit('newMessage', generateMessage('Welcome to te chat-app!'))
    socket.broadcast.to(room).emit('newMessage', generateMessage(`${username} has joined!`))
  })

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    io.emit('newMessage', generateMessage(message))
    callback()
  })

  socket.on('disconnect', () => {
    io.emit('newMessage', generateMessage('A user has left'))
  })

  socket.on('sendlocation', (location, callback) => {
    io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`))
    return callback('Location shared!')
  })
});


server.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})