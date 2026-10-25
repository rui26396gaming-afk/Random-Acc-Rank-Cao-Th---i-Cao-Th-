import { AIGatewayRequest, AIGatewayResponse, AIProvider, TelemetryLogEntry } from './types.js';
import { callGemini } from './adapters/geminiAdapter.js';
import { callOpenAI } from './adapters/openaiAdapter.js';
import { callAnthropic } from './adapters/anthropicAdapter.js';
import { callDeepSeek } from './adapters/deepseekAdapter.js';

// In-memory circular telemetry buffer for admin inspection
const MAX_TELEMETRY_LOGS = 200;
const telemetryLogs: TelemetryLogEntry[] = [];

export function logTelemetry(entry: TelemetryLogEntry) {
  telemetryLogs.unshift(entry);
  if (telemetryLogs.length > MAX_TELEMETRY_LOGS) {
    telemetryLogs.pop();
  }
}

export function getGatewayTelemetry(): TelemetryLogEntry[] {
  return [...telemetryLogs];
}

export function getConfiguredProviders(): Record<AIProvider, boolean> {
  return {
    gemini: Boolean(process.env.GEMINI_API_KEY?.trim()),
    openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
    deepseek: Boolean(process.env.DEEPSEEK_API_KEY?.trim()),
  };
}

export async function executeAIGatewayRequest(req: AIGatewayRequest): Promise<AIGatewayResponse> {
  const requestId = req.requestId || `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const configured = getConfiguredProviders();

  // Primary provider preference or Gemini by default
  const primaryProvider: AIProvider = req.preferredProvider || 'gemini';

  // Build fallback sequence of ONLY configured providers
  const providersSequence: AIProvider[] = [primaryProvider];
  (['gemini', 'openai', 'anthropic', 'deepseek'] as AIProvider[]).forEach((p) => {
    if (p !== primaryProvider && configured[p]) {
      providersSequence.push(p);
    }
  });

  let lastResponse: AIGatewayResponse | null = null;
  let fallbackUsed = false;

  for (let i = 0; i < providersSequence.length; i++) {
    const provider = providersSequence[i];
    if (i > 0) fallbackUsed = true;

    const currentReq: AIGatewayRequest = {
      ...req,
      requestId,
      preferredProvider: provider,
    };

    let result: AIGatewayResponse;
    switch (provider) {
      case 'gemini':
        result = await callGemini(currentReq);
        break;
      case 'openai':
        result = await callOpenAI(currentReq);
        break;
      case 'anthropic':
        result = await callAnthropic(currentReq);
        break;
      case 'deepseek':
        result = await callDeepSeek(currentReq);
        break;
      default:
        result = {
          requestId,
          provider,
          model: 'unknown',
          text: '',
          latencyMs: 0,
          status: 'error',
          fallbackUsed: false,
          error: `Provider '${provider}' không hợp lệ.`,
          errorCode: 'INVALID_PROVIDER',
        };
    }

    result.fallbackUsed = fallbackUsed;
    lastResponse = result;

    // Log telemetry for this attempt
    logTelemetry({
      requestId,
      timestamp: new Date().toISOString(),
      provider: result.provider,
      model: result.model,
      status: result.status,
      latencyMs: result.latencyMs,
      retries: result.retriesAttempted || 0,
      error: result.error,
      errorCode: result.errorCode,
    });

    if (result.status === 'success') {
      return result;
    }

    // If client requested specific provider and that provider is not configured, don't silently switch unless asked
    if (result.errorCode === 'NOT_CONFIGURED' && req.preferredProvider && req.preferredProvider !== 'gemini') {
      return result;
    }
  }

  // If all attempts failed
  return (
    lastResponse || {
      requestId,
      provider: primaryProvider,
      model: 'unknown',
      text: '',
      latencyMs: 0,
      status: 'error',
      fallbackUsed,
      error: 'Tất cả các AI Provider được cấu hình đều không phản hồi.',
      errorCode: 'ALL_PROVIDERS_FAILED',
    }
  );
}
