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
| 502 | Bad Gateway | Erreur du fournisseur de paiement externe |

## Gestion des erreurs

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
