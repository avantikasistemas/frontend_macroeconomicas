<template>
    <PanelView>
        <h3>Terceros</h3>
  
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
                        <select class="input-field" v-model="sector" @change="onSectorChange">
                            <option :value="null">Seleccione...</option>
                            <option v-for="sec in list_sectores" :value="sec.concepto_12">{{ sec.descripcion }}</option>
                        </select>
                        <p v-if="!sector && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                    </div>

                    <!-- SUBSECTOR -->
                    <div class="form-group">
                        <label>Sub Sector:</label>
                        <select class="input-field" v-model="subsector">
                            <option :value="null">Seleccione...</option>
                            <option v-for="subs in list_subsector" :value="subs.id_subsector">{{ subs.subsector }}</option>
                        </select>
                    </div>

                    <!-- NOMBRE --> 
                    <div class="form-group">
                      <label>Nombre:</label>
                      <input type="text" class="input-field" v-model="nombre_tercero"/>
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
                            <th>AÑO</th>
                            <th>NIT REAL</th>
                            <th>NIT</th>
                            <th>NOMBRE</th>
                            <th>PORCENTAJE (%)</th>
                            <th>FECHA CREACIÓN</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="list_clientes.length === 0">
                            <td colspan="8" class="no-registros">No hay registros disponibles</td>
                        </tr>
                        <tr v-else v-for="reg in list_clientes" :key="reg.id">
                            <td>{{ reg.id }}</td>
                            <td>{{ reg.anio }}</td>
                            <td>{{ reg.nit_real }}</td>
                            <td>{{ reg.nit }}</td>
                            <td>{{ reg.nombre }}</td>
                            <td>{{ reg.porcentaje_cliente }}%</td>
                            <td>{{ reg.created_at }}</td>
                            <td style="text-align: center;">
                                <i class="fa-regular fa-clipboard" style="cursor: pointer;" @click="abrirModalEdicion(reg)"></i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="pagination" v-if="total_registros > 20">
                <label for="records-per-page">Registros por página:</label>
                <select 
                    id="records-per-page" 
                    v-model="limit" 
                    @change="changePage(1)"
                >
                    <option value="50">50</option>
                    <option value="75">75</option>
                    <option value="100">100</option>
                </select>
                <button 
                    :disabled="position <= 1" 
                    @click="changePage(1)"
                >
                    Primera
                </button>
                
                <button 
                    :disabled="position <= 1" 
                    @click="changePage(position - 1)"
                >
                    Anterior
                </button>
                
                <span>Página {{ position }} de {{ total_paginas }}</span>
                
                <button 
                    :disabled="position >= total_paginas" 
                    @click="changePage(position + 1)"
                >
                    Siguiente
                </button>
                
                <button 
                    :disabled="position >= total_paginas" 
                    @click="changePage(total_paginas)"
                >
                    Última
                </button>
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
                            <!-- NIT (solo lectura) -->
                            <div class="form-group">
                                <label>NIT:</label>
                                <input type="text" class="input-field" v-model="registroSeleccionado.nit_real" disabled />
                            </div>
                            <!-- Nombre (solo lectura) -->
                            <div class="form-group">
                                <label>Nombre:</label>
                                <input type="text" class="input-field" v-model="registroSeleccionado.nombre" disabled />
                            </div>
                            <!-- Porcentaje (editable) -->
                            <div class="form-group" :class="{ 'error': porcentajeErrorEdicion }">
                                <label>Porcentaje (%):</label>
                                <input 
                                    type="text" 
                                    class="input-field" 
                                    v-model="registroSeleccionado.porcentaje_cliente" 
                                    @input="validarDecimalEdicion('porcentaje_cliente')" 
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
                            :disabled="porcentajeErrorEdicion || !registroSeleccionado.porcentaje_cliente"
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
        
    </PanelView>
</template>
  
<script setup>
import apiUrl from "../../config.js";
import PanelView from './Layouts/PanelView.vue';
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Modal } from 'bootstrap';

const router = useRouter();

const anio = ref("");
const sector = ref(null);
const subsector = ref(null);
const nombre_tercero = ref(null);

const modalInstance = ref(null);
const modalErrorInstance = ref(null);
const modalEditarInstance = ref(null);

const msg = ref("");
const errorMsg = ref("");
const mostrarErrores = ref(false);

const anioError = ref(false);
const sectorError = ref(false);
const porcentajeErrorEdicion = ref(false);
const list_anios = ref([]);
const list_sectores = ref([]);
const list_clientes = ref([]);
const list_subsector = ref([]);
const registroSeleccionado = ref({});

const total_paginas = ref(0);
const total_registros = ref(0);
const limit = ref(20);
const position = ref(1);

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

const obtenerclientes = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/obtener_clientes`, 
      {
        anio: anio.value,
        sector: sector.value,
        subsector: subsector.value,
        nombre_tercero: nombre_tercero.value,
        limit: parseInt(limit.value),
        position: parseInt(position.value),
      },
      {
          headers: {
              Accept: "application/json"
          }
      }
    );

    if (response.status === 200) {
        list_clientes.value = response.data.data.registros;
        total_paginas.value = response.data.data.total_pag;
        total_registros.value = response.data.data.total_registros;
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

    obtenerclientes(); // Llamar a la función original si todo está correcto
};
  
const abrirModalEdicion = (registro) => {
    registroSeleccionado.value = { ...registro }; // Clonar el registro seleccionado
    modalEditarInstance.value.show(); // Mostrar la modal de edición
};

const changePage = async (newPosition) => {
  position.value = newPosition;
  await obtenerclientes(); // Vuelve a cargar los datos con el nuevo límite y posición
};

function validarDecimalEdicion(campo) {
    if (campo !== 'porcentaje_cliente') return; // Validar solo el campo 'porcentaje_cliente'

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
            `${apiUrl}/actualizar_cliente`, 
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
            await obtenerclientes(); // Recargar la lista de registros
        }
    } catch (error) {
        console.error("Error al actualizar el registro:", error);
        errorMsg.value = error.response?.data?.message || "Error al actualizar el registro.";
        modalErrorInstance.value.show();
    }
};


const onSectorChange = async () => {
    try {
        // Carga de subsectores asociados al sector seleccionado
        const response = await axios.post(
            `${apiUrl}/get_subsector_by_sector`, 
            { 
                sector: sector.value 
            },
            {
                headers: {
                    Accept: "application/json"
                }
            }
        );

        if (response.status === 200) {
            list_subsector.value = response.data.data || [];
        }



    } catch (error) {
        console.error('Error al cargar datos dinámicos:', error);
        modalErrorInstance.value.show();
        errorMsg.value = error.response.data.message;
        if (error.response.status === 401) {
            token_status.value = error.response.status
            errorMsg.value = error.response.data.detail;
        } else if (error.response.status === 403) {
            token_status.value = error.response.status
            errorMsg.value = error.response.data.detail;
        }
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
    // obtenerclientes();
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

  .pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  gap: 2px;
  font-size: 142px; /* Reduce el tamaño de la fuente */
  padding: 20px;
}

.pagination label {
  margin-right: 10px;
  font-size: 1rem;
}

.pagination select {
  margin-right: 20px;
  padding: 4px;
  font-size: 0.8rem;
  height: 30px;
}

.pagination button {
  background-color: #679b3a;
  color: white;
  border: none;
  padding: 4px 8px;
  margin: 0 5px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  height: 30px;
  transition: background 0.3s;
}

.pagination button:hover {
  background-color: #487223;
}


.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  margin: 0 10px;
  font-size: 1rem;
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
