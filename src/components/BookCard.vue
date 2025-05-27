<template>
    <div class="bg-white rounded shadow p-4 hover:shadow-lg transition">
      <router-link :to="`/libro/${book.titulo.toLowerCase().replace(/\s+/g, '-')}`">
        <img :src="book.portada" alt="Portada" class="w-full h-48 object-cover rounded" />
        <h2 class="mt-2 text-lg font-semibold">{{ book.titulo }}</h2>
        <p class="text-gray-500 text-sm">{{ book.autor }}</p>
      </router-link>
    </div>
  </template>
  
  <script setup>
  defineProps({
    book: {
      type: Object,
      required: true
    }
  })
  </script>
  