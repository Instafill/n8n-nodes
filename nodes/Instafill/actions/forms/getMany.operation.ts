import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { instafillApiRequest } from '../../shared/transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Search Query',
		name: 'query',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. W-9',
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['getMany'],
			},
		},
		description: 'The form name or keyword to search for',
	},
];

interface FormSearchItem {
	form_id?: string;
	idInternal?: string;
	formName: string;
	status: string;
	created: string;
	modified: string;
}

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const query = (this.getNodeParameter('query', i) as string).trim();

	if (!query) {
		throw new NodeOperationError(this.getNode(), 'Search query is empty', {
			description: 'Please enter a form name or keyword to search for.',
			itemIndex: i,
		});
	}

	const response = (await instafillApiRequest.call(
		this,
		'GET',
		'/v1/forms/search',
		undefined,
		{ q: query, limit: '20' },
	)) as { forms: FormSearchItem[] };

	const forms = response.forms || [];

	return forms.map((form) => ({
		json: {
			id: form.form_id || form.idInternal,
			form_name: form.formName,
			status: form.status,
			created: form.created,
			modified: form.modified,
		} as IDataObject,
		pairedItem: { item: i },
	}));
}
