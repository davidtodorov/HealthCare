const getToken = () => {
    return localStorage.getItem("token")
}

const setToken = (value) => {
    return localStorage.setItem("token", value)
}

export default {
    getToken,
    setToken
};