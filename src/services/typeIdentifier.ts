interface KeywordScore {
  keywords: string[];
  weight: number;
}

const contractKeywords: KeywordScore[] = [
  { keywords: ['agreement', 'contract', 'deed'], weight: 3 },
  { keywords: ['party', 'parties', 'between'], weight: 2 },
  { keywords: ['terms', 'conditions', 'provisions'], weight: 2 },
  { keywords: ['hereby', 'shall', 'pursuant', 'obligations'], weight: 2 },
  { keywords: ['signed', 'executed', 'signature', 'witness'], weight: 3 },
  { keywords: ['effective date', 'term of agreement', 'termination'], weight: 2 },
  { keywords: ['governing law', 'jurisdiction', 'enforcement'], weight: 2 },
  { keywords: ['confidential', 'proprietary', 'non-disclosure'], weight: 1 }
];

const invoiceKeywords: KeywordScore[] = [
  { keywords: ['invoice', 'bill', 'statement'], weight: 3 },
  { keywords: ['amount', 'total', 'sum', 'price'], weight: 2 },
  { keywords: ['payment', 'due date', 'net', 'payable'], weight: 2 },
  { keywords: ['tax', 'vat', 'gst', 'sales tax'], weight: 2 },
  { keywords: ['item', 'quantity', 'unit', 'description'], weight: 2 },
  { keywords: ['bill to', 'ship to', 'billing address'], weight: 3 },
  { keywords: ['invoice number', 'invoice date', 'invoice #'], weight: 3 },
  { keywords: ['subtotal', 'discount', 'shipping', 'handling'], weight: 1 }
];

function calculateDocumentScore(text: string, keywords: KeywordScore[]): number {
  const textLower = text.toLowerCase();
  let score = 0;
  let maxPossibleScore = 0;

  for (const { keywords: keywordList, weight } of keywords) {
    maxPossibleScore += weight;
    if (keywordList.some(keyword => textLower.includes(keyword.toLowerCase()))) {
      score += weight;
    }
  }

  return maxPossibleScore > 0 ? score / maxPossibleScore : 0;
}

export async function classifyDocument(text: string): Promise<{ type: string; confidence: number }> {
  try {
    const contractScore = calculateDocumentScore(text, contractKeywords);
    const invoiceScore = calculateDocumentScore(text, invoiceKeywords);

    // Check for required fields
    const textLower = text.toLowerCase();
    
    // Essential invoice fields check
    const hasInvoiceNumber = /invoice.*?#|invoice.*?number/i.test(textLower);
    const hasAmount = /(\$|€|£)\s*\d+([,\.]\d{2})?|total|amount|sum/i.test(textLower);
    const hasDueDate = /due\s+date|payment\s+due/i.test(textLower);
    const hasBillingInfo = /bill\s+to|bill\s+from|billing\s+address/i.test(textLower);
    
    // Essential contract fields check
    const hasParties = /party|parties|between.*?and/i.test(textLower);
    const hasSignature = /signature|signed|executed/i.test(textLower);
    const hasDate = /dated|effective\s+date|date:/i.test(textLower);
    const hasTerms = /terms|conditions|agreement/i.test(textLower);
    
    // Common contract patterns
    if (textLower.match(/witnesseth|whereas|now,\s+therefore/)) {
      contractScore * 1.2;
    }
    if (textLower.match(/in\s+witness\s+whereof|agreed\s+and\s+accepted/)) {
      contractScore * 1.2;
    }

    // Common invoice patterns
    if (textLower.match(/invoice\s+#|invoice\s+no\.|invoice\s+number/)) {
      invoiceScore * 1.2;
    }
    if (textLower.match(/(\$|€|£)\s*\d+[,\d]*\.\d{2}/)) {
      invoiceScore * 1.1;
    }

    // Determine document type based on highest score
    if (contractScore > invoiceScore && contractScore > 0.3) {
      return { 
        type: 'contract', 
        confidence: Math.min(Math.max(contractScore, 0), 1)
      };
    } else if (invoiceScore > contractScore && invoiceScore > 0.3) {
      return { 
        type: 'invoice', 
        confidence: Math.min(Math.max(invoiceScore, 0), 1)
      };
    }

    // If no clear winner or scores too low, return report with low confidence
    return { type: 'report', confidence: 0.3 };
  } catch (error) {
    console.error('Error classifying document:', error);
    throw new Error('Failed to classify document');
  }
}