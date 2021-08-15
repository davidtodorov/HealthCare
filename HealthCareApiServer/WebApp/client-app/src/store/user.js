import axios from '@/axios';
import authService from '@/services/authService';


const getDefaultState = () => {
    return {
        currentUser: null,
    }
}

const user = {
    namespaced: true,
    state: getDefaultState(),
    getters: {
        currentUser(state) {
            return state.currentUser;
        },

    },
    mutations: {
        setCurrentUser(state, user) {
            state.currentUser = user;
        },
        resetState(state) {
            const initial = getDefaultState();
            Object.keys(initial).forEach(key => { state[key] = initial[key] })
        },
    },
    actions: {
        verifyUser({ commit }) {
            return axios.post("https://localhost:44336/identity/verify").then((res) => {
                console.log(res);
                commit('setCurrentUser', res.data);
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            })
        },
        register({ email, username, password }) {
            return axios.post('/identity/register', {
                email,
                username,
                password
            }).then(() => {
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            })
        },
        login({ commit }, { username, password }) {
            return axios.post("identity/login", {
                username,
                password
            }).then((res) => {
                console.log(res);
                authService.setToken(res.data.token);
                commit('setCurrentUser', res.data);
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            })
        },
        logout({ commit }) {
            return axios.post("user/logout")
                .then(() => {
                    commit('resetState');
                    commit('product/resetState', { root: true });
                    commit('branch/resetState', { root: true });
                    return Promise.resolve();
                }).catch(err => {
                    return Promise.reject(err);
                })
        },
    }
};



export default user;