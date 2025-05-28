<template>
  <header class="bg-gray-700 text-white p-4">
    <div class="mx-auto w-full px-4">
      <!-- Contenedor principal flex con justify-between -->
      <div class="flex items-center justify-between">

        <!-- Izquierda: logo + navegación -->
        <div class="flex items-center space-x-6">
          <router-link to="/" class="flex items-center space-x-2 hover:opacity-80">
            <img
              src="../assets/logo_sin_texto_ni_fondo.png"
              alt="Logo"
              class="h-8 w-auto"
            />
          </router-link>
          <nav class="hidden md:flex space-x-6">
            <router-link to="/" class="hover:text-gray-400">Inicio</router-link>
            <router-link to="/libros" class="hover:text-gray-400">Libros</router-link>
            <template v-if="tipoUsuario === 'admin'">
              <router-link to="/crear-libro" class="hover:text-gray-400">Añadir libro</router-link>
            </template>
          </nav>
        </div>

        <!-- Derecha escritorio: buscador + usuario -->
        <div class="hidden md:flex items-center space-x-4">
          <!-- Buscador -->
          <div class="relative w-96">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="text-gray-400" />
            </div>
            <input
              type="text"
              v-model="search"
              @input="handleSearch"
              placeholder="Buscar libros..."
              class="w-full pl-10 p-2 rounded text-white bg-gray-700 placeholder-gray-300 focus:outline-none"
            />
            <ul
              v-if="searchResults.length > 0"
              class="absolute z-10 w-full bg-white text-black shadow-md mt-1 rounded max-h-60 overflow-y-auto"
            >
              <li
                v-for="(book, index) in searchResults"
                :key="index"
                class="p-2 hover:bg-gray-100 cursor-pointer"
                @click="selectBook(book)"
              >
                {{ book.titulo }}
              </li>
            </ul>
          </div>

          <!-- Usuario -->
          <div class="relative" v-if="currentUser">
            <button @click="showDropdown = !showDropdown">
              <font-awesome-icon :icon="['fas', 'user']" />
            </button>
            <div v-if="showDropdown" class="absolute right-0 mt-2 bg-white text-black rounded shadow z-20 w-40">
              <router-link to="/perfil" class="block px-4 py-2 hover:bg-gray-100">Perfil</router-link>
              <button @click="logout" class="w-full text-left px-4 py-2 hover:bg-gray-100">Cerrar sesión</button>
            </div>
          </div>

          <router-link to="/login" v-else>
            <font-awesome-icon :icon="['fas', 'user']" />
          </router-link>
        </div>

        <!-- Derecha móvil: buscador + usuario + hamburguesa -->
        <div class="flex items-center space-x-4 md:hidden">
          <!-- Buscador móvil -->
          <div class="relative w-36">
            <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="text-gray-400" />
            </div>
            <input
              type="text"
              v-model="search"
              @input="handleSearch"
              placeholder="Buscar..."
              class="w-full pl-8 p-1.5 rounded text-white bg-gray-700 placeholder-gray-300 focus:outline-none text-sm"
            />
          </div>

          <!-- Usuario móvil -->
          <div class="relative" v-if="currentUser">
            <button @click="showDropdown = !showDropdown">
              <font-awesome-icon :icon="['fas', 'user']" />
            </button>
            <div v-if="showDropdown" class="absolute right-0 mt-2 bg-white text-black rounded shadow z-20 w-40">
              <router-link to="/perfil" class="block px-4 py-2 hover:bg-gray-100">Perfil</router-link>
              <button @click="logout" class="w-full text-left px-4 py-2 hover:bg-gray-100">Cerrar sesión</button>
            </div>
          </div>
          <router-link to="/login" v-else>
            <font-awesome-icon :icon="['fas', 'user']" />
          </router-link>

          <!-- Botón hamburguesa -->
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-white">
            <font-awesome-icon :icon="['fas', 'bars']" />
          </button>
        </div>

      </div>

      <!-- Menú colapsable para móvil -->
      <div
        v-if="isMobileMenuOpen"
        class="mt-4 md:hidden"
      >
        <nav class="space-y-2">
          <router-link to="/" class="block hover:text-gray-400">Inicio</router-link>
          <router-link to="/libros" class="block hover:text-gray-400">Libros</router-link>
          <template v-if="tipoUsuario === 'admin'">
            <router-link to="/crear-libro" class="block hover:text-gray-400">Añadir libro</router-link>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import { db } from '../firebase';
import { ref as dbRef, get } from 'firebase/database';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default {
  data() {
    return {
      search: '',
      searchResults: [],
      allBooks: [],
      currentUser: null,
      tipoUsuario: '',
      showDropdown: false,
      isMobileMenuOpen: false,
    };
  },
  async mounted() {
    try {
      const booksRef = dbRef(db, 'Libros');
      const snapshot = await get(booksRef);
      if (snapshot.exists()) {
        const booksData = snapshot.val();
        this.allBooks = Object.values(booksData);
      } else {
        console.warn('No hay libros disponibles');
      }
    } catch (err) {
      console.error('Error al cargar los libros:', err);
    }
  },
  created() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) this.fetchUserData(user.uid);
    });
  },
  methods: {
    async fetchUserData(uid) {
      try {
        const userRef = dbRef(db, `Usuarios/${uid}`);
        const userSnap = await get(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.val();
          this.tipoUsuario = userData.tipoUsuario || 'normal';
        }
      } catch (err) {
        console.error('Error al obtener tipoUsuario:', err);
      }
    },

    handleSearch() {
      const term = this.search.trim().toLowerCase();
      if (!term) {
        this.searchResults = [];
        return;
      }

      this.searchResults = this.allBooks
        .filter((book) => {
          const keywords = book.keywords?.toLowerCase() || '';
          const fullMatch = keywords.includes(term);
          const keywordWords = keywords.split(/\s|,|\./);
          const partialMatch = keywordWords.some((word) => word.includes(term));
          return fullMatch || partialMatch;
        })
        .slice(0, 7);
    },
    selectBook(book) {
      this.search = book.titulo;
      this.search = '';
      this.searchResults = [];
      const slug = book.titulo.toLowerCase().replace(/\s+/g, '-');
      this.$router.push({ name: 'BookDetailView', params: { title: slug } });
    },
    async logout() {
      await signOut(auth);
      location.reload();
    },
  },
};
</script>
