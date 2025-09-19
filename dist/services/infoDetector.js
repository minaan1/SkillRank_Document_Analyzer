"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeMissingFields = analyzeMissingFields;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
const REQUIRED_FIELDS = {
    contract: ['party_1', 'party_2', 'signature', 'date', 'payment_terms'],
    invoice: ['invoice_number', 'amount', 'due_date', 'tax', 'bill_to', 'bill_from']
};
function analyzeMissingFields(text, documentType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const requiredFields = REQUIRED_FIELDS[documentType] || [];
            const prompt = `
      Analyze this ${documentType} and check if the following required fields are present:
      ${requiredFields.join(', ')}
      
      Document content: "${text.substring(0, 1000)}..."
      
      For each field, indicate if it is missing or present.
    `;
            const completion = yield openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a document analysis system. Check for missing required fields and indicate their importance."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });
            const response = completion.choices[0].message.content;
            // Parse the response to identify missing fields
            // This is a simplified implementation - you might want to make this more robust
            const missingFields = requiredFields
                .filter(field => response.toLowerCase().includes(`${field.toLowerCase()} is missing`))
                .map(field => ({
                name: field,
                importance: 'critical'
            }));
            return missingFields;
        }
        catch (error) {
            console.error('Error analyzing missing fields:', error);
            throw new Error('Failed to analyze missing fields');
        }
    });
}
