---
title: Événements webhook
description: Liste complète des événements envoyés par LawPay à votre serveur.
---

## Types d'événements

| Événement | Description | Déclenché quand |
|-----------|-------------|-----------------|
| `payment.success` | Paiement réussi | L'utilisateur a complété le paiement |
| `payment.cancelled` | Paiement annulé | L'utilisateur a annulé le paiement |
| `payment.refunded` | Paiement remboursé | PayTech a confirmé le remboursement |
| `refund.pending` | Remboursement initié | Un remboursement a été demandé |
| `payout.success` | Versement effectué | *(marketplace)* Le bénéficiaire a reçu les fonds |
| `payout.failed` | Versement échoué | *(marketplace)* Le transfert a échoué, fonds revenus dans votre solde |
| `recipient.updated` | Bénéficiaire modifié | *(marketplace)* Statut ou numéro de versement changé |
| `subscription.activated` | Abonnement activé | Première facture payée |
| `subscription.renewed` | Abonnement renouvelé | Facture de renouvellement payée |
| `subscription.past_due` | Abonnement impayé | Période échue sans paiement |
| `subscription.cancelled` | Abonnement annulé | Fin de période, délai de grâce dépassé, ou annulation |

Tous les événements arrivent sur **la même URL de webhook**, signés de la même
manière. Utilisez le header `X-LawPay-Event` ou le champ `event` pour les router.

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
| `recipientId` | string | *(marketplace)* Bénéficiaire du paiement |
| `platformFee` | string | *(marketplace)* Frais LawPay figés à l'initialisation |
| `applicationFee` | string | *(marketplace)* Votre commission |
| `payoutStatus` | string | *(marketplace)* `processing` si le versement est parti, `failed` sinon |

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

## payout.success / payout.failed

*(mode marketplace)* Envoyé quand le transfert mobile money vers le
bénéficiaire aboutit ou échoue. En cas d'échec les fonds sont revenus dans
votre solde et LawPay réessaie automatiquement (3 tentatives, toutes les
30 minutes) ; vous pouvez aussi relancer via
`POST /api/v1/payments/:id/retry-payout`.

```json
{
  "event": "payout.success",
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "externalOrderId": "order_456",
  "refCommand": "LP-A1B2C3D4",
  "withdrawalId": "9b2d7d3e-…",
  "recipient": { "id": "7c9e6679-…", "externalId": "shop_42", "name": "Boutique Awa" },
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

En mode test, `payout.success` est envoyé immédiatement avec `"simulated": true`
et `withdrawalId: null` — aucun transfert réel n'a lieu.

## recipient.updated

*(mode marketplace)* Envoyé quand le statut ou le numéro de versement d'un
bénéficiaire change via l'API. `destinationChanged: true` mérite une alerte
dans vos systèmes : c'est là que l'argent d'un commerce peut être détourné.

```json
{
  "event": "recipient.updated",
  "recipientId": "7c9e6679-…",
  "externalId": "shop_42",
  "name": "Boutique Awa",
  "status": "active",
  "destinationChanged": true,
  "destinationNumber": "779999999",
  "service": "Wave Senegal",
  "timestamp": "2026-09-07T11:00:00.000Z"
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

    case 'payout.success':
      // Le commerce a été payé : informez-le
      await notifySeller(payload.recipient.externalId, payload.payoutAmount);
      break;

    case 'payout.failed':
      // LawPay réessaie seul ; loguez pour suivi
      await logPayoutFailure(payload.transactionId, payload.error);
      break;

    case 'recipient.updated':
      if (payload.destinationChanged) {
        await alertOps(`Numéro de versement modifié pour ${payload.externalId}`);
      }
      break;
  }
}
```
