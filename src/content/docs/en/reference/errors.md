---
title: Error Codes
description: Complete reference of error codes returned by the LawPay API.
---

## Error format

All errors follow the same format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description"
  }
}
```

## Error codes

### Authentication

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `AUTH` | 401 | Invalid or missing API key | Check that the `X-API-Key` header is present and valid |
| `AUTH` | 401 | Project is inactive | Reactivate the project in the dashboard |

### Validation

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `VALIDATION` | 400 | amount and itemName are required | Include `amount` and `itemName` in the body |
| `VALIDATION` | 400 | Amount must be positive | Amount must be greater than 0 |

### Resources

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `NOT_FOUND` | 404 | Transaction not found | Check the transaction ID and your API key |

### Payment

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `PAYMENT_ERROR` | 502 | Failed to create payment | Provider-side error — retry later |

## HTTP status codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created (payment initialized) |
| 400 | Bad Request | Invalid or missing parameters |
| 401 | Unauthorized | Missing or invalid API key |
| 404 | Not Found | Resource not found |
| 502 | Bad Gateway | External payment provider error |

## Error handling

```javascript
const response = await fetch('https://api.lawpay.sn/api/v1/payments/initialize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
  },
  body: JSON.stringify(paymentData),
});

const result = await response.json();

if (!result.success) {
  const { code, message } = result.error;

  switch (code) {
    case 'VALIDATION':
      // Fix the request parameters
      console.error('Validation error:', message);
      break;
    case 'AUTH':
      // Check your API key
      console.error('Authentication error:', message);
      break;
    case 'PAYMENT_ERROR':
      // Retry later
      console.error('Provider error:', message);
      break;
    default:
      console.error('Unknown error:', code, message);
  }
}
```
