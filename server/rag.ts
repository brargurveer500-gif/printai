import { GoogleGenAI } from '@google/genai';
import { storage } from './storage.js';
import { KnowledgeDoc, RetrievedChunk } from '../src/types.js';

interface KnowledgeChunk {
  chunk_id: string;
  doc_id: string;
  title: string;
  category: string;
  text: string;
}

export class RAGEngine {
  private chunks: KnowledgeChunk[] = [];
  private ai: GoogleGenAI | null = null;

  constructor() {
    this.refreshIndex();
    this.initGemini();
  }

  private initGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }

  public refreshIndex() {
    const docs = storage.getKnowledgeDocs();
    const newChunks: KnowledgeChunk[] = [];

    for (const doc of docs) {
      // Split content into paragraphs or numbered sections
      const paragraphs = doc.content
        .split(/\n\s*\n|\n(?=\d+\.\s+)/)
        .map(p => p.trim())
        .filter(p => p.length > 20);

      paragraphs.forEach((para, idx) => {
        newChunks.push({
          chunk_id: `${doc.doc_id}-chk-${idx}`,
          doc_id: doc.doc_id,
          title: doc.title,
          category: doc.category,
          text: para
        });
      });
    }

    this.chunks = newChunks;
  }

  // Lexical & semantic scoring retriever
  public retrieve(query: string, topK: number = 3): RetrievedChunk[] {
    this.refreshIndex();

    const normalizedQuery = query.toLowerCase();
    const queryTokens = normalizedQuery
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2);

    const scored = this.chunks.map(chunk => {
      const textLower = chunk.text.toLowerCase();
      const titleLower = chunk.title.toLowerCase();

      let score = 0;

      // Exact phrase match bonus
      if (textLower.includes(normalizedQuery) || titleLower.includes(normalizedQuery)) {
        score += 8.0;
      }

      // Keyword match
      for (const token of queryTokens) {
        if (titleLower.includes(token)) score += 3.0;
        if (textLower.includes(token)) score += 1.5;
      }

      // Special domain terms boost
      const domainBoosts: Record<string, string[]> = {
        refund: ['refund', 'cancel', 'cancellation', 'money', 'misprint', 'guarantee', 'error'],
        pricing: ['cost', 'price', 'pricing', 'rate', 'how much', 'fee', 'charge', 'discount', 'duplex', 'binding'],
        faq: ['hours', 'location', 'where', 'when', 'format', 'pdf', 'pickup', 'turnaround', 'urgent', 'express'],
        specifications: ['size', 'paper', 'a4', 'a3', 'letter', 'legal', 'dimension', 'gsm', 'bleed', 'margin'],
        operations: ['kiosk', 'step', 'how to', 'workflow', 'upload', 'qr', 'locker']
      };

      for (const [cat, words] of Object.entries(domainBoosts)) {
        if (words.some(w => normalizedQuery.includes(w)) && chunk.category === cat) {
          score += 3.5;
        }
      }

      return {
        doc_id: chunk.doc_id,
        title: chunk.title,
        category: chunk.category,
        snippet: chunk.text,
        score
      };
    });

    // Filter out chunks with zero or negligible score
    const matches = scored
      .filter(s => s.score > 1.0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return matches;
  }

  public async answerQuestion(question: string): Promise<{
    answer: string;
    retrieved_chunks: RetrievedChunk[];
    grounded: boolean;
  }> {
    const chunks = this.retrieve(question, 3);
    const hasSufficientContext = chunks.length > 0 && chunks[0].score >= 2.0;

    // Check if Gemini is available
    if (this.ai && process.env.GEMINI_API_KEY) {
      try {
        const contextText = chunks
          .map(c => `[DOCUMENT: "${c.title}" (Category: ${c.category})]\n${c.snippet}`)
          .join('\n\n---\n\n');

        const systemInstruction = `You are PrintAI Assistant, an AI expert for the centralized college/office printing center.
Your job is to answer user inquiries regarding printing orders, pricing, turnaround times, refund policies, paper dimensions, and operating procedures.

CRITICAL GROUNDING RULES:
1. Ground your answers firmly in the PROVIDED KNOWLEDGE BASE CONTEXT below.
2. If the user question is about printing policies, refund rules, pricing, turnaround times, or specifications, and the information is NOT found in the provided context, you MUST clearly state: "According to the PrintAI knowledge base, this information is not covered in our current documentation. Please contact the print staff at Counter #2 or email support@printai.io for assistance."
3. Do NOT hallucinate, guess, or invent unverified policies.
4. When citing knowledge, mention the source document name naturally (e.g., "According to the Official Pricing Schedule...").
5. Keep your tone professional, concise, helpful, and friendly.`;

        const prompt = `User Question: "${question}"

RELEVANT KNOWLEDGE BASE CONTEXT:
${hasSufficientContext ? contextText : '(No high-confidence knowledge base match found for this question)'}

Please provide an accurate, grounded answer based strictly on the above rules.`;

        const response = await this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction
          }
        });

        const answerText = response.text || '';
        return {
          answer: answerText,
          retrieved_chunks: chunks,
          grounded: hasSufficientContext && !answerText.toLowerCase().includes('not covered in our current documentation')
        };
      } catch (err) {
        console.error('Gemini generation error, falling back to local grounded generator:', err);
      }
    }

    // Local grounded response generator if Gemini key is unset or offline
    if (!hasSufficientContext) {
      return {
        answer: 'According to the PrintAI knowledge base, this information is not covered in our current documentation. Please contact the print staff at Counter #2 (Building B) or reach out to support@printai.io for assistance.',
        retrieved_chunks: [],
        grounded: false
      };
    }

    // Synthesize from matched chunks
    const topChunk = chunks[0];
    let synthesized = `Based on the **${topChunk.title}**:\n\n${topChunk.snippet}`;
    if (chunks.length > 1) {
      synthesized += `\n\n*Additional Reference from ${chunks[1].title}:*\n${chunks[1].snippet}`;
    }

    return {
      answer: synthesized,
      retrieved_chunks: chunks,
      grounded: true
    };
  }
}

export const ragEngine = new RAGEngine();
