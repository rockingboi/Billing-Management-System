const { getPartyTransactions, getPartyPayments, getPartyTransactionsByDate, getPartyPaymentsByDate , getAllPartyTransactions} = require('../repositories/TransactionRepo');
const { filterParties } = require('../repositories/PartyRepo');
const TransactionRepo = require('../repositories/TransactionRepo');



class PartyService {
  static async getAllPartyTransactions(party_id) {
    return await TransactionRepo.getPartyTransactions(party_id);
  }

  static async getAllPartyPayments(party_id) {
    return await TransactionRepo.getPartyPayments(party_id);
  }

  static async getTotalOwedToParty(party_id) {
    const transactions = await TransactionRepo.getPartyTransactions(party_id);
    return transactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
  }

  static async getTotalPaidToParty(party_id) {
    const payments = await TransactionRepo.getPartyPayments(party_id);
    return payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
  }

  static async getRemainingToParty(party_id) {
    const owed = await this.getTotalOwedToParty(party_id);
    const paid = await this.getTotalPaidToParty(party_id);
    return owed - paid;
  }

  // static async getAllParties() {
  //   const response = await axios.get("/api/parties");
  //   return response.data; // should be an array!
  // }
  
  // ✅ Summary with optional date range
  static async getSummaryByPartyId(party_id, from, to) {
    const transactions = await TransactionRepo.getPartyTransactionsByDate(party_id, from, to);
    const payments = await TransactionRepo.getPartyPaymentsByDate(party_id, from, to);

    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const remaining = totalAmount - totalPaid;

    return {
      transactions,
      payments,
      totalAmount,
      totalPaid,
      remaining,
    };
  }
}

exports.getFilteredParties = async ({ name }) => {
  return await PartyRepo.filterParties({ name });
};

module.exports = PartyService;
