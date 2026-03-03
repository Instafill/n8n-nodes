import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class InstafillApi implements ICredentialType {
	name = 'instafillApi';

	displayName = 'Instafill.ai API';

	icon = 'file:../icons/instafill.svg' as const;

	documentationUrl = 'https://api.instafill.ai/swagger/index.html';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.instafill.ai',
			url: '/v1/account/me',
			method: 'GET',
		},
	};
}
