---
title: Authentication
description: How to authenticate your requests to the LawPay API.
---

import { Aside } from '@astrojs/starlight/components';

## API Key

All requests to the payment API must include your API key in the `X-API-Key` header.

```http
POST /api/v1/payments/initialize HTTP/1.1
Host: law-pay-production.up.railway.app
Content-Type: application/json
X-API-Key: lp_live_xxxxxxxxxxxxxxxxxxxx
```

## Getting your keys

1. Log in to your [LawPay dashboard](https://app.lawpay.sn)
2. Create a project or access an existing one
3. Your **API Key** is visible in the project settings
4. The **API Secret** is only shown once at creation (can be regenerated)

<Aside type="caution" title="Security">
  Never share your API Secret. It is used to verify webhook signatures.
  If you think it has been compromised, regenerate it immediately from the dashboard.
</Aside>

## Key types

| Prefix | Environment | Usage |
|--------|-------------|-------|
| `lp_test_` | Test | Development and testing (no real payments) |
| `lp_live_` | Production | Real payments |

## Best practices

- Store your keys in environment variables, never in source code
- Use the test key during development
- Make API calls only from your server (never expose the key on the client side)
- Use HTTPS for all requests

## Webhook verification

When LawPay sends a webhook to your server, the request includes an `X-LawPay-Signature` header that you must verify:

```javascript
import { createHmac } from 'crypto';

function verifyWebhookSignature(payload, signature, apiKey) {
  const expected = createHmac('sha256', apiKey)
    .update(JSON.stringify(payload))
    .digest('hex');
  return expected === signature;
}
```

See the [Webhooks](/en/webhooks/setup/) section for more details.
