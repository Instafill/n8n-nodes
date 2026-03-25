# n8n-nodes-instafill

[![npm version](https://img.shields.io/npm/v/n8n-nodes-instafill.svg)](https://www.npmjs.com/package/n8n-nodes-instafill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![n8n community](https://img.shields.io/badge/n8n-community--node-orange)](https://www.npmjs.com/package/n8n-nodes-instafill)

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

**Fill**

- **Create** — Fill a PDF form with data from provided sources (file URLs, text) using AI.
- **Get** — Retrieve the status of a form fill by its ID.

**Form**

- **Upload** — Upload a PDF form to your Instafill.ai workspace.
- **Get Many** — Search for forms in your workspace by name.

**Utility**

- **Convert PDF** — Convert a flat (non-interactive) PDF into a fillable form. Returns a job ID to track the conversion.
- **Get Conversion Status** — Check the status of a conversion job. Returns the result and a link to the fillable form when complete.
- **Check If Flat** — Determine whether a PDF is already fillable or needs to be converted first.

### Instafill.ai Trigger

- **Form Converted** — Starts when a flat-to-fillable PDF conversion completes.
- **Form Filled** — Starts when a form has been filled with data.

## Credentials

To authenticate with Instafill.ai, you need an API key.

**Prerequisites:** An active [Instafill.ai](https://instafill.ai) account.

You can find your API key in your [workspace API settings](https://instafill.ai/settings/workspace/api).

**Setting up credentials in n8n:**

1. In n8n, open **Credentials** and create a new credential of type **Instafill.ai API**.
2. Paste your API key into the **API Key** field.
3. Click **Save** — n8n will verify the key automatically.

## Example Workflows

**Fill a form with data from a document:**

1. **Instafill.ai (Fill > Create)** — Select a form from the dropdown, provide source file URLs or text data.
2. **Wait** — Pause the workflow to allow processing.
3. **Instafill.ai (Fill > Get)** — Pass the fill ID to check status and get the filled PDF URL.

**Upload and convert a flat PDF:**

1. **Read Binary File** — Load a PDF from disk or an HTTP request.
2. **Instafill.ai (Form > Upload)** — Upload the PDF to your workspace.
3. **Instafill.ai (Utility > Convert PDF)** — Send the PDF for conversion. Returns a job ID.
4. **Instafill.ai (Utility > Get Conversion Status)** — Check if conversion is complete.

**Use trigger nodes for automation:**

1. **Instafill.ai Trigger (Form Filled)** — Starts the workflow when a form is filled with data.
2. **Instafill.ai Trigger (Form Converted)** — Starts the workflow when a PDF conversion completes.

## Compatibility

Tested against n8n version 1.x. No known incompatibilities.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Instafill.ai](https://instafill.ai)
- [Instafill.ai API documentation](https://api.instafill.ai/swagger/index.html)
