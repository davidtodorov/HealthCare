<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="doctors"
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
                New Doctor
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
                        v-model="editedItem.firstName"
                        label="First Name"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="editedItem.lastName"
                        label="Last Name"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-select
                        :items="hospitals"
                        item-value="id"
                        item-text="name"
                        label="Hospital"
                        v-model="editedItem.hospitalId"
                      >
                      </v-select>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-select
                        :items="departments"
                        item-value="id"
                        item-text="name"
                        label="Department"
                        v-model="editedItem.departmentId"
                      >
                      </v-select>
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
import { mapGetters } from "vuex";
import { doctorHelpers, hospitalHelpers } from "@/store";
import DeleteDialog from "@/components/base/DeleteDialog";

export default {
  components: {
    DeleteDialog,
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
        text: "First Name",
        align: "start",
        sortable: true,
        value: "firstName",
      },
      {
        text: "Last Name",
        align: "start",
        sortable: true,
        value: "lastName",
      },
      {
        text: "Hospital",
        align: "start",
        sortable: true,
        value: "hospitalName",
      },
      {
        text: "Department",
        align: "start",
        sortable: true,
        value: "departmentName",
      },
      { text: "Actions", value: "actions", sortable: false, width: 135 },
    ],
    editedIndex: -1,
    editedItem: {
      firstName: "",
      lastName: "",
      hospitalId: null,
      departmentId: null,
      
    },
    defaultItem: {
      firstName: "",
      lastName: "",
      hospitalId: null,
      departmentId: null,
    },
  }),

  computed: {
    ...doctorHelpers.mapGetters(["doctors"]),
    ...hospitalHelpers.mapGetters(["hospitals"]),
    ...mapGetters(["departments"]),
    formTitle() {
      return this.editedIndex === -1 ? "New Doctor" : "Edit Doctor";
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
      this.$store.dispatch("doctor/getDoctors");
      this.$store.dispatch("hospital/getHospitals");
      this.$store.dispatch("getDepartments");
      debugger;
    },

    editItem(item) {
      this.editedIndex = this.doctors.map((x) => x.id).indexOf(item.id);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.doctors.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      this.doctors.splice(this.editedIndex, 1);
      await this.$store.dispatch("doctor/doctorHospital", this.editedItem.id);
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
        Object.assign(this.doctors[this.editedIndex], this.editedItem);
        await this.$store.dispatch("doctor/editDoctor", this.editedItem);
      } else {
        await this.$store.dispatch("doctor/createDoctor", this.editedItem);
      }
      this.close();
    },
  },
};
</script>

<style>
</style>