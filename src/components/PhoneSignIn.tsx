import React, { useState, useCallback } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import CountryCodeSelect from '@/components/CountryCodeSelect';
import { Country, DEFAULT_COUNTRY } from '@/data/countries';

const OTP_LENGTH = 6;

type Step = 'phone' | 'otp';

const PhoneSignIn: React.FC = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('phone');
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fullPhoneNumber = `${selectedCountry.dialCode}${phone.replace(/[^0-9]/g, '')}`;

  const handleSendCode = useCallback(async () => {
    if (!isLoaded || !phone.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await signIn.create({
        strategy: 'phone_code',
        identifier: fullPhoneNumber,
      });
      setStep('otp');
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message?: string }> };
      setError(
        clerkError?.errors?.[0]?.message || t('phoneSignIn.sendCodeError')
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, fullPhoneNumber, phone, t]);

  const handleVerifyOtp = useCallback(async (code: string) => {
    if (!isLoaded || code.length !== OTP_LENGTH) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'phone_code',
        code,
      });

      if (result.status === 'complete' && setActive) {
        await setActive({ session: result.createdSessionId });
      } else {
        setError(t('phoneSignIn.verificationIncomplete'));
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message?: string }> };
      setError(
        clerkError?.errors?.[0]?.message || t('phoneSignIn.verifyError')
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, setActive, t]);

  const handleResend = useCallback(async () => {
    if (!isLoaded) return;

    setError('');

    try {
      await signIn.create({
        strategy: 'phone_code',
        identifier: fullPhoneNumber,
      });
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message?: string }> };
      setError(
        clerkError?.errors?.[0]?.message || t('phoneSignIn.sendCodeError')
      );
    }
  }, [isLoaded, signIn, fullPhoneNumber, t]);

  const handleOtpChange = useCallback((value: string) => {
    setOtp(value);
    if (value.length === OTP_LENGTH) {
      handleVerifyOtp(value);
    }
  }, [handleVerifyOtp]);

  const handlePhoneKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendCode();
    }
  }, [handleSendCode]);

  if (step === 'otp') {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Phone className="w-8 h-8 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {t('phoneSignIn.otpTitle')}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t('phoneSignIn.otpDescription', { phone: fullPhoneNumber })}
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={OTP_LENGTH}
                value={otp}
                onChange={handleOtpChange}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {isLoading && (
              <div className="flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                {t('phoneSignIn.resendCode')}
              </button>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  {t('phoneSignIn.changeNumber')}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Phone className="w-8 h-8 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('phoneSignIn.title')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('phoneSignIn.description')}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <CountryCodeSelect
                selected={selectedCountry}
                onChange={setSelectedCountry}
              />
              <Input
                type="tel"
                placeholder={t('phoneSignIn.phonePlaceholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={handlePhoneKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-left">{error}</p>
            )}

            <Button
              onClick={handleSendCode}
              className="w-full"
              disabled={!phone.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {t('phoneSignIn.sendCode')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhoneSignIn;
