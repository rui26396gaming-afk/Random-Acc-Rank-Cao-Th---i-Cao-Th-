export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'deepseek';

export type RequestStatus = 'success' | 'partial' | 'error' | 'timeout' | 'cancelled';

export interface ModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  isAvailable: boolean;
}

export interface AIGatewayRequest {
  requestId?: string;
  prompt: string;
  systemInstruction?: string;
  images?: { mimeType: string; base64: string }[];
  preferredProvider?: AIProvider;
  preferredModel?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  jsonMode?: boolean;
}

export interface AIGatewayResponse {
  requestId: string;
  provider: AIProvider;
  model: string;
  text: string;
  latencyMs: number;
  status: RequestStatus;
  fallbackUsed: boolean;
  error?: string;
  errorCode?: string | number;
  retriesAttempted?: number;
}

export interface TelemetryLogEntry {
  requestId: string;
  timestamp: string;
  provider: AIProvider;
  model: string;
  status: RequestStatus;
  latencyMs: number;
  retries: number;
  error?: string;
  errorCode?: string | number;
  endpoint?: string;
}
