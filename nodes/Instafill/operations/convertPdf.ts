import type { INodeProperties } from 'n8n-workflow';

export const convertPdfDescription: INodeProperties[] = [
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				operation: ['convertPdf'],
			},
		},
		description: 'The name of the input binary field containing the PDF file to convert',
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
				description: 'Whether to detect checkboxes in the PDF',
			},
			{
				displayName: 'Auto Confirm',
				name: 'autoConfirm',
				type: 'boolean',
				default: false,
				description: 'Whether to automatically confirm detected fields',
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
				description: 'Confidence threshold for field detection',
			},
			{
				displayName: 'Pages',
				name: 'pages',
				type: 'string',
				default: '',
				placeholder: 'e.g., 1,3,5 or 1-3',
				description: 'Specific pages to convert (e.g. "1,3,5" or "1-3")',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'number',
				default: 1600,
				hint: 'Higher resolution improves accuracy but increases processing time',
				description: 'Image resolution for processing',
			},
			{
				displayName: 'Use Cache',
				name: 'useCache',
				type: 'boolean',
				default: true,
				description: 'Whether to use cached results if available',
			},
		],
	},
];
