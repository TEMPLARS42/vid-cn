import axios from "axios";

axios.defaults.headers['Content-Type'] = 'application/json'

// adding token to the header.....................................
axios.interceptors.request.use((request) => {
    request.headers.Authorization = localStorage.getItem('echo');
    return request
}, (error) => {
    return console.log(error, "interceptot")
});

axios.interceptors.response.use((response) => {
    // Check if a new access token was provided in the response headers......
    const newEcho = response.headers['echo'];
    if (newEcho) {
        localStorage.setItem('echo', newEcho);
    }

    return response;
}, (error) => {
    if (error.response.status == 401 && error.response.data.status === 'TERMINATE') {
        localStorage.clear();
        window.location.href = '/'
    }

    return Promise.reject(error);
});

