class PartyTransaction {
    constructor({
      id,
      party_id,
      date,
      vehicle_no,
      weight,
      rate,
      moisture,
      rejection,
      duplex,
      first,
      second,
      third,
      amount,
      total_amount,
      factory_id,
      factory_name,
      party_name,
      remarks,
    }) {
      this.id = id;
      this.party_id = party_id;
      this.date = date;
      this.vehicle_no = vehicle_no;
      this.weight = weight;
      this.rate = rate;
      this.moisture = moisture || 0;
      this.rejection = rejection || 0;
      this.duplex = duplex || 0;
      this.first = first || 0;
      this.second = second || 0;
      this.third = third || 0;
      this.amount = amount;
      this.total_amount = total_amount || amount;
      this.factory_id = factory_id;
      this.factory_name = factory_name;
      this.party_name = party_name;
      this.remarks = remarks;
    }
  }
  
  module.exports = PartyTransaction;
  