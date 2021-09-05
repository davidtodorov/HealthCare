<template>
  <v-app>
    <Navigation></Navigation>>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import Navigation from "@/components/layout/Navigation";

export default {
  name: "App",

  components: {
    Navigation,
  },
};
</script>
