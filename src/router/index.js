import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue';
import SectoresView from '@/views/SectoresView.vue';
import SubsectoresView from '@/views/SubsectoresView.vue';
import TercerosView from '@/views/TercerosView.vue';
 
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', name: 'home', component: HomeView},
    {path: '/sectores', name: 'sectores', component: SectoresView},
    {path: '/subsectores', name: 'subsectores', component: SubsectoresView},
    {path: '/terceros', name: 'terceros', component: TercerosView},
  ]
})
 
// router.beforeEach((to, from, next) => {
 
//   const token = localStorage.getItem('token');
//   // Si no se requiere autenticación (por ejemplo, en la ruta de login), continúa
//   if (to.path === '/' || to.name === 'login') {
//     next();
//   } else {
//     // Si se requiere autenticación y no hay token, redirigir al login
//     if (!token) {
//       next({ name: 'login' }); // Redirigir a la ruta de login si no hay token
//     } else {
//       // Si hay token, permitir la navegación
//       next();
//     }
//   }
// });
 
export default router