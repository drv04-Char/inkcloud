<template>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 p-4">
      <BookCard v-for="book in books" :key="book.id" :book="book" />
    </div>
  </template>
  
  <script setup>
  import BookCard from './BookCard.vue'
  
  defineProps({
    books: {
      type: Array,
      required: true
    }
  })
  </script>
  