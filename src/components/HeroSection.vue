<template>
  <section class="bg-gray-100 p-6 rounded shadow mb-6 text-center">
    <h1 class="text-3xl font-bold mb-4">Bienvenido a InkCloud</h1>

    <div v-if="user && recommendedBooks.length > 0">
      <h2 class="text-xl font-semibold mb-4">Recomendados para ti</h2>
      <BookList :books="recommendedBooks" />
    </div>

    <div v-else-if="user">
      <p class="text-gray-600">No hay recomendaciones disponibles aún.</p>
    </div>

    <div v-else>
      <p class="text-gray-600">Inicia sesión para recibir recomendaciones personalizadas.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { ref as dbRef, get } from 'firebase/database';

import BookList from './BookList.vue';

const user = ref(null);
const recommendedBooks = ref([]);

onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser;
    if (!currentUser) return;

    const uid = currentUser.uid;

    // Obtener favoritos
    const favRef = dbRef(db, `Usuarios/${uid}/favoritos`);
    const favSnap = await get(favRef);
    if (!favSnap.exists()) return;

    const favoritoIds = Object.keys(favSnap.val());

    // Obtener todos los libros
    const booksRef = dbRef(db, 'Libros');
    const booksSnap = await get(booksRef);
    if (!booksSnap.exists()) return;

    const allBooks = booksSnap.val();

    // Extraer categorías favoritas
    const favoriteCategories = new Set();
    favoritoIds.forEach(id => {
      const libro = allBooks[id];
      if (libro?.categorias && Array.isArray(libro.categorias)) {
        libro.categorias.forEach(cat => favoriteCategories.add(cat));
      }
    });

    // Filtrar libros recomendados
    const recomendaciones = Object.entries(allBooks)
      .filter(([id, libro]) =>
        !favoritoIds.includes(id) &&
        libro?.categorias?.some(cat => favoriteCategories.has(cat))
      )
      .sort(([, a], [, b]) => (b.favoritos || 0) - (a.favoritos || 0)) // Ordenar por "favoritos" descendente
      .slice(0, 4)
      .map(([id, libro]) => ({ id, ...libro }));

    recommendedBooks.value = recomendaciones;
  });
});
</script>