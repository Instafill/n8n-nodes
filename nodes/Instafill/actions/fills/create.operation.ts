import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { instafillApiRequest } from '../../shared/transport';
import { validateObjectId } from '../../shared/validators';

export const description: INodeProperties[] = [
	{
		displayName: 'Form Name or ID',
		name: 'formId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getForms',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['fill'],
				operation: ['create'],
			},
		},
		description:
			'The form to fill. Find your forms <a href="https://instafill.ai/forms">here</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Source File URLs',
		name: 'fileUrls',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add File URL',
		displayOptions: {
			show: {
				resource: ['fill'],
				operation: ['create'],
			},
		},
		description: 'URLs of source files (PDF, DOCX, DOC, TXT) to extract data from',
		options: [
			{
				displayName: 'URL',
				name: 'urlItem',
				values: [
					{
						displayName: 'URL',
						name: 'url',
						type: 'string',
						default: '',
						description: 'HTTPS URL of a source file (PDF, DOCX, DOC, or TXT)',
						placeholder: 'e.g. https://example.com/document.pdf',
					},
				],
			},
		],
	},
	{
		displayName: 'Source Text',
		name: 'textInfo',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		displayOptions: {
			show: {
				resource: ['fill'],
				operation: ['create'],
			},
		},
		description:
			'Text data to use for filling the form. Can include names, addresses, or any relevant information.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const formIdRaw = this.getNodeParameter('formId', i) as string;

	let formId: string;

	try {
		formId = validateObjectId(formIdRaw, 'Form ID');
	} catch {
		throw new NodeOperationError(this.getNode(), 'Invalid Form ID', {
			description:
				'The Form ID must be a 24-character identifier. You can find your Form IDs in the Instafill.ai dashboard at https://instafill.ai/forms.',
			itemIndex: i,
		});
	}

	const body: IDataObject = { form_id: formId };

	const fileUrlsParam = this.getNodeParameter('fileUrls', i, {}) as IDataObject;
	const urlItems = (fileUrlsParam.urlItem as IDataObject[]) || [];
	const validUrls = urlItems
		.map((item) => (item.url as string) || '')
		.filter((url) => url.startsWith('https'));

	if (validUrls.length > 0) {
		body.file_urls = validUrls;
	}

	const textInfo = this.getNodeParameter('textInfo', i, '') as string;

	if (textInfo) {
		body.text_info = textInfo;
	}

	const response = (await instafillApiRequest.call(
		this,
		'POST',
		'/v1/sessions',
		body,
	)) as IDataObject;

	return [
		{
			json: { id: response.session_id },
			pairedItem: { item: i },
		},
	];
}
