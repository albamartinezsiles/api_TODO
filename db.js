require('dotenv').config(); //para que pueda leer dotenv y vea las claves
const postgres = require("postgres");

function conectar(){ // esta funcion retorna la conexion
    return postgres({
        host : process.env.DB_HOST,
        database : process.env.DB_NAME,
        user : process.env.DB_USER,
        password : process.env.DB_PASSWORD
    });
}

function getTareas(){ 
    return new Promise(async (fulfill,reject) => { 

        let conexion = conectar(); 

        try{
            let tareas = await conexion`SELECT * FROM tareas`;

            conexion.end();

            fulfill(tareas); 

        }catch(error){
            reject({error : "error en base de datos"});
        }
    });
}

function crearTarea({tarea}){ 
    return new Promise(async (fulfill, reject) => { 
        let conexion = conectar(); 

        try{
            let [{id}] = await conexion `INSERT INTO tareas (tarea) VALUES (${tarea}) RETURNING id`; //la tarea está entre paréntesis porque es el campo que quiero escribir

            conexion.end();

            fulfill(id); 

        }catch(error){
            reject({error : "error en base de datos"});
        }
    });
}

function borrarTarea(){ 
    return new Promise(async (fulfill,reject) => { 

        let conexion = conectar(); 

        try{
            let {count} = await conexion`DELETE * FROM tareas WHERE id = ${id}`;

            conexion.end();

            fulfill(count); 

        }catch(error){
            reject({error : "error en base de datos"});
        }
    });
}

module.exports = {getTareas,crearTarea,borrarTarea};