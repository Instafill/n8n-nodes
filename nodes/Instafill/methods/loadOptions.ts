import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { instafillApiRequest } from '../shared/transport';

interface FormListItem {
	form_id: string;
	formName: string;
	processed: boolean;
}

export async function getForms(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const response = (await instafillApiRequest.call(this, 'GET', '/v1/forms')) as {
			forms: FormListItem[];
		};
		const forms = response.forms || [];

		return forms
			.filter((form) => form.processed)
			.map((form) => ({
				name: form.formName,
				value: form.form_id,
			}));
	} catch {
		return [];
	}
}
