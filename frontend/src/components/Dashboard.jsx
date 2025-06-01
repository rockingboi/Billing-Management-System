// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import TransactionTable from './TransactionTable';
// import { formatCurrency } from '../utils/formatter';
// //import FilterPanel from '../components/FilterPanel';

// const Dashboard = () => {
//   const [partyId, setPartyId] = useState('');
//   const [factoryId, setFactoryId] = useState('');
//   const [partyData, setPartyData] = useState(null);
//   const [factoryData, setFactoryData] = useState(null);
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   useEffect(() => {
//     const fetchPartyDashboard = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5001/api/dashboard/party/${partyId}`);
//         setPartyData(res.data);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     const fetchFactoryDashboard = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5001/api/dashboard/factory/${factoryId}`);
//         setFactoryData(res.data);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     if (partyId) fetchPartyDashboard();
//     if (factoryId) fetchFactoryDashboard();
//   }, [partyId, factoryId]);



//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Dashboard</h2>

//       <div className="mb-4">
//         <label className="block font-semibold">Select Party ID:</label>
//         <input
//           type="text"
//           value={partyId}
//           onChange={(e) => setPartyId(e.target.value)}
//           className="border p-2 w-full"
//         />
//       </div>

//       {partyData && (
//         <div className="bg-white p-4 shadow rounded mb-8">
//           <h3 className="text-lg font-semibold mb-2">Party Summary</h3>
//           <p>Total Weight: {partyData.totalWeight} kg</p>
//           <p>Total Amount: {formatCurrency(partyData.totalAmount)}</p>
//           <p>Total Paid: {formatCurrency(partyData.totalPaid)}</p>
//           <p>Remaining: {formatCurrency(partyData.remaining)}</p>
//           <h4 className="mt-4 font-semibold">Transactions</h4>
//           <TransactionTable transactions={partyData.transactions} />
//         </div>
//       )}

//       <div className="mb-4">
//         <label className="block font-semibold">Select Factory ID:</label>
//         <input
//           type="text"
//           value={factoryId}
//           onChange={(e) => setFactoryId(e.target.value)}
//           className="border p-2 w-full"
//         />
//       </div>

//       {factoryData && (
//         <div className="bg-white p-4 shadow rounded">
//           <h3 className="text-lg font-semibold mb-2">Factory Summary</h3>
//           <p>Total Weight: {factoryData.totalWeight} kg</p>
//           <p>Total Amount: {formatCurrency(factoryData.totalAmount)}</p>
//           <p>Total Received: {formatCurrency(factoryData.totalReceived)}</p>
//           <p>Remaining: {formatCurrency(factoryData.remaining)}</p>
//           <h4 className="mt-4 font-semibold">Transactions</h4>
//           <TransactionTable transactions={factoryData.transactions} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;
