import axios from 'axios';



const api = axios.create();

export const getLeads = () => api.get('/api/leads');
export const createLead = (data) => api.post('/api/leads', data);
export const updateLead = (id, data) => api.put(`/api/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/api/leads/${id}`);
export const bulkDeleteLeads = (ids) => api.delete('/api/leads/bulk', { data: { ids } });
export const uploadCSV = (formData) => api.post('/api/leads/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;
