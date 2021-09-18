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
        updateHospital(state, hospital){
            state.currentHospital = hospital;
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
            debugger
            return axios.get('hospital')
                .then((res) => {
                    commit('setHospitals', res.data);
                    return Promise.resolve();
                }).catch(err => {
                    return Promise.reject(err)
                })
        },
        getProduct({ commit }, { id }) {
            return axios.get("/products/", {
                params: {
                    id
                }
            }).then(res => {
                commit('setCurrentProduct', res.data);
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            });
        },
    }
};



export default hospital;