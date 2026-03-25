import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { instafillApiRequest } from '../../shared/transport';
import { validateObjectId } from '../../shared/validators';

export const description: INodeProperties[] = [
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. abc123def456abc123def456',
		displayOptions: {
			show: {
				operation: ['getConversionStatus'],
			},
		},
		description: 'The ID of the conversion job to check',
	},
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const jobIdRaw = this.getNodeParameter('jobId', i) as string;

	let jobId: string;

	try {
		jobId = validateObjectId(jobIdRaw, 'Job ID');
	} catch {
		throw new NodeOperationError(this.getNode(), 'Invalid Job ID', {
			description:
				'The Job ID must be a 24-character identifier. It is returned by the Convert PDF operation.',
			itemIndex: i,
		});
	}

	const response = (await instafillApiRequest.call(
		this,
		'GET',
		`/v1/utils/convert/${jobId}/status`,
	)) as IDataObject;

	delete response.base64;

	return this.helpers.returnJsonArray(response).map((item) => ({
		...item,
		pairedItem: { item: i },
	}));
}
