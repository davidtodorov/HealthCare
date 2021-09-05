<template>
  <div>
    <v-navigation-drawer v-model="drawer" app>
      <MenuItems :isVisible="!isLoggedIn" :items="noUserMenuItems"></MenuItems>
      <MenuItems :isVisible="isLoggedIn" :items="adminMenuItems"></MenuItems>

      <template v-if="isLoggedIn" v-slot:append>
        <div class="pa-2">
          <v-btn @click="onLogout" block> Logout </v-btn>
        </div>
      </template>
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
  </div>
</template>

<script>
import MenuItems from "@/components/MenuItems";

export default {
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
        to: "/",
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
  methods: {
    onLogout() {
      this.$store
        .dispatch("user/logout")
        .then(() => {
          this.$router.push({ name: "Login" });
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>

<style>
</style>