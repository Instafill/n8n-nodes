import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { checkIfFlatDescription } from './operations/checkIfFlat';
import { convertPdfDescription } from './operations/covertPdf';
import { getConversionStatusDescription } from './operations/getConversionStatus';
import { instafillApiRequest } from './shared/transport';

export class Instafill implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instafill.ai',
		name: 'instafill',
		icon: 'file:../../icons/instafill.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
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
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(responseData as IDataObject),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
				}

				if (operation === 'getConversionStatus') {
					const jobId = this.getNodeParameter('jobId', i) as string;

					const response = await instafillApiRequest.call(
						this,
						'GET',
						`/v1/utils/convert/${jobId}/status`,
					);

					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(response as IDataObject),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
				}

				if (operation === 'checkIfFlat') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

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
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(responseData as IDataObject),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
