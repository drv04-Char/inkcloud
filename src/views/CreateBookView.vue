<template>
    <div class="w-[60%] mx-auto p-6">
      <h1 class="text-2xl font-bold mb-6">Crear nuevo libro</h1>
  
      <form @submit.prevent="createBook" class="space-y-4">
        <input v-model="title" type="text" placeholder="Título" class="w-full border p-2 rounded" required />
        <input v-model="author" type="text" placeholder="Autor" class="w-full border p-2 rounded" required />
        <textarea v-model="description" placeholder="Descripción" class="w-full border p-2 rounded" rows="4"></textarea>
        <div>
          <h2 class="block font-semibold mb-1">Portada del libro</h2>
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
          <div v-for="(chapter, index) in chapters" :key="index" class="flex gap-2 items-center">
            <input v-model="chapter.title" type="text" placeholder="Nombre del capítulo" class="flex-1 border p-2 rounded" />
            <input type="file" @change="handleFileUpload($event, index)" />
            <button 
              v-if="index > 0" 
              type="button" 
              class="text-red-600 hover:u nderline" 
              @click="removeChapter(index)">
              Eliminar
            </button>
          </div>
          <button type="button" class="text-blue-600 hover:underline" @click="addChapter">+ Añadir capítulo</button>
        </div>
  
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar libro</button>
      </form>
    </div>
  </template>
  
  <script>
  import { db } from '../firebase';
  import { ref as dbRef, push, set } from 'firebase/database';
  import { supabase } from '../supabase';
  import { CATEGORIES } from '../constants/categories';
  
  export default {
    data() {
      return {
        title: '',
        author: '',
        description: '',
        chapters: [{ title: '', file: null }],
        coverFile: null,
        selectedCategories: [],
        categories: CATEGORIES,
      };
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
      async createBook() {
        if (!this.title.trim()) {
          alert('El título es obligatorio.');
          return;
        }
  
        const bookFolderPath = `${this.title.replace(/\s+/g, '_').toLowerCase()}`;
        const uploadedChapters = [];
  
        let coverUrl = '';
        if (this.coverFile) {
          const coverFileName = `${this.title.replace(/\s+/g, '_').toLowerCase()}-cover-${Date.now()}.${this.coverFile.name.split('.').pop()}`;
          const coverPath = `portadas/${coverFileName}`;

          const { error: coverError } = await supabase
            .storage
            .from('libros')
            .upload(coverPath, this.coverFile, { upsert: true });

          if (coverError) {
            console.error('Error subiendo portada:', coverError.message);
          } else {
            const { data: coverData } = supabase.storage.from('libros').getPublicUrl(coverPath);
            coverUrl = coverData.publicUrl;
          }
        }

        for (const [index, chapter] of this.chapters.entries()) {
          if (!chapter.file) continue;
  
          const sanitizedTitle = chapter.title
          .normalize('NFD') // separa letras de sus acentos
          .replace(/[\u0300-\u036f]/g, '') // elimina los acentos
          .replace(/[^\w\s-]/g, '') // elimina símbolos especiales
          .replace(/\s+/g, '_') // reemplaza espacios por guiones bajos
          .toLowerCase();
      
          const filePath = `${bookFolderPath}/${sanitizedTitle}-${Date.now()}.pdf`;
          const { error: uploadError } = await supabase
            .storage
            .from('libros')
            .upload(filePath, chapter.file, { upsert: true });
  
          if (uploadError) {
            console.error('Error subiendo capítulo:', uploadError.message);
            alert(`Error subiendo el capítulo "${chapter.title}": ${uploadError.message}`);
            continue;
          }
  
          const { data: urlData } = supabase.storage.from('libros').getPublicUrl(filePath);
  
          uploadedChapters.push({
            title: chapter.title || `Capítulo ${index + 1}`,
            url: urlData.publicUrl,
          });
        }
  
        const bookData = {
          titulo: this.title,
          autor: this.author,
          descripcion: this.description,
          portada: coverUrl,
          favoritos: 0,
          capitulos: uploadedChapters,
          comentarios: [],
          createdAt: Date.now(),
          keywords: this.title.toLowerCase(),
          categorias: this.selectedCategories,
        };
  
        const newBookRef = push(dbRef(db, 'Libros'));
        await set(newBookRef, bookData);
  
        alert('Libro creado con éxito');
        this.$router.push('/');
      },
    },
  };
  </script>
