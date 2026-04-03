/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-adyenpayments/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class AdyenPayments implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Adyen Payments',
    name: 'adyenpayments',
    icon: 'file:adyenpayments.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Adyen Payments API',
    defaults: {
      name: 'Adyen Payments',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'adyenpaymentsApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'PaymentSessions',
            value: 'paymentSessions',
          },
          {
            name: 'Payments',
            value: 'payments',
          },
          {
            name: 'Payment Links',
            value: 'paymentLinks',
          },
          {
            name: 'RecurringPayments',
            value: 'recurringPayments',
          },
          {
            name: 'PaymentMethods',
            value: 'paymentMethods',
          },
          {
            name: 'Disputes',
            value: 'disputes',
          }
        ],
        default: 'paymentSessions',
      },
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['paymentSessions'] } },
  options: [
    { name: 'Create Session', value: 'createSession', description: 'Create a new checkout session', action: 'Create a checkout session' },
    { name: 'Get Session', value: 'getSession', description: 'Retrieve session details', action: 'Get a session' },
    { name: 'Setup Session', value: 'setupSession', description: 'Setup session with payment method', action: 'Setup a session' },
  ],
  default: 'createSession',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['payments'],
		},
	},
	options: [
		{
			name: 'Authorize Payment',
			value: 'authorizePayment',
			description: 'Authorize a payment',
			action: 'Authorize a payment',
		},
		{
			name: 'Capture Payment',
			value: 'capturePayment',
			description: 'Capture an authorized payment',
			action: 'Capture an authorized payment',
		},
		{
			name: 'Cancel Payment',
			value: 'cancelPayment',
			description: 'Cancel an authorized payment',
			action: 'Cancel an authorized payment',
		},
		{
			name: 'Refund Payment',
			value: 'refundPayment',
			description: 'Refund a captured payment',
			action: 'Refund a captured payment',
		},
		{
			name: 'Get Payment',
			value: 'getPayment',
			description: 'Get payment details',
			action: 'Get payment details',
		},
	],
	default: 'authorizePayment',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['paymentLinks'] } },
  options: [
    { name: 'Create Payment Link', value: 'createPaymentLink', description: 'Create a new payment link', action: 'Create a payment link' },
    { name: 'Get Payment Link', value: 'getPaymentLink', description: 'Retrieve payment link details', action: 'Get a payment link' },
    { name: 'Update Payment Link', value: 'updatePaymentLink', description: 'Update payment link status or details', action: 'Update a payment link' }
  ],
  default: 'createPaymentLink',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['recurringPayments'],
		},
	},
	options: [
		{
			name: 'Create Recurring Payment',
			value: 'createRecurringPayment',
			description: 'Process payment with stored payment method',
			action: 'Create a recurring payment',
		},
		{
			name: 'List Stored Payment Methods',
			value: 'listStoredPaymentMethods',
			description: 'List stored payment methods for shopper',
			action: 'List stored payment methods',
		},
		{
			name: 'Disable Stored Payment Method',
			value: 'disableStoredPaymentMethod',
			description: 'Disable a stored payment method',
			action: 'Disable a stored payment method',
		},
	],
	default: 'createRecurringPayment',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['paymentMethods'] } },
  options: [
    { name: 'Get Available Payment Methods', value: 'getPaymentMethods', description: 'Get available payment methods for merchants and shoppers', action: 'Get available payment methods' },
    { name: 'Get Balance', value: 'getBalance', description: 'Check balance for balance-based payment methods', action: 'Get balance for payment method' }
  ],
  default: 'getPaymentMethods',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['disputes'] } },
  options: [
    { name: 'Upload Dispute Document', value: 'uploadDisputeDocument', description: 'Upload document for dispute defense', action: 'Upload dispute document' },
    { name: 'Supply Defense Document', value: 'supplyDefenseDocument', description: 'Provide additional defense documentation', action: 'Supply defense document' },
    { name: 'Accept Dispute', value: 'acceptDispute', description: 'Accept a dispute', action: 'Accept dispute' }
  ],
  default: 'uploadDisputeDocument',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'number',
  required: true,
  displayOptions: { show: { resource: ['paymentSessions'], operation: ['createSession'] } },
  default: 0,
  description: 'Payment amount in minor currency units (e.g., cents)',
},
{
  displayName: 'Currency',
  name: 'currency',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['paymentSessions'], operation: ['createSession'] } },
  default: 'USD',
  description: 'Three-letter ISO 4217 currency code',
},
{
  displayName: 'Country Code',
  name: 'countryCode',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['paymentSessions'], operation: ['createSession'] } },
  default: 'US',
  description: 'Two-letter ISO 3166-1 alpha-2 country code',
},
{
  displayName: 'Merchant Account',
  name: 'merchantAccount',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['paymentSessions'], operation: ['createSession'] } },
  default: '',
  description: 'The merchant account identifier',
},
{
  displayName: 'Return URL',
  name: 'returnUrl',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['paymentSessions'], operation: ['createSession'] } },
  default: '',
  description: 'URL to redirect the shopper after payment completion',
},
{
  displayName: 'Session ID',
  name: 'sessionId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['paymentSessions'], operation: ['getSession', 'setupSession'] } },
  default: '',
  description: 'Unique identifier for the payment session',
},
{
  displayName: 'Payment Method',
  name: 'paymentMethod',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['paymentSessions'], operation: ['setupSession'] } },
  default: '{}',
  description: 'Payment method details as JSON object',
},
{
	displayName: 'Amount',
	name: 'amount',
	type: 'number',
	required: true,
	displayOptions: {
		show: {
			resource: ['payments'],
			operation: ['authorizePayment'],
		},
	},
	default: 0,
	description: 'Payment amount in minor units (e.g., cents)',
},
{
	displayName: 'Currency',
	name: 'currency',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['payments'],
			operation: ['authorizePayment'],
		},
	},
	default: 'USD',
	description: 'Three-letter currency code (ISO 4217)',
},
{
	displayName: 'Payment Method',
	name: 'paymentMethod',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['payments'],
			operation: ['authorizePayment'],
		},
	},
	default: '{}',
	description: 'Payment method details as JSON object',
},
{
	displayName: 'Merchant Account',
	name: 'merchantAccount',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['payments'],
			operation: ['authorizePayment', 'cancelPayment'],
		},
	},
	default: '',
	description: 'The merchant account identifier',
},
{
	displayName: 'Reference',
	name: 'reference',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['payments'],
			operation: ['authorizePayment'],
		},
	},
	default: '',
	description: 'Your reference for the payment',
},
{
	displayName: 'Payment PSP Reference',
	name: 'paymentPspReference',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['payments'],
			operation: ['capturePayment', 'cancelPayment', 'refundPayment', 'getPayment'],
		},
	},
	default: '',
	description: 'The PSP reference of the payment to process',
},
{
	displayName: 'Amount',
	name: 'amount',
	type: 'number',
	required: true,
	displayOptions: {
		show: {
			resource: ['payments'],
			operation: ['capturePayment', 'refundPayment'],
		},
	},
	default: 0,
	description: 'Amount to capture/refund in minor units (e.g., cents)',
},
{
	displayName: 'Currency',
	name: 'currency',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['payments'],
			operation: ['capturePayment', 'refundPayment'],
		},
	},
	default: 'USD',
	description: 'Three-letter currency code (ISO 4217)',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'number',
  required: true,
  displayOptions: { show: { resource: ['paymentLinks'], operation: ['createPaymentLink'] } },
  default: 0,
  description: 'Payment amount in minor units (e.g., 1000 for €10.00)',
},
{
  displayName: 'Currency',
  name: 'currency',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['paymentLinks'], operation: ['createPaymentLink'] } },
  default: 'EUR',
  description: 'Payment currency code (ISO 4217)',
},
{
  displayName: 'Merchant Account',
  name: 'merchantAccount',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['paymentLinks'], operation: ['createPaymentLink'] } },
  default: '',
  description: 'The merchant account identifier',
},
{
  displayName: 'Reference',
  name: 'reference',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['paymentLinks'], operation: ['createPaymentLink'] } },
  default: '',
  description: 'Your reference for the payment',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['paymentLinks'], operation: ['createPaymentLink'] } },
  default: '',
  description: 'Description of the payment link',
},
{
  displayName: 'Link ID',
  name: 'linkId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['paymentLinks'], operation: ['getPaymentLink', 'updatePaymentLink'] } },
  default: '',
  description: 'The payment link identifier',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  required: false,
  displayOptions: { show: { resource: ['paymentLinks'], operation: ['updatePaymentLink'] } },
  options: [
    { name: 'Active', value: 'active' },
    { name: 'Completed', value: 'completed' },
    { name: 'Expired', value: 'expired' }
  ],
  default: 'active',
  description: 'The status to update the payment link to',
},
{
	displayName: 'Selected Recurring Detail Reference',
	name: 'selectedRecurringDetailReference',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['recurringPayments'],
			operation: ['createRecurringPayment'],
		},
	},
	default: '',
	description: 'The recurring detail reference to use for the payment',
},
{
	displayName: 'Shopper Reference',
	name: 'shopperReference',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['recurringPayments'],
			operation: ['createRecurringPayment', 'listStoredPaymentMethods', 'disableStoredPaymentMethod'],
		},
	},
	default: '',
	description: 'Your reference to uniquely identify this shopper',
},
{
	displayName: 'Merchant Account',
	name: 'merchantAccount',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['recurringPayments'],
			operation: ['createRecurringPayment', 'listStoredPaymentMethods', 'disableStoredPaymentMethod'],
		},
	},
	default: '',
	description: 'The merchant account identifier',
},
{
	displayName: 'Amount',
	name: 'amount',
	type: 'fixedCollection',
	required: true,
	displayOptions: {
		show: {
			resource: ['recurringPayments'],
			operation: ['createRecurringPayment'],
		},
	},
	typeOptions: {
		multipleValues: false,
	},
	default: {},
	options: [
		{
			name: 'amountDetails',
			displayName: 'Amount Details',
			values: [
				{
					displayName: 'Currency',
					name: 'currency',
					type: 'string',
					default: 'EUR',
					description: 'The three-character ISO currency code',
				},
				{
					displayName: 'Value',
					name: 'value',
					type: 'number',
					default: 0,
					description: 'The amount in minor units (e.g., cents)',
				},
			],
		},
	],
	description: 'The payment amount',
},
{
	displayName: 'Recurring Detail Reference',
	name: 'recurringDetailReference',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['recurringPayments'],
			operation: ['disableStoredPaymentMethod'],
		},
	},
	default: '',
	description: 'The ID that uniquely identifies the recurring detail to disable',
},
{
	displayName: 'Additional Fields',
	name: 'additionalFields',
	type: 'collection',
	placeholder: 'Add Field',
	default: {},
	displayOptions: {
		show: {
			resource: ['recurringPayments'],
			operation: ['createRecurringPayment'],
		},
	},
	options: [
		{
			displayName: 'Reference',
			name: 'reference',
			type: 'string',
			default: '',
			description: 'Your reference for this payment',
		},
		{
			displayName: 'Return URL',
			name: 'returnUrl',
			type: 'string',
			default: '',
			description: 'The URL to return to after the payment is completed',
		},
		{
			displayName: 'CVV',
			name: 'cvv',
			type: 'string',
			default: '',
			description: 'The card security code for additional verification',
		},
	],
},
{
  displayName: 'Merchant Account',
  name: 'merchantAccount',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['paymentMethods'], operation: ['getPaymentMethods', 'getBalance'] } },
  default: '',
  description: 'The merchant account identifier for which to retrieve payment methods',
},
{
  displayName: 'Country Code',
  name: 'countryCode',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['paymentMethods'], operation: ['getPaymentMethods'] } },
  default: '',
  description: 'The country code in ISO 3166-1 alpha-2 format',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'number',
  required: false,
  displayOptions: { show: { resource: ['paymentMethods'], operation: ['getPaymentMethods'] } },
  default: 0,
  description: 'The amount in minor units (e.g., 1000 for €10.00)',
},
{
  displayName: 'Currency',
  name: 'currency',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['paymentMethods'], operation: ['getPaymentMethods'] } },
  default: 'EUR',
  description: 'The three-letter ISO 4217 currency code',
},
{
  displayName: 'Payment Method',
  name: 'paymentMethod',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['paymentMethods'], operation: ['getBalance'] } },
  default: '{}',
  description: 'The payment method object for which to check the balance',
},
{
  displayName: 'Dispute PSP Reference',
  name: 'disputePspReference',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['disputes'], operation: ['uploadDisputeDocument', 'supplyDefenseDocument', 'acceptDispute'] } },
  default: '',
  description: 'The PSP reference of the dispute to operate on',
},
{
  displayName: 'Defense Document',
  name: 'defenseDocument',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['disputes'], operation: ['uploadDisputeDocument'] } },
  default: '',
  description: 'Base64 encoded defense document to upload',
},
{
  displayName: 'Defense Documents',
  name: 'defenseDocuments',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['disputes'], operation: ['supplyDefenseDocument'] } },
  default: '',
  description: 'JSON array of defense documents to supply',
},
{
  displayName: 'Merchant Account',
  name: 'merchantAccount',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['disputes'], operation: ['acceptDispute'] } },
  default: '',
  description: 'The merchant account identifier',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'paymentSessions':
        return [await executePaymentSessionsOperations.call(this, items)];
      case 'payments':
        return [await executePaymentsOperations.call(this, items)];
      case 'paymentLinks':
        return [await executePaymentLinksOperations.call(this, items)];
      case 'recurringPayments':
        return [await executeRecurringPaymentsOperations.call(this, items)];
      case 'paymentMethods':
        return [await executePaymentMethodsOperations.call(this, items)];
      case 'disputes':
        return [await executeDisputesOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executePaymentSessionsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('adyenpaymentsApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'createSession': {
          const amount = this.getNodeParameter('amount', i) as number;
          const currency = this.getNodeParameter('currency', i) as string;
          const countryCode = this.getNodeParameter('countryCode', i) as string;
          const merchantAccount = this.getNodeParameter('merchantAccount', i) as string;
          const returnUrl = this.getNodeParameter('returnUrl', i) as string;

          const body = {
            amount: {
              value: amount,
              currency: currency,
            },
            countryCode: countryCode,
            merchantAccount: merchantAccount,
            returnUrl: returnUrl,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/sessions`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSession': {
          const sessionId = this.getNodeParameter('sessionId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/sessions/${sessionId}`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'setupSession': {
          const sessionId = this.getNodeParameter('sessionId', i) as string;
          const paymentMethod = this.getNodeParameter('paymentMethod', i) as string;

          let parsedPaymentMethod: any;
          try {
            parsedPaymentMethod = JSON.parse(paymentMethod);
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Invalid JSON in payment method: ${error.message}`);
          }

          const body = {
            paymentMethod: parsedPaymentMethod,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/sessions/${sessionId}/setup`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executePaymentsOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('adyenpaymentsApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'authorizePayment': {
					const amount = this.getNodeParameter('amount', i) as number;
					const currency = this.getNodeParameter('currency', i) as string;
					const paymentMethod = this.getNodeParameter('paymentMethod', i) as object;
					const merchantAccount = this.getNodeParameter('merchantAccount', i) as string;
					const reference = this.getNodeParameter('reference', i) as string;

					const body = {
						amount: {
							value: amount,
							currency: currency,
						},
						paymentMethod: paymentMethod,
						merchantAccount: merchantAccount,
						reference: reference,
					};

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/payments`,
						headers: {
							'X-API-Key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						body: body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'capturePayment': {
					const paymentPspReference = this.getNodeParameter('paymentPspReference', i) as string;
					const amount = this.getNodeParameter('amount', i) as number;
					const currency = this.getNodeParameter('currency', i) as string;

					const body = {
						amount: {
							value: amount,
							currency: currency,
						},
					};

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/payments/${paymentPspReference}/captures`,
						headers: {
							'X-API-Key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						body: body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'cancelPayment': {
					const paymentPspReference = this.getNodeParameter('paymentPspReference', i) as string;
					const merchantAccount = this.getNodeParameter('merchantAccount', i) as string;

					const body = {
						merchantAccount: merchantAccount,
					};

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/payments/${paymentPspReference}/cancels`,
						headers: {
							'X-API-Key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						body: body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'refundPayment': {
					const paymentPspReference = this.getNodeParameter('paymentPspReference', i) as string;
					const amount = this.getNodeParameter('amount', i) as number;
					const currency = this.getNodeParameter('currency', i) as string;

					const body = {
						amount: {
							value: amount,
							currency: currency,
						},
					};

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/payments/${paymentPspReference}/refunds`,
						headers: {
							'X-API-Key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						body: body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getPayment': {
					const paymentPspReference = this.getNodeParameter('paymentPspReference', i) as string;

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/payments/${paymentPspReference}`,
						headers: {
							'X-API-Key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(
						this.getNode(),
						`Unknown operation: ${operation}`,
						{ itemIndex: i },
					);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});

		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executePaymentLinksOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('adyenpaymentsApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'createPaymentLink': {
          const amount = this.getNodeParameter('amount', i) as number;
          const currency = this.getNodeParameter('currency', i) as string;
          const merchantAccount = this.getNodeParameter('merchantAccount', i) as string;
          const reference = this.getNodeParameter('reference', i) as string;
          const description = this.getNodeParameter('description', i) as string;

          const body = {
            amount: {
              value: amount,
              currency: currency,
            },
            merchantAccount: merchantAccount,
            reference: reference,
            description: description,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/paymentLinks`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getPaymentLink': {
          const linkId = this.getNodeParameter('linkId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/paymentLinks/${linkId}`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updatePaymentLink': {
          const linkId = this.getNodeParameter('linkId', i) as string;
          const status = this.getNodeParameter('status', i) as string;

          const body = {
            status: status,
          };

          const options: any = {
            method: 'PATCH',
            url: `${credentials.baseUrl}/paymentLinks/${linkId}`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeRecurringPaymentsOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('adyenpaymentsApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'createRecurringPayment': {
					const selectedRecurringDetailReference = this.getNodeParameter('selectedRecurringDetailReference', i) as string;
					const shopperReference = this.getNodeParameter('shopperReference', i) as string;
					const merchantAccount = this.getNodeParameter('merchantAccount', i) as string;
					const amount = this.getNodeParameter('amount.amountDetails', i, {}) as any;
					const additionalFields = this.getNodeParameter('additionalFields', i) as any;

					const body: any = {
						selectedRecurringDetailReference,
						shopperReference,
						merchantAccount,
						amount,
						...additionalFields,
					};

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/payments`,
						headers: {
							'X-API-Key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'listStoredPaymentMethods': {
					const shopperReference = this.getNodeParameter('shopperReference', i) as string;
					const merchantAccount = this.getNodeParameter('merchantAccount', i) as string;

					const body: any = {
						shopperReference,
						merchantAccount,
						recurring: {
							contract: 'RECURRING',
						},
					};

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/listRecurringDetails`,
						headers: {
							'X-API-Key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'disableStoredPaymentMethod': {
					const shopperReference = this.getNodeParameter('shopperReference', i) as string;
					const recurringDetailReference = this.getNodeParameter('recurringDetailReference', i) as string;
					const merchantAccount = this.getNodeParameter('merchantAccount', i) as string;

					const body: any = {
						shopperReference,
						recurringDetailReference,
						merchantAccount,
					};

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/disable`,
						headers: {
							'X-API-Key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});
		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executePaymentMethodsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('adyenpaymentsApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getPaymentMethods': {
          const merchantAccount = this.getNodeParameter('merchantAccount', i) as string;
          const countryCode = this.getNodeParameter('countryCode', i) as string;
          const amount = this.getNodeParameter('amount', i) as number;
          const currency = this.getNodeParameter('currency', i) as string;

          const body: any = {
            merchantAccount,
            countryCode,
          };

          if (amount) {
            body.amount = {
              value: amount,
              currency,
            };
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/paymentMethods`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        case 'getBalance': {
          const merchantAccount = this.getNodeParameter('merchantAccount', i) as string;
          const paymentMethod = this.getNodeParameter('paymentMethod', i) as any;

          const body: any = {
            merchantAccount,
            paymentMethod: typeof paymentMethod === 'string' ? JSON.parse(paymentMethod) : paymentMethod,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/paymentMethods/balance`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeDisputesOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('adyenpaymentsApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'uploadDisputeDocument': {
          const disputePspReference = this.getNodeParameter('disputePspReference', i) as string;
          const defenseDocument = this.getNodeParameter('defenseDocument', i) as string;
          
          const body = {
            disputePspReference,
            defenseDocument,
          };
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/defendDocument`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'supplyDefenseDocument': {
          const disputePspReference = this.getNodeParameter('disputePspReference', i) as string;
          const defenseDocuments = this.getNodeParameter('defenseDocuments', i) as string;
          
          const body = {
            disputePspReference,
            defenseDocuments: JSON.parse(defenseDocuments),
          };
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/supplyDefenseDocument`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'acceptDispute': {
          const disputePspReference = this.getNodeParameter('disputePspReference', i) as string;
          const merchantAccount = this.getNodeParameter('merchantAccount', i) as string;
          
          const body = {
            disputePspReference,
            merchantAccount,
          };
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/acceptDispute`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }
  
  return returnData;
}
