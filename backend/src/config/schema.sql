-- Parties table
CREATE TABLE IF NOT EXISTS parties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(100) NULL,
  address VARCHAR(500) NULL,
  gstin VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Factories table
CREATE TABLE IF NOT EXISTS factories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(100) NULL,
  address VARCHAR(500) NULL,
  gstin VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Party Transactions
CREATE TABLE IF NOT EXISTS party_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  party_id INT NULL,
  party_name VARCHAR(255) NULL,
  factory_name VARCHAR(255) NULL,
  date DATE NULL,
  vehicle_no VARCHAR(100) NULL,
  weight DECIMAL(12,3) NULL,
  rate DECIMAL(12,2) NULL,
  moisture DECIMAL(12,3) NULL,
  rejection DECIMAL(12,3) NULL,
  duplex DECIMAL(12,3) NULL,
  first DECIMAL(12,3) NULL,
  second DECIMAL(12,3) NULL,
  third DECIMAL(12,3) NULL,
  total_amount DECIMAL(14,2) NULL,
  remarks VARCHAR(1000) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_party_id (party_id),
  CONSTRAINT fk_party_transactions_party_id FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Factory Transactions
CREATE TABLE IF NOT EXISTS factory_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  factory_id INT NULL,
  factory_name VARCHAR(255) NULL,
  party_name VARCHAR(255) NULL,
  date DATE NULL,
  vehicle_no VARCHAR(100) NULL,
  weight DECIMAL(12,3) NULL,
  rate DECIMAL(12,2) NULL,
  total_amount DECIMAL(14,2) NULL,
  remarks VARCHAR(1000) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_factory_id (factory_id),
  CONSTRAINT fk_factory_transactions_factory_id FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Party Payments
CREATE TABLE IF NOT EXISTS party_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  party_id INT NOT NULL,
  party_name VARCHAR(255) NULL,
  date DATE NULL,
  amount_paid DECIMAL(14,2) NOT NULL,
  remarks VARCHAR(1000) NULL,
  total_amount DECIMAL(14,2) NULL,
  remaining_amount DECIMAL(14,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pp_party_id (party_id),
  CONSTRAINT fk_party_payments_party_id FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Factory Payments
CREATE TABLE IF NOT EXISTS factory_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  factory_id INT NOT NULL,
  factory_name VARCHAR(255) NULL,
  date DATE NULL,
  amount_received DECIMAL(14,2) NOT NULL,
  remarks VARCHAR(1000) NULL,
  total_amount DECIMAL(14,2) NULL,
  remaining_amount DECIMAL(14,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fp_factory_id (factory_id),
  CONSTRAINT fk_factory_payments_factory_id FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE CASCADE ON UPDATE CASCADE
);


