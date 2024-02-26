require("dotenv").config();
const express = require("express");
const {getTareas,crearTarea,borrarTarea,actualizarEstado,actualizarTexto} = require("./db"); //traete la funcion getTareas
const {json} = require("body-parser");
const cors = require('cors');

const servidor = express();

servidor.use(cors());

servidor.use(json());

servidor.use("/pruebas",express.static("./pruebas_api"));//quiero servir estos archivos estáticos. Esto es solo para hacer pruebas

servidor.get("/api-todo", async (peticion,respuesta) => { //Obtiene todas las tareas y las envíe en la respuesta.
    try{
        let tareas = await getTareas(); //espera a recibir las tareas

        respuesta.json(tareas); //envía las tareas
    }catch(error){
        respuesta.status(500);
        respuesta.json(error);//para que lo convierta en un string y lo envíe. Esto es para que pase a texto basicamente
    }
});

servidor.post("/api-todo/crear", async (peticion,respuesta,siguiente) => {//LC CLAVE ESTA AQUI. USAMOS { a : x } es lo que nos va a mandar el BACK. Lo esta desectructurando de un objeto que se supone que esta en la bd. Si el usuario luego no pone una tarea este valor será undefined

    
    let {tarea} = peticion.body; //extraigo la tarea del body

    if(tarea && tarea.trim() != ""){//aqui se verifica si nos mandan la tarea
        try{
            let id = await crearTarea({tarea}); //espera a que se cree la tarea y nos devuelve el id
            return respuesta.json({id}); //si no hay error se envía el id
        }catch(error){
            respuesta.status(500); 
            return respuesta.json(error); //si hay error se envía el error
        }
       
    }
    //siguiente se invoca en caso de que nos manden una cadena vacía o no se proporciona la tarea. Por eso se manda el error y siguiente para que no se quede pillada la petición
    siguiente({ error : "falta el argumento tarea en el objeto JSON" }); // si no hay tarea se envía un error.
    // Aquí se usa el siguiente para que vaya al siguiente middleware que es el de error. Si no se pone el siguiente se queda en este middleware y no va al siguiente creando un error
    //es básicamente porque no mandamos una respuesta, solo la retornamos. Si no mandamos una respuesta el servidor se queda esperando una respuesta y no se la damos.
    //throw "no me enviaste tarea"; //cuando hacemos un throw inmediatamente aterrizamos en ERROR, el último middleware que hemos hecho para responder errores
});

servidor.put("/api-todo/actualizar/:id([0-9]+)/:operacion(1|2)", async (peticion,respuesta,siguiente) => { //el id es un número o más y la operacion es 1 o 2. Si no es 1 o 2 no va a funcionar
    //operaciones tiene en el indice 0 actualizar texto y en el indice 1 actualizar estado. Si invoco operacion[1]-1 siempre invoco actualizarTexto

    let operacion = Number(peticion.params.operacion); //convierte el parámetro operacion de la url en un número

    let operaciones = [actualizarTexto,actualizarEstado]; //creo un array con las funciones que quiero invocar en función de la operación 

    let {tarea} = peticion.body;//extraigo la propiedad tarea del cuerpo de la petición. Esto es o bien la tarea o el estado de la tarea. Si es la operacion 1 es la tarea y si es la operacion 2 es el estado. Esto es por el orden en el que hemos puesto []

    if(operacion == 1 && (!tarea || tarea.trim() == "")){ //comprobamos si la operación es 1 y si no hay una tarea vacia. Si es 1 y no hay tarea vacia se va al siguiente middleware
     //si la operacion no es uno va directamente al try
     //necesito verificar que me hayan enviado la tarea. Si la tarea está esto va a ser true y el not lo va a convertir en true. Esto se mezcla con lo de la bd. Si no existe la tarea nos interesa porque lo vamos a convertir en true con lo de db.
     //Si ha llegado hasta el final es porque tarea existe.
        return siguiente({ error : "falta el argumento tarea en el objeto JSON" }); 
        //una vez verificado ya hacemos el try y el catch

    }

    try{ //si no hay error en el if anterior se ejecuta el try. Este intenta realizar la operación que le hemos pedido, es decir, actualizar el texto o el estado de la tarea
        let cantidad = await operaciones[operacion - 1](peticion.params.id, operacion == 1 ? tarea : null);//va si o si a operacion menos 1. Esto se podría hacer con un if y un else en vd
        //si la operacion es 1 se le pasa la tarea y si es 2 se le pasa null. Esto es porque si es 2 no necesitamos la tarea, solo el id
        respuesta.json({ resultado : cantidad ? "ok" : "ko" }); //si la cantidad es 1 es que se ha actualizado y si es 0 es que no se ha actualizado. Esto envia ok si la operacion es existosa
    }catch(error){
        respuesta.status(500);
        respuesta.json(error);
    }
});

servidor.delete("/api-todo/borrar/:id([0-9]+)", async (peticion,respuesta) => { //aqui solo le decimos que borre la tarea y que el id sea un número	
    //para localizar el id lo pedimos con params.id
    try{
        let cantidad = await borrarTarea(peticion.params.id); //espera a que se borre la tarea y nos devuelve la cantidad de tareas borradas.
        //usamos peticion.params.id para que nos devuelva el id que le hemos pasado por la url
        respuesta.json({ resultado : cantidad ? "ok" : "ko" }); //en el back tenemos que poner el resultado en un objeto para que el front lo pueda leer
        //si la cantidad es 1 o mas se borra porque es afirmativo, ya que javascript interpreta 0 como false y 1 como true
    }catch(error){
        respuesta.status(500);
        respuesta.json(error);
    }
});

servidor.use((peticion,respuesta) => { //cualquier cosa que no encaje va a error not found!
    respuesta.status(404);
    respuesta.json({ error : "not found" });
});

servidor.use((error,peticion,respuesta,siguiente) => { //a este middleware se llega cuando se invoca el siguiente con un error
    respuesta.status(400);
    respuesta.json({ error : "petición no válida" });
});


servidor.listen(process.env.PORT);