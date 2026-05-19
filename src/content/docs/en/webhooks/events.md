---
title: Webhook Events
description: Complete list of events sent by LawPay to your server.
---

## Event types

| Event | Description | Triggered when |
|-------|-------------|----------------|
| `payment.success` | Payment successful | User completed the payment |
| `payment.cancelled` | Payment cancelled | User cancelled the payment |

## payment.success

Sent when a payment is confirmed by the provider.

```json
{
  "event": "payment.success",
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "externalOrderId": "order_456",
  "amount": "15000.00",
  "currency": "XOF",
  "status": "paid",
  "refCommand": "LP-A1B2C3D4",
  "itemName": "Premium Subscription",
  "paymentMethod": "Orange Money",
  "clientPhone": "+221770001122",
  "metadata": { "userId": "user_789", "plan": "premium" },
  "timestamp": "2026-05-19T10:32:15.000Z"
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Always `"payment.success"` |
| `transactionId` | string (UUID) | LawPay unique identifier |
| `externalOrderId` | string \| null | Your order identifier (passed during initialization) |
| `amount` | string | Amount paid (decimal format) |
| `currency` | string | Currency (`"XOF"`) |
| `status` | string | Always `"paid"` for this event |
| `refCommand` | string | LawPay order reference |
| `itemName` | string | Item name |
| `paymentMethod` | string | Payment method used (e.g., "Orange Money", "Wave") |
| `clientPhone` | string \| null | Customer phone number |
| `metadata` | object \| null | Your custom data |
| `timestamp` | string (ISO 8601) | Event date/time |

## payment.cancelled

Sent when the user cancels the payment on the provider page.

```json
{
  "event": "payment.cancelled",
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "externalOrderId": "order_456",
  "amount": "15000.00",
  "currency": "XOF",
  "status": "cancelled",
  "refCommand": "LP-A1B2C3D4",
  "itemName": "Premium Subscription",
  "paymentMethod": null,
  "clientPhone": null,
  "metadata": { "userId": "user_789", "plan": "premium" },
  "timestamp": "2026-05-19T10:35:00.000Z"
}
```

## Recommended handling

```javascript
async function handleWebhook(event, payload) {
  switch (event) {
    case 'payment.success':
      // Mark order as paid
      await db.orders.update({
        where: { id: payload.externalOrderId },
        data: { status: 'paid', paidAt: new Date(payload.timestamp) },
      });
      // Send confirmation email
      await sendConfirmationEmail(payload);
      break;

    case 'payment.cancelled':
      // Release reserved stock
      await db.orders.update({
        where: { id: payload.externalOrderId },
        data: { status: 'cancelled' },
      });
      break;
  }
}
```
