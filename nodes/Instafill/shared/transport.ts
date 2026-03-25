import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

const BASE_URL = 'https://api.instafill.ai';

const STATUS_MESSAGES: Record<number, string> = {
	401: 'Invalid API key. Please check your Instafill.ai credentials.',
	403: 'Access denied. Your API key does not have permission for this action.',
	429: 'Too many requests. Please wait a moment and try again.',
}

export async function instafillApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body?: Buffer | IDataObject,
	qs: IDataObject = {},
	headers: Record<string, string> = {},
	json = true,
) {
	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${resource}`,
		qs,
		headers,
		json,
	};

	if (body !== undefined) {
		options.body = body;
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(
			this,
			'instafillApi',
			options,
		);
	} catch (error) {
		const statusCode = (error as { httpCode?: string }).httpCode;

		if (statusCode && STATUS_MESSAGES[Number(statusCode)]) {
			(error as Error).message = STATUS_MESSAGES[Number(statusCode)];
		}

		throw error;
	}
}
