import type { INodeProperties } from 'n8n-workflow';

export const checkIfFlatDescription: INodeProperties[] = [
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				operation: ['checkIfFlat'],
			},
		},
		description: 'The name of the input binary field containing the PDF file to check',
	},
];
