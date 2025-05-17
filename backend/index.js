const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const factoriesRoutes = require('./routes/factories');
const partyRoutes = require('./routes/party');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/factories', factoriesRoutes);
app.use('/api/party', partyRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('Bill Management System Backend Running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
