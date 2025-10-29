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
      moisture,
      rejection,
      duplex,
      first,
      second,
      third,
    }) {
      this.id = id;
      this.factory_id = factory_id;
      this.date = date;
      this.vehicle_no = vehicle_no;
      this.weight = weight;
      this.rate = rate;
      this.total_amount = total_amount;
      this.remarks = remarks;
      this.factory_name = factory_name;
      this.party_id = party_id;
      this.party_name = party_name;
      this.moisture = moisture || 0;
      this.rejection = rejection || 0;
      this.duplex = duplex || 0;
      this.first = first || 0;
      this.second = second || 0;
      this.third = third || 0;
    }
  }
  
  module.exports = FactoryTransaction;
  