import { AIGatewayRequest, AIGatewayResponse } from '../types.js';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callAnthropic(req: AIGatewayRequest): Promise<AIGatewayResponse> {
  const startTime = Date.now();
  const requestId = req.requestId || `req-claude-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey) {
    return {
      requestId,
      provider: 'anthropic',
      model: req.preferredModel || 'claude-3-5-haiku-20241022',
      text: '',
      latencyMs: Date.now() - startTime,
      status: 'error',
      fallbackUsed: false,
      error: 'Anthropic Claude Provider chưa được cấu hình (thiếu ANTHROPIC_API_KEY trên server).',
      errorCode: 'NOT_CONFIGURED',
      retriesAttempted: 0,
    };
  }

  const model = req.preferredModel || 'claude-3-5-haiku-20241022';
  const timeoutMs = req.timeoutMs || 15000;
  const maxRetries = 2;
  let lastError: any = null;
  let retriesCount = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      retriesCount++;
      const backoff = Math.floor(500 * Math.pow(2, attempt) + Math.random() * 250);
      await sleep(backoff);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const messages: any[] = [];
      const contentParts: any[] = [];

      if (req.images && req.images.length > 0) {
        for (const img of req.images) {
          contentParts.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: img.mimeType,
              data: img.base64,
            },
          });
        }
      }

      contentParts.push({ type: 'text', text: req.prompt });
      messages.push({ role: 'user', content: contentParts });

      const body: any = {
        model,
        messages,
        max_tokens: req.maxTokens ?? 4096,
        temperature: req.temperature ?? 0.4,
      };

      if (req.systemInstruction) {
        body.system = req.systemInstruction;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'User-Agent': 'OmniLife-AI-Gateway/1.0',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const errMsg = errBody.error?.message || `HTTP ${response.status} ${response.statusText}`;
        const isTransient = response.status === 529 || response.status === 503 || response.status === 429;

        lastError = {
          status: response.status,
          message: errMsg,
          isTransient,
        };

        if (!isTransient) break;
        continue;
      }

      const data: any = await response.json();
      const text = data.content?.map((c: any) => c.text || '').join('\n') || '';

      return {
        requestId,
        provider: 'anthropic',
        model,
        text,
        latencyMs: Date.now() - startTime,
        status: 'success',
        fallbackUsed: false,
        retriesAttempted: retriesCount,
      };
    } catch (err: any) {
      clearTimeout(timer);
      const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
      lastError = {
        status: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout ? `Request tới Anthropic (${model}) vượt quá ${timeoutMs}ms.` : err.message,
        isTransient: true,
      };
    }
  }

  return {
    requestId,
    provider: 'anthropic',
    model,
    text: '',
    latencyMs: Date.now() - startTime,
    status: lastError?.status === 'TIMEOUT' ? 'timeout' : 'error',
    fallbackUsed: false,
    error: lastError?.message || 'Không thể nhận phản hồi từ Anthropic Claude API sau các lần thử lại.',
    errorCode: lastError?.status || 'GATEWAY_ERROR',
    retriesAttempted: retriesCount,
  };
}
