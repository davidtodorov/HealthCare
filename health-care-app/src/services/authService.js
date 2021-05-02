const getToken = () => {
    return localStorage.getItem("auth-token")
}

const setToken = (value) => {
    return localStorage.setItem("auth-token", value)
}

export default {
    getToken,
    setToken
};