import Vue from 'vue';
import Vuex, { createNamespacedHelpers } from 'vuex';
import userModule from './user';
import hospitalModule from './hospital';

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user: userModule,
    hospital: hospitalModule
  }
});

export const userHelpers = createNamespacedHelpers('user');
export const hospitalHelpers = createNamespacedHelpers('hospital');
