<template>
  <div class="w-[90%] mx-auto p-6 space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
      <!-- Filtros -->
      <div class="md:col-span-1 space-y-4">
        <h2 class="text-xl font-semibold">Filtros</h2>

        <!-- Categoría -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            v-model="selectedCategory"
            class="w-full border rounded p-2"
          >
            <option value="">Seleccione una categoría</option>
            <option
              v-for="(categoria, index) in categories"
              :key="index"
              :value="categoria"
            >
              {{ categoria }}
            </option>
          </select>
        </div>

        <!-- Autor -->
        <div>
          <label class="block mb-1 font-medium">Autor</label>
          <select v-model="selectedAuthor" class="w-full border rounded p-2">
            <option value="">Todos</option>
            <option v-for="author in authors" :key="author">{{ author }}</option>
          </select>
        </div>

        <!-- Ordenar por -->
        <div>
          <label class="block mb-1 font-medium">Ordenar por</label>
          <select v-model="sortBy" class="w-full border rounded p-2">
            <option value="alfabetico">Alfabéticamente (A-Z)</option>
            <option value="fecha">Fecha de creación</option>
            <option value="favoritos">Favoritos</option>
            <option value="capitulos">Cantidad de capítulos</option>
          </select>
        </div>
      </div>

      <!-- Resultados -->
      <div class="md:col-span-4 space-y-4">
        <h2 class="text-2xl font-bold">Resultados</h2>
        <div v-if="filteredBooks.length === 0" class="text-gray-500">No hay resultados.</div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            v-for="book in sortedBooks"
            :key="book.id"
            class="bg-white border rounded-xl shadow hover:shadow-lg transition p-3"
          >
            <router-link :to="`/libro/${book.titulo.toLowerCase().replace(/\s+/g, '-')}`">
              <img :src="book.portada" class="w-full h-55 object-cover rounded" />
              <h3 class="mt-2 font-semibold truncate">{{ book.titulo }}</h3>
              <p class="text-sm text-gray-500">{{ book.autor }}</p>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase';
import { ref as dbRef, get } from 'firebase/database';
import { CATEGORIES } from '../constants/categories';

export default {
  data() {
    return {
      books: [],
      selectedCategory: '',
      selectedAuthor: '',
      sortBy: 'alfabetico',
      categorias: CATEGORIES,
    };
  },
  computed: {
    categories() {
      return [...this.categorias].sort((a, b) => a.localeCompare(b));
    },
    authors() {
      const authors = this.books.map(book => book.autor).filter(Boolean);
      const uniqueAuthors = [...new Set(authors)];
      return uniqueAuthors.sort((a, b) => a.localeCompare(b));
    },
    filteredBooks() {
      return this.books.filter(book => {
        const byCategory = this.selectedCategory ? book.categorias?.includes(this.selectedCategory) : true;
        const byAuthor = this.selectedAuthor ? book.autor === this.selectedAuthor : true;
      return byCategory && byAuthor;
      });
    },
    sortedBooks() {
      return [...this.filteredBooks].sort((a, b) => {
        switch (this.sortBy) {
          case 'favoritos':
            return (b.favoritos || 0) - (a.favoritos || 0);
          case 'capitulos':
            return (b.capitulos?.length || 0) - (a.capitulos?.length || 0);
          case 'alfabetico':
            return a.titulo.localeCompare(b.titulo);
          case 'fecha':
          default:
            return (b.createdAt || 0) - (a.createdAt || 0);
        }
      });
    },
  },
  async mounted() {
    const librosRef = dbRef(db, 'Libros');
    const snapshot = await get(librosRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const booksArray = Object.entries(data).map(([id, book]) => ({
        ...book,
        id,
      }));
      this.books = booksArray;
    }
  },
};
</script>
