const express = require("express");
require('dotenv').config();
const servidor = express();

servidor.use("/pruebas", express.static ("./pruebas_api")); //quiero servir estos ficheros estáticos

servidor.get("/api-todo", (peticion,respuesta) => {
    return respuesta.send("Esto es el método get");
    
});

servidor.post("/api-todo", (peticion,respuesta) => {
    return respuesta.send("Esto es el método post");
});

servidor.put("/api-todo", (peticion,respuesta) => {
    return respuesta.send("Esto es el método put");
});

servidor.delete("/api-todo", (peticion,respuesta) => {
    return respuesta.send("Esto es el método delete");
});

servidor.use((peticion,respuesta) => { //cualquier cosa que no encaje va a error not found!
    respuesta.json ({ error : "not found" });
})

servidor.listen(process.env.PORT);