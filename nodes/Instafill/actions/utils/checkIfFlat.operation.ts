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
				operation: ['checkIfFlat'],
			},
		},
		description: 'The name of the input data field containing the PDF file to check',
	},
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
	const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

	if (binaryData.length === 0) {
		throw new NodeOperationError(this.getNode(), 'The PDF file is empty', {
			description: `The field 'Input Data Field Name' contains an empty file. Please provide a valid PDF.`,
			itemIndex: i,
		});
	}

	const response = await instafillApiRequest.call(
		this,
		'POST',
		'/v1/utils/check-flat',
		binaryData,
		{},
		{ 'Content-Type': 'application/pdf' },
		false,
	);

	const responseData = typeof response === 'string' ? JSON.parse(response) : response;
	return this.helpers.returnJsonArray(responseData as IDataObject).map((item) => ({
		...item,
		pairedItem: { item: i },
	}));
}
