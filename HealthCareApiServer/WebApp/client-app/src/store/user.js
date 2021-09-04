import axios from '@/axios';

const getDefaultState = () => {
    return {
        currentUser: null,
        isLoggedIn: false,
    }
}

const user = {
    namespaced: true,
    state: getDefaultState(),
    getters: {
        currentUser(state) {
            return state.currentUser;
        },
        isLoggedIn(state) {
            return !!state.currentUser;
        }
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
            return axios.post("identity/verify").then((res) => {
                commit('setCurrentUser', res.data);
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            })
        },
        register({commit},{ email, username, password, firstName, lastName }) {
            return axios.post('identity/register', {
                email,
                username,
                password,
                firstName,
                lastName
            }).then((res) => {
                commit('setCurrentUser', res.data);
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
                commit('setCurrentUser', res.data);
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            })
        },
        logout({ commit }) {
            return axios.post("identity/logout")
                .then(() => {
                    commit('resetState');
                    return Promise.resolve();
                }).catch(err => {
                    return Promise.reject(err);
                })
        },
    }
};



export default user;