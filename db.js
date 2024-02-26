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

function getTareas(){ //no le pasamos nada porque su función es la de leer todas las tareas. Las demás si necesitan porque hacen una tarea específica.
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

function borrarTarea(id){ //neceisto el id de la tarea que quiero borrar
    return new Promise(async (fulfill,reject) => {  

        let conexion = conectar(); 
        //usamos count porque queremos saber si la tarea existía o se borró. Si no existe no se borra nada (0) y si existe se borra (1)
        try{
            let {count} = await conexion`DELETE FROM tareas WHERE id = ${id}`; //borra la tarea que tenga el id que le pasamos. Count es el numero de filas que se han borrado

            conexion.end(); //cerramos la conexion con postgres

            fulfill(count); //retornamos el 1 porque se ha borrado

        }catch(error){
            reject({error : "error en base de datos"});
        }
    });
}

function actualizarEstado(id){ 
    return new Promise(async (fulfill,reject) => { 

        let conexion = conectar(); 

        try{
            let {count} = await conexion`UPDATE tareas SET terminada = NOT terminada WHERE id = ${id}`; //COGE el valor de terminada. Si es terminada ponle que no. Es un toggle

            conexion.end();

            fulfill(count); 

        }catch(error){
            reject({error : "error en base de datos"});
        }
    });
}

function actualizarTexto(id,tarea){ 
    return new Promise(async (fulfill,reject) => { 

        let conexion = conectar(); 

        try{
            let {count} = await conexion`UPDATE tareas SET tarea = ${tarea} WHERE id = ${id}`;

            conexion.end();

            fulfill(count); 

        }catch(error){
            reject({error : "error en base de datos"});
        }
    });
}
//las funciones tambien se pueden hacer sin promesas usando un try catch y retornando el objeto, pero es mejor usar promesas

module.exports = {getTareas,crearTarea,borrarTarea,actualizarEstado,actualizarTexto};