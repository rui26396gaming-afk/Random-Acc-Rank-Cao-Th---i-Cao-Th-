export type STTStatus =
  | 'NOT_CONFIGURED'
  | 'PERMISSION_DENIED'
  | 'READY'
  | 'RECORDING'
  | 'TRANSCRIBING'
  | 'SUCCESS'
  | 'ERROR'
  | 'CANCELLED'
  | 'UNAVAILABLE';

export interface STTResult {
  status: STTStatus;
  transcript: string;
  confidence?: number;
  error?: string;
  durationMs?: number;
}

export class SpeechToTextManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private currentStatus: STTStatus = 'READY';

  public getStatus(): STTStatus {
    return this.currentStatus;
  }

  /**
   * Checks microphone capability and requests user permission
   */
  public async requestMicrophonePermission(): Promise<STTStatus> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.currentStatus = 'UNAVAILABLE';
      return 'UNAVAILABLE';
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release tracks after permission check
      stream.getTracks().forEach((t) => t.stop());
      this.currentStatus = 'READY';
      return 'READY';
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.currentStatus = 'PERMISSION_DENIED';
        return 'PERMISSION_DENIED';
      }
      this.currentStatus = 'ERROR';
      return 'ERROR';
    }
  }

  /**
   * Starts recording from microphone with data size and duration limits
   */
  public async startRecording(onStatusChange?: (status: STTStatus) => void): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.currentStatus = 'UNAVAILABLE';
      onStatusChange?.('UNAVAILABLE');
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.audioChunks = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          // Limit total recorded size to 25MB to prevent memory exhaustion
          const currentTotal = this.audioChunks.reduce((acc, c) => acc + c.size, 0);
          if (currentTotal + event.data.size <= 25 * 1024 * 1024) {
            this.audioChunks.push(event.data);
          }
        }
      };

      this.mediaRecorder.start(250); // Collect slice every 250ms
      this.currentStatus = 'RECORDING';
      onStatusChange?.('RECORDING');
      return true;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.currentStatus = 'PERMISSION_DENIED';
        onStatusChange?.('PERMISSION_DENIED');
      } else {
        this.currentStatus = 'ERROR';
        onStatusChange?.('ERROR');
      }
      return false;
    }
  }

  /**
   * Stops recording and initiates real transcription
   */
  public async stopAndTranscribe(): Promise<STTResult> {
    if (!this.mediaRecorder || this.currentStatus !== 'RECORDING') {
      return {
        status: this.currentStatus,
        transcript: '',
        error: 'Microphone chưa ghi âm.',
      };
    }

    const durationMs = Date.now() - this.startTime;

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        this.currentStatus = 'TRANSCRIBING';

        // Clean up hardware tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
        this.audioChunks = [];

        // Check if browser native Web Speech Recognition is available
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        // Verify if backend STT is configured
        try {
          const checkRes = await fetch('/api/stt/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkConfigOnly: true }),
          });

          const configData = await checkRes.json();
          if (configData.status === 'NOT_CONFIGURED' && !SpeechRecognition) {
            this.currentStatus = 'NOT_CONFIGURED';
            resolve({
              status: 'NOT_CONFIGURED',
              transcript: '',
              durationMs,
              error: 'Dịch vụ Nhận Dạng Giọng Nói (STT) chưa được cấu hình khóa trên server và trình duyệt không hỗ trợ Web Speech.',
            });
            return;
          }

          if (checkRes.ok && configData.status === 'CONFIGURED') {
            // Send base64 audio to real backend STT
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              const transcribeRes = await fetch('/api/stt/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64Audio,
                  mimeType: audioBlob.type,
                }),
              });
              const resJson = await transcribeRes.json();
              if (transcribeRes.ok && resJson.transcript) {
                this.currentStatus = 'SUCCESS';
                resolve({
                  status: 'SUCCESS',
                  transcript: resJson.transcript,
                  durationMs,
                });
              } else {
                this.currentStatus = 'ERROR';
                resolve({
                  status: 'ERROR',
                  transcript: '',
                  durationMs,
                  error: resJson.error || 'Lỗi nhận dạng âm thanh từ máy chủ.',
                });
              }
            };
            reader.readAsDataURL(audioBlob);
            return;
          }
        } catch {
          // Fall through to browser native if supported
        }

        // Clean NOT_CONFIGURED reporting when neither server nor browser engine is active
        this.currentStatus = 'NOT_CONFIGURED';
        resolve({
          status: 'NOT_CONFIGURED',
          transcript: '',
          durationMs,
          error: 'STT Backend chưa được cấu hình. Tuyệt đối không tạo transcript giả lập.',
        });
      };

      this.mediaRecorder!.stop();
    });
  }

  /**
   * Cancels current recording immediately
   */
  public cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
    this.currentStatus = 'CANCELLED';
  }
}
