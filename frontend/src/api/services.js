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
  markMyRequestsViewed: () => api.put('/services/my-requests/viewed'),
  getReceivedServices: (params) => api.get('/services/received', { params }),
  updateStatus: (id, data) => api.put(`/services/${id}/status`, data),
  suggestChange: (id, data) => api.post(`/services/${id}/suggest-change`, data),
  respondToNegotiation: (id, data) => api.put(`/services/${id}/negotiation`, data),
  openDispute: (id, data) => api.post(`/services/${id}/dispute`, data),
  getDisputes: (id) => api.get(`/services/${id}/disputes`),
  reviewService: (id, data) => api.post(`/services/${id}/review`, data)
};

// JOBS
export const jobAPI = {
  createJob: (data) => api.post('/jobs', data),
  getJobs: (params) => api.get('/jobs', { params }),
  getMyJobs: () => api.get('/jobs/my-jobs'),
  getJobById: (id) => api.get(`/jobs/${id}`),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  applyToJob: (id, data) => api.post(`/jobs/${id}/apply`, data),
  getMyApplications: () => api.get('/jobs/my-applications'),
  getJobApplications: (id) => api.get(`/jobs/${id}/applications`),
  updateApplicationStatus: (id, data) => api.put(`/jobs/applications/${id}`, data),
  proposeToProvider: (id, data) => api.post(`/jobs/${id}/propose`, data),
  getMyProposals: () => api.get('/jobs/my-proposals'),
  getSentProposals: () => api.get('/jobs/sent-proposals'),
  respondToProposal: (id, data) => api.put(`/jobs/proposals/${id}`, data)
};

// CHAT
export const chatAPI = {
  createOrGetConversation: (data) => api.post('/chat/conversation', data),
  getMyConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId, params) =>
    api.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) =>
    api.post(`/chat/conversations/${conversationId}/messages`, data)
};

// NOTIFICATIONS
export const notificationAPI = {
  getSummary: () => api.get('/notifications/summary')
};
