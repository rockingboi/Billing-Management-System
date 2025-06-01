import React, { useState, useEffect } from "react";
import TransactionTable from "../components/TransactionTable";
import TransactionForm from "../components/TransactionForm";
import MoneyTransactionForm from "../components/MoneyTransactionForm";
import transactionService from "../services/transactionService";

const TransactionsPage = ({ filters }) => {
  const [transactions, setTransactions] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchTransactions = async () => {
    try {
      const response = await transactionService.getFilteredTransactions(filters);
      
      // Handle axios or plain fetch response
      const data = response?.data || response;

      // Ensure it's an array (backend should return [] or array of transactions)
      const clean = Array.isArray(data) ? data : data.transactions || [];
      setTransactions(clean);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters, refreshTrigger]);

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Transactions</h1>

      {/* Scrap Transaction Form */}
      <TransactionForm onSave={handleRefresh} />

      {/* Money Transactions */}
      <MoneyTransactionForm type="party" onSave={handleRefresh} />
      <MoneyTransactionForm type="factory" onSave={handleRefresh} />

      {/* Transaction List */}
      <TransactionTable transactions={transactions} />
    </div>
  );
};

export default TransactionsPage;
