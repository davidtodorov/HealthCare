<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app>
      <v-card class="mx-auto" max-width="500">
        <v-list>
            <MenuItems :isVisible=!isLoggedIn :items=noUserMenuItems></MenuItems>
            <MenuItems :isVisible=isLoggedIn :items=adminMenuItems></MenuItems>
        </v-list>
      </v-card>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-spacer></v-spacer>
      <template v-if="isLoggedIn">
        <v-toolbar-title>
          <div>Welcome, {{ userFullName }}</div>
        </v-toolbar-title>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import MenuItems from './components/MenuItems';

export default {
  name: "App",

  components: {
    MenuItems,
  },

  data: () => ({
    drawer: null,
    noUserMenuItems: [
      {
        icon: "mdi-inbox",
        text: "Login",
        to: "/login",
      },
      {
        icon: "mdi-star",
        text: "Register",
        to: "/register",
      },
    ],
    adminMenuItems: [
      {
        icon: "mdi-inbox",
        text: "Home",
        to: "/home",
      },
    ],
  }),
  computed: {
    isLoggedIn() {
      return !!this.$store.getters["user/currentUser"];
    },
    userFullName() {
      return (
        this.isLoggedIn &&
        `${this.$store.getters["user/currentUser"].firstName} ${this.$store.getters["user/currentUser"].lastName}`
      );
    },
  },
};
</script>
