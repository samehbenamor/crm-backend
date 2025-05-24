export interface PasswordResetOtp {
  id: string;
  userId: string;
  email: string;
  code: string; // Hashed version
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export interface OtpResponse {
  success: boolean;
  message?: string;
  expiresAt?: Date;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
  newPassword?: string;
}