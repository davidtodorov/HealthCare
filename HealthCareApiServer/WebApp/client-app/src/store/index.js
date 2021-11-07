import Vue from "vue";
import Vuex, { createNamespacedHelpers } from "vuex";
import axios from '@/axios';
import userModule from "./user";
import hospitalModule from "./hospital";
import doctorModule from "./doctor";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    user: userModule,
    hospital: hospitalModule,
    doctor: doctorModule,
  },
  state: {
    departments: [],
  },
  getters: {
    departments(state) {
      return state.departments;
    },
  },
  actions: {
    getDepartments({ commit }) {
      return axios
        .get("department")
        .then((res) => {
          commit("setDepartments", res.data);
          return Promise.resolve();
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
  },
  mutations: {
    setDepartments(state, departments) {
      state.departments = departments;
    },
  },
});

export const userHelpers = createNamespacedHelpers("user");
export const hospitalHelpers = createNamespacedHelpers("hospital");
export const doctorHelpers = createNamespacedHelpers("doctor");
