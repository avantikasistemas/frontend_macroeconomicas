<template>
  <PanelView>
      <h3>Cargue de Variables Macroeconómicas</h3>

      <div class="container">
            <div class="form-container">
                <form @submit.prevent="validarFormulario" class="form-flex">
                    <div class="form-group" :class="{ 'error': (anioError || (!anio.trim() && mostrarErrores)) }">
                      <label>Año:</label>
                      <input
                        type="text"
                        class="input-field"
                        v-model="anio"
                        @input="validarAnio"
                        minlength="4"
                        maxlength="4"
                      />
                      <p v-if="!anio.trim() && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                      <p v-if="anioError" class="error-text">Ingrese un año entre 2000 y 2200.</p>
                    </div>
                    <!-- IPC -->
                    <div class="form-group" :class="{ 'error': (!ipc.trim() && mostrarErrores) || ipcError }">
                      <label>IPC Proyectado (%):</label>
                      <input type="text" class="input-field" v-model="ipc" @input="validarDecimal('ipc', false)">
                      <p v-if="!ipc.trim() && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                      <p v-if="ipcError" class="error-text">Debe ser un número menor o igual a 100 con máximo 2 decimales.</p>
                    </div>

                    <!-- PIB -->
                    <div class="form-group" :class="{ 'error': (!pib.trim() && mostrarErrores) || pibError }">
                      <label>PIB Proyectado (%):</label>
                      <input type="text" class="input-field" v-model="pib" @input="validarDecimal('pib', false)">
                      <p v-if="!pib.trim() && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                      <p v-if="pibError" class="error-text">Debe ser un número menor o igual a 100 con máximo 2 decimales.</p>
                    </div>

                    <!-- Devaluación -->
                    <div class="form-group" :class="{ 'error': (!devaluacion.trim() && mostrarErrores) || devaluacionError }">
                      <label>Devaluación Proyectada (%):</label>
                      <input type="text" class="input-field" v-model="devaluacion" @input="validarDecimal('devaluacion', true)">
                      <p v-if="!devaluacion.trim() && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                      <p v-if="devaluacionError" class="error-text">Número inválido o más de 2 decimales.</p>
                    </div>

                    <!-- Salario -->
                    <div class="form-group" :class="{ 'error': (!salario.trim() && mostrarErrores) || salarioError }">
                      <label>Aumento Salario Mínimo (%):</label>
                      <input type="text" class="input-field" v-model="salario" @input="validarDecimal('salario', false)">
                      <p v-if="!salario.trim() && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                      <p v-if="salarioError" class="error-text">Debe ser un número menor o igual a 100 con máximo 2 decimales.</p>
                    </div>

                    <!-- Crecimiento Avantika -->
                    <div class="form-group" :class="{ 'error': (!crecimiento_avantika.trim() && mostrarErrores) || crecimiento_avantikaError }">
                      <label>Crecimiento Avantika (%):</label>
                      <input type="text" class="input-field" v-model="crecimiento_avantika" @input="validarDecimal('crecimiento_avantika', false)">
                      <p v-if="!crecimiento_avantika.trim() && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                      <p v-if="crecimiento_avantikaError" class="error-text">Debe ser un número menor o igual a 100 con máximo 2 decimales.</p>
                    </div>
                    <div class="form-group full-width" :class="{ 'error': !fuente.trim() && mostrarErrores }">
                        <label>Fuente:</label>
                        <textarea 
                          class="input-field" 
                          v-model="fuente" 
                          @input="autoExpand($event)"
                          ref="textarea"
                        ></textarea>
                        <p v-if="!fuente.trim() && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                    </div>
                    <button type="submit" class="submit-button">Registrar</button>
                </form>
            </div>
      </div>

      <div class="form-container">
          <div class="table-container">
              <h3 class="h3-title">REGISTROS</h3>
              <table>
                  <thead>
                      <tr>
                          <th>ID</th>
                          <th>AÑO</th>
                          <th>IPC (%)</th>
                          <th>PIB (%)</th>
                          <th>DEVALUACIÓN (%)</th>
                          <th>AUMENTO SALARIO (%)</th>
                          <th>CRECIMIENTO AVANTIKA (%)</th>
                          <th>FUENTE</th>
                          <th>FECHA CREACIÓN</th>
                          <th>ACCIONES</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-if="lista_registros.length === 0">
                          <td colspan="10" class="no-registros">No hay registros disponibles</td>
                      </tr>
                      <tr v-else v-for="(reg, index) in lista_registros" :key="reg.id">
                          <td>{{ reg.id }}</td>
                          <td>{{ reg.ano_proyeccion }}</td>
                          <td>{{ reg.ipc_proyectado }}%</td>
                          <td>{{ reg.pib_proyectado }}%</td>
                          <td>{{ reg.devaluacion_proyectada }}%</td>
                          <td>{{ reg.aumento_salario_minimo }}%</td>
                          <td>{{ reg.crecimiento_avantika }}%</td>
                          <td>{{ reg.fuente }}</td>
                          <td>{{ reg.created_at }}</td>
                          <td style="text-align: center;">
                              <i class="fa-regular fa-clipboard" style="cursor: pointer;" @click="abrirModalEdicion(reg)"></i>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>

      <!-- Modal de edición -->
      <div class="modal fade" id="editarModal" tabindex="-1" aria-labelledby="editarModalLabel" aria-hidden="true" data-bs-backdrop="static" ref="editarModal">
          <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="editarModalLabel">Editar Registro</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      <form>
                          <div class="form-group">
                              <label>Año:</label>
                              <input type="text" class="input-field" v-model="registroSeleccionado.ano_proyeccion" disabled />
                          </div>
                          <div class="form-group" :class="{ 'error': ipcErrorEdicion }">
                              <label>IPC Proyectado (%):</label>
                              <input type="text" class="input-field" v-model="registroSeleccionado.ipc_proyectado" @input="validarDecimalEdicion('ipc_proyectado', false)" />
                              <p v-if="ipcErrorEdicion" class="error-text">Debe ser un número menor o igual a 100 con máximo 2 decimales.</p>
                          </div>
                          <div class="form-group" :class="{ 'error': pibErrorEdicion }">
                              <label>PIB Proyectado (%):</label>
                              <input type="text" class="input-field" v-model="registroSeleccionado.pib_proyectado" @input="validarDecimalEdicion('pib_proyectado', false)" />
                              <p v-if="pibErrorEdicion" class="error-text">Debe ser un número menor o igual a 100 con máximo 2 decimales.</p>
                          </div>
                          <div class="form-group" :class="{ 'error': devaluacionErrorEdicion }">
                              <label>Devaluación Proyectada (%):</label>
                              <input type="text" class="input-field" v-model="registroSeleccionado.devaluacion_proyectada" @input="validarDecimalEdicion('devaluacion_proyectada', true)" />
                              <p v-if="devaluacionErrorEdicion" class="error-text">Número inválido o más de 2 decimales.</p>
                          </div>
                          <div class="form-group" :class="{ 'error': salarioErrorEdicion }">
                              <label>Aumento Salario Mínimo (%):</label>
                              <input type="text" class="input-field" v-model="registroSeleccionado.aumento_salario_minimo" @input="validarDecimalEdicion('aumento_salario_minimo', false)" />
                              <p v-if="salarioErrorEdicion" class="error-text">Debe ser un número menor o igual a 100 con máximo 2 decimales.</p>
                          </div>
                          <div class="form-group" :class="{ 'error': crecimiento_avantikaErrorEdicion }">
                              <label>Crecimiento Avantika (%):</label>
                              <input type="text" class="input-field" v-model="registroSeleccionado.crecimiento_avantika" @input="validarDecimalEdicion('crecimiento_avantika', false)" />
                              <p v-if="crecimiento_avantikaErrorEdicion" class="error-text">Debe ser un número menor o igual a 100 con máximo 2 decimales.</p>
                          </div>
                          <div class="form-group">
                              <label>Fuente:</label>
                              <textarea class="input-field" v-model="registroSeleccionado.fuente"></textarea>
                          </div>
                        
                      </form>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button type="button" class="btn btn-primary update-button" @click="actualizarRegistro">Actualizar</button>
                  </div>
              </div>
          </div>
      </div>

      <!-- Modal de éxito -->
      <div class="modal fade" id="exitoModal" tabindex="-1" aria-labelledby="exitoModalLabel" aria-hidden="true" data-bs-backdrop="static" ref="exitoModal">
          <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="exitoModalLabel">Modal Éxito</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      {{ msg }}
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="reloadPage">Cerrar</button>
                  </div>
              </div>
          </div>
      </div>

      <!-- Modal de error -->
      <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true" data-bs-backdrop="static" ref="errorModal">
          <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="errorModalLabel">Error</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      {{ errorMsg }}
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
              </div>
          </div>
      </div>
      
  </PanelView>
</template>

<script setup>
import apiUrl from "../../config.js";
import PanelView from "./Layouts/PanelView.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Modal } from 'bootstrap';

const router = useRouter();

const anio = ref("");
const ipc = ref("");
const pib = ref("");
const devaluacion = ref("");
const salario = ref("");
const crecimiento_avantika = ref("");
const fuente = ref("");

const modalInstance = ref(null);
const modalErrorInstance = ref(null);
const modalEditarInstance = ref(null);

const msg = ref("");
const errorMsg = ref("");
const mostrarErrores = ref(false);

const anioError = ref(false);
const ipcError = ref(false)
const pibError = ref(false)
const devaluacionError = ref(false)
const salarioError = ref(false)
const crecimiento_avantikaError = ref(false)
const textarea = ref(null);
const lista_registros = ref([]);
const registroSeleccionado = ref({});

const ipcErrorEdicion = ref(false);
const pibErrorEdicion = ref(false);
const devaluacionErrorEdicion = ref(false);
const salarioErrorEdicion = ref(false);
const crecimiento_avantikaErrorEdicion = ref(false);

const cargarRegistros = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/mostrar_variables`, {},
      {
          headers: {
              Accept: "application/json"
          }
      }
    );

    if (response.status === 200) {
      lista_registros.value = response.data.data;
    }
  } catch (error) {
    console.error("Error al consultar los datos:", error);
    errorMsg.value = error.response?.data?.message || "Error al consultar los datos.";
    modalErrorInstance.value.show();
  }
};

// ✅ Función para guardar la información
const guardarDatos = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/guardar_variables`, {
        anio: anio.value,
        ipc: ipc.value,
        pib: pib.value,
        devaluacion: devaluacion.value,
        salario: salario.value,
        crecimiento_avantika: crecimiento_avantika.value,
        fuente: fuente.value
      },
      {
          headers: {
              Accept: "application/json"
          }
      }
    );

    if (response.status === 200) {
      msg.value = response.data.message || "Datos guardados correctamente.";
      modalInstance.value.show();
      await cargarRegistros()
      limpiar();
    }
  } catch (error) {
    console.error("Error al guardar los datos:", error);
    errorMsg.value = error.response?.data?.message || "Error al guardar los datos.";
    modalErrorInstance.value.show();
  }
};

const validarAnio = () => {
  // Elimina cualquier caracter no numérico
  anio.value = anio.value.replace(/\D/g, '');

  // Verifica rango solo si tiene 4 dígitos
  if (anio.value.length === 4) {
    const valor = parseInt(anio.value, 10);
    anioError.value = !(valor >= 2000 && valor <= 2200);
  } else {
    anioError.value = false;
  }
};

// ✅ Función para validar el formulario antes de enviar
const validarFormulario = () => {
    mostrarErrores.value = true;

    if (
      !anio.value ||
      anioError.value ||
      !ipc.value || ipcError.value ||
      !pib.value || pibError.value ||
      !devaluacion.value || devaluacionError.value ||
      !salario.value || salarioError.value ||
      !crecimiento_avantika.value || crecimiento_avantikaError.value ||
      !fuente.value.trim()
    ) {
        return; // Detener el envío si hay errores
    }

    guardarDatos(); // Llamar a la función original si todo está correcto
};

const limpiar = () => {
  anio.value = "";
  ipc.value = "";
  pib.value = "";
  devaluacion.value = "";
  salario.value = "";
  crecimiento_avantika.value = "";
  fuente.value = "";
  mostrarErrores.value = false;

  // Restablece el tamaño del textarea usando el ref
  if (textarea.value) {
        textarea.value.style.height = "auto"; // vuelve al tamaño original
    }
};

function validarDecimal(campo, permiteMayorCien) {
  let valor = {
    ipc,
    pib,
    devaluacion,
    salario,
    crecimiento_avantika
  }[campo]

  // Permitir signo negativo solo para devaluacion
  if (campo === 'devaluacion') {
    // Solo números, punto y un posible signo negativo al inicio
    valor.value = valor.value.replace(/(?!^)-|[^0-9\.-]/g, '');
    // Solo un signo negativo al inicio
    valor.value = valor.value.replace(/(?!^)-/g, '');
    // Evita múltiples puntos
    if ((valor.value.match(/\./g) || []).length > 1) {
      valor.value = valor.value.substring(0, valor.value.length - 1)
    }
  } else {
    // Solo números y punto
    valor.value = valor.value.replace(/[^0-9.]/g, '')
    // Evita múltiples puntos
    if ((valor.value.match(/\./g) || []).length > 1) {
      valor.value = valor.value.substring(0, valor.value.length - 1)
    }
  }

  // Limita a 2 decimales
  const partes = valor.value.split('.')
  if (partes.length === 2 && partes[1].length > 2) {
    partes[1] = partes[1].substring(0, 2)
    valor.value = `${partes[0]}.${partes[1]}`
  }

  // Validación de límite (excepto para devaluación)
  const num = parseFloat(valor.value)
  const errorRef = {
    ipc: ipcError,
    pib: pibError,
    devaluacion: devaluacionError,
    salario: salarioError,
    crecimiento_avantika: crecimiento_avantikaError
  }[campo]

  if (!valor.value) {
    errorRef.value = false
  } else if (isNaN(num) || (!permiteMayorCien && num > 100)) {
    errorRef.value = true
  } else {
    errorRef.value = false
  }
}

function validarDecimalEdicion(campo, permiteMayorCien) {
    let valor = registroSeleccionado.value[campo];

    // Permitir signo negativo solo para devaluacion_proyectada
    if (campo === 'devaluacion_proyectada') {
        valor = valor.replace(/(?!^)-|[^0-9\.-]/g, '');
        valor = valor.replace(/(?!^)-/g, '');
        if ((valor.match(/\./g) || []).length > 1) {
            valor = valor.substring(0, valor.length - 1);
        }
    } else {
        // Solo números y punto
        valor = valor.replace(/[^0-9.]/g, '');
        if ((valor.match(/\./g) || []).length > 1) {
            valor = valor.substring(0, valor.length - 1);
        }
    }

    // Limita a 2 decimales
    const partes = valor.split('.');
    if (partes.length === 2 && partes[1].length > 2) {
        partes[1] = partes[1].substring(0, 2);
        valor = `${partes[0]}.${partes[1]}`;
    }

    // Validación de límite
    const num = parseFloat(valor);
    const errorRef = {
        ipc_proyectado: ipcErrorEdicion,
        pib_proyectado: pibErrorEdicion,
        devaluacion_proyectada: devaluacionErrorEdicion,
        aumento_salario_minimo: salarioErrorEdicion,
        crecimiento_avantika: crecimiento_avantikaErrorEdicion,
    }[campo];

    if (!valor) {
        errorRef.value = false;
    } else if (isNaN(num) || (!permiteMayorCien && num > 100)) {
        errorRef.value = true;
    } else {
        errorRef.value = false;
    }

    registroSeleccionado.value[campo] = valor;
}

// ✅ Función para expandir automáticamente el textarea
function autoExpand(event) {
  const textarea = event.target;
  textarea.style.height = "auto"; // Restablece la altura
  textarea.style.height = `${textarea.scrollHeight}px`; // Ajusta la altura al contenido
};

// ✅ Función para abrir el modal de edición
const abrirModalEdicion = (registro) => {
    registroSeleccionado.value = { ...registro }; // Clonar el registro seleccionado
    modalEditarInstance.value.show();
};

// ✅ Función para actualizar el registro
const actualizarRegistro = async () => {
    try {
        const response = await axios.post(
            `${apiUrl}/actualizar_variables`, 
            registroSeleccionado.value,
            {
                headers: {
                    Accept: "application/json"
                }
            }
        );

        if (response.status === 200) {
            msg.value = response.data.message || "Registro actualizado correctamente.";
            modalEditarInstance.value.hide();
            modalInstance.value.show();
            await cargarRegistros(); // Recargar la lista de registros
        }
    } catch (error) {
        console.error("Error al actualizar el registro:", error);
        errorMsg.value = error.response?.data?.message || "Error al actualizar el registro.";
        modalErrorInstance.value.show();
    }
};

// ✅ Función mounted que carga información ANTES de que la página renderice
onMounted(() => {
  modalInstance.value = new Modal(exitoModal);
  modalErrorInstance.value = new Modal(errorModal);
  modalEditarInstance.value = new Modal(editarModal);

  // Cargar registros al inicio
  cargarRegistros();

});

</script>

<style scoped>
.container {
    max-width: 100%;
    margin: 0 auto;
    padding: 0;
}
.header, .form-container {
    background-color: #ffffff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-top: 24px;
}
.header h1 {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 16px;
}
.form-container h2 {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 16px;
}
.form-flex {
    display: flex;
    flex-wrap: wrap; /* Permite que los elementos se ajusten automáticamente */
    gap: 16px; /* Espaciado entre elementos */
    align-items: flex-start;
}
.form-group {
    flex: 1 1 calc(33.333% - 16px); /* Cada elemento ocupa 1/3 del ancho, restando el gap */
    min-width: 200px; /* Evita que se vuelvan demasiado pequeños */
    max-width: 500px; /* Máximo ancho para que no se expanda */
}
.form-group label {
    display: block;
    color: #4b5563;
    margin-bottom: 4px;
    font-weight: bold;
}
.full-width {
  flex: 0 0 100%;
  max-width: 100%;
  margin-top: 20px;
}
.input-field {
    width: 100%;
    padding: 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
}
.submit-button {
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    background: #679b3a;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
    font-size: 0.9em;
}
.submit-button:hover {
    background: #487223;
}
.error .input-field,
.error select {
    border-color: red;
    background-color: #ffe6e6;
}
.error-text {
    color: red;
    font-size: 0.85em;
    margin-top: 4px;
}

/* Tabla */
.table-container {
    flex-grow: 1; /* Permite que la tabla ocupe todo el espacio restante */
    overflow-y: auto; /* Activa el scroll interno en la tabla */
    max-height: 100%; /* Se ajusta a la altura disponible */
}
table {
    width: 100%;
    border-collapse: collapse;

    position: relative;
}
/* Dejar fija la cabecera */
thead {
    position: sticky;
    top: 0;
    background-color: #e5e7eb; /* Fijar color de fondo para que no sea transparente */
    z-index: 10; /* Asegurar que esté sobre el contenido */
}
th, td {
    border: 1px solid #e5e7eb;
    padding: 8px;
    text-align: left;
    font-size: 0.875rem;
}
th {
    background-color: #679b3a;
    color: white;
}

/* Reducir el tamaño de los select dentro de la tabla */
.table-container table select {
    width: 80px; /* Ajusta el ancho */
    padding: 4px; /* Reduce el padding interno */
    font-size: 0.875rem; /* Hace el texto un poco más pequeño */
}

.table-container table input {
    width: 150px; /* Ajusta el ancho */
    padding: 4px; /* Reduce el padding interno */
    font-size: 0.875rem; /* Hace el texto un poco más pequeño */
}

/* Ajustar el tamaño del textarea dentro de la tabla */
.table-container table textarea {
    width: 100%; /* Ocupar todo el ancho de la celda */
    min-width: 200px; /* Asegurar un tamaño mínimo */
    height: 50px; /* Un poco más alto */
    resize: vertical; /* Permitir que el usuario lo ajuste en altura */
    font-size: 0.875rem;
}

.no-registros {
    text-align: center;
    font-weight: bold;
    color: #888;
    padding: 16px;
    font-size: 1rem;
}

.update-button {
    background-color: #679b3a;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background 0.3s;
}
.update-button:hover {
    background-color: #487223;
}

@media (max-width: 768px) {
    .form-group {
        flex: 1 1 calc(50% - 16px); /* 2 columnas en pantallas medianas */
    }
}
@media (max-width: 480px) {
    .form-group {
        flex: 1 1 100%; /* 1 columna en pantallas pequeñas */
    }
} 
</style>
