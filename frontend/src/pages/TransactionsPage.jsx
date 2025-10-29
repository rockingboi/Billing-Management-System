import React, { useState, useEffect } from "react";
import TransactionTable from "../components/TransactionTable";
import TransactionForm from "../components/TransactionForm";
import MoneyTransactionForm from "../components/MoneyTransactionForm";
import transactionService from "../services/transactionService";
import { FileText, Plus, RefreshCw, Filter, Search, Calendar, User, Factory, ChevronDown } from "lucide-react";

const TransactionsPage = ({ filters }) => {
  const [transactions, setTransactions] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForms, setShowForms] = useState({
    factoryTransaction: false,
    partyTransaction: false,
    partyPayment: false,
    factoryPayment: false,
  });
  const [selectedFormType, setSelectedFormType] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [parties, setParties] = useState([]);
  const [factories, setFactories] = useState([]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionService.getFilteredTransactions(filters);
      const data = response?.data || response;
      const clean = Array.isArray(data) ? data : data.transactions || [];
      setTransactions(clean);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters, refreshTrigger]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [partiesRes, factoriesRes] = await Promise.all([
          fetch('http://localhost:5001/api/parties').then(res => res.json()),
          fetch('http://localhost:5001/api/factories').then(res => res.json())
        ]);
        setParties(partiesRes || []);
        setFactories(factoriesRes || []);
      } catch (err) {
        console.error('Failed to fetch dropdowns', err);
      }
    };
    fetchDropdowns();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const selectFormType = (formType) => {
    // Hide all forms first
    setShowForms({
      factoryTransaction: false,
      partyTransaction: false,
      partyPayment: false,
      factoryPayment: false,
    });
    
    // Show selected form
    if (formType) {
      setShowForms(prev => ({
        ...prev,
        [formType]: true
      }));
      setSelectedFormType(formType);
    } else {
      setSelectedFormType("");
    }
    
    setShowDropdown(false);
  };

  const getFormTypeLabel = (formType) => {
    switch (formType) {
      case 'factoryTransaction':
        return 'Factory Transaction';
      case 'partyTransaction':
        return 'Party Transaction';
      case 'partyPayment':
        return 'Add Party Payment';
      case 'factoryPayment':
        return 'Add Factory Payment';
      default:
        return 'Select Action';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = !searchTerm || 
      tx.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.factory_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      new Date(tx.date).toDateString() === new Date(dateFilter).toDateString();
    
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    
    return matchesSearch && matchesDate && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Transactions Management</h1>
        <p className="text-gray-600">Manage scrap transactions and payments</p>
      </div>


      {/* Action Dropdown */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="relative dropdown-container">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors primary"
            >
              <Plus size={16} />
              {getFormTypeLabel(selectedFormType)}
              <ChevronDown size={16} />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
                    Create Transaction
                  </div>
                  <button
                    onClick={() => selectFormType('factoryTransaction')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Factory size={16} />
                    Factory Transaction
                  </button>
                  <button
                    onClick={() => selectFormType('partyTransaction')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User size={16} />
                    Party Transaction
                  </button>
                  
                  <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b border-gray-100 mt-1">
                    Add Payment
                  </div>
                  <button
                    onClick={() => selectFormType('partyPayment')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User size={16} />
                    Party Payment
                  </button>
                  <button
                    onClick={() => selectFormType('factoryPayment')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Factory size={16} />
                    Factory Payment
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {selectedFormType && (
            <button
              onClick={() => selectFormType('')}
              className="secondary text-sm"
            >
              Close Form
            </button>
          )}
        </div>
      </div>

      {/* Forms */}
      {showForms.factoryTransaction && (
        <div className="animate-fade-in">
          <TransactionForm transactionType="factory" onSave={() => handleRefresh()} />
        </div>
      )}

      {showForms.partyTransaction && (
        <div className="animate-fade-in">
          <TransactionForm transactionType="party" onSave={() => handleRefresh()} />
        </div>
      )}

      {showForms.partyPayment && (
        <div className="animate-fade-in">
          <MoneyTransactionForm 
            type="party" 
            onSave={() => handleRefresh()} 
          />
        </div>
      )}

      {showForms.factoryPayment && (
        <div className="animate-fade-in">
          <MoneyTransactionForm 
            type="factory" 
            onSave={() => handleRefresh()} 
          />
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters & Search</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
                placeholder="Search transactions..."
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full"
            >
              <option value="all">All Types</option>
              <option value="party_transaction">Party Transaction</option>
              <option value="factory_transaction">Factory Transaction</option>
              <option value="party_payment">Party Payment</option>
              <option value="factory_payment">Factory Payment</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setDateFilter("");
                setTypeFilter("all");
              }}
              className="secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchTransactions}
              disabled={loading}
              className="secondary text-sm"
            >
              <RefreshCw size={14} className={`mr-1 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </button>
            <span className="text-sm text-gray-500">
              {filteredTransactions.length} of {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <TransactionTable transactions={filteredTransactions} />
      </div>
    </div>
  );
};

export default TransactionsPage;
