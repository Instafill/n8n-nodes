import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

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

			// Convert PDF fields
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						operation: ['convertPdf'],
					},
				},
				description: 'The name of the input binary field containing the PDF file to convert',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['convertPdf'],
					},
				},
				options: [
					{
						displayName: 'Allow Checkboxes',
						name: 'allowCheckboxes',
						type: 'boolean',
						default: true,
						description: 'Whether to detect checkboxes in the PDF',
					},
					{
						displayName: 'Auto Confirm',
						name: 'autoConfirm',
						type: 'boolean',
						default: false,
						description: 'Whether to automatically confirm detected fields',
					},
					{
						displayName: 'Confidence',
						name: 'confidence',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberStepSize: 0.1,
						},
						default: 0.1,
						description: 'Confidence threshold for field detection',
					},
					{
						displayName: 'Pages',
						name: 'pages',
						type: 'string',
						default: '',
						description: 'Specific pages to convert (e.g., "1,3,5" or "1-3"',
					},
					{
						displayName: 'Resolution',
						name: 'resolution',
						type: 'number',
						default: 1600,
						description: 'Image resolution for processing',
					},
					{
						displayName: 'Use Cache',
						name: 'useCache',
						type: 'boolean',
						default: true,
						description: 'Whether to use cached results if available',
					},
				],
			},

			// Get Conversion Status fields
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['getConversionStatus'],
					},
				},
				description: 'The ID of the conversion job to check',
			},

			// Check If Flat fields
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						operation: ['checkIfFlat'],
					},
				},
				description: 'The name of the input binary field containing the PDF file to check',
			},
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

					const requestOptions: IHttpRequestOptions = {
						method: 'POST',
						url: 'https://api.instafill.ai/v1/utils/convert',
						body: binaryData,
						headers: {
							'Content-Type': 'application/pdf',
							'X-Use-Cache': String(options.useCache ?? true),
						},
						qs,
						json: true,
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'instafillApi',
						requestOptions,
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

					const requestOptions: IHttpRequestOptions = {
						method: 'GET',
						url: `https://api.instafill.ai/v1/utils/convert/${jobId}/status`,
						json: true,
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'instafillApi',
						requestOptions,
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

					const requestOptions: IHttpRequestOptions = {
						method: 'POST',
						url: 'https://api.instafill.ai/v1/utils/check-flat',
						body: binaryData,
						headers: {
							'Content-Type': 'application/pdf',
						},
						json: false,
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'instafillApi',
						requestOptions,
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
				throw error;
			}
		}

		return [returnData];
	}
}
