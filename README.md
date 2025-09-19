# Document Analyzer

An intelligent document analyzer that identifies document types and detects missing critical information in business documents.

## Features

1. Document Upload & Processing

   - Upload PDF documents through web interface
   - Extract and display text content from PDFs
   - Store document content in database

2. LLM Document Classification

   - Automatically identify document type
   - Support contracts, invoices, and reports
   - Display detected document type with confidence

3. Missing Fields Analysis
   - LLM-powered detection of missing required fields
   - Compare document content against field requirements
   - Generate detailed missing fields report

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your OpenAI API key:

```
OPENAI_API_KEY=your_api_key_here
```

3. Start the development server:

```bash
npm run dev
```

## Required Fields

### Contract

- party_1
- party_2
- signature
- date
- payment_terms

### Invoice

- invoice_number
- amount
- due_date
- tax
- bill_to
- bill_from
