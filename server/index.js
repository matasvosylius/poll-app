require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http')
const socketIo = require('socket.io')

const db = require('./models');
const handle = require('./handlers');
const routes = require('./routes');


const port = process.env.PORT

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 



app.get('/', (req,res) => res.json({hello: 'world'}));
app.use('/api/auth', routes.auth);
app.use('/api/polls', routes.poll);

app.use(handle.notFound);
app.use(handle.errors);
  
const updateData = (socket, id) => {
  const newData = handle.getPoll(id)

  socket.emit("updateData", newData);
};


app.listen(port, console.log(`Server started on port ${port}`));

const server = http.createServer(app)
const io = socketIo.listen(server)

io.on("connection", (socket) => {
    console.log("New client connected");
    if (interval) {
      clearInterval(interval);
    }
    interval = setInterval(() => updateData(socket, id), 1000);
    socket.on("disconnect", () => {
      console.log("Client disconnected");
      clearInterval(interval);
    });
  });