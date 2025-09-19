interface FieldRecommendation {
  name: string;
  importance: 'critical' | 'optional';
  recommendation: string;
  example: string;
  impact: string;
}

const FIELD_REQUIREMENTS = {
  contract: {
    party_1: {
      importance: 'critical' as const,
      recommendation: "Add the full legal name and address of the first party",
      example: "ABC Corporation, a company registered under the laws of [State], with its principal office at [Address]",
      impact: "Without clear party identification, the contract may not be legally binding"
    },
    party_2: {
      importance: 'critical' as const,
      recommendation: "Add the full legal name and address of the second party",
      example: "XYZ Ltd., a company registered under the laws of [State], with its principal office at [Address]",
      impact: "Missing counterparty information can invalidate the agreement"
    },
    signature: {
      importance: 'critical' as const,
      recommendation: "Add signature blocks for all parties with names, titles, and dates",
      example: "IN WITNESS WHEREOF, the parties have executed this Agreement as of [Date].\n[Signature]\nName:\nTitle:\nDate:",
      impact: "Unsigned contracts are not legally enforceable"
    },
    date: {
      importance: 'critical' as const,
      recommendation: "Include the effective date of the agreement",
      example: "This Agreement is made and entered into on [Month Day, Year]",
      impact: "Missing date can cause confusion about when obligations begin"
    },
    payment_terms: {
      importance: 'critical' as const,
      recommendation: "Specify payment amounts, schedules, and methods",
      example: "Payment of $[Amount] shall be made within [X] days of [Milestone/Date] by [Payment Method]",
      impact: "Unclear payment terms can lead to payment disputes"
    }
  },
  invoice: {
    invoice_number: {
      importance: 'critical' as const,
      recommendation: "Add a unique invoice number for tracking",
      example: "Invoice #: INV-2023-001",
      impact: "Missing invoice number makes payment tracking and reconciliation difficult"
    },
    amount: {
      importance: 'critical' as const,
      recommendation: "Clearly state the total amount due",
      example: "Total Amount Due: $1,234.56",
      impact: "Missing amount prevents proper payment processing"
    },
    due_date: {
      importance: 'critical' as const,
      recommendation: "Specify the payment due date",
      example: "Due Date: [30 days from invoice date]",
      impact: "Without a due date, payment timing is unclear"
    },
    tax: {
      importance: 'optional' as const,
      recommendation: "Include applicable tax amounts and rates",
      example: "Sales Tax (8%): $98.76",
      impact: "Missing tax information may cause compliance issues"
    },
    bill_to: {
      importance: 'critical' as const,
      recommendation: "Add the complete billing address and contact information",
      example: "Bill To:\n[Company Name]\n[Street Address]\n[City, State, ZIP]",
      impact: "Incorrect billing details can delay payment"
    },
    bill_from: {
      importance: 'critical' as const,
      recommendation: "Include your company's complete details",
      example: "From:\n[Your Company Name]\n[Your Address]\n[Tax ID/Registration Number]",
      impact: "Missing sender details can cause payment and compliance issues"
    }
  }
};

const FIELD_PATTERNS = {
  invoice: {
    invoice_number: /(invoice|bill)(\s+)?#?:?\s*[a-z0-9\-]+/i,
    amount: /((total|amount|sum)(\s+)?(due|payable)?:?\s*[\$€£]?\s*\d+([,\.]\d{2})?)|(\$\s*\d+([,\.]\d{2})?)/i,
    due_date: /(due|payment)\s+date:?\s*\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/i,
    tax: /(tax|vat|gst):?\s*[\$€£]?\s*\d+([,\.]\d{2})?/i,
    bill_to: /bill\s+to:?.*?(\\n|$)/i,
    bill_from: /(from|seller|vendor):?.*?(\\n|$)/i
  }
};

export async function analyzeMissingFields(text: string, documentType: string): Promise<FieldRecommendation[]> {
  try {
    const requirements = FIELD_REQUIREMENTS[documentType as keyof typeof FIELD_REQUIREMENTS];
    if (!requirements) {
      throw new Error(`Unknown document type: ${documentType}`);
    }

    const patterns = FIELD_PATTERNS[documentType as keyof typeof FIELD_PATTERNS];
    const missingFields: FieldRecommendation[] = [];

    for (const [fieldName, details] of Object.entries(requirements)) {
      let isFieldMissing = false;
      
      if (patterns && patterns[fieldName as keyof typeof patterns]) {
        // Use regex pattern if available
        isFieldMissing = !patterns[fieldName as keyof typeof patterns].test(text);
      } else {
        // Fallback to simple word matching
        const fieldWords = fieldName.split('_');
        isFieldMissing = !fieldWords.some(word => text.toLowerCase().includes(word.toLowerCase()));
      }

      if (isFieldMissing) {
        missingFields.push({
          name: fieldName,
          importance: details.importance,
          recommendation: details.recommendation,
          example: details.example,
          impact: details.impact
        });
      }
    }

    // Sort missing fields by importance (critical first)
    return missingFields.sort((a, b) => 
      a.importance === 'critical' ? -1 : b.importance === 'critical' ? 1 : 0
    );

  } catch (error) {
    console.error('Error analyzing missing fields:', error);
    throw new Error('Failed to analyze missing fields');
  }
}