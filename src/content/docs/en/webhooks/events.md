---
title: Webhook Events
description: Complete list of events sent by LawPay to your server.
---

## Event types

| Event | Description | Triggered when |
|-------|-------------|----------------|
| `payment.success` | Payment successful | User completed the payment |
| `payment.cancelled` | Payment cancelled | User cancelled the payment |
| `payment.refunded` | Payment refunded | PayTech confirmed the refund |
| `refund.pending` | Refund initiated | A refund was requested |
| `payout.success` | Payout completed | *(marketplace)* The recipient received the funds |
| `payout.failed` | Payout failed | *(marketplace)* Transfer failed, funds returned to your balance |
| `recipient.updated` | Recipient changed | *(marketplace)* Status or payout number changed |
| `subscription.activated` | Subscription activated | First invoice paid |
| `subscription.renewed` | Subscription renewed | Renewal invoice paid |
| `subscription.past_due` | Subscription past due | Period ended unpaid |
| `subscription.cancelled` | Subscription cancelled | Period end, grace period exceeded, or cancellation |

Every event arrives at **the same webhook URL**, signed the same way. Route them
with the `X-LawPay-Event` header or the `event` field.

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
| `recipientId` | string | *(marketplace)* Recipient of the payment |
| `platformFee` | string | *(marketplace)* LawPay fee locked at initialization |
| `applicationFee` | string | *(marketplace)* Your commission |
| `payoutStatus` | string | *(marketplace)* `processing` if the payout went out, `failed` otherwise |

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

## payout.success / payout.failed

*(marketplace mode)* Sent when the mobile money transfer to the recipient
completes or fails. On failure the funds are back in your balance and LawPay
retries automatically (3 attempts, 30 minutes apart); you can also retry with
`POST /api/v1/payments/:id/retry-payout`.

```json
{
  "event": "payout.success",
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "externalOrderId": "order_456",
  "refCommand": "LP-A1B2C3D4",
  "withdrawalId": "9b2d7d3e-…",
  "recipient": { "id": "7c9e6679-…", "externalId": "shop_42", "name": "Awa Shop" },
  "amount": "10000.00",
  "platformFee": "50.00",
  "applicationFee": "500.00",
  "payoutAmount": "9450.00",
  "currency": "XOF",
  "error": null,
  "metadata": { "userId": "user_789" },
  "timestamp": "2026-09-07T10:33:00.000Z"
}
```

In test mode, `payout.success` is sent immediately with `"simulated": true` and
`withdrawalId: null` — no real transfer takes place.

## recipient.updated

*(marketplace mode)* Sent when a recipient's status or payout number changes
through the API. `destinationChanged: true` deserves an alert in your systems:
this is where a business's money could be diverted.

```json
{
  "event": "recipient.updated",
  "recipientId": "7c9e6679-…",
  "externalId": "shop_42",
  "name": "Awa Shop",
  "status": "active",
  "destinationChanged": true,
  "destinationNumber": "779999999",
  "service": "Wave Senegal",
  "timestamp": "2026-09-07T11:00:00.000Z"
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
