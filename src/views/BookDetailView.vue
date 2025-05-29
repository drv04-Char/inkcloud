<template>
  <div class="w-[95%] mx-auto px-6 py-10">
    <div v-if="book" class="grid grid-cols-1 md:grid-cols-4 gap-10">
      <!-- Portada del libro -->
      <div class="md:col-span-1">
        <img
          :src="book.portada"
          alt="Portada del libro"
          class="w-full object-cover rounded-xl shadow-lg max-h-[600px]"
        />
        <!-- Botones debajo de la portada -->
        <div class="space-y-3 mt-4">
          <div v-if="user">
            <button
              @click="toggleFavorite"
              class="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              {{ isFavorite ? 'Quitar de favoritos' : 'Marcar favorito' }}
            </button>
          </div>

          <div v-if="isAdmin">
            <router-link
              :to="`/editar-libro/${book.titulo.toLowerCase().replace(/\s+/g, '-')}`"
              class="w-full inline-block text-center bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow"
            >
              Editar libro
            </router-link>
          </div>
        </div>
      </div>
      

      <!-- Detalles del libro -->
      <div class="md:col-span-3 space-y-6">
        <h1 class="text-4xl font-extrabold text-gray-900">{{ book.titulo }}</h1> <!-- Cambiar a español -->
        <p class="text-lg text-gray-700"><strong>Autor:</strong> {{ book.autor }}</p> <!-- Cambiar a español -->
        <p class="text-gray-600 leading-relaxed">{{ book.descripcion }}</p> <!-- Cambiar a español -->

        <!-- Lista de capítulos -->
        <div class="mt-10">
          <h2 class="text-2xl font-bold mb-4">Capítulos</h2>
          <ul class="divide-y divide-gray-200">
            <li
              v-for="(chapter, index) in chapters"
              :key="index"
              class="py-3 hover:bg-gray-100 transition rounded"
            >
              <router-link
                :to="`/libro/${book.titulo.toLowerCase().replace(/\s+/g, '-')}/${index}`"
                class="text-blue-600 hover:underline"
              >
                {{ chapter.title }} <!-- Cambiar a español -->
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Comentarios -->
        <div class="mt-12">
          <h2 class="text-2xl font-bold mb-4">Comentarios</h2>
          <form @submit.prevent="addComment" class="space-y-4 mb-6">
            <textarea
              v-model="newComment"
              placeholder="Escribe tu comentario..."
              class="w-full border rounded p-3"
              rows="3"
            />
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Publicar
            </button>
          </form>

          <div v-if="enrichedComments.length === 0" class="text-gray-500">Aún no hay comentarios.</div>
          <ul class="space-y-3">
            <li
              v-for="comment in enrichedComments"
              :key="comment.id"
              @click="handleCommentClick(comment)"
              class="bg-gray-50 p-3 rounded border cursor-pointer hover:bg-red-50 transition"
            >
              <p class="text-gray-800">{{ comment.text }}</p>
              <p class="text-sm text-gray-500">
                por {{ comment.user }} · {{ formatDate(comment.timestamp) }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-10 text-gray-500">Cargando libro...</div>
  </div>
</template>
  
<script>
import { db } from '../firebase';
import { ref as dbRef, get, onValue, update, set, remove } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { capitalize } from 'vue';

export default {
  props: ['title'],
  data() {
    return {
      book: null,
      bookKey: null,
      newComment: '',
      comments: [],
      enrichedComments: [],
      user: null,
      isAdmin: false,
      isFavorite: false,
    };
  },
  computed: {
    chapters() {
      return this.book?.capitulos || [];
    }
  },
  async mounted() {
    try {
      const booksRef = dbRef(db, 'Libros');
      const snapshot = await get(booksRef);

      if (snapshot.exists()) {
        const booksData = snapshot.val();
        const bookEntry = Object.entries(booksData).find(
          ([id, b]) => b.titulo.toLowerCase().replace(/\s+/g, '-') === this.title
        );

        if (bookEntry) {
          const [key, book] = bookEntry;
          book.id = key;
          this.book = book;
          this.bookKey = key;
          this.comments = book.comentarios || [];

          await this.loadUsernames();

          const auth = getAuth();
          onAuthStateChanged(auth, async (user) => {
            if (user) {
              this.user = user;

              const userRef = dbRef(db, `Usuarios/${user.uid}`);
              const userSnap = await get(userRef);
              if (userSnap.exists()) {
                const userData = userSnap.val();
                this.isAdmin = userData.tipoUsuario === 'admin';
              }

              const favRef = dbRef(db, `Usuarios/${user.uid}/favoritos/${this.book.id}`);
              onValue(favRef, (snap) => {
                this.isFavorite = snap.exists();
              });
            }
          });
        } else {
          console.warn('No se encontró el libro');
        }
      }
    } catch (err) {
      console.error('Error al cargar el libro:', err);
    }
  },
  methods: {
    async loadUsernames() {
      const promises = this.comments.map(async (comment) => {
        if (!comment.uid) {
          return { ...comment, user: 'Anónimo' };
        }

        try {
          const snap = await get(dbRef(db, `Usuarios/${comment.uid}`));
          const userData = snap.exists() ? snap.val() : {};
          return {
            ...comment,
            user: capitalize(userData.nombre || 'Usuario'),
          };
        } catch {
          return { ...comment, user: 'Usuario' };
        }
      });

      this.enrichedComments = await Promise.all(promises);
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    async toggleFavorite() {
      if (!this.user || !this.book?.id) return;

      const favRef = dbRef(db, `Usuarios/${this.user.uid}/favoritos/${this.book.id}`);
      const bookRef = dbRef(db, `Libros/${this.book.id}`);

      try {
        const bookSnap = await get(bookRef);
        const currentFavoritos = bookSnap.val()?.favoritos || 0;

        if (this.isFavorite) {
          await remove(favRef);
          const nuevosFavoritos = Math.max(0, currentFavoritos - 1);
          await update(bookRef, { favoritos: nuevosFavoritos });
          this.isFavorite = false;
        } else {
          await set(favRef, {
            titulo: this.book.titulo,
            portada: this.book.portada || '',
            marcadoEn: Date.now(),
          });
          const nuevosFavoritos = currentFavoritos + 1;
          await update(bookRef, { favoritos: nuevosFavoritos });
          this.isFavorite = true;
        }

        this.book.favoritos = this.isFavorite
          ? currentFavoritos + 1
          : Math.max(0, currentFavoritos - 1);
      } catch (err) {
        console.error('Error al actualizar favoritos:', err);
      }
    },

    async addComment() {
      const text = this.newComment.trim();
      if (!text || !this.bookKey) return;

      const auth = getAuth();
      const currentUser = auth.currentUser;

      const newComment = {
        id: Date.now().toString(),
        text,
        uid: currentUser?.uid || null,
        timestamp: Date.now(),
      };

      const updatedComments = [...this.comments, newComment];

      try {
        await update(dbRef(db, `Libros/${this.bookKey}`), {
          comentarios: updatedComments,
        });

        this.comments = updatedComments;
        this.newComment = '';
        await this.loadUsernames(); // vuelve a enriquecer los comentarios
      } catch (err) {
        console.error('Error al guardar el comentario:', err);
        alert('No se pudo guardar el comentario.');
      }
    },

    async deleteComment(commentId) {
      const updatedComments = this.comments.filter((c) => c.id !== commentId);

      try {
        await update(dbRef(db, `Libros/${this.bookKey}`), {
          comentarios: updatedComments,
        });
        this.comments = updatedComments;
        await this.loadUsernames();
      } catch (err) {
        console.error('Error al eliminar el comentario:', err);
        alert('No se pudo eliminar el comentario.');
      }
    },

    handleCommentClick(comment) {
      const isOwner = this.user && comment.uid === this.user.uid;

      if (this.isAdmin || isOwner) {
        const confirmed = confirm('¿Quieres eliminar este comentario?');
        if (confirmed) {
          this.deleteComment(comment.id);
        }
      }
    },
  },
};
</script>
