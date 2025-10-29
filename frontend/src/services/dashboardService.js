import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Fetch all parties
export const getParties = () => {
  return axios.get(`${API_URL}/parties`);
};

// Fetch all factories
export const getFactories = () => {
  return axios.get(`${API_URL}http://localhost:3001//factories`);
};

// Get dashboard data for a party by ID, with optional filters
export const getPartyDashboard = (partyId, filters = {}) => {
  const params = new URLSearchParams(filters);
  return axios.get(`${API_URL}/dashboard/party/${partyId}?${params.toString()}`);
};

// Get dashboard data for a factory by ID, with optional filters
export const getFactoryDashboard = (factoryId, filters = {}) => {
  const params = new URLSearchParams(filters);
  return axios.get(`${API_URL}/dashboard/factory/${factoryId}?${params.toString()}`);
};

// Get transactions filtered by various criteria
export const getFilteredTransactions = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return axios.get(`${API_URL}/dashboard/transactions/filter?${params.toString()}`);
};

// Download PDF report for party dashboard
export const downloadPartyReportPDF = (partyId, filters = {}) => {
  const params = new URLSearchParams(filters);
  return axios.get(`${API_URL}/dashboard/party/${partyId}/report/pdf?${params.toString()}`, {
    responseType: 'blob',
  });
};

// Download Excel report for party dashboard
export const downloadPartyReportExcel = (partyId, filters = {}) => {
  const params = new URLSearchParams(filters);
  return axios.get(`${API_URL}/dashboard/party/${partyId}/report/excel?${params.toString()}`, {
    responseType: 'blob',
  });
};

// Download PDF report for factory dashboard
export const downloadFactoryReportPDF = (factoryId, filters = {}) => {
  const params = new URLSearchParams(filters);
  return axios.get(`${API_URL}/dashboard/factory/${factoryId}/report/pdf?${params.toString()}`, {
    responseType: 'blob',
  });
};

// Download Excel report for factory dashboard
export const downloadFactoryReportExcel = (factoryId, filters = {}) => {
  const params = new URLSearchParams(filters);
  return axios.get(`${API_URL}/dashboard/factory/${factoryId}/report/excel?${params.toString()}`, {
    responseType: 'blob',
  });
};
