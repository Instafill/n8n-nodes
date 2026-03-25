import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import { instafillApiRequest } from '../../shared/transport';
import { validateObjectId } from '../../shared/validators';

export const description: INodeProperties[] = [
	{
		displayName: 'Fill ID',
		name: 'fillId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. abc123def456abc123def456',
		displayOptions: {
			show: {
				resource: ['fill'],
				operation: ['get'],
			},
		},
		description: 'The ID of the fill returned by the Create operation',
	},
];

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const fillIdRaw = this.getNodeParameter('fillId', i) as string;

	let fillId: string;

	try {
		fillId = validateObjectId(fillIdRaw, 'Fill ID');
	} catch {
		throw new NodeOperationError(this.getNode(), 'Invalid Fill ID', {
			description:
				'The Fill ID must be a 24-character identifier. It is returned by the Create operation.',
			itemIndex: i,
		});
	}

	let response: IDataObject;

	try {
		response = (await instafillApiRequest.call(
			this,
			'GET',
			`/v1/sessions/${fillId}`,
		)) as IDataObject;
	} catch (error) {
		if ((error as NodeApiError).httpCode === '404') {
			return [];
		}

		throw error;
	}

	return [
		{
			json: {
				id: fillId,
				status: response.status,
				filled_form_url: response.filled_form_url || null,
			},
			pairedItem: { item: i },
		},
	];
}
