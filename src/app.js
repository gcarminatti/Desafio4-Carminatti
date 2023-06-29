//Importacion de modulos necesarios

const express = require("express");
const { create } = require("express-handlebars");
const http = require("http");
const socketIO = require("socket.io");
const fs = require("fs");
const router = express.Router();
const handlebars = require("handlebars");

//Instancia de servidor express con puerto 8080
const app = express();
const port = 8080;

//Configuracion de plantillas HandleBars y carpetas de vistas / archivos
const hbs = create({
  extname: ".hbs",
  defaultLayout: "main",
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

//Configuracion de servidor HTTP con instancia Socket.IO

const server = http.createServer(app);
const io = socketIO(server);

//Codigo de lectura y carga de datos
const templateSource = fs.readFileSync("./views/productsList.hbs", "utf8");

const template = handlebars.compile(templateSource);

const productsData = fs.readFileSync("./data/products.json", "utf8");
const products = JSON.parse(productsData);

//Configuracion de rutas
app.get("/", (req, res) => {
  let home = { title: "Mi nombre es Gianluca" };

  res.render("index", home);
});

app.get("/productsList", (req, res) => {
  const html = template({ products });
  res.send(html);
});

app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", {
    title: "Lista de productos en tiempo real",
    products: products,
  });
});

//Configuracion de Socket.IO con eventos

io.on("connection", (socket) => {
  console.log("Usuario conectado");

  socket.on("newProduct", (newProduct) => {
    products.push(newProduct);

    fs.writeFileSync("./data/products.json", JSON.stringify(products));

    io.emit("updateProducts", products);
  });

  socket.on("deleteProduct", (productId) => {
    const index = products.findIndex((product) => product.id === productId);
    if (index !== -1) {
      products.splice(index, 1);
    }

    io.emit("updateProducts", products);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });

  app.use(express.json());

  app.post("/addProduct", (req, res) => {
    const newProduct = req.body;
    console.log(newProduct);

    products.push(newProduct);

    fs.writeFileSync("./data/products.json", JSON.stringify(products));

    io.emit("updateProducts", products);

    res.send("Producto agregado correctamente");
  });
});

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
