import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AdyenPaymentsApi implements ICredentialType {
	name = 'adyenPaymentsApi';
	displayName = 'Adyen Payments API';
	documentationUrl = 'https://docs.adyen.com/api-explorer/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'API key from your Adyen Customer Area',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Test',
					value: 'test',
				},
				{
					name: 'Live',
					value: 'live',
				},
			],
			default: 'test',
			description: 'Choose between test and live environment',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://checkout-test.adyen.com/v71',
			description: 'Base URL for the Adyen API',
		},
	];
}