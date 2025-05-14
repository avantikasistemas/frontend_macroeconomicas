<template>
  <LayoutView>
      <h3>Sectores</h3>

      <div class="container">
          <div class="form-container">
              <form class="form-flex">
                  <!-- AÑO -->
                  <div class="form-group" :class="{ 'error': (!anio && mostrarErrores)}">
                    <label>Año:</label>
                    <select class="input-field" v-model="anio">
                        <option :value="null">Seleccione...</option>
                        <option v-for="an in list_anios_para_sectores" :value="an.anio">{{ an.anio }}</option>
                    </select>
                    <p v-if="!anio && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
                    <p v-if="anio" class="info-text">Crecimiento Avantika: {{ crecimientoSeleccionado }}%</p>
                  </div>
              </form>
          </div>

            <!-- Tabla de sectores -->
            <div v-if="list_sectores.length > 0" class="form-container table-sectores">
                <h3 class="h3-title">Sectores</h3>
                <table>
                    <thead>
                        <tr>
                        <th>Descripción</th>
                        <th>Porcentaje Sector (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(sector, index) in list_sectores" :key="index">
                            <td>{{ sector.descripcion }}</td>
                            <td>
                                <input 
                                type="text" 
                                class="input-field" 
                                v-model="sector.porcentaje_sector" 
                                @input="validarDecimalSector(index)" 
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button type="submit" class="submit-button" @click="validarFormulario" >Registrar</button>
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
                          <th>SECTOR</th>
                          <th>SECTOR (%)</th>
                          <th>FECHA CREACIÓN</th>
                          <th>ACCIONES</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-if="lista_registros.length === 0">
                          <td colspan="7" class="no-registros">No hay registros disponibles</td>
                      </tr>
                      <tr v-else v-for="(reg, index) in lista_registros" :key="reg.id">
                          <td>{{ reg.id }}</td>
                          <td>{{ reg.anio }}</td>
                          <td>{{ reg.sector_nombre }}</td>
                          <td>{{ reg.sector_porcentaje }}%</td>
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
                              <input type="text" class="input-field" v-model="registroSeleccionado.anio" disabled />
                          </div>
                          <div class="form-group">
                              <label>Sector:</label>
                              <input type="text" class="input-field" v-model="registroSeleccionado.sector_nombre" disabled />
                          </div>
                          <div class="form-group" :class="{ 'error': sectorPorcentajeErrorEdicion }">
                              <label>Sector Porcentaje (%):</label>
                              <input 
                                  type="text" 
                                  class="input-field" 
                                  v-model="registroSeleccionado.sector_porcentaje" 
                                  @input="validarDecimalEdicion('sector_porcentaje', false)" 
                              />
                              <p v-if="sectorPorcentajeErrorEdicion" class="error-text">Debe ser un número menor o igual a 100 con máximo 2 decimales.</p>
                          </div>
                      </form>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button 
                          type="button" 
                          class="btn btn-primary update-button" 
                          @click="actualizarRegistro"
                          :disabled="sectorPorcentajeErrorEdicion || !registroSeleccionado.sector_porcentaje"
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

const anio = ref(null);
const crecimiento_avantika = ref("");
const sector = ref("");
const sector_porcentaje = ref("");
const data_ultimo_anio = ref({});

const modalInstance = ref(null);
const modalErrorInstance = ref(null);
const modalEditarInstance = ref(null);

const msg = ref("");
const errorMsg = ref("");
const mostrarErrores = ref(false);

const anioError = ref(false);
const crecimiento_avantikaError = ref(false)
const sectorError = ref(false)
const sector_porcentajeError = ref(false)
const lista_registros = ref([]);
const list_sectores = ref([]);
const list_anios_para_sectores = ref([]);
const registroSeleccionado = ref({});

const crecimientoAvantikaErrorEdicion = ref(false);
const sectorPorcentajeErrorEdicion = ref(false);

const crecimientoSeleccionado = computed(() => {
  const seleccionado = list_anios_para_sectores.value.find(item => item.anio === anio.value);
  return seleccionado ? seleccionado.crecimiento_avantika : "N/A";
});

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

const cargarDatos = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/obtener_registros`, {},
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
    // Mostrar en consola el año seleccionado y el listado de sectores
    console.log(crecimientoSeleccionado.value);
    try {
        const response = await axios.post(
            `${apiUrl}/guardar_valores`, {
                anio: anio.value,
                sectores: list_sectores.value.map(sector => ({
                    concepto: sector.concepto_12,
                    porcentaje: sector.porcentaje_sector
                })),
                crecimiento_avantika: crecimientoSeleccionado.value
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
            limpiar();
            await obtenerSectores();
            await cargarDatos(); 
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
    anioError.value = !(valor >= 2024 && valor <= 2200);
  } else {
    anioError.value = false;
  }
};

// ✅ Función para validar el formulario antes de enviar
const validarFormulario = () => {
    mostrarErrores.value = true;

    if (
      !anio.value || anioError.value 
    ) {
        return; // Detener el envío si hay errores
    }

    guardarDatos(); // Llamar a la función original si todo está correcto
};

const limpiar = () => {
  anio.value = "";
  mostrarErrores.value = false;
};

function validarDecimal(campo, permiteMayorCien) {
  let valor = {
    crecimiento_avantika,
    sector,
    sector_porcentaje,
  }[campo]

  // Solo números y punto
  valor.value = valor.value.replace(/[^0-9.]/g, '')

  // Evita múltiples puntos
  if ((valor.value.match(/\./g) || []).length > 1) {
    valor.value = valor.value.substring(0, valor.value.length - 1)
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
    crecimiento_avantika: crecimiento_avantikaError,
    sector: sectorError,
    sector_porcentaje: sector_porcentajeError
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
    const errorRef = {
        sector_porcentaje: sectorPorcentajeErrorEdicion
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

// ✅ Validar que el porcentaje del sector permita solo números y hasta 2 decimales
const validarDecimalSector = (index) => {
  let valor = list_sectores.value[index].porcentaje_sector;

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

  list_sectores.value[index].porcentaje_sector = valor || "0"; // Si está vacío, inicializar en 0
};

// ✅ Función para abrir el modal de edición
const abrirModalEdicion = (registro) => {
    registroSeleccionado.value = { ...registro }; // Clonar el registro seleccionado
    modalEditarInstance.value.show();
};

// ✅ Función para actualizar el registro
const actualizarRegistro = async () => {
    console.log(registroSeleccionado.value);
    try {
        const response = await axios.post(
            `${apiUrl}/actualizar_valores`, 
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
            await cargarDatos(); // Recargar la lista de registros
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
  obtener_anios_para_sectores();
  obtenerSectores();
  cargarDatos();

});

// Inicializar el porcentaje_sector en 0 para cada sector
watch(list_sectores, (newList) => {
  newList.forEach(sector => {
    if (sector.porcentaje_sector === undefined) {
      sector.porcentaje_sector = "0";
    }
  });
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
.info-text {
    color: #4b5563;
    font-size: 1.2em;
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

.table-sectores {
    max-width: 30%; /* Ajusta este valor entre 30% y 40% según tu preferencia */
    
}

.table-sectores table {
    width: 100%; /* Mantener el ancho de la tabla dentro del contenedor reducido */
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
