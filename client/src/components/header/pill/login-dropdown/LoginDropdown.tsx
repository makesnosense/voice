import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mail, Check } from 'lucide-react';
import { useAuthStore } from '../../../../stores/useAuthStore';
import baseStyles from '../../../../styles/BaseCard.module.css';
import buttonStyles from '../../../../styles/Buttons.module.css';
import loginDropdownStyles from './LoginDropdown.module.css';
import type { ObjectValues } from '../../../../../../shared/types';

const LOGIN_STEP = {
  EMAIL_INPUT: 'email-input',
  CODE_INPUT: 'code-input',
  SUCCESS: 'success',
} as const;

type LoginStep = ObjectValues<typeof LOGIN_STEP>;

const PENDING_EMAIL_KEY = 'pending_auth_email';
const SUCCESS_DISPLAY_DURATION = 2000; // 2 seconds

interface LoginDropdownProps {
  onClose: () => void;
}

export default function LoginDropdown({ onClose }: LoginDropdownProps) {
  const { requestOtp, verifyOtp, isLoading, setAuthSuccessDelay } = useAuthStore();

  const [loginStep, setLoginStep] = useState<LoginStep>(LOGIN_STEP.EMAIL_INPUT);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // restore email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(PENDING_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setLoginStep(LOGIN_STEP.CODE_INPUT);
    }
  }, []);

  // cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleSendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await requestOtp(email);
      localStorage.setItem(PENDING_EMAIL_KEY, email);
      setLoginStep(LOGIN_STEP.CODE_INPUT);
    } catch (err) {
      setError('failed to send code. please try again.');
    }
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      setAuthSuccessDelay(true);
      await verifyOtp(email, code);
      localStorage.removeItem(PENDING_EMAIL_KEY);

      setLoginStep(LOGIN_STEP.SUCCESS);

      successTimeoutRef.current = setTimeout(() => {
        setAuthSuccessDelay(false);
        onClose();
      }, SUCCESS_DISPLAY_DURATION);
    } catch (err) {
      setAuthSuccessDelay(false);
      setError('Invalid code. Please try again.');
      setCode('');
    }
  };

  const handleBack = () => {
    setLoginStep(LOGIN_STEP.EMAIL_INPUT);
    setCode('');
    setError(null);
    localStorage.removeItem(PENDING_EMAIL_KEY);
  };

  const handleCodeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <div className={`${loginDropdownStyles.dropdown} ${baseStyles.card}`}>
      {loginStep === LOGIN_STEP.EMAIL_INPUT ? (
        <form onSubmit={handleSendCode} className={loginDropdownStyles.form}>
          <div className={loginDropdownStyles.emailInputContainer}>
            {!email && <Mail size={16} className={loginDropdownStyles.emailPlaceholderIcon} />}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email to sign in"
              className={loginDropdownStyles.input}
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && <div className={loginDropdownStyles.error}>{error}</div>}

          <button
            type="submit"
            disabled={isLoading || !email}
            className={`${buttonStyles.button} ${buttonStyles.neutral} ${loginDropdownStyles.submitButton}`}
          >
            {isLoading ? 'Sending...' : 'Send code'}
          </button>
        </form>
      ) : loginStep === LOGIN_STEP.CODE_INPUT ? (
        <form onSubmit={handleVerifyCode} className={loginDropdownStyles.form}>
          <div className={loginDropdownStyles.codeStepHeader}>
            <button
              type="button"
              onClick={handleBack}
              className={loginDropdownStyles.backButton}
              disabled={isLoading}
            >
              <ArrowLeft size={16} />
            </button>
            <div className={loginDropdownStyles.emailDisplay}>{email}</div>
          </div>

          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={handleCodeInput}
            placeholder="000000"
            className={`${loginDropdownStyles.input} ${loginDropdownStyles.codeInput}`}
            required
            autoFocus
            disabled={isLoading}
            maxLength={6}
          />

          {error && <div className={loginDropdownStyles.error}>{error}</div>}

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className={`${buttonStyles.button} ${buttonStyles.neutral} ${loginDropdownStyles.submitButton}`}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      ) : (
        <div className={loginDropdownStyles.successState}>
          <div className={loginDropdownStyles.successIcon}>
            <Check size={32} />
          </div>
          <span className={loginDropdownStyles.successText}>Success!</span>
        </div>
      )}
    </div>
  );
}
