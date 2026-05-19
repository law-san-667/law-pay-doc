---
title: Événements webhook
description: Liste complète des événements envoyés par LawPay à votre serveur.
---

## Types d'événements

| Événement | Description | Déclenché quand |
|-----------|-------------|-----------------|
| `payment.success` | Paiement réussi | L'utilisateur a complété le paiement |
| `payment.cancelled` | Paiement annulé | L'utilisateur a annulé le paiement |

## payment.success

Envoyé lorsqu'un paiement est confirmé par le fournisseur.

```json
{
  "event": "payment.success",
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "externalOrderId": "order_456",
  "amount": "15000.00",
  "currency": "XOF",
  "status": "paid",
  "refCommand": "LP-A1B2C3D4",
  "itemName": "Abonnement Premium",
  "paymentMethod": "Orange Money",
  "clientPhone": "+221770001122",
  "metadata": { "userId": "user_789", "plan": "premium" },
  "timestamp": "2026-05-19T10:32:15.000Z"
}
```

### Champs

| Champ | Type | Description |
|-------|------|-------------|
| `event` | string | Toujours `"payment.success"` |
| `transactionId` | string (UUID) | Identifiant unique LawPay |
| `externalOrderId` | string \| null | Votre identifiant de commande (passé lors de l'initialisation) |
| `amount` | string | Montant payé (format décimal) |
| `currency` | string | Devise (`"XOF"`) |
| `status` | string | Toujours `"paid"` pour cet événement |
| `refCommand` | string | Référence de commande LawPay |
| `itemName` | string | Nom de l'article |
| `paymentMethod` | string | Méthode de paiement utilisée (ex: "Orange Money", "Wave") |
| `clientPhone` | string \| null | Numéro du client |
| `metadata` | object \| null | Vos données personnalisées |
| `timestamp` | string (ISO 8601) | Date/heure de l'événement |

## payment.cancelled

Envoyé lorsque l'utilisateur annule le paiement sur la page du fournisseur.

```json
{
  "event": "payment.cancelled",
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "externalOrderId": "order_456",
  "amount": "15000.00",
  "currency": "XOF",
  "status": "cancelled",
  "refCommand": "LP-A1B2C3D4",
  "itemName": "Abonnement Premium",
  "paymentMethod": null,
  "clientPhone": null,
  "metadata": { "userId": "user_789", "plan": "premium" },
  "timestamp": "2026-05-19T10:35:00.000Z"
}
```

## Traitement recommandé

```javascript
async function handleWebhook(event, payload) {
  switch (event) {
    case 'payment.success':
      // Marquez la commande comme payée
      await db.orders.update({
        where: { id: payload.externalOrderId },
        data: { status: 'paid', paidAt: new Date(payload.timestamp) },
      });
      // Envoyez un email de confirmation
      await sendConfirmationEmail(payload);
      break;

    case 'payment.cancelled':
      // Libérez le stock réservé
      await db.orders.update({
        where: { id: payload.externalOrderId },
        data: { status: 'cancelled' },
      });
      break;
  }
}
```
