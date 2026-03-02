import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { instafillApiRequest } from './shared/transport';

export class InstafillTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instafill.ai Trigger',
		name: 'instafillTrigger',
		icon: 'file:../../icons/instafill.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when an Instafill.ai event occurs',
		defaults: {
			name: 'Instafill.ai Trigger',
		},
		usableAsTool: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'instafillApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Form Converted',
						value: 'form_converted',
						description: 'Triggers when a PDF form conversion completes',
					},
				],
				default: 'form_converted',
				required: true,
				description: 'The event to listen for',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				return webhookData.webhookId !== undefined;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const webhookData = this.getWorkflowStaticData('node');
				const event = this.getNodeParameter('event', 0) as string;

				const response = (await instafillApiRequest.call(
					this,
					'POST',
					'/v1/integrations/n8n/hooks/subscribe',
					{
						hookUrl: webhookUrl,
						event_type: event,
					},
				)) as IDataObject;

				webhookData.webhookId = response.id as string;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookId = webhookData.webhookId as string;

				if (!webhookId) {
					return true;
				}

				try {
					await instafillApiRequest.call(
						this,
						'DELETE',
						`/v1/integrations/n8n/hooks/${webhookId}`,
					);
				} catch {
					return false;
				}

				delete webhookData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;

		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
