const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://rbac-backend-yg60.onrender.com/api'
  : 'http://localhost:5000/api';

export default API_URL; 