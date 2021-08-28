<template>
  <v-list-item-group>
    <template v-if="isVisible">
      <v-list-item v-for="(item, i) in items" :key="i" :to="item.to">
        <v-list-item-icon>
          <v-icon v-text="item.icon"></v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title v-text="item.text"></v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-list-item-group>
</template>

<script>
export default {
  props: {
    items: Array,
    isVisible: Boolean,
  },
};
</script>