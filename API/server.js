//Pacotes
const compression = require("compression");
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

//Start
const app = express();

// Ambiente - verificar se esta no ambiente de producão
const isProdution = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

// arquivos estaticos
app.use("/public", express.static(__dirname + "/public"));
app.use("/public/images", express.static(__dirname + "/public/images"));

// Setup MONGODB
const dbs = require("./config/database")
const dbURI = isProdution ? dbs.dbprodution : dbs.dbTest;
mongoose.connect(dbURI, { useNewUrlParser: true });

//Setup EJS
app.set("view engine", "ejs");

//Configurações
if(isProdution) app.use(morgan("dev"));
app.use(cors());
app.disable('x-powered-by'); // desabilitado por segurança, por possiveis falha no framework
app.use(compression());

// Setup Body Parser
app.use(bodyParser.urlencoded({extended: false, limit: 1.5*1024*1024}))
app.use(bodyParser.json({ limit: 1.5*1024*1024 }));

//Models
require('/models');

//Rotas
app.use("/", require("./routes"));

//404 - rota
app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

//Rotas - 422, 500, 401
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    if(err.status !== 404 )
    console.warn("Error: ", err.message, new Date());
    res.json({ errors: {message: err.message, status: err.status }});
});

// Start - Escutar
app.listen(PORT, (err) => {
    if(err) throw err;
    console.log(`rodando na \\localhost:${PORT}`);
});
