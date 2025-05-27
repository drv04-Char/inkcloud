<template>
  <section class="overflow-hidden py-8">
    <div
      ref="carousel"
      class="flex gap-6 overflow-x-hidden px-4 cursor-grab"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
    >
    <div
        v-for="(book, index) in infiniteBooks"
        :key="`${book.id}-${index}`"
        class="flex-none w-1/3 mx-2 transition-transform hover:scale-105 transform"
      >
        <router-link :to="`/libro/${book.id}`">
          <img
            :src="book.image"
            alt="Book cover"
            class="w-full h-64 object-cover rounded-lg shadow select-none pointer-events-none"
            @mousedown.prevent
          />
        </router-link>
      </div>
    </div>
  </section>
</template>
  
<script>
export default {
  data() {
    return {
      isDragging: false,
      startX: 0,
      scrollLeft: 0,
      books: [
        { id: '1', image: new URL('../assets/covers/portada-nombre-del-viento.jpg', import.meta.url).href },
        { id: '2', image: new URL('../assets/covers/portada-nombre-del-viento.jpg', import.meta.url).href },
        { id: '3', image: new URL('../assets/covers/portada-nombre-del-viento.jpg', import.meta.url).href },
        { id: '4', image: new URL('../assets/covers/portada-nombre-del-viento.jpg', import.meta.url).href },
        { id: '5', image: new URL('../assets/covers/portada-nombre-del-viento.jpg', import.meta.url).href },
      ],
    };
  },
  computed: {
    infiniteBooks() {
      // Duplicamos los libros para simular scroll infinito
      return [...this.books, ...this.books];
    },
  },
  mounted() {
    this.$nextTick(() => {
      const el = this.$refs.carousel;
      // Posiciona al centro (al principio de la segunda tanda)
      el.scrollLeft = el.scrollWidth / 2;
      this.startAutoScroll();
    });
  },
  beforeUnmount() {
    clearInterval(this.scrollInterval);
  },
  methods: {
    startDrag(e) {
      this.isDragging = true;
      this.startX = e.pageX - this.$refs.carousel.offsetLeft;
      this.scrollLeft = this.$refs.carousel.scrollLeft;
    },
    onDrag(e) {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.pageX - this.$refs.carousel.offsetLeft;
      const walk = (x - this.startX) * 1.5; // Ajustar velocidad de desplazamiento
      this.$refs.carousel.scrollLeft = this.scrollLeft - walk;
    },
    endDrag() {
      this.isDragging = false;
    },
    startAutoScroll() {
      const container = this.$refs.carousel;
      const scrollAmount = container.offsetWidth / 3;

      this.scrollInterval = setInterval(() => {
        if (container.scrollLeft + scrollAmount >= container.scrollWidth - container.offsetWidth) {
          // Vuelve al inicio sin animación
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += scrollAmount;
        }
      }, 5000);
    },
  },
};
</script>

<style scoped>
/* Asegúrate de que el carrusel se vea correctamente */
img {
  user-select: none;
}
</style>