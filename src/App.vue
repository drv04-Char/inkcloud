<template>
  <div id="app" class="flex flex-col min-h-screen w-full">
    <Header />
    <main class="flex-grow w-full">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<style scoped>
/* Puedes agregar estilos generales si quieres */
</style>
