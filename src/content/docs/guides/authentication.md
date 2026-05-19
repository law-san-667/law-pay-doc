---
title: Authentification
description: Comment authentifier vos requêtes à l'API LawPay.
---

import { Aside } from '@astrojs/starlight/components';

## Clé API

Toutes les requêtes à l'API de paiement doivent inclure votre clé API dans le header `X-API-Key`.

```http
POST /api/v1/payments/initialize HTTP/1.1
Host: api.lawpay.sn
Content-Type: application/json
X-API-Key: lp_live_xxxxxxxxxxxxxxxxxxxx
```

## Obtenir vos clés

1. Connectez-vous à votre [dashboard LawPay](https://app.lawpay.sn)
2. Créez un projet ou accédez à un projet existant
3. Votre **API Key** est visible dans les paramètres du projet
4. L'**API Secret** n'est affiché qu'une seule fois à la création (régénérable)

<Aside type="caution" title="Sécurité">
  Ne partagez jamais votre API Secret. Il est utilisé pour vérifier les signatures de webhook.
  Si vous pensez qu'il a été compromis, régénérez-le immédiatement depuis le dashboard.
</Aside>

## Types de clés

| Préfixe | Environnement | Usage |
|---------|---------------|-------|
| `lp_test_` | Test | Développement et tests (aucun paiement réel) |
| `lp_live_` | Production | Paiements réels |

## Bonnes pratiques

- Stockez vos clés dans des variables d'environnement, jamais dans le code source
- Utilisez la clé de test pendant le développement
- Effectuez les appels API uniquement côté serveur (ne jamais exposer la clé côté client)
- Utilisez HTTPS pour toutes les requêtes

## Vérification de webhook

Lorsque LawPay envoie un webhook à votre serveur, la requête inclut un header `X-LawPay-Signature` que vous devez vérifier :

```javascript
import { createHmac } from 'crypto';

function verifyWebhookSignature(payload, signature, apiKey) {
  const expected = createHmac('sha256', apiKey)
    .update(JSON.stringify(payload))
    .digest('hex');
  return expected === signature;
}
```

Voir la section [Webhooks](/webhooks/setup/) pour plus de détails.
