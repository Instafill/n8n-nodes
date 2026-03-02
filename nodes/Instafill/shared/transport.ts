import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';

const BASE_URL = 'https://api.instafill.ai';

export async function instafillApiRequest(
	this: IExecuteFunctions | IHookFunctions,
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

	return this.helpers.httpRequestWithAuthentication.call(this, 'instafillApi', options);
}
