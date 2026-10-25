import { AIGatewayRequest, AIGatewayResponse } from '../types.js';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callOpenAI(req: AIGatewayRequest): Promise<AIGatewayResponse> {
  const startTime = Date.now();
  const requestId = req.requestId || `req-openai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return {
      requestId,
      provider: 'openai',
      model: req.preferredModel || 'gpt-4o-mini',
      text: '',
      latencyMs: Date.now() - startTime,
      status: 'error',
      fallbackUsed: false,
      error: 'OpenAI Provider chưa được cấu hình (thiếu OPENAI_API_KEY trên server).',
      errorCode: 'NOT_CONFIGURED',
      retriesAttempted: 0,
    };
  }

  const model = req.preferredModel || 'gpt-4o-mini';
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
      if (req.systemInstruction) {
        messages.push({ role: 'system', content: req.systemInstruction });
      }

      if (req.images && req.images.length > 0) {
        const contentParts: any[] = [{ type: 'text', text: req.prompt }];
        for (const img of req.images) {
          contentParts.push({
            type: 'image_url',
            image_url: {
              url: `data:${img.mimeType};base64,${img.base64}`,
            },
          });
        }
        messages.push({ role: 'user', content: contentParts });
      } else {
        messages.push({ role: 'user', content: req.prompt });
      }

      const body: any = {
        model,
        messages,
        temperature: req.temperature ?? 0.4,
        max_tokens: req.maxTokens ?? 4096,
      };

      if (req.jsonMode) {
        body.response_format = { type: 'json_object' };
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
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

        if (!isTransient) {
          break; // Don't retry invalid auth or bad requests
        }
        continue;
      }

      const data: any = await response.json();
      const text = data.choices?.[0]?.message?.content || '';

      return {
        requestId,
        provider: 'openai',
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
        message: isTimeout ? `Request tới OpenAI (${model}) vượt quá ${timeoutMs}ms.` : err.message,
        isTransient: true,
      };
    }
  }

  return {
    requestId,
    provider: 'openai',
    model,
    text: '',
    latencyMs: Date.now() - startTime,
    status: lastError?.status === 'TIMEOUT' ? 'timeout' : 'error',
    fallbackUsed: false,
    error: lastError?.message || 'Không thể nhận phản hồi từ OpenAI API sau các lần thử lại.',
    errorCode: lastError?.status || 'GATEWAY_ERROR',
    retriesAttempted: retriesCount,
  };
}
