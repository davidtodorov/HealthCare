import Cookie from 'js-cookie'

const getToken = () => {
    return Cookie.get("auth-token");
    // return localStorage.getItem("auth-token")
}

const setToken = (value) => {
    return Cookie.set("auth-token", value);
    // return localStorage.setItem("auth-token", value)
}

export default {
    getToken,
    setToken
};