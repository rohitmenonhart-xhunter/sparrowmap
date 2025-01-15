import { FirebaseError } from 'firebase/app';

export interface FirebaseAuthError extends FirebaseError {
  code: string;
  message: string;
  name: string;
} 