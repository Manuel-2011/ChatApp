const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT
const publicDirectory = path.join(__dirname, '../public')

app.use(express.static(publicDirectory))

let count = 0

io.on('connection', (socket) => {
  

  socket.on('join', (options, callback) => {
    const { error, user} = addUser({ id: socket.id, ...options })
    
    if (error) {
      return callback(error)
    }

    socket.join(user.room) //create the chat room

    socket.emit('newMessage', generateMessage('ChatApp', 'Welcome to te chat-app!'))
    socket.broadcast.to(user.room).emit('newMessage', generateMessage('ChatApp', `${user.username} has joined!`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  })

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    const user = getUser(socket.id)


    io.to(user.room).emit('newMessage', generateMessage(user.username, message))
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('newMessage', generateMessage('ChatApp', `${user.username} has left!`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })

  socket.on('sendlocation', (location, callback) => {
    const user = getUser(socket.id)

    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
    return callback('Location shared!')
  })
});


server.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})