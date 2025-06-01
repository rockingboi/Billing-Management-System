class FactoryPayment {
    constructor({ id, factory_id, date, amount_received, remarks }) {
      this.id = id;
      this.factory_id = factory_id;
      this.date = date;
      this.amount = amount_received;
      this.remarks = remarks;
      this.factory_name = "";
    }
  }
  
  module.exports = FactoryPayment;
  