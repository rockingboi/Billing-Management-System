# GSTIN Validation Setup Guide

This guide explains how to set up real GSTIN validation using the official E-Way Bill API from the Indian government.

## Overview

The system now supports two modes of GSTIN validation:

1. **Mock Validation** (Default): For development and testing
2. **Official API Validation**: Using the government's E-Way Bill portal API

## Current Implementation

### Mock Validation (Development Mode)
- Automatically used when official API credentials are not configured
- Returns simulated business data for testing
- Perfect for development and testing environments

### Official API Validation (Production Mode)
- Connects to the official E-Way Bill portal API
- Fetches real business details from government records
- Requires API registration with the government

## Setting Up Official E-Way Bill API

### Prerequisites

1. **Automated Invoice System**: Your system must be capable of generating invoices automatically
2. **Static IP Address**: You need a static IP address for your server
3. **SSL/TLS Domain**: Your domain must have SSL/TLS certificate
4. **Business Registration**: You must be a registered business with GSTIN

### Registration Process

1. **Visit E-Way Bill Portal**: Go to [https://ewaybillgst.gov.in](https://ewaybillgst.gov.in)
2. **Login**: Use your GST credentials to login
3. **API Registration**: 
   - Go to **Registration** → **For API**
   - Fill in the required details:
     - Domain name (with SSL)
     - Static IP address
     - Business details
4. **Get Credentials**: After approval, you'll receive:
   - `Client ID`
   - `Client Secret`
   - `Auth Token`
   - `Requester GSTIN`

### Configuration

1. **Create Environment File**: Copy `backend/env.example` to `backend/.env`
2. **Add API Credentials**:
   ```env
   EWAY_BILL_API_URL=https://api.ewaybillgst.gov.in
   EWAY_BILL_CLIENT_ID=your_client_id_here
   EWAY_BILL_CLIENT_SECRET=your_client_secret_here
   EWAY_BILL_AUTH_TOKEN=your_auth_token_here
   EWAY_BILL_REQUESTER_GSTIN=your_requester_gstin_here
   ```

3. **Restart Server**: The system will automatically use the official API

## API Response Details

When using the official API, the system fetches and displays:

- **Business Name** (Trade Name)
- **Legal Name** (if different from trade name)
- **State Code** (from GSTIN)
- **PIN Code**
- **Address** (Line 1 and Line 2)
- **Status** (Active/Inactive)
- **Taxpayer Type** (Regular/Composition/etc.)
- **Block Status** (if any)

## Frontend Display

The frontend now shows:

- ✅ **Valid GSTIN** with official data badge
- 📍 **Complete business details** including address and status
- 🏷️ **Data source indicator** (Official Data vs Mock Data)
- ❌ **Error messages** for invalid or inactive GSTINs

## Testing

### Development Testing
```bash
# Test with mock data (no API credentials needed)
curl -X POST http://localhost:5001/api/factories/validate-gstin \
  -H "Content-Type: application/json" \
  -d '{"gstin":"22ABCDE1234F1Z5"}'
```

### Production Testing
```bash
# Test with real GSTIN (requires API credentials)
curl -X POST http://localhost:5001/api/factories/validate-gstin \
  -H "Content-Type: application/json" \
  -d '{"gstin":"29AWGPV7107B1Z1"}'
```

## Error Handling

The system handles various scenarios:

1. **Invalid GSTIN Format**: Returns format validation error
2. **API Not Configured**: Falls back to mock validation
3. **API Unavailable**: Falls back to mock validation
4. **GSTIN Not Found**: Returns "not found" error
5. **Inactive GSTIN**: Returns "inactive" error

## Security Notes

- API credentials are stored in environment variables
- Never commit `.env` file to version control
- Use HTTPS in production
- Monitor API usage to avoid rate limits

## Troubleshooting

### Common Issues

1. **"E-Way Bill API not available"**: Check API credentials
2. **"Invalid GSTIN format"**: Ensure 15-character format
3. **"GSTIN not found"**: GSTIN may not be registered or active
4. **Network errors**: Check internet connectivity and API endpoint

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed logs of API calls and responses.

## Production Deployment

1. **Environment Variables**: Set all required API credentials
2. **SSL Certificate**: Ensure HTTPS is enabled
3. **Static IP**: Configure your server with static IP
4. **Monitoring**: Set up monitoring for API failures
5. **Backup**: Keep mock validation as fallback

## Support

For API-related issues:
- E-Way Bill Portal: [https://ewaybillgst.gov.in](https://ewaybillgst.gov.in)
- API Documentation: [https://docs.ewaybillgst.gov.in](https://docs.ewaybillgst.gov.in)

For system issues:
- Check server logs for detailed error messages
- Verify API credentials are correct
- Test with known valid GSTINs
