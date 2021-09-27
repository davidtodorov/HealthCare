import axios from '@/axios';

const getDefaultState = () => {
    return {
        hospitals: [],
        currentHospital: null
    }
}

const hospital = {
    namespaced: true,
    state: getDefaultState(),
    getters: {
        hospitals(state) {
            return state.hospitals;
        },
        currentProduct(state) {
            return state.currentHospital;
        },
    },
    mutations: {
        setHospitals(state, hospitals) {
            state.hospitals = hospitals;
        },
        setCurrentHospital(state, hospital) {
            state.currentHospital = hospital;
        },
        addHospital(state, hospital) {
            state.hospitals.push(hospital);
        },
        updateHospital(state, hospital) {
            state.currentHospital = hospital;
            // const index = state.hospitals.map(x => x.id).indexOf(hospital.id);
            // state.hospitals[index] = hospital;
        },
        removeHospital(state, id) {
            state.hospitals = state.hospitals.filter(p => p.id != id);
        },
        resetState(state) {
            const initial = getDefaultState();
            Object.keys(initial).forEach(key => { state[key] = initial[key] })
        }
    },
    actions: {
        getHospitals({ commit }) {
            return axios.get('hospital')
                .then((res) => {
                    commit('setHospitals', res.data);
                    return Promise.resolve();
                }).catch(err => {
                    return Promise.reject(err)
                })
        },
        getHospital({ commit }, { id }) {
            return axios.get("/hospital/", {
                params: {
                    id
                }
            }).then(res => {
                commit('setCurrentHospital', res.data);
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            });
        },
        createHospital({ commit }, payload) {
            return axios.post("hospital", payload)
                .then(res => {
                    commit('addHospital', res.data);
                    return Promise.resolve();
                })
                .catch(err => {
                    return Promise.reject(err)
                })
        },
        editHospital({ commit }, payload) {
            return axios.put("hospital/:id", payload).then((res) => {
                commit('updateHospital', res.data);
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            })
        },
        deleteHospital({ commit }, id) {
            return axios.delete("hospital/:id", { id }).then(() => {
                commit('removeHospital');
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            })
        }
    }
};



export default hospital;