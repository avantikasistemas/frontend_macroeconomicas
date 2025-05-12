<template>
    <div class="main-navbar">
      <aside class="sidebar">
        <div class="header-div">
          <img :src="logo" :alt="logo">
          <h2 class="titulo-sidebar">Input de Variables</h2>
        </div>
        <nav>
          <ul>
            <li><router-link :to="{ name: 'home'}"><i class="fa-solid fa-file"></i> Macroeconómicas</router-link></li>
            <li><router-link :to="{ name: 'sectores'}"><i class="fa-regular fa-folder-open"></i> Sectores</router-link></li>
            <li><router-link :to="{ name: 'subsectores'}"><i class="fa-regular fa-folder-open"></i> Subsectores</router-link></li>
          </ul>
        </nav>
      </aside>
    </div>
  </template>
  
  <script setup>
  
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import logo from '@/assets/logo-blanco.png';
  
  const router = useRouter();
  
  onMounted(() => {
  });
  </script>
  
  <style scoped>
  body {
    font-family: 'Arial', sans-serif;
    display: flex;
    margin: 0;
    padding: 0;
    background: #f5f5fa;
    width: 250px;
    height: 100vh;
    overflow: hidden;
  }
  
  .header-div {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  }
  .header-div img {
    margin-right: 8px;
    width: 32px; 
    height: 32px;
  }
  .header-div h1 {
    font-size: 1.25rem;
    font-weight: bold;
  }
  
  .main-navbar {
    display: flex;
    height: 100vh;
  }
  
  .sidebar {
    width: 250px;
    height: 100vh;
    background:#024985;
    color: white;
    padding: 20px;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
  }
  
  .sidebar h2 {
    text-align: center;
    font-weight: bold;
    font-size: 1.2rem;
  }
  
  nav ul {
    list-style: none;
    padding: 0;
  }
  
  nav {
    flex-grow: 1; /* Empuja el botón hacia abajo */
  }
  
  nav ul li {
    margin: 20px 0;
  }
  
  nav ul li a, nav ul li router-link {
    color: white;
    text-decoration: none;
    padding: 10px;
    display: block;
    border-radius: 5px;
    transition: background 0.3s;
  }
  
  nav ul li .router-link-active {
    background: #0c4db7; /* Color de fondo cuando está activo */
    font-weight: bold;
  }
  
  nav ul li a:hover,
  .active {
    background: #ffffff;
    color: #000000;
  }
  
  </style>
  