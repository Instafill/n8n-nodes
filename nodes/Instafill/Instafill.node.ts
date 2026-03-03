import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import {
	checkIfFlat,
	convertPdf,
	getConversionStatus,
	utilsFields,
	utilsOperations,
} from './actions/utils';

export class Instafill implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instafill.ai',
		name: 'instafill',
		icon: 'file:../../icons/instafill.svg',
		group: ['transform'],
		version: 1,
		subtitle:
			'={{ {"convertPdf": "Convert PDF", "getConversionStatus": "Get Conversion Status", "checkIfFlat": "Check If Flat"}[$parameter["operation"]] }}',
		description: 'Interact with the Instafill.ai API',
		defaults: {
			name: 'Instafill.ai',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'instafillApi',
				required: true,
			},
		],
		properties: [utilsOperations, ...utilsFields],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0);

		const operationMap: Record<
			string,
			(this: IExecuteFunctions, i: number) => Promise<INodeExecutionData[]>
		> = {
			convertPdf: convertPdf.execute,
			getConversionStatus: getConversionStatus.execute,
			checkIfFlat: checkIfFlat.execute,
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const executeFn = operationMap[operation];
				const results = await executeFn.call(this, i);
				returnData.push(...results);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}

				if (error instanceof NodeOperationError) {
					throw error;
				}

				throw new NodeApiError(this.getNode(), error as JsonObject, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
