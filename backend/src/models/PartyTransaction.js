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
    }) {
      this.id = id;
      this.party_id = party_id;
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
    }
  }
  
  module.exports = PartyTransaction;
  