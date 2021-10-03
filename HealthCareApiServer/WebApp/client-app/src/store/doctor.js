import axios from '@/axios';

const getDefaultState = () => {
    return {
        doctors: [],
        currentDoctor: null
    }
}

const doctorModule = {
    namespaced: true,
    state: getDefaultState(),
    getters: {
        doctors(state) {
            return state.doctors;
        },
        currentProduct(state) {
            return state.currentDoctor;
        },
    },
    mutations: {
        setDoctors(state, doctors) {
            state.doctors = doctors;
        },
        setCurrentDoctor(state, doctor) {
            state.currentDoctor = doctor;
        },
        addDoctor(state, doctor) {
            state.doctors.push(doctor);
        },
        updateDoctor(state, doctor) {
            state.currentDoctor = doctor;
        },
        removeDoctor(state, id) {
            state.doctors = state.doctors.filter(p => p.id != id);
        },
        resetState(state) {
            const initial = getDefaultState();
            Object.keys(initial).forEach(key => { state[key] = initial[key] })
        }
    },
    actions: {
        getDoctors({ commit }) {
            return axios.get('doctor')
                .then((res) => {
                    commit('setDoctors', res.data);
                    return Promise.resolve();
                }).catch(err => {
                    return Promise.reject(err)
                })
        },
        getDoctor({ commit }, { id }) {
            return axios.get("/doctor/", {
                params: {
                    id
                }
            }).then(res => {
                commit('setCurrentDoctor', res.data);
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            });
        },
        createDoctor({ commit }, payload) {
            return axios.post("doctor", payload)
                .then(res => {
                    commit('addDoctor', res.data);
                    return Promise.resolve();
                })
                .catch(err => {
                    return Promise.reject(err)
                })
        },
        editDoctor({ commit }, payload) {
            return axios.put("doctor/:id", payload).then((res) => {
                commit('updateDoctor', res.data);
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            })
        },
        deleteDoctor({ commit }, id) {
            return axios.delete("doctor/:id", { id }).then(() => {
                commit('removeDoctor');
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            })
        }
    }
};



export default doctorModule;