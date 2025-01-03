import { getSecret } from "@utils/aws/secret";
import Groq from "groq-sdk";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

interface ModelOptions {
  jsonResponse?: boolean;
  maxTokens?: number;
}

export class GroqApi {
  private groq!: Groq;
  private messageHistory!: ChatCompletionMessageParam[];

  constructor() {
    this.messageHistory = [];
  }

  async getGroqInstance(): Promise<Groq> {
    if (this.groq) {
      return this.groq;
    }

    const apiKey = await getSecret("/groq/api-credentials");
    this.groq = new Groq({ apiKey });
    return this.groq;
  }

  async startPrompt(systemPrompt: string, opts?: ModelOptions): Promise<string> {
    const groq = await this.getGroqInstance();
    this.messageHistory.push({ role: "system", content: systemPrompt });

    const chat = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      response_format: opts?.jsonResponse === true ? { type: "json_object" } : { type: "text" },
      messages: this.messageHistory,
      max_tokens: opts?.maxTokens ?? 512,
    });

    const response = chat.choices[0];
    if (!response) throw new Error("No chat repsonse");
    if (!response.message.content) throw new Error("Response has no message");

    this.messageHistory.push(response.message);
    return response.message.content;
  }

  async sendMessage(message: string, opts?: ModelOptions): Promise<string> {
    const groq = await this.getGroqInstance();
    this.messageHistory.push({ role: "user", content: message });

    const chat = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      response_format: opts?.jsonResponse === true ? { type: "json_object" } : { type: "text" },
      messages: this.messageHistory,
      max_tokens: opts?.maxTokens ?? 512,
    });

    const response = chat.choices[0];
    if (!response) throw new Error("No chat repsonse");

    this.messageHistory.push(response.message);

    if (!response.message.content) throw new Error("Response has no message");

    return response.message.content;
  }

  resetMessages() {
    this.messageHistory = [];
  }
}
