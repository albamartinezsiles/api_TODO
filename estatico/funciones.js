const contenedorTareas = document.querySelector(".tareas");
const formulario = document.querySelector("form");
const input = document.querySelector('form input[type="text"]');

//Aquí van las tareas que vamos creando con el back

fetch("/api-todo") //para obtener las tareas que ya existen en el back
.then(respuesta => respuesta.json()) // las convertimos en json para poder leerlas
.then(tareas => { //una vez las tenemos las recorremos
    tareas.forEach(({id,tarea,terminada}) => { //para cada tarea quiero que me crees una nueva tarea
        new Tarea (id,tarea,terminada,contenedorTareas); //crea una nueva tarea con el id, la tarea y si está terminada o no y el contenedor donde va a ir en el front
    });
});


//Por qué esto va aquí y no en tarea?
//Funciones tiene como hijo tarea. Tarea es un componente para hacer la representación visual de lo que tenemos en la bd
//Este lo disparamos para que se cree la nueva tarea. Primero la creamos (el fetch anterior,que es para leer) y este crea cada tarea indivudalmente. Las funciones de tarea son para atacar al front
formulario.addEventListener("submit", evento => { //dentro del input ahora sea lo que se escribe en el formulario
    evento.preventDefault(); //evita que el formulario se envíe de la manera predeterminada, que normalmente recargaría la página.
    if(/^[a-záéíóúñ][a-záéíóúñ0-9 ]*$/i.test(input.value)){ // ^ y $ es para que no te pongan espacios ni al principio ni al final y el + para indicar que sea una o más veces. El i es para que de igual si es mayúsculas o minúsculas//test busca la expresion regular y si la cumple funciona.
        return fetch("/api-todo/crear", { //si el valor ingresado es válido realiza una solicitud post para crear una nueva tarea
            method : "POST",
            body : JSON.stringify({ tarea : input.value }), //convierte la tarea a json para mandarla al backend. Ponemos input.value porque queremos lo que justo ha escrito el usuario en el input
            headers : {
                "Content-type" : "application/json"
            }
        })
        .then(respuesta => respuesta.json()) //una vez lo he enviado, ahora recibo la respuesta del back y lo convierto a json para leerlo
        .then(({id}) => { //extrae el id de la respuesta en json
            if(id){ //la api nos envia el id. Esto va a verificar que nos da el id porque si no nos lo da es que ha habido un error
                new Tarea(id,input.value.trim(),false,contenedorTareas); //creamos una tarea con el id y el valor de lo escrito. tu envias tarea : input.value y en el front lo crea (lo del if). El false es porque no está terminada aún
                return input.value = ""; //esto para resetear el valor del input a vacío
            }
            console.log("error creando la tarea");
        });
    }
    console.log("error en el formulario");
});