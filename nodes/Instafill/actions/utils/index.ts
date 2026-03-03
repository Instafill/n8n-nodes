import type { INodeProperties } from 'n8n-workflow';

import * as checkIfFlat from './checkIfFlat.operation';
import * as convertPdf from './convertPdf.operation';
import * as getConversionStatus from './getConversionStatus.operation';

export { checkIfFlat, convertPdf, getConversionStatus };

export const utilsOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	options: [
		{
			name: 'Check If Flat',
			value: 'checkIfFlat',
			description: 'Check whether PDF form is flat or fillable',
			action: 'Check whether PDF form is flat or fillable',
		},
		{
			name: 'Convert PDF',
			value: 'convertPdf',
			description: 'Convert flat PDF form into a fillable one',
			action: 'Convert flat PDF form into a fillable one',
		},
		{
			name: 'Get Conversion Status',
			value: 'getConversionStatus',
			description: 'Get status of PDF conversion job',
			action: 'Get status of PDF conversion job',
		},
	],
	default: 'convertPdf',
};

export const utilsFields: INodeProperties[] = [
	...convertPdf.description,
	...getConversionStatus.description,
	...checkIfFlat.description,
];
