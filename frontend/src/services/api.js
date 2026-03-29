import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

export const getLeads = () => api.get('/leads');
export const createLead = (data) => api.post('/leads', data);
export const updateLead = (id, data) => api.put(`/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/leads/${id}`);
export const uploadCSV = (formData) => api.post('/leads/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data ' }
});

export default api;
