import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/authentication/Login'
import Register from '@/views/authentication/Register'
import Dashboard from '@/views/dashboard/Index'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/hospitals/create',
    name: 'CreateHospital',
    meta: {
      requiresAuth: true
    },
    component: () => import('@/views/hospital/CreateHospital')
  },
  {
    path: '/hospitals',
    name: 'Hospitals',
    meta: {
      requiresAuth: true
    },
    component: () => import('@/views/hospital/Index')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const user = store.getters['user/currentUser']
    if (user) {
      next()
    } else {
      store.dispatch('user/verifyUser').then(() => {
        next()
      }).catch(() => {
        next('/login')
      })
    }
  } else {
    next();
  }
})

export default router
