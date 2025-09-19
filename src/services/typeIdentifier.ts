// Mock document classification without using OpenAI API
export async function classifyDocument(text: string): Promise<{ type: string; confidence: number }> {
  try {
    // Simple keyword-based classification
    const textLower = text.toLowerCase();
    
    // Check for contract-related keywords
    if (textLower.includes('agreement') || 
        textLower.includes('party') || 
        textLower.includes('terms') ||
        textLower.includes('contract')) {
      return { type: 'contract', confidence: 0.9 };
    }
    
    // Check for invoice-related keywords
    if (textLower.includes('invoice') || 
        textLower.includes('payment') || 
        textLower.includes('amount') ||
        textLower.includes('due date')) {
      return { type: 'invoice', confidence: 0.9 };
    }
    
    // Default to report if no other matches
    return { type: 'report', confidence: 0.7 };
  } catch (error) {
    console.error('Error classifying document:', error);
    throw new Error('Failed to classify document');
  }
}