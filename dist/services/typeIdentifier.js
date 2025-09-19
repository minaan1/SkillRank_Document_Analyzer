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
exports.classifyDocument = classifyDocument;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
function classifyDocument(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prompt = `Analyze this document and classify it as either a contract, invoice, or report. The document content is: "${text.substring(0, 1000)}..."`;
            const completion = yield openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a document classification system. Respond with document type and confidence score only."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });
            const response = completion.choices[0].message.content;
            // Parse the response to get type and confidence
            // This is a simplified example - you might want to make this more robust
            const type = response.toLowerCase().includes('contract') ? 'contract' :
                response.toLowerCase().includes('invoice') ? 'invoice' : 'report';
            const confidence = 0.9; // This should be calculated based on the model's response
            return { type, confidence };
        }
        catch (error) {
            console.error('Error classifying document:', error);
            throw new Error('Failed to classify document');
        }
    });
}
