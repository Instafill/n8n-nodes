# n8n-nodes-instafill

This is a n8n community node. It lets you use [Instafill.ai](https://instafill.ai) in your n8n workflows.

Instafill.ai is an AI-powered form automation platform. It fills PDF and Word forms in seconds — extracting fields, mapping your data semantically, and completing forms automatically. Used by legal, insurance, healthcare, and finance teams to eliminate manual data entry at scale.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Instafill.ai (Action node)

- **Convert PDF** — Convert a flat (non-interactive) PDF into a fillable form. Returns a job ID to track the conversion.
- **Get Conversion Status** — Check the status of a conversion job. Returns the result and a link to the fillable form when complete.
- **Check If Flat** — Determine whether a PDF is already fillable or needs to be converted first.

### Instafill.ai Trigger

- **Form Converted** — Triggers when a PDF conversion job completes. Use this to start a workflow automatically as soon as a fillable form is ready.

## Credentials

To authenticate with Instafill.ai, you need an API key.

**Prerequisites:** An active [Instafill.ai](https://instafill.ai) account.

You can find your API key in your [workspace API settings](https://instafill.ai/settings/workspace/api).

**Setting up credentials in n8n:**

1. In n8n, open **Credentials** and create a new credential of type **Instafill.ai API**.
2. Paste your API key into the **API Key** field.
3. Click **Save** — n8n will verify the key automatically.

## Example Workflow

**Convert a flat PDF into a fillable form and wait for the result:**

1. **Read Binary File** — Load a PDF from disk or an HTTP request.
2. **Instafill.ai (Convert PDF)** — Send the PDF for conversion. Returns a job ID.
3. **Wait** — Pause the workflow (e.g. 30 seconds) to allow processing.
4. **Instafill.ai (Get Conversion Status)** — Pass the job ID to check if conversion is complete. The response includes the status and a link to review the result on Instafill.ai.

**Alternatively, use the trigger node:**

1. **Instafill.ai Trigger (Form Converted)** — Starts the workflow automatically when a conversion completes.
2. Process the trigger payload in subsequent nodes (e.g. send a notification, update a database).

## Compatibility

Tested against n8n version 1.x. No known incompatibilities.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Instafill.ai](https://instafill.ai)
- [Instafill.ai API documentation](https://api.instafill.ai/swagger/index.html)
