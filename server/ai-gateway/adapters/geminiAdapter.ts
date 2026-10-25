import { AIGatewayRequest, AIGatewayResponse } from '../types.js';

interface ModelCandidate {
  id: string;
}

// Verified active models in Google Generative Language API
const GEMINI_MODELS: ModelCandidate[] = [
  { id: 'gemini-3.1-flash-lite' }, // Verified active & ultra-fast
  { id: 'gemini-flash-latest' },   // Verified active fallback
  { id: 'gemini-3.5-flash' },      // Standard flash
  { id: 'gemini-3.8-flash' },      // Advanced reasoning
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGemini(req: AIGatewayRequest): Promise<AIGatewayResponse> {
  const startTime = Date.now();
  const requestId = req.requestId || `req-gemini-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return {
      requestId,
      provider: 'gemini',
      model: req.preferredModel || 'gemini-3.5-flash',
      text: '',
      latencyMs: Date.now() - startTime,
      status: 'error',
      fallbackUsed: false,
      error: 'Gemini API Provider chưa được cấu hình (thiếu GEMINI_API_KEY trên server).',
      errorCode: 'NOT_CONFIGURED',
      retriesAttempted: 0,
    };
  }

  // Model selection: use requested model if valid, else pick stable primary
  const targetModels = req.preferredModel
    ? [req.preferredModel, ...GEMINI_MODELS.map((m) => m.id).filter((id) => id !== req.preferredModel)]
    : GEMINI_MODELS.map((m) => m.id);

  const timeoutMs = req.timeoutMs || 15000;
  const maxRetries = 2;
  let lastError: any = null;
  let retriesCount = 0;

  for (const model of targetModels) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        retriesCount++;
        // Exponential backoff with jitter: 500ms * 2^attempt + jitter
        const backoff = Math.floor(500 * Math.pow(2, attempt) + Math.random() * 250);
        await sleep(backoff);
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const contents: any[] = [];
        const parts: any[] = [];

        if (req.images && req.images.length > 0) {
          for (const img of req.images) {
            parts.push({
              inline_data: {
                mime_type: img.mimeType,
                data: img.base64,
              },
            });
          }
        }

        parts.push({ text: req.prompt });
        contents.push({ role: 'user', parts });

        const body: any = {
          contents,
          generationConfig: {
            temperature: req.temperature ?? 0.4,
            maxOutputTokens: req.maxTokens ?? 4096,
          },
        };

        if (req.jsonMode) {
          body.generationConfig.responseMimeType = 'application/json';
        }

        if (req.systemInstruction) {
          body.systemInstruction = {
            parts: [{ text: req.systemInstruction }],
          };
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'OmniLife-AI-Gateway/1.0',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          const errMsg = errBody.error?.message || `HTTP ${response.status} ${response.statusText}`;
          const isTransient = response.status === 503 || response.status === 429 || response.status === 500;

          lastError = {
            status: response.status,
            message: errMsg,
            isTransient,
          };

          // If client error (400, 401, 403, 404), do not retry blindly
          if (!isTransient) {
            break; // Try next model or fail
          }
          continue; // Retry with backoff
        }

        const data: any = await response.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text || '';

        if (!text && candidate?.finishReason && candidate.finishReason !== 'STOP') {
          throw new Error(`Mô hình dừng với lý do: ${candidate.finishReason}`);
        }

        return {
          requestId,
          provider: 'gemini',
          model,
          text,
          latencyMs: Date.now() - startTime,
          status: 'success',
          fallbackUsed: model !== targetModels[0],
          retriesAttempted: retriesCount,
        };
      } catch (err: any) {
        clearTimeout(timer);
        const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
        lastError = {
          status: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
          message: isTimeout ? `Request tới model ${model} vượt quá ${timeoutMs}ms.` : err.message,
          isTransient: true,
        };
      }
    }
  }

  // All retries and models exhausted
  return {
    requestId,
    provider: 'gemini',
    model: targetModels[0],
    text: '',
    latencyMs: Date.now() - startTime,
    status: lastError?.status === 'TIMEOUT' ? 'timeout' : 'error',
    fallbackUsed: false,
    error: lastError?.message || 'Không thể nhận phản hồi từ Gemini API sau các lần thử lại.',
    errorCode: lastError?.status || 'GATEWAY_ERROR',
    retriesAttempted: retriesCount,
  };
}
