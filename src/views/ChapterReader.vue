<template>
  <div class="w-[90%] mx-auto p-6">
    <!-- Barra superior -->
    <div class="flex flex-col md:flex-row items-center justify-between mb-4 gap-4 md:gap-2">
      <button
        @click="goToPreviousChapter"
        :disabled="currentIndex <= 0"
        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50 w-full md:w-auto"
      >
        ← Anterior
      </button>

      <div class="text-center md:text-left flex-1">
        <h1 class="text-xl md:text-2xl font-bold text-gray-800">{{ currentChapter?.title || 'Capítulo' }}</h1>
        <p class="text-sm text-gray-500">{{ bookTitle }}</p>
      </div>

      <button
        v-if="user"
        @click="downloadPDF"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full md:w-auto"
      >
        Descargar PDF
      </button>

      <button
        @click="goToNextChapter"
        :disabled="currentIndex >= chapters.length - 1"
        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50 w-full md:w-auto"
      >
        Siguiente →
      </button>
    </div>

    <!-- PDF -->
    <div v-if="pdfUrl" class="border rounded shadow overflow-hidden">
      <iframe
        ref="pdfIframe"
        :src="pdfUrl + '#toolbar=0&navpanes=0&zoom=100'"
        width="100%"
        :height="iframeHeight"
        class="w-full"
        frameborder="0"
      ></iframe>
    </div>

    <div v-else class="text-gray-500 text-center py-10">Cargando capítulo...</div>

    <!-- Menú inferior idéntico a la barra superior -->
    <div class="flex flex-col md:flex-row items-center justify-between mt-6 gap-4 md:gap-2">
      <button
        @click="goToPreviousChapter"
        :disabled="currentIndex <= 0"
        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50 w-full md:w-auto"
      >
        ← Anterior
      </button>

      <div class="text-center md:text-left flex-1">
        <h1 class="text-xl md:text-2xl font-bold text-gray-800">{{ currentChapter?.title || 'Capítulo' }}</h1>
        <p class="text-sm text-gray-500">{{ bookTitle }}</p>
      </div>

      <button
        @click="goToNextChapter"
        :disabled="currentIndex >= chapters.length - 1"
        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50 w-full md:w-auto"
      >
        Siguiente →
      </button>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase';
import { ref as dbRef, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default {
  data() {
    return {
      bookTitle: '',
      bookId: '', // ID real de Firebase
      chapters: [],
      currentChapter: null,
      currentIndex: 0,
      pdfUrl: '',
      windowWidth: window.innerWidth,
      user: null,
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);

    onAuthStateChanged(auth, (currentUser) => {
      this.user = currentUser;
    });

    const { bookId: bookSlug, chapterId } = this.$route.params;

    this.loadBookAndChapters(bookSlug)
      .then(() => this.updateChapterFromRoute(chapterId))
      .catch(err => console.error('❌ Error al cargar el libro o capítulo:', err));
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  computed: {
    iframeHeight() {
      // Si la ventana es menor que 768px (md), reduce la altura del iframe
      return this.windowWidth < 768 ? '500px' : '900px';
    }
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    async loadBookAndChapters(bookSlug) {
      const booksRef = dbRef(db, 'Libros');
      const snapshot = await get(booksRef);

      if (!snapshot.exists()) {
        console.warn('⚠️ No hay libros en la base de datos.');
        return;
      }

      const books = snapshot.val();

      const foundEntry = Object.entries(books).find(
        ([, libro]) => libro.titulo.toLowerCase().replace(/\s+/g, '-') === bookSlug
      );

      if (!foundEntry) {
        console.warn('⚠️ Libro no encontrado por slug.');
        return;
      }

      const [idLibro, book] = foundEntry;
      this.bookId = idLibro;
      this.bookTitle = book.titulo;

      const capitulos = book.capitulos || {};
      this.chapters = Object.entries(capitulos).map(([id, data]) => ({ id, ...data }));
    },
    updateChapterFromRoute(chapterId) {
      const index = this.chapters.findIndex(ch => ch.id === chapterId);
      if (index !== -1) {
        this.currentIndex = index;
        this.currentChapter = this.chapters[index];
        this.pdfUrl = this.currentChapter.url;
        this.scrollToIframe();
      } else {
        console.warn('Capítulo no encontrado en updateChapterFromRoute');
      }
    },
    scrollToIframe() {
      this.$nextTick(() => {
        const iframe = this.$refs.pdfIframe;
        if (iframe) {
          iframe.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    },
    goToPreviousChapter() {
      if (this.currentIndex > 0) {
        const prevChapter = this.chapters[this.currentIndex - 1];
        this.navigateToChapter(prevChapter.id);
      }
    },
    goToNextChapter() {
      if (this.currentIndex < this.chapters.length - 1) {
        const nextChapter = this.chapters[this.currentIndex + 1];
        this.navigateToChapter(nextChapter.id);
      }
    },
    navigateToChapter(chapterId) {
      const bookSlug = this.$route.params.bookId;
      this.$router.push(`/libro/${bookSlug}/${chapterId}`);
    },
    async downloadPDF() {
      if (!this.pdfUrl) return;

      try {
        const response = await fetch(this.pdfUrl);
        const blob = await response.blob();

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.currentChapter?.title || 'capitulo'}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(link.href);
      } catch (err) {
        console.error('Error al descargar el PDF:', err);
      }
    },
  },
  watch: {
    '$route.params.chapterId'(newChapterId) {
      this.updateChapterFromRoute(newChapterId);
    },
  },
};
</script>
