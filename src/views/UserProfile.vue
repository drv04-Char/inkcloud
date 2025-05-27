<template>
  <div class="w-[90%] mx-auto mt-10 p-6 bg-white rounded shadow">
    <h1 class="text-2xl font-bold mb-6">Perfil de Usuario</h1>

    <!-- Info usuario -->
    <div class="mb-8 space-y-4">
      <div>
        <label class="font-semibold">Nombre:</label>
        <div v-if="!editandoNombre" class="inline-flex items-center space-x-2">
          <span>{{ userData?.nombre || 'Cargando...' }}</span>
          <button @click="editandoNombre = true" class="text-blue-600 hover:underline text-sm">Editar</button>
        </div>
        <div v-else class="flex items-center space-x-2">
          <input v-model="nuevoNombre" class="border rounded p-1" />
          <button @click="guardarNombre" class="text-green-600 hover:underline text-sm">Guardar</button>
          <button @click="cancelarEdicion" class="text-red-600 hover:underline text-sm">Cancelar</button>
        </div>
      </div>
      <p><strong>Email:</strong> {{ userData?.email || 'Cargando...' }}</p>
    </div>

    <!-- Libros favoritos -->
    <div>
      <h2 class="text-xl font-semibold mb-4">Libros favoritos</h2>
      <div v-if="loadingFavorites" class="text-gray-500">Cargando favoritos...</div>
      <div v-else-if="favoriteBooks.length === 0" class="text-gray-600">No tienes libros favoritos aún.</div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        <router-link
          v-for="book in favoriteBooks"
          :key="book.id"
          :to="`/libro/${book.titulo.toLowerCase().replace(/\s+/g, '-')}`"
          class="border rounded shadow hover:shadow-lg overflow-hidden flex flex-col"
        >
          <img
            :src="book.portada || 'https://via.placeholder.com/300x400?text=Sin+portada'"
            alt="Portada libro"
            class="w-full h-48 object-cover"
          />
          <div class="p-3 flex-1">
            <h3 class="text-lg font-semibold">{{ book.titulo }}</h3>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref as dbRef, get, update } from "firebase/database";
import { auth, db } from "../firebase";

export default {
  data() {
    return {
      user: null,
      userData: null,
      favoriteBooks: [],
      loadingFavorites: true,
      editandoNombre: false,
      nuevoNombre: "",
    };
  },
  methods: {
    cancelarEdicion() {
      this.editandoNombre = false;
      this.nuevoNombre = this.userData?.nombre || "";
    },
    async guardarNombre() {
      if (!this.nuevoNombre.trim()) return;
      await update(dbRef(db, `Usuarios/${this.user.uid}`), {
        nombre: this.nuevoNombre.trim(),
      });
      this.userData.nombre = this.nuevoNombre.trim();
      this.editandoNombre = false;
    },
  },
  async mounted() {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;

        // Info usuario
        const userSnap = await get(dbRef(db, `Usuarios/${user.uid}`));
        if (userSnap.exists()) {
          this.userData = userSnap.val();
          this.nuevoNombre = this.userData.nombre;
        }

        // Favoritos
        const favSnap = await get(dbRef(db, `Usuarios/${user.uid}/favoritos`));
        if (favSnap.exists()) {
          const favs = favSnap.val();
          const bookIds = Object.keys(favs);
          const booksPromises = bookIds.map(async (id) => {
            const bookSnap = await get(dbRef(db, `Libros/${id}`));
            if (bookSnap.exists()) {
              const bookData = bookSnap.val();
              bookData.id = id;
              return bookData;
            }
            return null;
          });
          this.favoriteBooks = (await Promise.all(booksPromises)).filter(b => b !== null);
        } else {
          this.favoriteBooks = [];
        }

        this.loadingFavorites = false;
      } else {
        this.$router.push("/login");
      }
    });
  },
};
</script>
