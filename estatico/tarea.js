class Tarea{ //clase para crear tareas. Esto es un molde donde decidimos todo lo que tiene que tener una tarea
    
    constructor(id,textoTarea,estado,contenedor){ //cada tarea necesita... el contenedor es donde lo vamos a soltar con un appendChild
        this.id = id; //cuando usamos this. significa que estamos obteniendo el valor de la propiedad que le sigue del objeto actual
        this.textoTarea = textoTarea;
        this.DOM = null; //representa la tarea en la interfaz. Es el componente HTML. Es el div que contiene la tarea. 
        //En un principio no existe, por eso es null, sin embargo, luego lo vamos a crear con un appendChild.
        this.editando = false; //si la acabo de crear no la estoy editando, por eso está en false
        this.crearComponente(estado,contenedor); //esto llama a la función crearComponente y le pasa el estado y el contenedor.
    }
    crearComponente(estado,contenedor){ //método(funcion para los amigos) de la clase tarea 
        this.DOM = document.createElement("div"); //en el elemento dom, es decir, la tarea, crea un div
        this.DOM.classList.add("tarea"); //Añádale la clase tarea

        //texto
        let textoTarea = document.createElement("h2"); //Crea un texto h2
        textoTarea.classList.add("visible"); //añádele la clase visible
        textoTarea.innerHTML = this.textoTarea; //Copia el valor de this.textoTarea y colócalo como el contenido interno del elemento HTML textoTarea. Esto podría ser útil, por ejemplo, para actualizar dinámicamente el texto en una página web.Esto no existe en el scope por eso la creamos otra vez

        //input
        let inputTarea = document.createElement("input");
        inputTarea.setAttribute("type","text"); //añádele atributo tipo texto
        inputTarea.value = this.textoTarea; //el value diga lo mismo que textoTarea

        //boton editar
        let botonEditar = document.createElement("button");
        botonEditar.classList.add("boton");
        botonEditar.innerText = "editar";
            //función editar tarea
        botonEditar.addEventListener("click",() => this.editarTarea()); //cuando hagas click en boton editar invoca la función editarTarea

        //boton borrar
        let botonBorrar = document.createElement("button");
        botonBorrar.classList.add("boton");
        botonBorrar.innerText = "borrar";
            //this hace refenrencia al objeto que estamos creando en ese momento
        botonBorrar.addEventListener("click",() => this.borrarTarea()); //cuando haces click invoca la función borrar tarea y hace referencia a this. La función flecha no crea un contexto de ejecución. Entras a la función flecha, pregunta a función flecha y va a borrarTarea, despues de esto this es para quien sea en borrarTarea, es decir, el objeto
        //Si se utilizara una función normal en lugar de una función de flecha, this dentro de la función se referiría al objeto botonEditar, porque los oyentes de eventos en JavaScript establecen this al objeto que disparó el evento.
        
        //boton estado
        let botonEstado = document.createElement("button");
        botonEstado.classList.add("estado", estado ? "terminada" : null); //la variable estado es true o false? si es true ponle la clase terminada, si no no hagas nada
        //es true o false en función de lo que le pase el backend, por eso lo ponemos ahora en el constructor
        botonEstado.appendChild(document.createElement("span")); //crea un elemento span y mételo dentro de botonEstado(el boton creado)

        botonEstado.addEventListener("click", () => {
            this.toggleEstado() //llama a la función toggleEstado la cual hace una llamada al backend. Esta lo que hace es que al id actual le cambia el estado. Si está en true lo pone en false y viceversa
                .then(({ resultado }) => {
                    if (resultado == "ok") {
                        return botonEstado.classList.toggle("terminada");
                    }
                    console.log("error actualizando");
                });
        });

        //aquí vamos a meter todo lo que hemos creado en el dom, ese objeto vacío que hemos creado
        this.DOM.appendChild(textoTarea); //añádele al div todo esto
        this.DOM.appendChild(inputTarea);
        this.DOM.appendChild(botonEditar);
        this.DOM.appendChild(botonBorrar);
        this.DOM.appendChild(botonEstado);
        contenedor.appendChild(this.DOM); //añade el los elementos al contenedor. Esto hace que el dom con todo lo que le hemos metido (sus hijos) aparezcar en el contenedor
    }

    borrarTarea(){ //implementación de la función borrar tarea en el FRONT
        fetch("/api-todo/borrar/" + this.id, { //pido a la api, esto espera un resultado
            method : "DELETE"
        })
        .then(respuesta => respuesta.json()) //aqui viene el objetito {resultado}. Le podemos hacer referencia en la función como tal, no aquí que es la llamada a la bd
        .then(({resultado}) => { //aqui te viene ok o ko
            if(resultado == "ok"){ //el resultado es ok o ko pero nopodemos hacer nada sin eso
                return this.DOM.remove(); //cuando regresa simplemente coge el html que representa ESTA tarea y elimínalo del DOM. se borra solo una tarea porque usa THIS
            } //tengo que esperar hasta obtener una respuesta de la bd. No retorna nada, es del callback. BorrarTarea no retorna nada como tal
            console.log("error al borrar");
        });
    }

    toggleEstado(){ //aquí va a suceder una llamada al backend.
        return fetch(`/api-todo/actualizar/${this.id}/2`,{
                    method : "PUT"
                })
                .then(respuesta => respuesta.json()); //esto es una promesa. Cuando se resuelva la promesa, se ejecutará el siguiente then
                //  .then(({resultado}) => { //aqui te viene ok o ko. Esto es lo mismo que lo de abajo
                //retorna la llamada a fetch para poder recibir el then en la función de botonEstado. Solo necesita retornar porque queremos hacer algo con la respuesta. Esto va a la línea 46 al ({resultado})
                //estoy retornando una promesa porque el .json retorna una promesa. Si le engancháramos un then tendríamos aquí el resultado ok o ko. Pero decidimos cortar para poner el then arriba para atacar al botonEstado
            }

    async editarTarea(){ //usamos async porque vamos a hacer una llamada al backend

        if(this.editando){ // ¿estoy editando? 
            //en caso de que sea true queremos guardar
            
            let textoTemporal = this.DOM.children[1].value; // lo que ha escrito el usuario. Esta línea obtiene el valor del segundo hijo del elemento DOM de la tarea, que probablemente es un campo de entrada 

            //actualizar el backend
           
            if (textoTemporal.trim() !== "" && textoTemporal.trim() !== this.textoTarea) { //si el texto temporal no está vacío y es diferente al texto tarea
                let { resultado } = await fetch(`/api-todo/actualizar/${this.id}/1`, { //usamos await para esperar a que se complete la solicitud
                                            method: "PUT",
                                            body: JSON.stringify({ tarea : textoTemporal.trim() }), //quiero que mandes el objeto json tarea : y el texto temporal sin espacios
                                            headers: {
                                                "Content-type": "application/json"
                                            }
                                        })
                                        .then(respuesta => respuesta.json());//convierte la respuesta de la api a json
                //actualizar el frontend
                if(resultado == "ok"){ //si la respuesta es el json resultado es ok
                    this.textoTarea = textoTemporal; //si es "ok" esto se activa. Esto hace que el texto temporal sea el nuevo textoTarea!!  
                }
            }

            this.DOM.children[0].innerText = this.textoTarea; //ponle al h2 textoTarea
            this.DOM.children[0].classList.add("visible"); //pon visible el h2
            this.DOM.children[1].classList.remove("visible");
            this.DOM.children[2].innerText = "editar";
            this.editando = false;
        }else{
            //en caso de que sea false queremos editar
            this.DOM.children[0].classList.remove("visible"); //quitale al h2 la clase visible
            this.DOM.children[1].value = this.textoTarea; // el valor del input es igual al de textoTarea
            this.DOM.children[1].classList.add("visible"); //ponle la clase visible al input
            this.DOM.children[2].innerText = "guardar"; //boton borrar ahora pone guardar
            this.editando = true;
        }
    }
}