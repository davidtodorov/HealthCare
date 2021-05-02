import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/authentication/Login'
import Register from '@/views/authentication/Register'

// import store from '@/store'
// import authService from '@/services/authService';

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
    path: '/home',
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
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
      // if (!store.state.user.currentUser) {
      //     var authToken = authService.get('auth-token');
      //     if (authToken) {
      //         store.dispatch("user/getCurrentUser")
      //             .then(() => {
      //                 return next()
      //             })
      //             .catch(() => {
      //                 next('/login')
      //             });
      //     } else {
      //         next("/login")
      //     }
      // } else {
      //     next();
      // }
  } else {
      next();
  }
})

export default router
