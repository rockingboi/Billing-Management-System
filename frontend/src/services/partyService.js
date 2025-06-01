import axios from "axios";

const API_URL = "http://localhost:5001/api/parties";

// Existing CRUD APIs
export const getAllParties = () => axios.get(API_URL);

export const getPartyById = (id) => axios.get(`${API_URL}/${id}`);

export const createParty = (partyData) => axios.post(API_URL, partyData);

export const updateParty = (id, partyData) => axios.put(`${API_URL}/${id}`, partyData);

export const deleteParty = (id) => axios.delete(`${API_URL}/${id}`);
export const getPartySummary = (id) => axios.get(`${API_URL}/${id}/summary`);
export const getPartySummaryByName = (name) => axios.get(`${API_URL}/summary/${name}`);

// New filter API - expects filter object with optional fields, e.g. { name: 'John' }
export const getFilteredParties = (filter) => {
  const params = new URLSearchParams();

  if (filter?.name) params.append("name", filter.name);

  return axios.get(`${API_URL}/filter?${params.toString()}`);
};

export default {
  getAllParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty,
  getFilteredParties,
};
