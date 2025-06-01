import axios from "axios";

const API_URL = "http://localhost:5001/api/factories";

export const getAllFactories = () => axios.get(API_URL);

export const getFactoryById = (id) => axios.get(`${API_URL}/${id}`);

export const createFactory = (factoryData) => axios.post(API_URL, factoryData);

export const updateFactory = (id, factoryData) => axios.put(`${API_URL}/${id}`, factoryData);

export const deleteFactory = (id) => axios.delete(`${API_URL}/${id}`);

export const getFilteredFactories = (filter) => {
  const params = new URLSearchParams();
  if (filter?.name) params.append("name", filter.name);
  return axios.get(`${API_URL}/filter?${params.toString()}`);
};

export default {
  getAllFactories,
  getFactoryById,
  createFactory,
  updateFactory,
  deleteFactory,
  getFilteredFactories,
};
