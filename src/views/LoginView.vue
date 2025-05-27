<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
    <h1 class="text-2xl font-semibold mb-4 text-center">Iniciar sesión</h1>
    <form @submit.prevent="login" class="space-y-4">
      <input v-model="email" type="email" placeholder="Correo electrónico" class="w-full p-2 border rounded" required />
      <input v-model="password" type="password" placeholder="Contraseña" class="w-full p-2 border rounded" required />

      <button type="submit" class="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
        Iniciar sesión
      </button>
    </form>

    <p v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</p>

    <p class="mt-4 text-center text-sm">
      ¿No tienes cuenta?
      <router-link to="/register" class="text-blue-600 hover:underline">Regístrate aquí</router-link>
    </p>
  </div>
</template>
  
<script>
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default {
  data() {
    return {
      email: '',
      password: '',
      error: '',
    };
  },
  methods: {
    async login() {
      this.error = '';
      const auth = getAuth();
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.$router.push('/');
      } catch (err) {
        this.error = 'Correo o contraseña incorrectos';
      }
    },
  },
};
</script>