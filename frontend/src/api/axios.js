import axios from "axios"

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",  // our FastAPI backend URL
})

// this runs before every request
// it automatically adds the token to every request header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")  // get token from browser storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`  // attach token
  }
  return config
})

export default API