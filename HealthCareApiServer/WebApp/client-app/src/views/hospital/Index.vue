<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="hospitals"
      item-key="name"
      sort-by="name"
      class="elevation-1"
      :search="search"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-text-field
            v-model="search"
            label="Search"
            class="mx-4"
          ></v-text-field>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-dialog v-model="dialog" max-width="450px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                New Hospital
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="editedItem.name"
                        label="Hospital Name"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <DeleteDialog
           :showDialog="dialogDelete"
           :onConfirm="deleteItemConfirm"
           :onClose="closeDelete"
           :item="editedItem"
          ></DeleteDialog>
          
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { hospitalHelpers } from "@/store";
import DeleteDialog from "@/components/base/DeleteDialog"

export default {
  components: {
    DeleteDialog
  },
  created() {
    this.initialize();
  },
  data: () => ({
    search: "",
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        text: "Name",
        align: "start",
        sortable: true,
        value: "name",
      },
      { text: "Actions", value: "actions", sortable: false, width: 135 },
    ],
    editedIndex: -1,
    editedItem: {
      name: "",
    },
    defaultItem: {
      name: "",
    },
  }),

  computed: {
    ...hospitalHelpers.mapGetters(["hospitals"]),
    formTitle() {
      return this.editedIndex === -1 ? "New Hospital" : "Edit Hospital";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  methods: {
    initialize() {
      this.$store.dispatch("hospital/getHospitals");
    },

    editItem(item) {
      this.editedIndex = this.hospitals.map(x => x.id).indexOf(item.id);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.hospitals.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      this.hospitals.splice(this.editedIndex, 1);
      await this.$store.dispatch("hospital/deleteHospital", this.editedItem.id);
      this.closeDelete();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async save() {
      if (this.editedIndex > -1) {
        Object.assign(this.hospitals[this.editedIndex], this.editedItem);
        await this.$store.dispatch("hospital/editHospital", this.editedItem);
      } else {
        await this.$store.dispatch("hospital/createHospital", this.editedItem);
      }
      this.close();
    },
  },
};
</script>

<style>
</style>