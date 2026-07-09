import axios from 'axios';

// Tomar la URL base de las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://turismo-web-glpa.onrender.com';
// Crear una instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones (si existe)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

console.log('API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

export default api;


