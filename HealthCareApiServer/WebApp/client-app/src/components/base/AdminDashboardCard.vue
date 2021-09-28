<template>
  <v-card class="mx-auto" max-width="400">
    <v-img
      class="white--text align-end"
      height="250px"
      :src="imageUrl"
    >
    </v-img>
    <v-card-title>{{title}}</v-card-title>
    <v-card-actions>
      <v-btn color="primary" elevation="1" :to="entityUrl">View All</v-btn>

      <v-spacer></v-spacer>
      <v-btn color="primary" elevation="2" :to="addNewUrl"
        >Add New</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    imageUrl: {
      type: String,
      required: true,
    },
    entityUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },

  },
  computed: {
      addNewUrl() {
          return this.entityUrl + '/create'
      }
  }
};
</script>

<style>
</style>