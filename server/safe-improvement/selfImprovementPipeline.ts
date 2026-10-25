import crypto from 'crypto';

export type PipelineStage =
  | 'OBSERVE'
  | 'PROPOSE'
  | 'DIFF_REVIEW'
  | 'ISOLATED_SANDBOX'
  | 'TEST'
  | 'HUMAN_APPROVAL'
  | 'STAGING'
  | 'CANARY'
  | 'MONITOR'
  | 'PROMOTE'
  | 'ROLLBACK';

export interface CodePatchProposal {
  patchId: string;
  timestamp: string;
  title: string;
  targetFile: string;
  diff: string;
  hash: string;
  stage: PipelineStage;
  testPassed: boolean;
  humanApproved: boolean;
  canaryPercent: number;
  rollbackTriggered: boolean;
  notes: string;
}

const patchHistory: CodePatchProposal[] = [];

export function createPatchProposal(
  title: string,
  targetFile: string,
  diff: string
): CodePatchProposal {
  const hash = crypto.createHash('sha256').update(diff).digest('hex').slice(0, 16);
  const patch: CodePatchProposal = {
    patchId: `patch-${Date.now()}-${hash.slice(0, 6)}`,
    timestamp: new Date().toISOString(),
    title,
    targetFile,
    diff,
    hash,
    stage: 'PROPOSE',
    testPassed: false,
    humanApproved: false,
    canaryPercent: 0,
    rollbackTriggered: false,
    notes: 'Bản vá đang chờ kiểm thử sandbox.',
  };
  patchHistory.unshift(patch);
  return patch;
}

export function runSandboxValidation(patchId: string, syntaxValid: boolean): CodePatchProposal | null {
  const patch = patchHistory.find((p) => p.patchId === patchId);
  if (!patch) return null;

  patch.stage = 'ISOLATED_SANDBOX';
  if (!syntaxValid) {
    patch.testPassed = false;
    patch.stage = 'ROLLBACK';
    patch.rollbackTriggered = true;
    patch.notes = 'Bản vá có lỗi cú pháp hoặc vi phạm an toàn mã nguồn. Đã từ chối triển khai.';
    return patch;
  }

  patch.testPassed = true;
  patch.stage = 'HUMAN_APPROVAL';
  patch.notes = 'Đã vượt qua kiểm thử sandbox. Đang chờ Người Quản Trị phê duyệt trước khi chuyển sang Staging/Canary.';
  return patch;
}

export function approveAndPromotePatch(patchId: string, approvedByHuman: boolean): CodePatchProposal | null {
  const patch = patchHistory.find((p) => p.patchId === patchId);
  if (!patch) return null;

  if (!approvedByHuman) {
    patch.stage = 'ROLLBACK';
    patch.rollbackTriggered = true;
    patch.notes = 'Người quản trị đã từ chối bản vá này.';
    return patch;
  }

  patch.humanApproved = true;
  patch.stage = 'STAGING';
  patch.notes = 'Đã được phê duyệt bởi Quản trị viên. Đang triển khai Staging & Canary.';
  return patch;
}

export function getPatchHistory(): CodePatchProposal[] {
  return [...patchHistory];
}
