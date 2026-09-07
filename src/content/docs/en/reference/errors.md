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
| `NOT_FOUND` | 404 | Recipient not found | The recipient does not exist in this project |
| `CONFLICT` | 409 | A recipient with externalId "…" already exists | `externalId` must be unique per project |

### Marketplace

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `MARKETPLACE_DISABLED` | 400 | This project is not in marketplace mode | Enable marketplace mode in the project settings (owner only) |
| `AMOUNT_TOO_LOW` | 400 | After fees the recipient would receive … | Raise `amount` or lower `applicationFee`: the recipient must receive at least 100 F |
| `RECIPIENT_SUSPENDED` | 409 | This recipient is suspended | Reactivate the recipient (`PATCH { "status": "active" }`) |
| `NOT_ROUTED` | 409 | This payment has no recipient | `retry-payout` only applies to routed payments |
| `INVALID_STATE` | 409 | Payout is …; only failed payouts can be retried | Only a `failed` payout can be retried |
| `PAYOUT_FAILED` | 502 | *(operator message)* | The transfer failed again; funds remain in your balance |

### Refunds

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `NOT_REFUNDABLE` | 409 | Only paid transactions can be refunded | Only a `paid` payment can be refunded |
| `ALREADY_REFUNDED` | 409 | This payment has already been refunded | — |
| `INSUFFICIENT_FUNDS` | 409 | Refunding requires … | The project balance must cover the refund |
| `REFUND_FAILED` | 502 | *(PayTech message)* | PayTech rejected the refund |
| `RATE_LIMITED` | 429 | Too many requests | Honour the `Retry-After` header |

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
| 409 | Conflict | Incompatible state (already refunded, suspended recipient, duplicate) |
| 429 | Too Many Requests | Rate limit reached on a sensitive endpoint |
| 502 | Bad Gateway | External payment provider error |

## Error handling

```javascript
const response = await fetch('https://law-pay-production.up.railway.app/api/v1/payments/initialize', {
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
