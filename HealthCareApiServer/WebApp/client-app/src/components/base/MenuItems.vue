<template>
<div v-if="isVisible">
  <v-list>
    <v-list-item link v-for="(item, i) in items" :key="i" :to="item.to">
      <v-list-item-icon>
        <v-icon v-text="item.icon"></v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title v-text="item.text"></v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</div>
  
</template>

<script>
export default {
  props: {
    items: Array,
    isVisible: Boolean,
  },
};
</script>