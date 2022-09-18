export const BASE_URL = 'http://localhost:3000/';
export const API_URL = 'http://localhost:5555/';

export const apiCall = async (method, path, data) => {
    const body = method !== 'GET' ? JSON.stringify(data) : null;

    const response = await fetch(API_URL + 'api' + path, {
        method,
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data?.token}`
        },
        body
    }).then(res => res.json()).catch(err => console.log(err));

    return response;
}