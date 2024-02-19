const express = require("express");
require('dotenv').config();
const servidor = express();
const {getTareas,crearTarea} = require ("./db.js"); //traete la funcion getTareas
const {json} = require ("body-parser");

servidor.use(json());

servidor.use("/pruebas", express.static ("./pruebas_api")); //quiero servir estos ficheros estáticos

servidor.get("/api-todo", async (peticion,respuesta) => {
   try{ 
        conectar();
        let tareas = await getTareas(); 

        respuesta.json(tareas);
   }catch(error){

        respuesta.status(500);
        
        respuesta.json(error); //para que lo convierta en un string y lo envíe. Esto es para que pase a texto basicamente

   }
        
});

servidor.post("/api-todo/crear", async (peticion,respuesta,siguiente) => {
    let {tarea} = peticion.body; //LC CLAVE ESTA AQUI. USAMOS { a : x } es lo que nos va a mandar el BACK. Lo esta desectructurando de un objeto que se supone que esta en la bd. Si el usuario luego no pone una tarea este valor será undefined
    if(tarea && tarea.trim() != ""){
        try{
            let id = await crearTarea({tarea});
            return respuesta.json({id});
        }catch(error){
            respuesta.status(500);
            return respuesta.json(error);
        }
    }
    siguiente({ error : "falta el argumento tarea en el objeto JSON"});
    //throw "no me enviaste tarea"; //cuando hacemos un throw inmediatamente aterrizamos en ERROR, el último middleware que hemos hecho para responder errores

});

servidor.put("/api-todo", (peticion,respuesta) => {
    return respuesta.send("Esto es el método put");
});

servidor.delete("/api-todo", (peticion,respuesta) => {
    return respuesta.send("Esto es el método delete");
});

servidor.use((peticion,respuesta) => { //cualquier cosa que no encaje va a error not found!
    respuesta.status(404);
    respuesta.json ({ error : "not found" });
});

servidor.use((error, peticion,respuesta,siguiente) => {
    respuesta.status(400);
    respuesta.json({error : "peticion no válida"});
});

servidor.listen(process.env.PORT);