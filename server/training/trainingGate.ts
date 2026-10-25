export type TrainingJobStatus =
  | 'NOT_CONFIGURED'
  | 'NOT_IMPLEMENTED'
  | 'DATASET_VALIDATING'
  | 'READY'
  | 'RUNNING'
  | 'EVALUATING'
  | 'COMPLETED'
  | 'FAILED';

export interface DatasetValidationResult {
  valid: boolean;
  totalLines: number;
  trainSplit: number;
  valSplit: number;
  errors: string[];
  tokenEstimate?: number;
}

export interface TrainingJob {
  jobId: string;
  baseModel: string;
  targetModelName: string;
  status: TrainingJobStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  datasetStats?: DatasetValidationResult;
  message: string;
}

export function validateFineTuningDataset(jsonlContent: string): DatasetValidationResult {
  const lines = jsonlContent.trim().split('\n').filter((l) => l.trim().length > 0);
  const errors: string[] = [];
  let validLines = 0;

  if (lines.length < 10) {
    errors.push('Tập dữ liệu phải có tối thiểu 10 mẫu để huấn luyện chuẩn xác.');
  }

  lines.forEach((line, idx) => {
    try {
      const parsed = JSON.parse(line);
      if (!parsed.messages || !Array.isArray(parsed.messages)) {
        errors.push(`Dòng ${idx + 1}: Thiếu mảng 'messages'.`);
      } else {
        const hasUser = parsed.messages.some((m: any) => m.role === 'user');
        const hasAssistant = parsed.messages.some((m: any) => m.role === 'assistant');
        if (!hasUser || !hasAssistant) {
          errors.push(`Dòng ${idx + 1}: 'messages' phải có đủ vai trò 'user' và 'assistant'.`);
        } else {
          validLines++;
        }
      }
    } catch {
      errors.push(`Dòng ${idx + 1}: Định dạng JSON không hợp lệ.`);
    }
  });

  const totalLines = lines.length;
  const trainSplit = Math.floor(validLines * 0.8);
  const valSplit = validLines - trainSplit;

  return {
    valid: errors.length === 0 && validLines >= 10,
    totalLines,
    trainSplit,
    valSplit,
    errors: errors.slice(0, 10), // Return first 10 errors
    tokenEstimate: validLines * 120,
  };
}

export function getTrainingGateStatus(): {
  status: TrainingJobStatus;
  isBackendAvailable: boolean;
  message: string;
  supportedProviders: string[];
} {
  // Check if a dedicated fine-tuning cluster / Vertex AI custom job endpoint is configured
  const hasTrainingCluster = Boolean(process.env.FINE_TUNING_BACKEND_URL);

  if (!hasTrainingCluster) {
    return {
      status: 'NOT_CONFIGURED',
      isBackendAvailable: false,
      message:
        'Hạ tầng Huấn Luyện (Model Fine-Tuning Cluster) chưa được cấu hình. Hệ thống từ chối giả lập thay đổi trọng số và chỉ phục vụ suy luận qua AI Gateway.',
      supportedProviders: ['Vertex AI Custom Training', 'OpenAI Fine-Tuning API'],
    };
  }

  return {
    status: 'READY',
    isBackendAvailable: true,
    message: 'Hạ tầng huấn luyện đã sẵn sàng tiếp nhận dataset.',
    supportedProviders: ['Vertex AI Custom Training'],
  };
}
