import type { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as get from './get.operation';

export { create, get };

export const fillsOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['fill'],
		},
	},
	options: [
		{
			name: 'Create',
			value: 'create',
			description: 'Fill a PDF form with data from provided sources using AI',
			action: 'Fill form with data from provided sources',
		},
		{
			name: 'Get',
			value: 'get',
			description: 'Retrieve the status of a form fill by its ID',
			action: 'Get fill status by ID',
		},
	],
	default: 'create',
};

export const fillsFields: INodeProperties[] = [
	...create.description,
	...get.description,
];
