// Gives the HTTP client a valid access token; the identity module implements it.
export interface TokenProvider {
  // Current token, renewed first when it is about to expire; null without a session.
  getAccessToken(): Promise<string | null>;
  // Renews once after a 401 to the given token; null when the session cannot continue.
  renewAfterUnauthorized(rejectedToken: string): Promise<string | null>;
}
