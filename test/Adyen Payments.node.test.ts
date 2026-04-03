/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { AdyenPayments } from '../nodes/Adyen Payments/Adyen Payments.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('AdyenPayments Node', () => {
  let node: AdyenPayments;

  beforeAll(() => {
    node = new AdyenPayments();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Adyen Payments');
      expect(node.description.name).toBe('adyenpayments');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('PaymentSessions Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://checkout-test.adyen.com/v71'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('createSession operation', () => {
    it('should create a payment session successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createSession')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce('USD')
        .mockReturnValueOnce('US')
        .mockReturnValueOnce('TestMerchant')
        .mockReturnValueOnce('https://example.com/return');

      const mockResponse = { sessionData: 'test-session-data', id: 'session-123' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePaymentSessionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://checkout-test.adyen.com/v71/sessions',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          amount: { value: 1000, currency: 'USD' },
          countryCode: 'US',
          merchantAccount: 'TestMerchant',
          returnUrl: 'https://example.com/return',
        },
        json: true,
      });
    });

    it('should handle createSession errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createSession');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executePaymentSessionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getSession operation', () => {
    it('should get session details successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getSession')
        .mockReturnValueOnce('session-123');

      const mockResponse = { id: 'session-123', status: 'active' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePaymentSessionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://checkout-test.adyen.com/v71/sessions/session-123',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('setupSession operation', () => {
    it('should setup session with payment method successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('setupSession')
        .mockReturnValueOnce('session-123')
        .mockReturnValueOnce('{"type": "card", "number": "4111111111111111"}');

      const mockResponse = { status: 'setup-complete' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePaymentSessionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://checkout-test.adyen.com/v71/sessions/session-123/setup',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          paymentMethod: { type: 'card', number: '4111111111111111' },
        },
        json: true,
      });
    });

    it('should handle invalid JSON in payment method', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('setupSession')
        .mockReturnValueOnce('session-123')
        .mockReturnValueOnce('invalid-json');

      await expect(
        executePaymentSessionsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Invalid JSON in payment method');
    });
  });
});

describe('Payments Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://checkout-test.adyen.com/v71'
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	it('should authorize payment successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('authorizePayment')
			.mockReturnValueOnce(1000)
			.mockReturnValueOnce('USD')
			.mockReturnValueOnce({ type: 'scheme', number: '4111111111111111' })
			.mockReturnValueOnce('TestMerchant')
			.mockReturnValueOnce('TEST-REF-123');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			resultCode: 'Authorised',
			pspReference: 'PSP123456',
		});

		const result = await executePaymentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.resultCode).toBe('Authorised');
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://checkout-test.adyen.com/v71/payments',
			headers: {
				'X-API-Key': 'test-api-key',
				'Content-Type': 'application/json',
			},
			body: {
				amount: { value: 1000, currency: 'USD' },
				paymentMethod: { type: 'scheme', number: '4111111111111111' },
				merchantAccount: 'TestMerchant',
				reference: 'TEST-REF-123',
			},
			json: true,
		});
	});

	it('should capture payment successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('capturePayment')
			.mockReturnValueOnce('PSP123456')
			.mockReturnValueOnce(1000)
			.mockReturnValueOnce('USD');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			status: 'received',
			pspReference: 'CAP123456',
		});

		const result = await executePaymentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.status).toBe('received');
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://checkout-test.adyen.com/v71/payments/PSP123456/captures',
			headers: {
				'X-API-Key': 'test-api-key',
				'Content-Type': 'application/json',
			},
			body: {
				amount: { value: 1000, currency: 'USD' },
			},
			json: true,
		});
	});

	it('should cancel payment successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('cancelPayment')
			.mockReturnValueOnce('PSP123456')
			.mockReturnValueOnce('TestMerchant');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			status: 'received',
			pspReference: 'CAN123456',
		});

		const result = await executePaymentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.status).toBe('received');
	});

	it('should refund payment successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('refundPayment')
			.mockReturnValueOnce('PSP123456')
			.mockReturnValueOnce(500)
			.mockReturnValueOnce('USD');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			status: 'received',
			pspReference: 'REF123456',
		});

		const result = await executePaymentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.status).toBe('received');
	});

	it('should get payment successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getPayment')
			.mockReturnValueOnce('PSP123456');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			pspReference: 'PSP123456',
			status: 'Authorised',
			amount: { value: 1000, currency: 'USD' },
		});

		const result = await executePaymentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.pspReference).toBe('PSP123456');
	});

	it('should handle API errors gracefully', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('authorizePayment');
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const result = await executePaymentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('API Error');
	});

	it('should throw error for unknown operation', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

		await expect(
			executePaymentsOperations.call(mockExecuteFunctions, [{ json: {} }])
		).rejects.toThrow('Unknown operation: unknownOperation');
	});
});

describe('Payment Links Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://checkout-test.adyen.com/v71'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  describe('createPaymentLink', () => {
    it('should create a payment link successfully', async () => {
      const mockResponse = { id: 'PL123', url: 'https://checkoutshopper-test.adyen.com/pay/PL123' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createPaymentLink')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce('EUR')
        .mockReturnValueOnce('TestMerchant')
        .mockReturnValueOnce('REF123')
        .mockReturnValueOnce('Test payment link');

      const items = [{ json: {} }];
      const result = await executePaymentLinksOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://checkout-test.adyen.com/v71/paymentLinks',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: { value: 1000, currency: 'EUR' },
          merchantAccount: 'TestMerchant',
          reference: 'REF123',
          description: 'Test payment link',
        }),
        json: true,
      });
    });

    it('should handle createPaymentLink error', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.getNodeParameter.mockReturnValue('createPaymentLink');
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executePaymentLinksOperations.call(mockExecuteFunctions, items);

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getPaymentLink', () => {
    it('should get payment link successfully', async () => {
      const mockResponse = { id: 'PL123', status: 'active' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getPaymentLink')
        .mockReturnValueOnce('PL123');

      const items = [{ json: {} }];
      const result = await executePaymentLinksOperations.call(mockExecuteFunctions, items);

      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://checkout-test.adyen.com/v71/paymentLinks/PL123',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('updatePaymentLink', () => {
    it('should update payment link successfully', async () => {
      const mockResponse = { id: 'PL123', status: 'completed' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updatePaymentLink')
        .mockReturnValueOnce('PL123')
        .mockReturnValueOnce('completed');

      const items = [{ json: {} }];
      const result = await executePaymentLinksOperations.call(mockExecuteFunctions, items);

      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PATCH',
        url: 'https://checkout-test.adyen.com/v71/paymentLinks/PL123',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
        json: true,
      });
    });
  });
});

describe('RecurringPayments Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://checkout-test.adyen.com/v71',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('createRecurringPayment', () => {
		it('should create a recurring payment successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createRecurringPayment')
				.mockReturnValueOnce('LATEST')
				.mockReturnValueOnce('shopper123')
				.mockReturnValueOnce('TestMerchant')
				.mockReturnValueOnce({ currency: 'EUR', value: 1000 })
				.mockReturnValueOnce({ reference: 'test-payment' });

			const mockResponse = { resultCode: 'Authorised', pspReference: 'test-psp-ref' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeRecurringPaymentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://checkout-test.adyen.com/v71/payments',
				headers: {
					'X-API-Key': 'test-api-key',
					'Content-Type': 'application/json',
				},
				body: {
					selectedRecurringDetailReference: 'LATEST',
					shopperReference: 'shopper123',
					merchantAccount: 'TestMerchant',
					amount: { currency: 'EUR', value: 1000 },
					reference: 'test-payment',
				},
				json: true,
			});

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle createRecurringPayment error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createRecurringPayment');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Payment failed'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeRecurringPaymentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Payment failed' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('listStoredPaymentMethods', () => {
		it('should list stored payment methods successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('listStoredPaymentMethods')
				.mockReturnValueOnce('shopper123')
				.mockReturnValueOnce('TestMerchant');

			const mockResponse = { details: [{ recurringDetailReference: 'detail1' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeRecurringPaymentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://checkout-test.adyen.com/v71/listRecurringDetails',
				headers: {
					'X-API-Key': 'test-api-key',
					'Content-Type': 'application/json',
				},
				body: {
					shopperReference: 'shopper123',
					merchantAccount: 'TestMerchant',
					recurring: { contract: 'RECURRING' },
				},
				json: true,
			});

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle listStoredPaymentMethods error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('listStoredPaymentMethods');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('List failed'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeRecurringPaymentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'List failed' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('disableStoredPaymentMethod', () => {
		it('should disable stored payment method successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('disableStoredPaymentMethod')
				.mockReturnValueOnce('shopper123')
				.mockReturnValueOnce('TestMerchant')
				.mockReturnValueOnce('detail123');

			const mockResponse = { response: '[detail-successfully-disabled]' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeRecurringPaymentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://checkout-test.adyen.com/v71/disable',
				headers: {
					'X-API-Key': 'test-api-key',
					'Content-Type': 'application/json',
				},
				body: {
					shopperReference: 'shopper123',
					recurringDetailReference: 'detail123',
					merchantAccount: 'TestMerchant',
				},
				json: true,
			});

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle disableStoredPaymentMethod error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('disableStoredPaymentMethod');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Disable failed'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeRecurringPaymentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Disable failed' }, pairedItem: { item: 0 } }]);
		});
	});
});

describe('PaymentMethods Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://checkout-test.adyen.com/v71'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('getPaymentMethods operation', () => {
    it('should get available payment methods successfully', async () => {
      const mockResponse = {
        paymentMethods: [
          { name: 'Credit Card', type: 'scheme' },
          { name: 'PayPal', type: 'paypal' }
        ]
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getPaymentMethods')
        .mockReturnValueOnce('TEST_MERCHANT')
        .mockReturnValueOnce('NL')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce('EUR');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePaymentMethodsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://checkout-test.adyen.com/v71/paymentMethods',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json'
        },
        body: {
          merchantAccount: 'TEST_MERCHANT',
          countryCode: 'NL',
          amount: {
            value: 1000,
            currency: 'EUR'
          }
        },
        json: true
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle getPaymentMethods error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getPaymentMethods')
        .mockReturnValueOnce('TEST_MERCHANT')
        .mockReturnValueOnce('NL')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce('EUR');

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executePaymentMethodsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{
        json: { error: 'API Error' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getBalance operation', () => {
    it('should get balance for payment method successfully', async () => {
      const mockResponse = {
        balance: {
          value: 5000,
          currency: 'EUR'
        }
      };

      const paymentMethod = { type: 'giftcard', brand: 'givex' };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBalance')
        .mockReturnValueOnce('TEST_MERCHANT')
        .mockReturnValueOnce(paymentMethod);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePaymentMethodsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://checkout-test.adyen.com/v71/paymentMethods/balance',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json'
        },
        body: {
          merchantAccount: 'TEST_MERCHANT',
          paymentMethod: paymentMethod
        },
        json: true
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle getBalance error', async () => {
      const paymentMethod = { type: 'giftcard', brand: 'givex' };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBalance')
        .mockReturnValueOnce('TEST_MERCHANT')
        .mockReturnValueOnce(paymentMethod);

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Balance check failed'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(false);

      await expect(
        executePaymentMethodsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Balance check failed');
    });
  });
});

describe('Disputes Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-api-key', 
        baseUrl: 'https://checkout-test.adyen.com/v71' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('uploadDisputeDocument', () => {
    it('should upload dispute document successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('uploadDisputeDocument')
        .mockReturnValueOnce('DISPUTE123')
        .mockReturnValueOnce('base64encodeddocument');
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        disputePspReference: 'DISPUTE123',
        status: 'uploaded'
      });

      const result = await executeDisputesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://checkout-test.adyen.com/v71/defendDocument',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          disputePspReference: 'DISPUTE123',
          defenseDocument: 'base64encodeddocument'
        },
        json: true,
      });

      expect(result[0].json).toEqual({
        disputePspReference: 'DISPUTE123',
        status: 'uploaded'
      });
    });

    it('should handle upload dispute document error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('uploadDisputeDocument')
        .mockReturnValueOnce('DISPUTE123')
        .mockReturnValueOnce('base64encodeddocument');
      
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Upload failed'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeDisputesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual({ error: 'Upload failed' });
    });
  });

  describe('supplyDefenseDocument', () => {
    it('should supply defense documents successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('supplyDefenseDocument')
        .mockReturnValueOnce('DISPUTE123')
        .mockReturnValueOnce('[{"type":"receipt","data":"base64data"}]');
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        disputePspReference: 'DISPUTE123',
        status: 'supplied'
      });

      const result = await executeDisputesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://checkout-test.adyen.com/v71/supplyDefenseDocument',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          disputePspReference: 'DISPUTE123',
          defenseDocuments: [{"type":"receipt","data":"base64data"}]
        },
        json: true,
      });

      expect(result[0].json).toEqual({
        disputePspReference: 'DISPUTE123',
        status: 'supplied'
      });
    });

    it('should handle supply defense document error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('supplyDefenseDocument')
        .mockReturnValueOnce('DISPUTE123')
        .mockReturnValueOnce('[{"type":"receipt"}]');
      
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Supply failed'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeDisputesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual({ error: 'Supply failed' });
    });
  });

  describe('acceptDispute', () => {
    it('should accept dispute successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('acceptDispute')
        .mockReturnValueOnce('DISPUTE123')
        .mockReturnValueOnce('TestMerchant');
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        disputePspReference: 'DISPUTE123',
        status: 'accepted'
      });

      const result = await executeDisputesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://checkout-test.adyen.com/v71/acceptDispute',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          disputePspReference: 'DISPUTE123',
          merchantAccount: 'TestMerchant'
        },
        json: true,
      });

      expect(result[0].json).toEqual({
        disputePspReference: 'DISPUTE123',
        status: 'accepted'
      });
    });

    it('should handle accept dispute error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('acceptDispute')
        .mockReturnValueOnce('DISPUTE123')
        .mockReturnValueOnce('TestMerchant');
      
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Accept failed'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeDisputesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual({ error: 'Accept failed' });
    });
  });
});
});
