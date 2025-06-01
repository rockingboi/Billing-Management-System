class FactoryTransaction {
    constructor({
      id,
      factory_id,
      date,
      vehicle_no,
      weight,
      rate,
      total_amount,
      remarks,
      factory_name,
      party_id,
      party_name,
    }) {
      this.id = id;
      this.factory_id = factory_id;
      this.date = date;
      this.vehicle_no = vehicle_no;
      this.weight = weight;
      this.rate = rate;
      this.total_amount=total_amount ?? amount;
      this.remarks=remarks;
      this.factory_name=factory_name;
      this.party_id = party_id;
      this.party_name = party_name; 
    }
  }
  
  module.exports = FactoryTransaction;
  