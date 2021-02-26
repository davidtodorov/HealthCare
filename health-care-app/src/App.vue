<template>
  <v-app>
    <v-main>
      <!-- <Login/> -->
      <Register/>
    </v-main>
  </v-app>
</template>

<script>
// import Login from './components/authentication/Login';
import Register from './components/authentication/Register';

export default {
  name: 'App',

  components: {
    // Login,
    Register
  },

  data: () => ({
    //
  }),
};
</script>
