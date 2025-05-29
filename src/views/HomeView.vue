<template>
    <div>
      <HeroSection />
      <section class="p-4">
        <h2 class="text-2xl font-bold mb-4">Nuevos lanzamientos</h2>
        <BookList :books="latestBooks" />
      </section>
      <section class="p-4">
        <h2 class="text-2xl font-bold mb-4">Más gustados</h2>
        <BookList :books="mostLikedBooks" />
      </section>
    </div>
  </template>
  
<script setup>
import { ref, onMounted } from 'vue';
import HeroSection from '../components/HeroSection.vue';
import BookList from '../components/BookList.vue';
import { db } from '../firebase';
import { ref as dbRef, get } from 'firebase/database';

const allBooks = ref([]);
const latestBooks = ref([]);
const mostLikedBooks = ref([]);

onMounted(async () => {
  const booksRef = dbRef(db, 'Libros');
  const snapshot = await get(booksRef);

  if (snapshot.exists()) {
    const booksData = snapshot.val();

    const booksArray = Object.entries(booksData).map(([id, book]) => ({
      id,
      ...book,
    }));

    allBooks.value = booksArray;

    // Ordenar por fecha de creación (más recientes primero)
    latestBooks.value = [...booksArray]
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 8);

    // Ordenar por número de favoritos (más populares primero)
    mostLikedBooks.value = [...booksArray]
      .sort((a, b) => (b.favoritos || 0) - (a.favoritos || 0))
      .slice(0, 8);
  } else {
    console.log('No hay libros disponibles.');
  }
});
</script>
  