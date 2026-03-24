import type { INodeProperties } from 'n8n-workflow';

import * as upload from './upload.operation';
import * as getMany from './getMany.operation';

export { upload, getMany };

export const formsOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['form'],
		},
	},
	options: [
		{
			name: 'Get Many',
			value: 'getMany',
			description: 'Search for forms in your workspace by name',
			action: 'Search for forms in workspace',
		},
		{
			name: 'Upload',
			value: 'upload',
			description: 'Upload a PDF form to your Instafill.ai workspace',
			action: 'Upload PDF form to workspace',
		},
	],
	default: 'upload',
};

export const formsFields: INodeProperties[] = [
	...upload.description,
	...getMany.description,
];
