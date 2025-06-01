class Factory {
    constructor({ id, name, contact, address, gstin }) {
      this.id = id;
      this.name = name;
      this.contact = contact;
      this.address = address;
      this.gstin = gstin || null;
    }
  }
  
  module.exports = Factory; 
  