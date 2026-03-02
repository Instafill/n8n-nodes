import type { INodeProperties } from 'n8n-workflow';

export const getConversionStatusDescription: INodeProperties[] = [
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: ['getConversionStatus'],
			},
		},
		description: 'The ID of the conversion job to check',
	},
];
