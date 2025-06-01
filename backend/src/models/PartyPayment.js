class PartyPayment {
    constructor({ id, party_id, date, amount_paid, remarks }) {
      this.id = id;
      this.party_id = party_id;
      this.date = date;
      this.amount = amount_paid;
      this.remarks = remarks;
      this.party_name = "";
    }
  }
  
  module.exports = PartyPayment;
  