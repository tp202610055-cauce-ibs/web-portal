// Anonymous calls. Each throws PasswordResetRefusedError when the server refuses it and
// ServiceUnavailableError when it cannot answer. request resolves the same whether or not the
// email has an account.
export interface PasswordResetGateway {
  request(email: string): Promise<void>;
  validate(token: string): Promise<void>;
  confirm(token: string, newPassword: string): Promise<void>;
}
