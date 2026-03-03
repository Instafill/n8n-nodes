import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { checkIfFlatDescription } from './operations/checkIfFlat';
import { convertPdfDescription } from './operations/convertPdf';
import { getConversionStatusDescription } from './operations/getConversionStatus';
import { instafillApiRequest } from './shared/transport';

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
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Convert PDF',
						value: 'convertPdf',
						description: 'Convert a flat PDF form into a fillable one',
						action: 'Convert a flat PDF form into a fillable one',
					},
					{
						name: 'Get Conversion Status',
						value: 'getConversionStatus',
						description: 'Get the status of a PDF conversion job',
						action: 'Get the status of a PDF conversion job',
					},
					{
						name: 'Check If Flat',
						value: 'checkIfFlat',
						description: 'Check whether a PDF form is flat or fillable',
						action: 'Check whether a PDF form is flat or fillable',
					},
				],
				default: 'convertPdf',
			},
			...convertPdfDescription,
			...getConversionStatusDescription,
			...checkIfFlatDescription,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'convertPdf') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const options = this.getNodeParameter('options', i) as IDataObject;
					const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

					if (binaryData.length === 0) {
						throw new NodeOperationError(this.getNode(), 'The PDF file is empty', {
							description: 'The input binary field contains an empty file. Please provide a valid PDF.',
							itemIndex: i,
						});
					}

					const qs: IDataObject = {};

					if (options.pages) qs.pages = options.pages;
					if (options.confidence !== undefined) qs.confidence = options.confidence;
					if (options.resolution !== undefined) qs.resolution = options.resolution;
					if (options.allowCheckboxes !== undefined) qs.allow_checkboxes = options.allowCheckboxes;
					if (options.autoConfirm !== undefined) qs.auto_confirm = options.autoConfirm;

					const response = await instafillApiRequest.call(
						this,
						'POST',
						'/v1/utils/convert',
						binaryData,
						qs,
						{
							'Content-Type': 'application/pdf',
							'X-Use-Cache': String(options.useCache ?? true),
						},
						false,
					);

					const responseData = typeof response === 'string' ? JSON.parse(response) : response;
					returnData.push(...this.helpers.returnJsonArray(responseData as IDataObject).map((item) => ({
						...item,
						pairedItem: { item: i },
					})));
				}

				if (operation === 'getConversionStatus') {
					const jobId = this.getNodeParameter('jobId', i) as string;

					if (!jobId.trim()) {
						throw new NodeOperationError(this.getNode(), 'Job ID is required', {
							description: 'Please provide a valid Job ID to check the conversion status.',
							itemIndex: i,
						});
					}

					const response = await instafillApiRequest.call(
						this,
						'GET',
						`/v1/utils/convert/${jobId}/status`,
					);

					returnData.push(...this.helpers.returnJsonArray(response as IDataObject).map((item) => ({
						...item,
						pairedItem: { item: i },
					})));
				}

				if (operation === 'checkIfFlat') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

					if (binaryData.length === 0) {
						throw new NodeOperationError(this.getNode(), 'The PDF file is empty', {
							description: 'The input binary field contains an empty file. Please provide a valid PDF.',
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
					returnData.push(...this.helpers.returnJsonArray(responseData as IDataObject).map((item) => ({
						...item,
						pairedItem: { item: i },
					})));
				}
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
