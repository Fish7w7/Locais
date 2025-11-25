import api from './axios';

// AUTH
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updatePassword: (passwords) => api.put('/auth/updatepassword', passwords)
};

// USERS
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  upgradeToProvider: (data) => api.post('/users/upgrade-to-provider', data),
  updateProviderInfo: (data) => api.put('/users/provider-info', data),
  getProviders: (params) => api.get('/users/providers', { params }),
  getUserById: (id) => api.get(`/users/${id}`)
};

// SERVICES
export const serviceAPI = {
  createRequest: (data) => api.post('/services', data),
  getMyRequests: (params) => api.get('/services/my-requests', { params }),
  getReceivedServices: (params) => api.get('/services/received', { params }),
  updateStatus: (id, data) => api.put(`/services/${id}/status`, data),
  reviewService: (id, data) => api.post(`/services/${id}/review`, data)
};

// JOBS
export const jobAPI = {
  createJob: (data) => api.post('/jobs', data),
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  applyToJob: (id, data) => api.post(`/jobs/${id}/apply`, data),
  getMyApplications: () => api.get('/jobs/my-applications'),
  getJobApplications: (id) => api.get(`/jobs/${id}/applications`),
  updateApplicationStatus: (id, data) => api.put(`/jobs/applications/${id}`, data),
  proposeToProvider: (id, data) => api.post(`/jobs/${id}/propose`, data),
  getMyProposals: () => api.get('/jobs/my-proposals'),
  respondToProposal: (id, data) => api.put(`/jobs/proposals/${id}`, data)
};