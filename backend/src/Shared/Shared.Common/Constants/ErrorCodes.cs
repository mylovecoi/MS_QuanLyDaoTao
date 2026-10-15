namespace Shared.Common.Constants;

/// <summary>
/// Bảng mã lỗi định danh chuẩn hóa toàn hệ thống (Machine-Readable Error Codes).
/// Dùng để đồng bộ giữa các Microservices và Frontend Client.
/// </summary>
public static class ErrorCodes
{
    // ==========================================
    // 1. Hệ thống chung (System & General: SYS_*)
    // ==========================================
    public const string SysInternalError       = "SYS_INTERNAL_ERROR";
    public const string SysNotFound            = "SYS_NOT_FOUND";
    public const string SysBadRequest          = "SYS_BAD_REQUEST";
    public const string SysUnauthorized        = "SYS_UNAUTHORIZED";
    public const string SysForbidden           = "SYS_FORBIDDEN";
    public const string SysValidationFailed     = "SYS_VALIDATION_FAILED";

    // ==========================================
    // 2. Định danh & Xác thực (Identity & Auth: AUTH_*)
    // ==========================================
    public const string AuthInvalidCredentials    = "AUTH_INVALID_CREDENTIALS";
    public const string AuthUserNotFound          = "AUTH_USER_NOT_FOUND";
    public const string AuthUsernameAlreadyExists = "AUTH_USERNAME_ALREADY_EXISTS";
    public const string AuthEmailAlreadyExists    = "AUTH_EMAIL_ALREADY_EXISTS";
    public const string AuthForbiddenRoleAdmin    = "AUTH_FORBIDDEN_ROLE_ADMIN";
    public const string AuthTokenExpired          = "AUTH_TOKEN_EXPIRED";
    public const string AuthRefreshTokenInvalid   = "AUTH_REFRESH_TOKEN_INVALID";
    public const string AuthAccountLocked         = "AUTH_ACCOUNT_LOCKED";

    // ==========================================
    // 3. Danh mục dùng chung (Catalog: CATALOG_*)
    // ==========================================
    public const string CatalogRoomNotFound       = "CATALOG_ROOM_NOT_FOUND";
    public const string CatalogRoomCodeExists     = "CATALOG_ROOM_CODE_EXISTS";
    public const string CatalogSubjectNotFound    = "CATALOG_SUBJECT_NOT_FOUND";
    public const string CatalogSubjectCodeExists  = "CATALOG_SUBJECT_CODE_EXISTS";
    public const string CatalogCourseNotFound     = "CATALOG_COURSE_NOT_FOUND";

    // ==========================================
    // 4. Quản lý Đào tạo & Học vụ (Academic: ACADEMIC_*)
    // ==========================================
    public const string AcademicClassNotFound     = "ACADEMIC_CLASS_NOT_FOUND";
    public const string AcademicClassCodeExists   = "ACADEMIC_CLASS_CODE_EXISTS";
    public const string AcademicCurriculumNotFound= "ACADEMIC_CURRICULUM_NOT_FOUND";
    public const string AcademicScheduleConflict  = "ACADEMIC_SCHEDULE_CONFLICT";
    public const string AcademicTeacherNotAssigned= "ACADEMIC_TEACHER_NOT_ASSIGNED";

    // ==========================================
    // 5. Khảo thí & Điểm số (Grading & Exam: GRADING_*)
    // ==========================================
    public const string GradingExamPaperNotFound  = "GRADING_EXAM_PAPER_NOT_FOUND";
    public const string GradingScoreOutOfRange    = "GRADING_SCORE_OUT_OF_RANGE";
    public const string GradingScoreLocked        = "GRADING_SCORE_LOCKED";
    public const string GradingAttendanceClosed   = "GRADING_ATTENDANCE_CLOSED";

    // ==========================================
    // 6. Lưu trữ tệp tin & Media (Storage: STORAGE_*)
    // ==========================================
    public const string StorageFileTooLarge       = "STORAGE_FILE_TOO_LARGE";
    public const string StorageInvalidExtension   = "STORAGE_INVALID_EXTENSION";
    public const string StorageUploadFailed       = "STORAGE_UPLOAD_FAILED";
}
