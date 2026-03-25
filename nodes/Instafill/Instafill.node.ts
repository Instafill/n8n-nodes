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
	utilsOperations,
	utilsFields,
} from './actions/utils';

import {
	upload as formsUpload,
	getMany as formsGetMany,
	formsOperations,
	formsFields,
} from './actions/forms';

import {
	create as fillsCreate,
	get as fillsGet,
	fillsOperations,
	fillsFields,
} from './actions/fills';

import { getForms } from './methods/loadOptions';

type OperationExecuteFn = (this: IExecuteFunctions, i: number) => Promise<INodeExecutionData[]>;

export class Instafill implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instafill.ai',
		name: 'instafill',
		icon: 'file:../../icons/instafill.svg',
		group: ['transform'],
		version: [1, 2],
		subtitle:
			'={{ $parameter["resource"] ? $parameter["operation"] + ": " + $parameter["resource"] : {"convertPdf": "Convert PDF", "getConversionStatus": "Get Conversion Status", "checkIfFlat": "Check If Flat"}[$parameter["operation"]] }}',
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
		properties: [
			// v2: Resource selector (hidden in v1)
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Fill', value: 'fill' },
					{ name: 'Form', value: 'form' },
					{ name: 'Utility', value: 'utility' },
				],
				default: 'form',
				displayOptions: {
					show: {
						'@version': [2],
					},
				},
			},
			// v1: Legacy operation selector (no resource, shown only in v1)
			{
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
				displayOptions: {
					show: {
						'@version': [1],
					},
				},
			},
			// v2: Per-resource operation selectors
			fillsOperations,
			formsOperations,
			utilsOperations,
			// Utils fields work in both v1 and v2 (operation values are unique across resources)
			...utilsFields,
			// v2: New resource-specific fields
			...fillsFields,
			...formsFields,
		],
	};

	methods = {
		loadOptions: {
			getForms,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const nodeVersion = this.getNode().typeVersion;

		let executeFn: OperationExecuteFn | undefined;

		if (nodeVersion === 1) {
			const operation = this.getNodeParameter('operation', 0);
			const v1Map: Record<string, OperationExecuteFn> = {
				convertPdf: convertPdf.execute,
				getConversionStatus: getConversionStatus.execute,
				checkIfFlat: checkIfFlat.execute,
			};
			executeFn = v1Map[operation];
		} else {
			const resource = this.getNodeParameter('resource', 0) as string;
			const operation = this.getNodeParameter('operation', 0) as string;
			const v2Map: Record<string, Record<string, OperationExecuteFn>> = {
				fill: {
					create: fillsCreate.execute,
					get: fillsGet.execute,
				},
				form: {
					upload: formsUpload.execute,
					getMany: formsGetMany.execute,
				},
				utility: {
					convertPdf: convertPdf.execute,
					getConversionStatus: getConversionStatus.execute,
					checkIfFlat: checkIfFlat.execute,
				},
			};
			executeFn = v2Map[resource]?.[operation];
		}

		if (!executeFn) {
			throw new NodeOperationError(
				this.getNode(),
				`Unknown operation: ${this.getNodeParameter('operation', 0)}`,
			);
		}

		for (let i = 0; i < items.length; i++) {
			try {
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
