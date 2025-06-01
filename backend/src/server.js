const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const partyRoutes = require('./routes/party.routes');
const factoryRoutes = require('./routes/factory.routes');
const paymentRoutes = require('./routes/payment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const transactionRoutes = require('./routes/transaction.routes');


require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/parties', partyRoutes);
app.use('/api/factories', factoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/transactions", transactionRoutes);


// Health check route
app.get('/', (req, res) => {
  res.send('System Billing API is running');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Internal Server Error', message: err.message });
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
