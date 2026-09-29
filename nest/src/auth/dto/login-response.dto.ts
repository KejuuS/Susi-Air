export interface LoginResponseDto {
  accessToken: string;
  /** In seconds. */
  expiresIn: number;
  pilot: { name: string };
}
