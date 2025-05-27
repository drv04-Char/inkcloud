<template>
    <div>
      <!--<HeroSection />-->
      <section class="p-4">
        <h2 class="text-2xl font-bold mb-4">Nuevos lanzamientos</h2>
        <BookList :books="books" />
      </section>
    </div>
  </template>
  
<script setup>
  import { ref, onMounted } from 'vue';
  import HeroSection from '../components/HeroSection.vue';
  import BookList from '../components/BookList.vue';
  import { db } from '../firebase'; // Asegúrate de que esta importación sea correcta
  import { ref as dbRef, get } from 'firebase/database';

  const books = ref([]);

  // Obtener los libros desde Firebase Realtime Database
  onMounted(async () => {
    const booksRef = dbRef(db, 'Libros');  // Ruta a la colección de libros en la base de datos
    const snapshot = await get(booksRef);
    
    if (snapshot.exists()) {
      const booksData = snapshot.val();
      // Transformar los datos para agregarlos a la lista
      books.value = Object.keys(booksData).map((key) => ({
        id: key,
        ...booksData[key]
      }));
    } else {
      console.log("No hay libros disponibles.");
    }
  });
</script>
  