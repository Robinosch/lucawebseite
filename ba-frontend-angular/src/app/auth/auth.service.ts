/**
 * @deprecated Use ApiService from '../services/api.service' instead.
 *
 * This file exists only for backward compatibility.
 * All authentication logic has been moved to ApiService.
 */

export { ApiService as AuthService } from '../services/api.service';
export type {
  LoginRequest,
  RegisterRequest,
  UserProfile,
  AuthResponse
} from '../services/api.service';

