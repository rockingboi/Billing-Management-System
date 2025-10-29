class Transaction {
    constructor({
      id,
      party_id,
      factory_id,
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
      type
    }) {
      this.id = id;
      this.party_id = party_id;
      this.factory_id = factory_id;
      this.date = date;
      this.vehicle_no = vehicle_no;
      this.weight = weight;
      this.rate = rate;
      this.moisture = moisture;
      this.rejection = rejection;
      this.duplex = duplex;
      this.first = first;
      this.second = second;
      this.third = third;
      this.amount = amount;
      this.total_amount = amount;
      // this.type = type; 
    }
  }
  
  module.exports = Transaction;
  