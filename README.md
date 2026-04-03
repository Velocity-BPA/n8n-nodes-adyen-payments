# n8n-nodes-adyen-payments

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node for integrating with Adyen's payment platform. This node provides 6 comprehensive resources enabling complete payment processing workflows, from session creation and payment processing to dispute management and recurring payment automation.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Payments](https://img.shields.io/badge/Payments-Adyen-green)
![API](https://img.shields.io/badge/API-REST-orange)
![E-commerce](https://img.shields.io/badge/E--commerce-Ready-purple)

## Features

- **Payment Sessions** - Create and manage secure payment sessions for checkout flows
- **Payment Processing** - Handle payments, captures, refunds, and cancellations
- **Payment Links** - Generate shareable payment links for remote transactions
- **Recurring Payments** - Automate subscription billing and stored payment methods
- **Payment Methods** - Retrieve available payment methods by country and amount
- **Dispute Management** - Handle chargebacks, disputes, and defense document submission
- **Multi-Environment** - Support for test and live Adyen environments
- **Comprehensive Error Handling** - Detailed error responses with actionable solutions

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-adyen-payments`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-adyen-payments
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-adyen-payments.git
cd n8n-nodes-adyen-payments
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-adyen-payments
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Adyen API key from Customer Area | Yes |
| Environment | Test or Live environment | Yes |
| Merchant Account | Your Adyen merchant account identifier | Yes |

## Resources & Operations

### 1. Payment Sessions

| Operation | Description |
|-----------|-------------|
| Create | Create a new payment session for checkout |
| Get | Retrieve payment session details |
| Update | Update payment session parameters |
| Cancel | Cancel an active payment session |

### 2. Payments

| Operation | Description |
|-----------|-------------|
| Authorize | Authorize a payment |
| Capture | Capture an authorized payment |
| Refund | Refund a captured payment |
| Cancel | Cancel an authorized payment |
| Get Details | Retrieve payment details |
| List | List payments with filters |

### 3. Payment Links

| Operation | Description |
|-----------|-------------|
| Create | Generate a shareable payment link |
| Get | Retrieve payment link details |
| Update | Update payment link settings |
| Delete | Delete a payment link |
| List | List all payment links |

### 4. Recurring Payments

| Operation | Description |
|-----------|-------------|
| Create Token | Store payment method for future use |
| Process Payment | Process payment using stored token |
| Disable Token | Disable a stored payment token |
| List Tokens | List stored payment methods |
| Get Token Details | Retrieve stored payment method details |

### 5. Payment Methods

| Operation | Description |
|-----------|-------------|
| Get Available | Retrieve available payment methods |
| Get Details | Get specific payment method details |
| Check Balance | Check gift card or wallet balance |
| Get Brands | Retrieve supported card brands |

### 6. Disputes

| Operation | Description |
|-----------|-------------|
| Get | Retrieve dispute details |
| List | List disputes with filters |
| Accept | Accept a dispute |
| Defend | Submit defense documents |
| Supply Document | Upload supporting documents |
| Delete Document | Remove uploaded documents |

## Usage Examples

```javascript
// Create a payment session
{
  "amount": {
    "currency": "EUR",
    "value": 2500
  },
  "countryCode": "NL",
  "merchantAccount": "YourMerchantAccount",
  "reference": "order-12345",
  "returnUrl": "https://your-site.com/checkout/result"
}
```

```javascript
// Process a payment
{
  "amount": {
    "currency": "USD", 
    "value": 1000
  },
  "reference": "payment-67890",
  "paymentMethod": {
    "type": "scheme",
    "number": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "holderName": "John Doe",
    "cvc": "123"
  },
  "merchantAccount": "YourMerchantAccount"
}
```

```javascript
// Create payment link
{
  "amount": {
    "currency": "GBP",
    "value": 5000
  },
  "reference": "link-54321",
  "description": "Payment for order #54321",
  "expiresAt": "2024-12-31T23:59:59Z",
  "merchantAccount": "YourMerchantAccount"
}
```

```javascript
// Get available payment methods
{
  "merchantAccount": "YourMerchantAccount",
  "countryCode": "US",
  "amount": {
    "currency": "USD",
    "value": 1500
  },
  "channel": "Web"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| 401 Unauthorized | Invalid API key or credentials | Verify API key and merchant account in credentials |
| 403 Forbidden | Insufficient permissions | Check API key permissions in Adyen Customer Area |
| 422 Unprocessable Entity | Invalid request data | Review required fields and data formats |
| 500 Internal Server Error | Adyen service temporarily unavailable | Retry request after brief delay |
| Network Error | Connection timeout or failure | Check internet connectivity and Adyen service status |
| Invalid Amount | Amount format incorrect | Ensure amount is in minor units (cents) |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-adyen-payments/issues)
- **Adyen API Documentation**: [docs.adyen.com](https://docs.adyen.com)
- **Adyen Support**: [support.adyen.com](https://support.adyen.com)