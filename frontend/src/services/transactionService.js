import axios from "axios";

// Transaction endpoints
const TRANSACTION_API = "http://localhost:5001/api/transactions";
// Payment endpoints
const PAYMENT_API = "http://localhost:5001/api/payments";

// --- CRUD: Scrap Transactions ---

export const getAllTransactions = () => axios.get(TRANSACTION_API);

export const getTransactionById = (id) =>
  axios.get(`${TRANSACTION_API}/${id}`);

export const createTransaction = (data) =>
  axios.post(TRANSACTION_API, data);

export const updateTransaction = (id, data) =>
  axios.put(`${TRANSACTION_API}/${id}`, data);

export const deleteTransaction = (id) =>
  axios.delete(`${TRANSACTION_API}/${id}`);

// --- Filters ---
export const getFilteredTransactions = (filter) => {
  const params = new URLSearchParams();
  if (filter?.startDate) params.append("startDate", filter.startDate);
  if (filter?.endDate) params.append("endDate", filter.endDate);
  if (filter?.partyId) params.append("partyId", filter.partyId);
  if (filter?.factoryId) params.append("factoryId", filter.factoryId);

  return axios.get(`${TRANSACTION_API}/filter?${params.toString()}`);
};

// --- Money Payments ---

export const createPartyPayment = (data) =>
  axios.post(`${PAYMENT_API}/party_payments`, data);

export const createFactoryPayment = (data) =>
  axios.post(`${PAYMENT_API}/factory_payments`, data);

// --- Export as a service object ---

export default {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getFilteredTransactions,
  createPartyPayment,
  createFactoryPayment,
};
