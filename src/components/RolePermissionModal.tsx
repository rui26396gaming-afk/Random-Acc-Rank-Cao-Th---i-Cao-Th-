import React from 'react';
import {
  ShieldCheck,
  Crown,
  Users,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Eye,
  RotateCcw,
  Sparkles,
  Zap,
  Megaphone,
  Activity,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface RolePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RolePermissionModal: React.FC<RolePermissionModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    userProfile,
    isAdmin,
    isRealAdmin,
    effectiveRole,
    isRolePreviewActive,
    toggleRolePreview,
    setActivePillar,
  } = useApp();

  if (!isOpen) return null;

  const permissions = [
    {
      feature: 'Giải bài AI & Phân tích logic (Toán, Văn, Anh)',
      category: 'Học tập',
      admin: true,
      member: true,
      guest: true,
      description: 'Hệ thống AI Gateway đa mô hình phân tích bài tập theo từng bước.',
    },
    {
      feature: 'Tự động tính giờ học & Vinh danh BXH',
      category: 'Học tập',
      admin: true,
      member: true,
      guest: false,
      description: 'Ghi nhận thời gian học tự động không cần bấm, đồng bộ lên Firestore.',
    },
    {
      feature: 'Quản lý Nhiệm vụ, Thói quen & Kỷ niệm',
      category: 'Cá nhân',
      admin: true,
      member: true,
      guest: false,
      description: 'Lưu trữ Todo list, Habit tracker cá nhân trên đám mây.',
    },
    {
      feature: 'AI Companion & Nhạc nền Lofi thư giãn',
      category: 'Cá nhân',
      admin: true,
      member: true,
      guest: true,
      description: 'Trợ lý tâm lý và âm thanh nền giúp duy trì cảm hứng.',
    },
    {
      feature: 'Xem thông báo phát sóng từ Quản trị',
      category: 'Cộng đồng',
      admin: true,
      member: true,
      guest: true,
      description: 'Nhận thông báo cập nhật mới và tin tức quan trọng từ ban quản trị.',
    },
    {
      feature: '👑 Phân quyền thành viên (Thăng/Hạ cấp)',
      category: 'Quản trị',
      admin: true,
      member: false,
      guest: false,
      description: 'Trao quyền Admin hoặc chuyển thành Thành viên thường trong danh bạ.',
    },
    {
      feature: '📣 Phát thông báo toàn hệ thống (Broadcast)',
      category: 'Quản trị',
      admin: true,
      member: false,
      guest: false,
      description: 'Gửi tin nhắn thông báo hiển thị tới toàn bộ người dùng app.',
    },
    {
      feature: '📊 Giám sát AI Gateway & Telemetry Logs',
      category: 'Quản trị',
      admin: true,
      member: false,
      guest: false,
      description: 'Kiểm tra tỷ lệ lỗi, độ trễ, số lượng request và trạng thái nhà cung cấp.',
    },
    {
      feature: '🔒 Kiểm duyệt & Xem danh sách toàn bộ người dùng',
      category: 'Quản trị',
      admin: true,
      member: false,
      guest: false,
      description: 'Được bảo vệ bởi Firestore Security Rules: chỉ Admin có quyền allow list.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl text-slate-100 p-6 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          title="Đóng modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Trung Tâm Phân Quyền &amp; Vai Trò (RBAC)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hệ thống phân cấp bảo mật đa tầng giữa Quản Trị Viên (Admin) và Thành Viên (Member)
            </p>
          </div>
        </div>

        {/* Current User Role Identity Card */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isAdmin
            ? 'bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border-red-500/40 shadow-lg shadow-red-950/20'
            : 'bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/40'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-700" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center">
                    {user?.displayName?.charAt(0) || userProfile?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className={`absolute -bottom-1 -right-1 p-1 rounded-full text-white text-[10px] ${
                  isAdmin ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  {isAdmin ? <Crown className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base">
                    {user?.displayName || userProfile?.displayName || 'Khách (Chưa đăng nhập)'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      isAdmin
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}
                  >
                    {isAdmin ? '👑 Quản Trị Viên (Admin)' : '🎓 Thành Viên (Member)'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  {user?.email || 'Chế độ khách — Hãy đăng nhập để lưu trữ dữ liệu'}
                </div>
              </div>
            </div>

            {/* If Root Superadmin, allow role preview toggle */}
            {isRealAdmin && (
              <div className="flex items-center gap-2 sm:self-center">
                <button
                  onClick={toggleRolePreview}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm ${
                    isRolePreviewActive
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                  title="Chuyển đổi góc nhìn để kiểm tra phân quyền"
                >
                  {isRolePreviewActive ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Thoát xem thử (Về Admin)</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Xem thử góc nhìn Thành Viên</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Role Preview Warning if active */}
          {isRolePreviewActive && (
            <div className="mt-3 pt-3 border-t border-amber-800/40 flex items-center gap-2 text-xs text-amber-300">
              <Eye className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Chế độ xem trước:</strong> Bạn đang trải nghiệm giao diện chính xác như một <strong>Thành Viên (Member)</strong>. Các chức năng Admin đã được ẩn/khóa an toàn.
              </span>
            </div>
          )}
        </div>

        {/* Detailed Permissions Matrix Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Bảng Ma Trận Phân Quyền Chi Tiết (Role Matrix)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Thiết lập theo chuẩn RBAC</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Tính Năng &amp; Quyền Hạn</th>
                  <th className="p-3">Phân Loại</th>
                  <th className="p-3 text-center text-red-400">👑 Admin</th>
                  <th className="p-3 text-center text-blue-400">🎓 Thành Viên</th>
                  <th className="p-3 text-center text-slate-400">👤 Khách</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                {permissions.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="font-bold text-white">{p.feature}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{p.description}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.category === 'Quản trị'
                          ? 'bg-red-500/20 text-red-300'
                          : p.category === 'Học tập'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {p.admin ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {p.member ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {p.guest ? (
                        <CheckCircle2 className="w-4 h-4 text-slate-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-layer Security Architecture note */}
        <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>1. Firestore ABAC Rules</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Bảo mật từ database. Thành viên không thể tự chỉnh sửa trường <code>role</code> của chính mình.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-blue-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>2. Server API 403 Gate</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Các endpoint <code>/api/admin/*</code> kiểm tra token và header role; từ chối mọi yêu cầu từ non-admin.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-purple-400 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>3. Quản Trị Phân Quyền</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Admin có thể nâng cấp thành viên hoặc chuyển quyền trực tiếp từ Control Center bất cứ lúc nào.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          {isAdmin ? (
            <button
              onClick={() => {
                setActivePillar('admin');
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Mở Bảng Điều Khiển Quản Trị (Admin Panel)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setActivePillar('study');
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tiếp Tục Học Tập (Quyền Thành Viên)</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
