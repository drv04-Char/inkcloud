<template>
  <div class="w-[60%] mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Editar Libro</h1>

    <form @submit.prevent="updateBook" class="space-y-4">
      <input v-model="title" type="text" placeholder="Título" class="w-full border p-2 rounded" required />
      <input v-model="author" type="text" placeholder="Autor" class="w-full border p-2 rounded" required />
      <textarea v-model="description" placeholder="Descripción" class="w-full border p-2 rounded" rows="4"></textarea>

      <div>
        <h2 class="font-semibold">Portada actual:</h2>
        <img :src="existingCover" alt="Portada actual" class="w-32 h-48 object-cover my-2" />
        <input type="file" accept="image/*" @change="handleCoverUpload" />
      </div>
      <div>
        <h2 class="font-semibold mb-1">Categorías</h2>
        <div class="flex flex-wrap gap-4">
          <label v-for="cat in categories" :key="cat" class="flex items-center gap-1">
            <input type="checkbox" :value="cat" v-model="selectedCategories" />
            {{ cat }}
          </label>
        </div>
      </div>
      <div class="space-y-2">
        <h2 class="font-semibold">Capítulos</h2>
        <div
          v-for="(chapter, index) in chapters"
          :key="index"
          class="flex gap-2 items-center"
        >
          <input
            v-model="chapter.title"
            type="text"
            placeholder="Nombre del capítulo"
            class="flex-1 border p-2 rounded"
          />
          <a
            v-if="chapter.url"
            :href="chapter.url"
            target="_blank"
            class="text-blue-600 text-sm"
          >
            Ver PDF
          </a>
          <input type="file" @change="handleFileUpload($event, index)" />
          <button
            v-if="chapters.length > 1"
            type="button"
            class="text-red-600 hover:underline"
            @click="removeChapter(index)"
          >
            Eliminar
          </button>
        </div>
        <button type="button" class="text-blue-600 hover:underline" @click="addChapter">
          + Añadir capítulo
        </button>
      </div>

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Guardar cambios
      </button>

      <button
        @click.prevent="deleteBook"
        class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-4"
      >
        Eliminar libro
      </button>
    </form>
  </div>
</template>
  
<script>
import { ref, get, update, remove } from 'firebase/database';
import { db } from '../firebase';
import { supabase } from '../supabase';
import { CATEGORIES } from '../constants/categories';

export default {
  data() {
    return {
      bookId: '',
      title: '',
      author: '',
      description: '',
      chapters: [],
      existingCover: '',
      coverFile: null,
      selectedCategories: [],
      categories: CATEGORIES,
    };
  },
  async mounted() {
    const slug = this.$route.params.id;  // el slug recibido
    const librosRef = ref(db, 'Libros');
    const snapshot = await get(librosRef);
    

    if (snapshot.exists()) {
      const libros = snapshot.val();
      const libroEntry = Object.entries(libros).find(([, libro]) => libro.titulo.toLowerCase().replace(/\s+/g, '-') === slug);

      if (libroEntry) {
      const [bookId, book] = libroEntry;
      this.bookId = bookId;  // guardar para usarlo luego
      this.title = book.titulo;
      this.author = book.autor;
      this.description = book.descripcion;
      this.existingCover = book.portada || '';
      this.chapters = book.capitulos || [];
      this.selectedCategories = book.categorias || [];
    } else {
      alert('Libro no encontrado');
      this.$router.push('/');
    }
    } else {
      alert('Libro no encontrado');
      this.$router.push('/');
    }
  },
  methods: {
    addChapter() {
      this.chapters.push({ title: '', file: null });
    },
    removeChapter(index) {
      this.chapters.splice(index, 1);
    },
    handleFileUpload(event, index) {
      this.chapters[index].file = event.target.files[0];
    },
    handleCoverUpload(event) {
      this.coverFile = event.target.files[0];
    },
    async updateBook() {
      const bookId = this.bookId;
      const bookFolderPath = `${this.title.replace(/\s+/g, '_').toLowerCase()}`;

      let coverUrl = this.existingCover;
      if (this.coverFile) {
        const coverFileName = `${this.title.replace(/\s+/g, '_').toLowerCase()}-cover-${Date.now()}.${this.coverFile.name.split('.').pop()}`;
        const coverPath = `portadas/${coverFileName}`;

        const { error: coverError } = await supabase.storage
          .from('libros')
          .upload(coverPath, this.coverFile, { upsert: true });

        if (coverError) {
          console.error('Error subiendo portada:', coverError.message);
        } else {
          const { data: coverData } = supabase.storage.from('libros').getPublicUrl(coverPath);
          coverUrl = coverData.publicUrl;
        }
      }

      const updatedChapters = [];
      for (const [index, chapter] of this.chapters.entries()) {
        let chapterUrl = chapter.url || '';
        if (chapter.file) {
          const filePath = `${bookFolderPath}/${chapter.title.replace(/\s+/g, '_').toLowerCase()}-${Date.now()}.pdf`;
          const { error: uploadError } = await supabase.storage
            .from('libros')
            .upload(filePath, chapter.file, { upsert: true });

          if (uploadError) {
            console.error('Error subiendo capítulo:', uploadError.message);
            continue;
          }

          const { data: urlData } = supabase.storage.from('libros').getPublicUrl(filePath);
          chapterUrl = urlData.publicUrl;
        }

        updatedChapters.push({
          title: chapter.title,
          url: chapterUrl,
        });
      }

      const updatedBook = {
        titulo: this.title,
        autor: this.author,
        descripcion: this.description,
        portada: coverUrl,
        capitulos: updatedChapters,
        updatedAt: Date.now(),
        categorias: this.selectedCategories,
      };

      await update(ref(db, `Libros/${bookId}`), updatedBook);
      alert('Libro actualizado correctamente');
      this.$router.push('/');
    },
    async deleteBook() {
      if (confirm('¿Estás seguro de que quieres eliminar este libro?')) {
        const db = getDatabase();
        await remove(ref(db, `Libros/${this.bookId}`));
        alert('Libro eliminado');
        this.$router.push('/');
      }
    },
  },
};
</script>