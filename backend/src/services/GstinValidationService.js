const axios = require('axios');

class GstinValidationService {
  static async validateGstin(gstin) {
    console.log('GSTIN validation called for:', gstin);
    
    // Validate GSTIN format first
    if (!this.validateGstinFormat(gstin)) {
      return {
        isValid: false,
        error: 'Invalid GSTIN format. GSTIN should be 15 characters long and follow the correct format.'
      };
    }

    try {
      // Try to validate with official E-Way Bill API
      const validationResult = await this.validateWithEwayBillAPI(gstin);
      if (validationResult.isValid) {
        return validationResult;
      }
    } catch (error) {
      console.log('E-Way Bill API not available, falling back to mock validation:', error.message);
    }

    // Fallback: Mock validation for development/testing
    // This will be used when official API is not configured or available
    return this.getMockValidation(gstin);
  }

  static async validateWithEwayBillAPI(gstin) {
    // Official E-Way Bill API endpoint
    // Note: This requires API registration with the government portal
    const ewayBillAPIUrl = process.env.EWAY_BILL_API_URL || 'https://api.ewaybillgst.gov.in';
    const clientId = process.env.EWAY_BILL_CLIENT_ID;
    const clientSecret = process.env.EWAY_BILL_CLIENT_SECRET;
    const authToken = process.env.EWAY_BILL_AUTH_TOKEN;
    const requesterGstin = process.env.EWAY_BILL_REQUESTER_GSTIN;

    // Check if API credentials are configured
    if (!clientId || !clientSecret || !authToken || !requesterGstin) {
      throw new Error('E-Way Bill API credentials not configured');
    }

    const response = await axios.get(`${ewayBillAPIUrl}/Master/GetGSTINDetails`, {
      params: { GSTIN: gstin },
      headers: {
        'client-id': clientId,
        'client-secret': clientSecret,
        'Gstin': requesterGstin,
        'authtoken': authToken,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.data && response.data.status === 'ACT') {
      return {
        isValid: true,
        businessName: response.data.tradeName || response.data.legalName || 'Business Name Not Available',
        legalName: response.data.legalName,
        tradeName: response.data.tradeName,
        status: response.data.status,
        stateCode: response.data.stateCode,
        pinCode: response.data.pinCode,
        address1: response.data.address1,
        address2: response.data.address2,
        txpType: response.data.txpType,
        blkStatus: response.data.blkStatus,
        isOfficial: true // Flag to indicate this is from official API
      };
    } else {
      return {
        isValid: false,
        error: 'GSTIN not found or inactive in government records'
      };
    }
  }

  static getMockValidation(gstin) {
    // Mock validation for development/testing
    // This simulates the official API response structure
    return {
      isValid: true,
      businessName: `Validated Business - ${gstin}`,
      legalName: `Legal Name - ${gstin}`,
      tradeName: `Trade Name - ${gstin}`,
      status: 'ACT',
      stateCode: gstin.substring(0, 2), // First 2 digits of GSTIN represent state code
      pinCode: '560001',
      address1: 'Mock Address Line 1',
      address2: 'Mock Address Line 2',
      txpType: 'REG',
      blkStatus: null,
      isMock: true // Flag to indicate this is mock data
    };
  }

  static validateGstinFormat(gstin) {
    // Basic GSTIN format validation
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  }
}

module.exports = GstinValidationService;


