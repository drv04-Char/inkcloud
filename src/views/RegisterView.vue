<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
    <h1 class="text-2xl font-semibold mb-4 text-center">Registrarse</h1>
    <form @submit.prevent="register" class="space-y-4">
      <input v-model="name" type="text" placeholder="Nombre" class="w-full p-2 border rounded" required />
      <input v-model="email" type="email" placeholder="Correo electrónico" class="w-full p-2 border rounded" required />
      <input v-model="password" type="password" placeholder="Contraseña" class="w-full p-2 border rounded" required />
      <!--<input @change="handleImage" type="file" accept="image/*" class="w-full" />-->

      <button type="submit" class="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
        Crear cuenta
      </button>
    </form>

    <p v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</p>
  </div>
</template>
  
  <script>
  import { auth, db } from "../firebase";
  import { createUserWithEmailAndPassword } from "firebase/auth";
  import { ref as dbRef, set } from "firebase/database";
  
  export default {
    data() {
      return {
        email: '',
        password: '',
        name: '',
        error: null,
      };
    },
    methods: {
    async register() {
      this.error = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        // Guardar nombre en Realtime Database
        await set(dbRef(db, 'Usuarios/' + user.uid), {
          nombre: this.name,
          email: this.email,
          tipoUsuario: 'user',
        });

        // Redirigir o mostrar éxito
        this.$router.push('/');
      } catch (err) {
        console.error("Error al registrar:", err);
        this.error = err.message;
      }
    }
  }
};
  </script>
  