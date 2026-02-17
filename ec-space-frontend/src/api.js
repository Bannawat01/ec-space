import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // URL ของ Go Backend ของคุณ
});

// ด่านตรวจอัตโนมัติ: ถ้ามี Token ในเครื่อง ให้แนบไปกับ Header ทุกครั้ง
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;