class Party {
    constructor({ id, name, contact, address, gstin, business_type }) {
      this.id = id;
      this.name = name;
      this.contact = contact;
      this.address = address;
      this.gstin = gstin;
      this.business_type = business_type || 'unregistered';
    }
  }
  
  module.exports = Party;
  