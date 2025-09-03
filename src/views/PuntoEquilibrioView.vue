<template>
    <LayoutView>
        <h3>Punto de Equilibrio</h3>

        <div class="container">
            <div class="form-container">
                <form @submit.prevent="validarFormulario" class="form-flex">

                    <!-- AÑOS -->
                    <div class="form-group" :class="{ 'error': (!anio && mostrarErrores)}">
                      <label>Años:</label>
                      <select class="input-field" v-model="anio">
                          <option :value="null">Seleccione...</option>
                          <option v-for="(an, index) in list_anios_para_sectores" :value="an.anio">{{ an.anio }}</option>
                      </select>
                      <p v-if="!anio && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                    </div>

                    <!-- SECTOR -->
                    <div class="form-group" :class="{ 'error': (!sector && mostrarErrores)}">
                        <label>Sector:</label>
                        <select class="input-field" v-model="sector" @change="onSectorChange(sector)">
                            <option :value="null">Seleccione...</option>
                            <option v-for="sec in list_sectores" :value="sec.concepto_12">{{ sec.descripcion }}</option>
                        </select>
                        <p v-if="!sector && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                    </div>
                </form>
            </div>
        </div>

        <div class="form-container">
            <div class="table-container">
                <h3 class="h3-title">Periodicidad</h3>
                <!-- Formulario dinámico según sector -->
                <div v-if="sector === 30 || sector === 40">
                  <div class="form-group">
                    <label>Mes:</label>
                    <select v-model="mesSeleccionado" class="input-field">
                      <option :value="null">Seleccione mes...</option>
                      <option v-for="mes in meses" :key="mes.id" :value="mes.id">{{ mes.nombre }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Valor:</label>
                    <input type="number" v-model="valor" class="input-field" placeholder="Ingrese valor" />
                  </div>
                  <button class="submit-button" @click="guardarRegistro">Guardar</button>
                </div>
                <div v-else-if="sector === 10 || sector === 20">
                  <div class="form-group">
                    <label>Trimestre:</label>
                    <select v-model="trimestreSeleccionado" class="input-field">
                      <option :value="null">Seleccione trimestre...</option>
                      <option v-for="trimestre in trimestres" :key="trimestre.id" :value="trimestre.id">{{ trimestre.nombre }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Valor:</label>
                    <input type="number" v-model="valor" class="input-field" placeholder="Ingrese valor" />
                  </div>
                  <button class="submit-button" @click="guardarRegistro">Guardar</button>
                </div>
            </div>
        </div>

        <div class="form-container" v-if="list_datos_punto_equilibrio.length > 0">
            <div class="table-container">
                <h3 class="h3-title">REGISTROS</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>AÑO</th>
                            <th>TIPO PERIODICIDAD</th>
                            <th>MES</th>
                            <th>VALOR</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="reg in list_datos_punto_equilibrio" :key="reg.id">
                            <td>{{ reg.id }}</td>
                            <td>{{ reg.anio }}</td>
                            <td>{{ reg.tipo_periodicidad_nombre }}</td>
                            <td>{{ reg.mes_nombre }}</td>
                            <td>{{ reg.valor_peso }}</td>
                        </tr>
                    </tbody>
                </table>
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

const modalInstance = ref(null);
const modalErrorInstance = ref(null);

const msg = ref("");
const errorMsg = ref("");
const mostrarErrores = ref(false);

const list_anios_para_sectores = ref([]);
const anio = ref(null);
const list_sectores = ref([]);
const sector = ref(null);

const anioError = ref(false);
const sectorError = ref(false);

// Variables para formulario dinámico
const meses = [
  { id: 1, nombre: 'Enero' },
  { id: 2, nombre: 'Febrero' },
  { id: 3, nombre: 'Marzo' },
  { id: 4, nombre: 'Abril' },
  { id: 5, nombre: 'Mayo' },
  { id: 6, nombre: 'Junio' },
  { id: 7, nombre: 'Julio' },
  { id: 8, nombre: 'Agosto' },
  { id: 9, nombre: 'Septiembre' },
  { id: 10, nombre: 'Octubre' },
  { id: 11, nombre: 'Noviembre' },
  { id: 12, nombre: 'Diciembre' }
];

const trimestres = [
  { id: 1, nombre: 'Enero, Febrero, Marzo' },
  { id: 2, nombre: 'Abril, Mayo, Junio' },
  { id: 3, nombre: 'Julio, Agosto, Septiembre' },
  { id: 4, nombre: 'Octubre, Noviembre, Diciembre' }
];

const mesSeleccionado = ref(null);
const trimestreSeleccionado = ref(null);
const valor = ref(null);
const tipo_periodicidad = ref(null);
const list_datos_punto_equilibrio = ref([]);

// ✅ Api que consulta los años disponibles para los sectores
const obtener_anios_para_sectores = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/obtener_anios_para_sectores`, {},
      {
          headers: {
              Accept: "application/json"
          }
      }
    );

    if (response.status === 200) {
      list_anios_para_sectores.value = response.data.data;
    }
  } catch (error) {
    console.error("Error al consultar los datos:", error);
    errorMsg.value = error.response?.data?.message || "Error al consultar los datos.";
    modalErrorInstance.value.show();
  }
};

// ✅ Api para obtener los sectores
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

// ✅ Función para validar el formulario antes de enviar
const validarFormulario = () => {
    mostrarErrores.value = true;

    if (
      !anio.value || anioError.value ||
      !sector.value || sectorError.value
    ) {
        return; // Detener el envío si hay errores
    }

    // obtenerclientes(); 
};

const onSectorChange = async (sector) => {
    if (sector === 30 || sector === 40) {
        tipo_periodicidad.value = 1;
    } else if (sector === 10 || sector === 20) {
        tipo_periodicidad.value = 2;
    }
    // Limpiar campos al cambiar sector
    mesSeleccionado.value = null;
    trimestreSeleccionado.value = null;
    valor.value = null;

    // Consumir API según tipo_periodicidad y sector
    await consultarInformacionPeriodica(tipo_periodicidad.value, sector);
};
// Consulta información según tipo_periodicidad y sector
const consultarInformacionPeriodica = async (tipo_periodicidad, sector) => {
    try {
        const response = await axios.post(
            `${apiUrl}/consultar_informacion_periodica`,
            {
                tipo_periodicidad: tipo_periodicidad,
                sector: sector,
            },
            {
                headers: {
                    Accept: "application/json"
                }
            }
        );
        
        if (response.status === 200) {
            list_datos_punto_equilibrio.value = response.data.data || [];
        } 
    } catch (error) {
        console.error("Error al consultar información periódica:", error);
        errorMsg.value = error.response?.data?.message || "Error al consultar información periódica.";
        modalErrorInstance.value.show();
    }
};

const guardarRegistro = async () => {

    try {
        // Aquí puedes manejar el guardado según el sector
        if (sector.value === 30 || sector.value === 40) {
            if (!mesSeleccionado.value || !valor.value || anio.value === null || sector.value === null) {
                errorMsg.value = 'Campos año, mes y valor no deben estar vacíos.';
                modalErrorInstance.value.show();
                return;
            }
            // tipo_periodicidad.value = 1;
        } else if (sector.value === 10 || sector.value === 20) {
            if (!trimestreSeleccionado.value || !valor.value || anio.value === null || sector.value === null) {
                errorMsg.value = 'Campos año, trimestre y valor no deben estar vacíos.';
                modalErrorInstance.value.show();
                return;
            }
            // tipo_periodicidad.value = 2;
        }

        const response = await axios.post(
        `${apiUrl}/guardar_punto_equilibrio`, {
            anio: anio.value,
            sector: sector.value,
            mes: mesSeleccionado.value,
            trimestre: trimestreSeleccionado.value,
            valor: valor.value,
            tipo_periodicidad: tipo_periodicidad.value
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
            await consultarInformacionPeriodica(tipo_periodicidad.value, sector.value);
        }
    } catch (error) {
        console.error("Error al consultar los datos:", error);
        errorMsg.value = error.response?.data?.message || "Error al consultar los datos.";
        modalErrorInstance.value.show();
    }
};

// ✅ Función mounted que carga información ANTES de que la página renderice
onMounted(() => {
    modalInstance.value = new Modal(exitoModal);
    modalErrorInstance.value = new Modal(errorModal);

    obtener_anios_para_sectores();
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
