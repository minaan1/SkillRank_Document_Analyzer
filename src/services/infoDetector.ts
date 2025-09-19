interface Field {
  name: string;
  importance: 'critical' | 'optional';
}

const REQUIRED_FIELDS = {
  contract: ['party_1', 'party_2', 'signature', 'date', 'payment_terms'],
  invoice: ['invoice_number', 'amount', 'due_date', 'tax', 'bill_to', 'bill_from']
};

export async function analyzeMissingFields(text: string, documentType: string): Promise<Field[]> {
  try {
    const requiredFields = REQUIRED_FIELDS[documentType as keyof typeof REQUIRED_FIELDS] || [];
    const textLower = text.toLowerCase();
    
    // Simple mock implementation that checks for keyword presence
    const missingFields: Field[] = requiredFields.filter(field => {
      const fieldWords = field.split('_');
      // Check if any of the field words are present in the text
      const isFieldMissing = !fieldWords.some(word => textLower.includes(word));
      return isFieldMissing;
    }).map(field => ({
        name: field,
        importance: 'critical'
      }));

    return missingFields;
  } catch (error) {
    console.error('Error analyzing missing fields:', error);
    throw new Error('Failed to analyze missing fields');
  }
}