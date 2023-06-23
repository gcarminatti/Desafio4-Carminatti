const express = require("express");
const { engine } = require("express-handlebars");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const port = 3000;

app.engine("handlebars", engine({ extname: ".hbs", defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

const server = http.createServer(app);

const io = socketIO(server);

app.get("/", (req, res) => {
  res.render("index", { title: "Mi aplicación con Handlebars y Socket.IO" });
});

io.on("connection", (socket) => {
  console.log("Usuario conectado");

  socket.on("mensaje", (data) => {
    console.log("Mensaje recibido:", data);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
