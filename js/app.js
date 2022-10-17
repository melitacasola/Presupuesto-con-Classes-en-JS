//  Variables y Selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');


//  Eventos

eventListeners();
function eventListeners(){
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
    formulario.addEventListener('submit', agregarGasto);
};

// Classes
class Presupuesto{
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto){
        this.gastos= [...this.gastos, gasto]; // ir agregando al obj ppal
        this.calcRestante();
    }

    calcRestante(){
        const gastado = this.gastos.reduce((total, gasto)=> total + gasto.cantidad, 0)
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id){
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.calcRestante();
    }
   

}

class UI {

    insertarPresupuesto(cantidad){
    //extraemos el valor del prompt
    const {presupuesto, restante} = cantidad;

    //insertar al HTML  
    document.querySelector('#total').textContent = presupuesto;
    document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo){
        //crear div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        }else{
            divMensaje.classList.add('alert-success');
        }
        
        //msj de error
        divMensaje.textContent = mensaje;

        //insertar en HTML - insertBefore toma 2 arg: 1) qé vamos a insertar, y 2) DONDE
        document.querySelector('.primario').insertBefore(divMensaje, formulario)
        
        // Quitar error del HTML
        setTimeout(()=>{
            divMensaje.remove();
        }, 3000)
    }
    mostrarGastos(gastos){
        this.limpiarHTML();
        //iterar sobre los gastos con forEach xq gastos es un []
        gastos.forEach( gasto =>{
            const {nombre, cantidad, id} = gasto;
            // Crear un LI
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;

            // Insertar el gasto
            nuevoGasto.innerHTML = `
                ${nombre}
                <span class="badge rounded-pill text-bg-primary">$ ${cantidad}</span>
            `;

            // Btn borrar gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            // btnBorrar.textContent = 'Borrar';
            btnBorrar.innerHTML = 'Borrar &times;';

            btnBorrar.onclick = ()=> {
                eliminarGasto(id);
            };

            nuevoGasto.appendChild(btnBorrar);

            // Insertar al HTML
            gastoListado.appendChild(nuevoGasto);
        })
    }
    limpiarHTML(){
        while(gastoListado.firstChild){
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }
    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj){
        const {presupuesto, restante} = presupuestoObj;

        const restanteDiv = document.querySelector('.restante')
        //comprobar 25%
        if((presupuesto / 4) > restante){
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger')
        } else if ((presupuesto / 2) > restante){
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning')
        } else {
            restanteDiv.classList.remove('alert-warning', 'alert-danger');
            restanteDiv.classList.add('alert-success');
            formulario.querySelector('button[type="submit"]').disabled = false;
        }

        //si el total es 0 || < 
        if(restante <= 0){
            ui.imprimirAlerta('Sin presupuesto...', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }
};



//necesito que la variable presupuesto sea global - INSTANCIAR
const ui = new UI();
let presupuesto;

// Funciones
function preguntarPresupuesto(){
    const presupuestoUser = prompt('¿Cual es tu presupuesto?')
    if(presupuestoUser === '' ||presupuestoUser === null || isNaN(presupuestoUser) || presupuestoUser <= 0){
        window.location.reload();
    }

    presupuesto = new Presupuesto(presupuestoUser);
    ui.insertarPresupuesto(presupuesto)
};


// Agrego gastos
function agregarGasto(e){
    e.preventDefault();

    //leer datos del formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);

    //validar el formulario
    if(nombre === '' || cantidad === ''){
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return; //p/qe no se ejec las otras lineas del cod.
    } else if(cantidad <= 0 || isNaN(cantidad)){
        ui.imprimirAlerta('Gasto no válido...', 'error');
        return;
    } 

    //Genero objeto con gasto - mejoria objeto literal - al revés de distruct
    const gasto = {nombre, cantidad, id: Date.now()} 
    /* es igual a un objeto llave y valor 
    const gasto = {
        nombre: nombre, 
        cantidad: cantidad, 
        id: Date.now()} */
    //añade nuevo gasto
    presupuesto.nuevoGasto(gasto);
    
    //msj de campos ok de gastos. no envio tipo de msj xq solo valuo si es error
    ui.imprimirAlerta('Gasto agregado...')

    //imprimir Gastos en HTML y solo sean los gastos 
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);
    
    //reiniciar form p/ nuevos gastos
    formulario.reset();
}

function eliminarGasto(id){
    //los elimina del Objeto
    presupuesto.eliminarGasto(id);

    //elimina los gastos del HTML
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos)
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}