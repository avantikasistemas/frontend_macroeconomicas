<template>
    <LayoutView>
        <h3>Subsectores</h3>
  
        <div class="container">
            <div class="form-container">
                <form @submit.prevent="validarFormulario" class="form-flex">

                    <!-- AÑOS -->
                    <div class="form-group" :class="{ 'error': (!anio && mostrarErrores)}">
                      <label>Años:</label>
                      <select class="input-field" v-model="anio">
                          <option :value="null">Seleccione...</option>
                          <option v-for="(an, index) in list_anios" :value="an.anio">{{ an.anio }}</option>
                      </select>
                      <p v-if="!anio && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                    </div>

                    <!-- SECTOR -->
                    <div class="form-group" :class="{ 'error': (!sector && mostrarErrores)}">
                        <label>Sector:</label>
                        <select class="input-field" v-model="sector">
                            <option :value="null">Seleccione...</option>
                            <option v-for="sec in list_sectores" :value="sec.concepto_12">{{ sec.descripcion }}</option>
                        </select>
                        <p v-if="!sector && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                    </div>
                    <button type="submit" class="submit-button">Buscar</button>
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
                            <th>CÓDIGO</th>
                            <th>DESCRIPCIÓN</th>
                            <th>PORCENTAJE (%)</th>
                            <th>FECHA CREACIÓN</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="list_subsectores.length === 0">
                            <td colspan="5" class="no-registros">No hay registros disponibles</td>
                        </tr>
                        <tr v-else v-for="reg in list_subsectores" :key="reg.id">
                            <td>{{ reg.id }}</td>
                            <td>{{ reg.subsector }}</td>
                            <td>{{ reg.subsector_nombre }}</td>
                            <td>{{ reg.subsector_porcentaje }}%</td>
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
                            <!-- Año (solo lectura) -->
                            <div class="form-group">
                                <label>Año:</label>
                                <input type="text" class="input-field" v-model="registroSeleccionado.anio" disabled />
                            </div>
                            <!-- Código (solo lectura) -->
                            <div class="form-group">
                                <label>Código:</label>
                                <input type="text" class="input-field" v-model="registroSeleccionado.subsector" disabled />
                            </div>
                            <!-- Descripción (solo lectura) -->
                            <div class="form-group">
                                <label>Descripción:</label>
                                <input type="text" class="input-field" v-model="registroSeleccionado.subsector_nombre" disabled />
                            </div>
                            <!-- Porcentaje (editable) -->
                            <div class="form-group" :class="{ 'error': porcentajeErrorEdicion }">
                                <label>Porcentaje (%):</label>
                                <input 
                                    type="text" 
                                    class="input-field" 
                                    v-model="registroSeleccionado.subsector_porcentaje" 
                                    @input="validarDecimalEdicion('subsector_porcentaje')" 
                                />
                                <p v-if="porcentajeErrorEdicion" class="error-text">Debe ser un número menor o igual a 100 con máximo 2 decimales.</p>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button 
                            type="button" 
                            class="btn btn-primary update-button" 
                            @click="actualizarRegistro"
                            :disabled="porcentajeErrorEdicion || !registroSeleccionado.subsector_porcentaje"
                        >
                            Actualizar
                        </button>
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
        
    </LayoutView>
</template>
  
<script setup>
import apiUrl from "../../config.js";
import LayoutView from '../views/Layouts/LayoutView.vue';
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Modal } from 'bootstrap';

const router = useRouter();

const anio = ref("");
const sector = ref("");
const sector_porcentaje_response = ref(0);

const modalInstance = ref(null);
const modalErrorInstance = ref(null);
const modalEditarInstance = ref(null);

const msg = ref("");
const errorMsg = ref("");
const mostrarErrores = ref(false);

const anioError = ref(false);
const sectorError = ref(false);
const porcentajeErrorEdicion = ref(false);
const lista_registros = ref([]);
const list_anios = ref([]);
const list_sectores = ref([]);
const list_subsectores = ref([]);
const registroSeleccionado = ref({});

const obtenerAnios = async () => {
    try {
        const response = await axios.post(
        `${apiUrl}/obtener_anios_proyecciones`, {},
        {
            headers: {
                Accept: "application/json"
            }
        }
        );

        if (response.status === 200) {
        list_anios.value = response.data.data;
        }
    } catch (error) {
        console.error("Error al consultar los datos:", error);
        errorMsg.value = error.response?.data?.message || "Error al consultar los datos.";
        modalErrorInstance.value.show();
    }
}

const obtenerSectores = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/obtener_sectores`, {},
      {
          headers: {
              Accept: "application/json"
          }
      }
    );

    if (response.status === 200) {
      list_sectores.value = response.data.data;
    }
  } catch (error) {
    console.error("Error al consultar los datos:", error);
    errorMsg.value = error.response?.data?.message || "Error al consultar los datos.";
    modalErrorInstance.value.show();
  }
};

const obtenerSubsectores = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/obtener_subsectores_insertados`, 
      {
        anio: anio.value,
        sector: sector.value
      },
      {
          headers: {
              Accept: "application/json"
          }
      }
    );

    if (response.status === 200) {
        list_subsectores.value = response.data.data;
    }
  } catch (error) {
    console.error("Error al consultar los datos:", error);
    errorMsg.value = error.response?.data?.message || "Error al consultar los datos.";
    modalErrorInstance.value.show();
  }
};

// ✅ Función para validar el formulario antes de enviar
const validarFormulario = () => {
    mostrarErrores.value = true;

    if (
      !anio.value || anioError.value ||
      !sector.value || sectorError.value
    ) {
        return; // Detener el envío si hay errores
    }

    obtenerSubsectores(); // Llamar a la función original si todo está correcto
};
  
const abrirModalEdicion = (registro) => {
    registroSeleccionado.value = { ...registro }; // Clonar el registro seleccionado
    modalEditarInstance.value.show(); // Mostrar la modal de edición
};

function validarDecimalEdicion(campo) {
    if (campo !== 'subsector_porcentaje') return; // Validar solo el campo 'subsector_porcentaje'

    let valor = registroSeleccionado.value[campo];

    // Solo números y punto
    valor = valor.replace(/[^0-9.]/g, '');

    // Evita múltiples puntos
    if ((valor.match(/\./g) || []).length > 1) {
        valor = valor.substring(0, valor.length - 1);
    }

    // Limita a 2 decimales
    const partes = valor.split('.');
    if (partes.length === 2 && partes[1].length > 2) {
        partes[1] = partes[1].substring(0, 2);
        valor = `${partes[0]}.${partes[1]}`;
    }

    // Validación de límite
    const num = parseFloat(valor);
    if (!valor) {
        porcentajeErrorEdicion.value = false;
    } else if (isNaN(num) || num > 100) {
        porcentajeErrorEdicion.value = true;
    } else {
        porcentajeErrorEdicion.value = false;
    }

    registroSeleccionado.value[campo] = valor;
};

// ✅ Función para actualizar el registro
const actualizarRegistro = async () => {

    try {
        const response = await axios.post(
            `${apiUrl}/actualizar_subsectores`, 
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
            await obtenerSubsectores(); // Recargar la lista de registros
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
    obtenerAnios();
    obtenerSectores();
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
      flex: 1 1 calc(25% - 16px); /* Cada elemento ocupa 1/3 del ancho, restando el gap */
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
