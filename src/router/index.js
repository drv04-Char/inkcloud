import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BookDetailView from '../views/BookDetailView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import CreateBookView from '../views/CreateBookView.vue'
import UserProfile from '../views/UserProfile.vue'
import ChapterReader from '../views/ChapterReader.vue'
import EditarBookView from '../views/EditarBookView.vue'

const routes = [
    { path: '/', component: HomeView, name: 'Home' },
    { path: '/libro/:title', component: BookDetailView, name: 'BookDetailView', props: true },
    { path: '/libros', name: 'all-books', component: () => import('../views/AllBookList.vue') },
    { path: '/login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/crear-libro', name: 'crear-libro', component: CreateBookView, meta: { requiresAdmin: true } },
    { path: '/editar-libro/:id', name: 'editar-libro', component: EditarBookView, meta: { requiresAdmin: true } },
    { path: '/perfil', name: 'perfil', component: UserProfile, meta: { requiresAuth: true } },
    { path: '/libro/:bookId/:chapterId', component: ChapterReader },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
