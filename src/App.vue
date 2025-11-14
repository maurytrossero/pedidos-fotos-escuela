<template>
  <div id="app">
    <nav class="navbar">
      <!-- Logo -->
      <div class="logo">
        <router-link to="/login" class="logo-link">Hace tu pedido online</router-link>
      </div>

      <!-- Menú principal -->
      <ul class="nav-links" :class="{ 'nav-active': menuOpen }">
        <!-- Botón X para cerrar -->
        <li class="close-btn" @click="menuOpen = false">✖</li>

        <!-- Opciones del menú -->
        <li>
          <router-link to="/foto-pedidos" @click="menuOpen = false">Listado de pedidos</router-link>
        </li>

        <li v-if="isAuthenticated">
          <router-link to="/foto-pedidos/subir" @click="menuOpen = false">Subir Fotos</router-link>
        </li>

        <li>
          <router-link to="/foto-pedidos/nuevo" @click="menuOpen = false">Nuevo Pedido de fotos</router-link>
        </li>

        <li>
          <router-link to="/foto-pedidos/editar" @click="menuOpen = false">Editar Pedido de fotos</router-link>
        </li>

        <li>
          <router-link to="/foto-pedidos/seleccionar" @click="menuOpen = false">Seleccionar Fotos</router-link>
        </li>

        <li v-if="isAuthenticated">
          <router-link to="/seleccion" @click="menuOpen = false">Vista de Selección</router-link>
        </li>

        <!-- Logout -->
        <li v-if="isAuthenticated">
          <button class="logout-btn" @click="logout">Cerrar sesión</button>
        </li>
      </ul>

      <!-- Burger menu -->
      <div class="burger" @click="menuOpen = !menuOpen">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </nav>

    <!-- Vista principal -->
    <router-view />
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const menuOpen = ref(false);
    const isAuthenticated = ref(localStorage.getItem('token') !== null);
    const router = useRouter();

    // Escucha eventos de login/logout
    const updateAuth = () => {
      isAuthenticated.value = localStorage.getItem('token') !== null;
    };

    onMounted(() => {
      window.addEventListener('login-changed', updateAuth);
    });

    onUnmounted(() => {
      window.removeEventListener('login-changed', updateAuth);
    });

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.setItem('isLoggedIn', 'false');
      window.dispatchEvent(new Event('login-changed'));
      router.push('/login');
    };

    return { menuOpen, isAuthenticated, logout };
  }
};
</script>

<style scoped>
/* Fuente base */
.navbar,
.nav-links li a,
.logo {
  font-family: 'Inter', sans-serif;
}

/* Barra principal */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2563eb;
  padding: 0 1.5rem;
  height: 60px;
  color: white;
  position: relative;
  z-index: 200;
}

/* Logo */
.logo {
  font-weight: 700;
  font-size: 1.5rem;
}

.logo-link {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}

.logo-link:hover {
  opacity: 0.8;
}

/* Links desktop */
.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links li a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 0.4rem 0.6rem;
  border-radius: 0.4rem;
  transition: background-color 0.2s;
}

.nav-links li a:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Logout */
.logout-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.35);
}

/* Botón X - oculto en desktop */
.nav-links .close-btn {
  display: none;
}

/* Burger menu */
.burger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
  z-index: 300;
}

.burger div {
  width: 28px;
  height: 3px;
  background-color: white;
  border-radius: 2px;
}

/* Responsive mobile */
@media (max-width: 600px) {
  .nav-links {
    position: fixed;
    right: 0;
    top: 0;
    height: 100vh;
    width: 240px;
    background-color: #2563eb;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.3s ease-in;
    padding-top: 2.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    overflow-y: auto;
    box-shadow: -4px 0 10px rgba(0, 0, 0, 0.2);
    z-index: 100;
  }

  .nav-links.nav-active {
    transform: translateX(0);
  }

  .nav-links .close-btn {
    display: flex;
    align-self: flex-end;
    justify-content: center;
    align-items: center;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: white;
    color: #2563eb;
    font-size: 1.4rem;
    font-weight: bold;
    margin-bottom: 2rem;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;
  }

  .nav-links .close-btn:hover {
    transform: scale(1.1);
  }

  .nav-links li {
    margin-bottom: 1rem;
  }

  .nav-links li a {
    display: block;
    width: 100%;
    padding: 0.8rem 1rem;
    border-radius: 0.5rem;
    background-color: rgba(255, 255, 255, 0.1);
    transition: background-color 0.2s;
  }

  .nav-links li a:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  .burger {
    display: flex;
  }
}
</style>
