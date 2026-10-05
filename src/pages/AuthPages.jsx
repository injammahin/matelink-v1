import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  Phone,
} from 'lucide-react';

import {
  toast,
} from 'sonner';

import {
  Button,
} from '@/components/ui/button';

import {
  Input,
} from '@/components/ui/input';

import {
  Label,
} from '@/components/ui/label';

import {
  useAuth,
} from '@/context/AuthContext';

/*
|--------------------------------------------------------------------------
| Shared visual panel
|--------------------------------------------------------------------------
*/

function AuthVisual({
  register = false,
}) {
  return (
    <div className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
      {/* decorative glow */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-28 h-[370px] w-[370px] rounded-full bg-primary/20 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -left-24 h-[330px] w-[330px] rounded-full bg-[#4faaa8]/10 blur-3xl"
      />

      <div className="relative z-10">
        <div className="mb-10 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#a7dddb] ring-1 ring-white/10">
          <Sparkles size={22} />
        </div>

        <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#a7dddb]">
          Your Matelink account
        </p>

        <h2 className="max-w-[480px] text-[clamp(2.2rem,3.4vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.05em]">
          {register
            ? 'A simpler way to manage your clean.'
            : 'Everything about your clean, together.'}
        </h2>

        <p className="mt-6 max-w-[470px] text-sm leading-7 text-[#c8d6de]">
          {register
            ? 'Create your account to keep your details together and make future cleaning requests easier.'
            : 'Sign in to keep your details and cleaning journey in one convenient place.'}
        </p>
      </div>

      <div className="relative z-10 mt-14 space-y-4">
        {[
          'Keep your contact details together',
          'A simpler experience for future bookings',
          'Secure account access',
        ].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 text-sm text-[#e1eaee]"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-[#a7dddb]">
              <Check size={14} />
            </span>

            {item}
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-14 border-t border-white/10 pt-7">
        <div className="flex items-center gap-3">
          <ShieldCheck
            size={20}
            className="text-[#a7dddb]"
          />

          <p className="text-xs leading-5 text-[#b9cbd4]">
            Your account is for your Matelink
            cleaning experience only.
          </p>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Password input
|--------------------------------------------------------------------------
*/

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = 'Enter your password',
  autoComplete,
  error,
}) {
  const [visible, setVisible] =
    useState(false);

  return (
    <div>
      <Label
        htmlFor={id}
        className="mb-2.5 block text-sm font-semibold"
      >
        {label}
      </Label>

      <div className="relative">
        <LockKeyhole
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <Input
          id={id}
          type={
            visible
              ? 'text'
              : 'password'
          }
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className="h-13 rounded-xl pl-11 pr-12"
        />

        <button
          type="button"
          onClick={() =>
            setVisible(
              (previous) => !previous
            )
          }
          aria-label={
            visible
              ? 'Hide password'
              : 'Show password'
          }
          className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-primary"
        >
          {visible ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>

      {error && (
        <p className="field-error mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| LOGIN PAGE
|--------------------------------------------------------------------------
*/

export function LoginPage() {
  const {
    user,
    login,
  } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [values, setValues] =
    useState({
      email: '',
      password: '',
      remember: true,
    });

  const [errors, setErrors] =
    useState({});

  const [submitting, setSubmitting] =
    useState(false);

  if (user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  function updateField(
    field,
    value
  ) {
    setValues(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

    setErrors(
      (previous) => ({
        ...previous,
        [field]: '',
        form: '',
      })
    );
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    const nextErrors = {};

    if (!values.email.trim()) {
      nextErrors.email =
        'Enter your email address.';
    }

    if (!values.password) {
      nextErrors.password =
        'Enter your password.';
    }

    if (
      Object.keys(nextErrors).length
    ) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      const loggedInUser =
        await login({
          email: values.email,
          password:
            values.password,
        });

      toast.success(
        `Welcome back, ${
          loggedInUser.name.split(
            ' '
          )[0]
        }.`
      );

      const destination =
        location.state?.from ||
        '/';

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      setErrors({
        form:
          error?.message ||
          'Unable to sign in.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-[#f7f9fa] py-12 sm:py-16 lg:py-20">
      <div className="container-site">
        <div className="mx-auto grid max-w-[1120px] overflow-hidden rounded-[28px] border bg-white shadow-[0_28px_80px_rgba(16,45,67,0.08)] lg:grid-cols-[1.05fr_.95fr]">
          {/* FORM */}

          <div className="p-7 sm:p-10 lg:p-14">
            <div className="mx-auto max-w-[440px]">
              <p className="eyebrow mb-5">
                Welcome back
              </p>

              <h1 className="text-[clamp(2.25rem,4vw,3.4rem)] font-semibold tracking-[-0.055em]">
                Sign in to your
                account.
              </h1>

              <p className="body-copy mt-5 text-sm">
                Enter your details to
                continue with Matelink.
              </p>

              {errors.form && (
                <div
                  role="alert"
                  className="mt-7 rounded-xl border border-[#ebcaca] bg-[#fff5f5] px-4 py-3 text-sm text-[#963b3b]"
                >
                  {errors.form}
                </div>
              )}

              <form
                onSubmit={
                  handleSubmit
                }
                className="mt-8 space-y-5"
                noValidate
              >
                {/* EMAIL */}

                <div>
                  <Label
                    htmlFor="login-email"
                    className="mb-2.5 block text-sm font-semibold"
                  >
                    Email address
                  </Label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={
                        values.email
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'email',
                          event.target
                            .value
                        )
                      }
                      placeholder="you@example.com"
                      aria-invalid={
                        Boolean(
                          errors.email
                        )
                      }
                      className="h-13 rounded-xl pl-11"
                    />
                  </div>

                  {errors.email && (
                    <p className="field-error mt-2">
                      {
                        errors.email
                      }
                    </p>
                  )}
                </div>

                {/* PASSWORD */}

                <PasswordField
                  id="login-password"
                  label="Password"
                  value={
                    values.password
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      'password',
                      event.target
                        .value
                    )
                  }
                  autoComplete="current-password"
                  error={
                    errors.password
                  }
                />

                {/* REMEMBER / FORGOT */}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={
                        values.remember
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'remember',
                          event.target
                            .checked
                        )
                      }
                      className="h-4 w-4 accent-[#087e83]"
                    />

                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      toast.info(
                        'Password reset will be connected when the backend email system is integrated.'
                      )
                    }
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* SUBMIT */}

                <Button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="h-13 w-full rounded-xl text-sm font-semibold"
                >
                  {submitting
                    ? 'Signing in...'
                    : 'Sign in'}

                  {!submitting && (
                    <ArrowRight
                      size={17}
                    />
                  )}
                </Button>
              </form>

              <div className="relative my-8">
                <div className="border-t" />

                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-muted-foreground">
                  New to Matelink?
                </span>
              </div>

              <Button
                variant="outline"
                asChild
                className="h-13 w-full rounded-xl"
              >
                <Link to="/register">
                  Create an account
                </Link>
              </Button>

              <p className="mt-7 text-center text-xs leading-5 text-muted-foreground">
                By continuing, you
                agree to Matelink’s{' '}
                <Link
                  className="font-semibold text-foreground underline underline-offset-4"
                  to="/terms"
                >
                  Terms
                </Link>{' '}
                and{' '}
                <Link
                  className="font-semibold text-foreground underline underline-offset-4"
                  to="/privacy"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <AuthVisual />
        </div>
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| REGISTER PAGE
|--------------------------------------------------------------------------
*/

export function RegisterPage() {
  const {
    user,
    register,
  } = useAuth();

  const navigate = useNavigate();

  const [values, setValues] =
    useState({
      name: '',
      email: '',
      mobile: '',
      password: '',
      passwordConfirmation:
        '',
      terms: false,
    });

  const [errors, setErrors] =
    useState({});

  const [submitting, setSubmitting] =
    useState(false);

  if (user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  function updateField(
    field,
    value
  ) {
    setValues(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

    setErrors(
      (previous) => ({
        ...previous,
        [field]: '',
        form: '',
      })
    );
  }

  function validate() {
    const nextErrors = {};

    if (!values.name.trim()) {
      nextErrors.name =
        'Enter your full name.';
    }

    if (!values.email.trim()) {
      nextErrors.email =
        'Enter your email address.';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        values.email
      )
    ) {
      nextErrors.email =
        'Enter a valid email address.';
    }

    if (
      values.password.length < 8
    ) {
      nextErrors.password =
        'Use at least 8 characters.';
    }

    if (
      values.password !==
      values.passwordConfirmation
    ) {
      nextErrors.passwordConfirmation =
        'The passwords do not match.';
    }

    if (!values.terms) {
      nextErrors.terms =
        'Please accept the terms to continue.';
    }

    return nextErrors;
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    const nextErrors =
      validate();

    if (
      Object.keys(nextErrors).length
    ) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      const newUser =
        await register({
          name: values.name,
          email: values.email,
          mobile:
            values.mobile,
          password:
            values.password,
        });

      toast.success(
        `Welcome to Matelink, ${
          newUser.name.split(
            ' '
          )[0]
        }.`
      );

      navigate('/', {
        replace: true,
      });
    } catch (error) {
      setErrors({
        form:
          error?.message ||
          'Unable to create your account.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-[#f7f9fa] py-12 sm:py-16 lg:py-20">
      <div className="container-site">
        <div className="mx-auto grid max-w-[1120px] overflow-hidden rounded-[28px] border bg-white shadow-[0_28px_80px_rgba(16,45,67,0.08)] lg:grid-cols-[1.05fr_.95fr]">
          {/* FORM */}

          <div className="p-7 sm:p-10 lg:p-14">
            <div className="mx-auto max-w-[440px]">
              <p className="eyebrow mb-5">
                Your account
              </p>

              <h1 className="text-[clamp(2.25rem,4vw,3.4rem)] font-semibold tracking-[-0.055em]">
                Create your Matelink
                account.
              </h1>

              <p className="body-copy mt-5 text-sm">
                A simple way to keep
                your details together
                for your next clean.
              </p>

              {errors.form && (
                <div
                  role="alert"
                  className="mt-7 rounded-xl border border-[#ebcaca] bg-[#fff5f5] px-4 py-3 text-sm text-[#963b3b]"
                >
                  {errors.form}
                </div>
              )}

              <form
                onSubmit={
                  handleSubmit
                }
                className="mt-8 space-y-5"
                noValidate
              >
                {/* NAME */}

                <div>
                  <Label
                    htmlFor="register-name"
                    className="mb-2.5 block text-sm font-semibold"
                  >
                    Full name
                  </Label>

                  <div className="relative">
                    <UserRound
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <Input
                      id="register-name"
                      type="text"
                      autoComplete="name"
                      value={
                        values.name
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'name',
                          event.target
                            .value
                        )
                      }
                      placeholder="Your full name"
                      aria-invalid={
                        Boolean(
                          errors.name
                        )
                      }
                      className="h-13 rounded-xl pl-11"
                    />
                  </div>

                  {errors.name && (
                    <p className="field-error mt-2">
                      {
                        errors.name
                      }
                    </p>
                  )}
                </div>

                {/* EMAIL */}

                <div>
                  <Label
                    htmlFor="register-email"
                    className="mb-2.5 block text-sm font-semibold"
                  >
                    Email address
                  </Label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <Input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      value={
                        values.email
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'email',
                          event.target
                            .value
                        )
                      }
                      placeholder="you@example.com"
                      aria-invalid={
                        Boolean(
                          errors.email
                        )
                      }
                      className="h-13 rounded-xl pl-11"
                    />
                  </div>

                  {errors.email && (
                    <p className="field-error mt-2">
                      {
                        errors.email
                      }
                    </p>
                  )}
                </div>

                {/* MOBILE */}

                <div>
                  <Label
                    htmlFor="register-mobile"
                    className="mb-2.5 block text-sm font-semibold"
                  >
                    Mobile number{' '}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <Input
                      id="register-mobile"
                      type="tel"
                      autoComplete="tel"
                      value={
                        values.mobile
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'mobile',
                          event.target
                            .value
                        )
                      }
                      placeholder="04xx xxx xxx"
                      className="h-13 rounded-xl pl-11"
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <PasswordField
                  id="register-password"
                  label="Password"
                  value={
                    values.password
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      'password',
                      event.target
                        .value
                    )
                  }
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  error={
                    errors.password
                  }
                />

                {/* CONFIRM */}

                <PasswordField
                  id="register-password-confirmation"
                  label="Confirm password"
                  value={
                    values.passwordConfirmation
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      'passwordConfirmation',
                      event.target
                        .value
                    )
                  }
                  autoComplete="new-password"
                  placeholder="Enter your password again"
                  error={
                    errors.passwordConfirmation
                  }
                />

                {/* TERMS */}

                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={
                        values.terms
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'terms',
                          event.target
                            .checked
                        )
                      }
                      className="mt-1 h-4 w-4 shrink-0 accent-[#087e83]"
                    />

                    <span>
                      I agree to
                      Matelink’s{' '}
                      <Link
                        className="font-semibold text-foreground underline underline-offset-4"
                        to="/terms"
                      >
                        Terms &
                        Conditions
                      </Link>{' '}
                      and{' '}
                      <Link
                        className="font-semibold text-foreground underline underline-offset-4"
                        to="/privacy"
                      >
                        Privacy
                        Policy
                      </Link>
                      .
                    </span>
                  </label>

                  {errors.terms && (
                    <p className="field-error mt-2">
                      {
                        errors.terms
                      }
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="h-13 w-full rounded-xl text-sm font-semibold"
                >
                  {submitting
                    ? 'Creating account...'
                    : 'Create account'}

                  {!submitting && (
                    <ArrowRight
                      size={17}
                    />
                  )}
                </Button>
              </form>

              <p className="mt-7 text-center text-sm text-muted-foreground">
                Already have an
                account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <AuthVisual register />
        </div>
      </div>
    </section>
  );
}