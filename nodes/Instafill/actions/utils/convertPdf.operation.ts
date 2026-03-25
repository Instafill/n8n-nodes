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
		displayName: 'Input Data Field Name',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				operation: ['convertPdf'],
			},
		},
		description: 'The name of the input data field containing the PDF file to convert',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: ['convertPdf'],
			},
		},
		options: [
			{
				displayName: 'Allow Checkboxes',
				name: 'allowCheckboxes',
				type: 'boolean',
				default: true,
				description: 'Whether to detect checkboxes in the PDF. Defaults to true.',
			},
			{
				displayName: 'Auto Confirm',
				name: 'autoConfirm',
				type: 'boolean',
				default: false,
				description: 'Whether to automatically confirm detected fields. Defaults to false.',
			},
			{
				displayName: 'Confidence',
				name: 'confidence',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 0.1,
				hint: 'Lower values detect more fields but may include false positives',
				description: 'Confidence threshold for field detection. Defaults to 0.1.',
			},
			{
				displayName: 'Pages',
				name: 'pages',
				type: 'string',
				default: '',
				placeholder: 'e.g. 1,3,5 or 1-3',
				description: 'Specific pages to convert (e.g. "1,3,5" or "1-3")',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'number',
				default: 1600,
				hint: 'Higher resolution improves accuracy but increases processing time',
				description: 'Image resolution for processing. Defaults to 1600.',
			},
			{
				displayName: 'Use Cache',
				name: 'useCache',
				type: 'boolean',
				default: true,
				description: 'Whether to use cached results if available. Defaults to true.',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
	const options = this.getNodeParameter('options', i) as IDataObject;
	const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

	if (binaryData.length === 0) {
		throw new NodeOperationError(this.getNode(), 'The PDF file is empty', {
			description: `The field 'Input Data Field Name' contains an empty file. Please provide a valid PDF.`,
			itemIndex: i,
		});
	}

	const qs: IDataObject = {};

	if (options.pages) qs.pages = options.pages;
	if (options.confidence !== undefined) qs.confidence = options.confidence;
	if (options.resolution !== undefined) qs.resolution = options.resolution;
	if (options.allowCheckboxes !== undefined) qs.allow_checkboxes = options.allowCheckboxes;
	if (options.autoConfirm !== undefined) qs.auto_confirm = options.autoConfirm;

	const response = await instafillApiRequest.call(
		this,
		'POST',
		'/v1/utils/convert',
		binaryData,
		qs,
		{
			'Content-Type': 'application/pdf',
			'X-Use-Cache': String(options.useCache ?? true),
		},
		false,
	);

	const responseData = typeof response === 'string' ? JSON.parse(response) : response;
	return this.helpers.returnJsonArray(responseData as IDataObject).map((item) => ({
		...item,
		pairedItem: { item: i },
	}));
}
