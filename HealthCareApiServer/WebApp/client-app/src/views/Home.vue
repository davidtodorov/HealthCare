<template>
  <v-container>
    <v-row>
      <v-card class="mx-auto" max-width="400">
        <v-img
          class="white--text align-end"
          height="200px"
          src="/Hospitals.jpg"
        >
        </v-img>
        <v-card-title>Hospitals</v-card-title>
        <v-card-actions>
          <v-btn color="primary" elevation="1" to="/hospitals"
            >View All</v-btn
          >

          <v-spacer></v-spacer>
          <v-btn color="primary" elevation="2" to="/hospitals/create"
            >Create New</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Home",
  components: {},
};
</script>
