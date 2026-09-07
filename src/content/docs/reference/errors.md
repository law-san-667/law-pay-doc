---
title: Codes d'erreur
description: Référence complète des codes d'erreur retournés par l'API LawPay.
---

## Format des erreurs

Toutes les erreurs suivent le même format :

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description lisible de l'erreur"
  }
}
```

## Codes d'erreur

### Authentification

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `AUTH` | 401 | Invalid or missing API key | Vérifiez que le header `X-API-Key` est présent et valide |
| `AUTH` | 401 | Project is inactive | Réactivez le projet dans le dashboard |

### Validation

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `VALIDATION` | 400 | amount and itemName are required | Incluez `amount` et `itemName` dans le body |
| `VALIDATION` | 400 | Amount must be positive | Le montant doit être supérieur à 0 |

### Ressources

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `NOT_FOUND` | 404 | Transaction not found | Vérifiez l'ID de transaction et votre clé API |
| `NOT_FOUND` | 404 | Recipient not found | Le bénéficiaire n'existe pas dans ce projet |
| `CONFLICT` | 409 | A recipient with externalId "…" already exists | `externalId` doit être unique par projet |

### Marketplace

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `MARKETPLACE_DISABLED` | 400 | This project is not in marketplace mode | Activez le mode marketplace dans les paramètres du projet (propriétaire uniquement) |
| `AMOUNT_TOO_LOW` | 400 | After fees the recipient would receive … | Augmentez `amount` ou réduisez `applicationFee` : le bénéficiaire doit recevoir au moins 100 F |
| `RECIPIENT_SUSPENDED` | 409 | This recipient is suspended | Réactivez le bénéficiaire (`PATCH { "status": "active" }`) |
| `NOT_ROUTED` | 409 | This payment has no recipient | `retry-payout` ne s'applique qu'aux paiements reversés |
| `INVALID_STATE` | 409 | Payout is …; only failed payouts can be retried | Seul un versement en `failed` peut être relancé |
| `PAYOUT_FAILED` | 502 | *(message de l'opérateur)* | Le transfert a de nouveau échoué ; les fonds restent dans votre solde |

### Remboursements

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `NOT_REFUNDABLE` | 409 | Only paid transactions can be refunded | Seul un paiement `paid` est remboursable |
| `ALREADY_REFUNDED` | 409 | This payment has already been refunded | — |
| `INSUFFICIENT_FUNDS` | 409 | Refunding requires … | Le solde du projet doit couvrir le montant à rembourser |
| `REFUND_FAILED` | 502 | *(message PayTech)* | PayTech a refusé le remboursement |
| `RATE_LIMITED` | 429 | Too many requests | Respectez le header `Retry-After` |

### Paiement

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `PAYMENT_ERROR` | 502 | Failed to create payment | Erreur côté fournisseur — réessayez plus tard |

## Codes HTTP utilisés

| Code | Signification | Usage |
|------|---------------|-------|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée (paiement initialisé) |
| 400 | Bad Request | Paramètres invalides ou manquants |
| 401 | Unauthorized | Clé API manquante ou invalide |
| 404 | Not Found | Ressource introuvable |
| 409 | Conflict | État incompatible (déjà remboursé, bénéficiaire suspendu, doublon) |
| 429 | Too Many Requests | Limite de débit atteinte sur un endpoint sensible |
| 502 | Bad Gateway | Erreur du fournisseur de paiement externe |

## Gestion des erreurs

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
      // Corrigez les paramètres de la requête
      console.error('Erreur de validation:', message);
      break;
    case 'AUTH':
      // Vérifiez votre clé API
      console.error('Erreur d\'authentification:', message);
      break;
    case 'PAYMENT_ERROR':
      // Réessayez plus tard
      console.error('Erreur fournisseur:', message);
      break;
    default:
      console.error('Erreur inconnue:', code, message);
  }
}
```
