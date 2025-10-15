import { useState, useCallback } from 'react';
import { PasswordValidation, PasswordStrengthColor } from '../types';


interface UsePasswordValidationReturn {
  validation: PasswordValidation;
  validate: (password: string, confirmPassword: string) => boolean;
  getStrength: () => number;
  getStrengthColor: () => PasswordStrengthColor;
}

export const usePasswordValidation = (): UsePasswordValidationReturn => {
  const [validation, setValidation] = useState<PasswordValidation>({
    hasUppercase: false,
    hasDigit: false,
    hasSpecialChar: false,
    hasMinLength: false,
    passwordsMatch: false
  });

  const validate = useCallback((password: string, confirmPassword: string): boolean => {
    const newValidation: PasswordValidation = {
      hasUppercase: /[A-Z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|_<>]/.test(password),
      hasMinLength: password.length >= 8,
      passwordsMatch: password === confirmPassword && password !== ''
    };
    setValidation(newValidation);
    return Object.values(newValidation).every(v => v);
  }, []);

  const getStrength = useCallback((): number => {
    const { hasUppercase, hasDigit, hasSpecialChar, hasMinLength } = validation;
    const score = [hasUppercase, hasDigit, hasSpecialChar, hasMinLength].filter(Boolean).length;
    return (score / 4) * 100;
  }, [validation]);

  const getStrengthColor = useCallback((): PasswordStrengthColor => {
    const strength = getStrength();
    if (strength < 50) return 'error';
    if (strength < 75) return 'warning';
    return 'success';
  }, [getStrength]);

  return { validation, validate, getStrength, getStrengthColor };
};