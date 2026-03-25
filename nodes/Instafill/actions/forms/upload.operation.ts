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
				resource: ['form'],
				operation: ['upload'],
			},
		},
		description:
			'The name of the input data field containing the PDF file to upload',
	},
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['upload'],
			},
		},
		placeholder: 'e.g. tax-form.pdf',
		description:
			'Name for the uploaded file. If omitted, the original file name is used.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const binaryPropertyName = this.getNodeParameter(
		'binaryPropertyName',
		i,
	) as string;
	const binaryData = await this.helpers.getBinaryDataBuffer(
		i,
		binaryPropertyName,
	);

	if (binaryData.length === 0) {
		throw new NodeOperationError(this.getNode(), 'No file data found', {
			description: `The field '${binaryPropertyName}' does not contain any data. Make sure a previous node provides a file.`,
			itemIndex: i,
		});
	}

	const header = binaryData.subarray(0, 4).toString('utf8');

	if (header !== '%PDF') {
		throw new NodeOperationError(
			this.getNode(),
			'The file is not a valid PDF',
			{
				description:
					'The uploaded file does not appear to be a PDF document. Please check that the file starts with a valid PDF header.',
				itemIndex: i,
			},
		);
	}

	const inputData = this.getInputData();
	const binaryMeta = inputData[i]?.binary?.[binaryPropertyName];
	const fileNameParam = this.getNodeParameter('fileName', i, '') as string;
	const fileName = fileNameParam || binaryMeta?.fileName || 'document.pdf';

	const response = await instafillApiRequest.call(
		this,
		'POST',
		'/v1/forms/upload',
		binaryData,
		{},
		{
			'Content-Type': 'application/pdf',
			'X-File-Name': fileName,
		},
		false,
	);

	const responseData =
		typeof response === 'string' ? JSON.parse(response) : response;

	return [
		{
			json: {
				id: (responseData as IDataObject).form_id,
				file_name: (responseData as IDataObject).file_name,
			},
			pairedItem: { item: i },
		},
	];
}
