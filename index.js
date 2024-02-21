const express = require("express");
require('dotenv').config();
const servidor = express();
const {getTareas,crearTarea,borrarTarea,actualizarEstado,actualizarTexto} = require ("./db.js"); //traete la funcion getTareas
const {json} = require ("body-parser");
const bodyParser = require("body-parser");

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
    if(tarea && tarea.trim() != ""){ //aqui se verifica si nos mandan la tarea
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
servidor.put("/api-todo/actualizar/:id([0-9]+)/:operacion(1|2)", async (peticion,respuesta,siguiente) => {
    let operacion = Number(peticion.params.operacion);
    let operaciones = [actualizarTexto,actualizarEstado]; //operaciones tiene en el indice 0 actualizar texto y en el indice 1 actualizar estado. Si invoco operacion[1]-1 siempre invoco actualizarTexto
    let {tarea} = peticion.body; //extraigo la tarea.

    if(operacion == 1 && (!tarea || tarea.trim() == "")){ //si la operacion no es uno va directamente al try
     //necesito verificar que me hayan enviado la tarea. Si la tarea está esto va a ser true y el not lo va a convertir en true. Esto se mezcla con lo de la bd. Si no existe la tarea nos interesa porque lo vamos a convertir en true con lo de db. 
     //Si ha llegado hasta el final es porque tarea existe.
     return siguiente({ error : "falta el argumento en el objeto JSON"});
    }//una vez verificado ya hacemos el try y el catch
    try{
        let cantidad = await operaciones [operacion - 1](peticion.params.id, operacion == 1 ? tarea : null); //va si o si a operacion menos 1. Esto se podría hacer con un if y un else en vd

    }catch(error){
       respuesta.status(500);
       respuesta.json(error);
    }
//esto posiblemente se pueda hacer de forma mas sencilla, esto está muy enrevesado

//FORMA FACIL
/*
    if(peticion.params.operacion == 1){

        let {tarea} = peticion.body;

        if(tarea && tarea.trim() != ""){ //SI ES UNO
            try{
                let id = await actualizarTexto(peticion.params.id);
                return respuesta.json({resultado : cantidad ? "ok" : "ko"});
            }catch(error){
                respuesta.status(500);
                return respuesta.json(error);
            }
        }
        siguiente({ error : "falta el argumento tarea en el objeto JSON"});
    }else{
            try{
                let id = await actualizarEstado(peticion.params.id);
                return respuesta.json({resultado : cantidad ? "ok" : "ko"});
            }catch(error){
                respuesta.status(500);
                return respuesta.json(error);
            }
    }*/
});

servidor.delete("/api-todo/borrar/:id([0-9]+)", async (peticion,respuesta) => { //para localizar el id lo pedimos con params.id
    try {
        let cantidad = await borrarTarea(peticion.params.id);
        return respuesta.json ({ resultado : cantidad ? "ok" : "ko"});
    }catch (error) {
      console.error(error);
      respuesta.status(500);
      return respuesta.json(error);
    }
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