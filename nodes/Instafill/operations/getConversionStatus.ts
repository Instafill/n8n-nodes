import type { INodeProperties } from 'n8n-workflow';

export const getConversionStatusDescription: INodeProperties[] = [
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g., abc123def456abc123def456',
		displayOptions: {
			show: {
				operation: ['getConversionStatus'],
			},
		},
		description: 'The ID of the conversion job to check',
	},
];
