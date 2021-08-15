import Vue from 'vue';
import Vuex, { createNamespacedHelpers } from 'vuex';
import userModule from './user';

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user: userModule
  },
  actions: {
    clearAll({ commit }) {
      commit('user/resetState');
    }
  }
});

export const userHelpers = createNamespacedHelpers('user');
