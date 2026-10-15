/**
 * Bảng mã lỗi định danh chuẩn hóa đồng bộ với Backend Microservices (Shared.Common.Constants.ErrorCodes)
 */
export const ERROR_CODES = {
  // 1. Hệ thống chung (SYS_*)
  SYS_INTERNAL_ERROR: 'SYS_INTERNAL_ERROR',
  SYS_NOT_FOUND: 'SYS_NOT_FOUND',
  SYS_BAD_REQUEST: 'SYS_BAD_REQUEST',
  SYS_UNAUTHORIZED: 'SYS_UNAUTHORIZED',
  SYS_FORBIDDEN: 'SYS_FORBIDDEN',
  SYS_VALIDATION_FAILED: 'SYS_VALIDATION_FAILED',

  // 2. Định danh & Xác thực (AUTH_*)
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_USERNAME_ALREADY_EXISTS: 'AUTH_USERNAME_ALREADY_EXISTS',
  AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_FORBIDDEN_ROLE_ADMIN: 'AUTH_FORBIDDEN_ROLE_ADMIN',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_REFRESH_TOKEN_INVALID: 'AUTH_REFRESH_TOKEN_INVALID',
  AUTH_ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',

  // 3. Danh mục dùng chung (CATALOG_*)
  CATALOG_ROOM_NOT_FOUND: 'CATALOG_ROOM_NOT_FOUND',
  CATALOG_ROOM_CODE_EXISTS: 'CATALOG_ROOM_CODE_EXISTS',
  CATALOG_SUBJECT_NOT_FOUND: 'CATALOG_SUBJECT_NOT_FOUND',
  CATALOG_SUBJECT_CODE_EXISTS: 'CATALOG_SUBJECT_CODE_EXISTS',
  CATALOG_COURSE_NOT_FOUND: 'CATALOG_COURSE_NOT_FOUND',

  // 4. Quản lý Đào tạo & Học vụ (ACADEMIC_*)
  ACADEMIC_CLASS_NOT_FOUND: 'ACADEMIC_CLASS_NOT_FOUND',
  ACADEMIC_CLASS_CODE_EXISTS: 'ACADEMIC_CLASS_CODE_EXISTS',
  ACADEMIC_CURRICULUM_NOT_FOUND: 'ACADEMIC_CURRICULUM_NOT_FOUND',
  ACADEMIC_SCHEDULE_CONFLICT: 'ACADEMIC_SCHEDULE_CONFLICT',
  ACADEMIC_TEACHER_NOT_ASSIGNED: 'ACADEMIC_TEACHER_NOT_ASSIGNED',

  // 5. Khảo thí & Điểm số (GRADING_*)
  GRADING_EXAM_PAPER_NOT_FOUND: 'GRADING_EXAM_PAPER_NOT_FOUND',
  GRADING_SCORE_OUT_OF_RANGE: 'GRADING_SCORE_OUT_OF_RANGE',
  GRADING_SCORE_LOCKED: 'GRADING_SCORE_LOCKED',
  GRADING_ATTENDANCE_CLOSED: 'GRADING_ATTENDANCE_CLOSED',

  // 6. Lưu trữ tệp tin & Media (STORAGE_*)
  STORAGE_FILE_TOO_LARGE: 'STORAGE_FILE_TOO_LARGE',
  STORAGE_INVALID_EXTENSION: 'STORAGE_INVALID_EXTENSION',
  STORAGE_UPLOAD_FAILED: 'STORAGE_UPLOAD_FAILED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Từ điển thông báo tiếng Việt tương ứng theo từng mã lỗi
 */
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.SYS_INTERNAL_ERROR]: 'Đã xảy ra lỗi nội bộ trên hệ thống. Vui lòng thử lại sau.',
  [ERROR_CODES.SYS_NOT_FOUND]: 'Dữ liệu yêu cầu không tồn tại trên hệ thống.',
  [ERROR_CODES.SYS_UNAUTHORIZED]: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
  [ERROR_CODES.SYS_FORBIDDEN]: 'Bạn không có quyền thực hiện thao tác này.',
  [ERROR_CODES.SYS_VALIDATION_FAILED]: 'Dữ liệu gửi lên không đúng định dạng.',

  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'Không tìm thấy thông tin tài khoản người dùng.',
  [ERROR_CODES.AUTH_USERNAME_ALREADY_EXISTS]: 'Tên đăng nhập đã tồn tại trong hệ thống.',
  [ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS]: 'Địa chỉ email đã được liên kết với một tài khoản khác.',
  [ERROR_CODES.AUTH_FORBIDDEN_ROLE_ADMIN]: 'Bạn không có thẩm quyền tạo hoặc phân quyền Quản trị viên (ADMIN).',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Phiên đăng nhập đã hết hạn. Hệ thống đang tự động gia hạn...',
  [ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID]: 'Phiên xác thực không hợp lệ. Vui lòng đăng nhập lại.',
  [ERROR_CODES.AUTH_ACCOUNT_LOCKED]: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ ban quản trị.',

  [ERROR_CODES.CATALOG_ROOM_NOT_FOUND]: 'Không tìm thấy thông tin phòng học.',
  [ERROR_CODES.CATALOG_ROOM_CODE_EXISTS]: 'Mã phòng học đã tồn tại trong danh mục.',
  [ERROR_CODES.CATALOG_SUBJECT_NOT_FOUND]: 'Không tìm thấy thông tin môn học.',
  [ERROR_CODES.CATALOG_SUBJECT_CODE_EXISTS]: 'Mã môn học đã tồn tại.',

  [ERROR_CODES.ACADEMIC_CLASS_NOT_FOUND]: 'Không tìm thấy lớp học yêu cầu.',
  [ERROR_CODES.ACADEMIC_CLASS_CODE_EXISTS]: 'Mã lớp học đã tồn tại trong niên khóa.',
  [ERROR_CODES.ACADEMIC_SCHEDULE_CONFLICT]: 'Lịch học bị trùng với một lớp khác trong cùng khung giờ/phòng.',

  [ERROR_CODES.STORAGE_FILE_TOO_LARGE]: 'Dung lượng tệp tin vượt quá giới hạn tối đa (2MB cho ảnh).',
  [ERROR_CODES.STORAGE_INVALID_EXTENSION]: 'Định dạng tệp tin không được hệ thống hỗ trợ.',
};

/**
 * Helper lấy thông điệp thân thiện theo mã lỗi (có fallback sang backend message)
 */
export function getErrorMessage(code?: string, defaultMessage?: string): string {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  return defaultMessage || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
}
