import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Zap, AlertCircle } from "lucide-react";
import gridImg from "../assets/grid-infrastructure.jpg";
// import gridImg from "../assets/ikeja electric image.jpg";
// import gridImg from "../assets/nbc 1.webp";
import { authService } from "../services/authService";
import type { User } from "../types/auth";

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { user } = await authService.login(email, password, rememberMe);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Invalid email or password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-offwhite text-nearblack antialiased lg:h-screen lg:overflow-hidden">
      {/* LEFT PANEL: Hero Image & Brand Narrative (Desktop) */}
      <section
        aria-label="Ikeja Energy Hero Panel"
        className="hidden lg:relative lg:flex lg:flex-col lg:w-1/2 min-h-screen lg:h-screen bg-charcoal overflow-hidden select-none"
      >
        <img
          src={gridImg}
          alt="High Voltage Electrical Power Substation and Transmission Grid"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Dark Gradient Overlay for Contrast & Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/40 to-black/30" />

        {/* Brand Logo / Wordmark (Top-Left) */}
        <div className="relative z-10 p-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B91C1C] flex items-center justify-center shadow-lg shadow-black/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
            NBC Ikeja Energy Monitoring
          </span>
        </div>

        {/* Narrative & Value Proposition (Bottom-Left) */}
        <div className="relative z-10 mt-auto p-12 max-w-xl">
          <h1 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-tight drop-shadow-sm">
            Power, Perfectly Monitored
          </h1>
          <p className="mt-3 text-base text-white/85 leading-relaxed drop-shadow-sm font-normal">
            Real-time visibility across every meter, every circuit, every site.
          </p>
        </div>
      </section>

      {/* RIGHT PANEL: Authentication Form - Vertically Centered */}
      <section
        aria-label="Sign in to your dashboard"
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 min-h-screen lg:h-screen overflow-y-auto"
      >
        <div className="w-full max-w-md my-auto bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-black/5">
          {/* Mobile-only Brand Header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-[#B91C1C] flex items-center justify-center shadow-md shadow-[#B91C1C]/20">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-nearblack">
              NBC Ikeja Energy Monitoring
            </span>
          </div>

          {/* Form Header */}
          <header className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-nearblack tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-grey">Sign in to your dashboard</p>
          </header>

          {/* Inline Error Callout */}
          {errorMessage && (
            <div
              id="login-error-alert"
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-3 text-sm text-red-800 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-5 h-5 text-[#B91C1C] flex-shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-semibold block mb-0.5">
                  Authentication Failed
                </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email-input"
                className="block text-sm font-medium text-charcoal mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email-input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ikeja.io"
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-nearblack placeholder:text-grey/60 focus:outline-none focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide toggle */}
            <div>
              <label
                htmlFor="password-input"
                className="block text-sm font-medium text-charcoal mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pl-3.5 pr-11 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-nearblack placeholder:text-grey/60 focus:outline-none focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-charcoal transition p-1 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 rounded"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label
                htmlFor="remember-me"
                className="flex items-center gap-2.5 cursor-pointer text-sm text-charcoal select-none"
              >
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-gray-300 text-[#B91C1C] accent-[#B91C1C] focus:ring-[#B91C1C]/20 transition cursor-pointer"
                />
                <span>Remember Me</span>
              </label>
            </div>

            {/* Primary Action Button (Locked Brand Red #B91C1C with Darker Red Hover #991B1B) */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] active:bg-[#7F1D1D] text-white text-sm font-semibold tracking-wide shadow-sm shadow-[#B91C1C]/25 hover:shadow-md hover:shadow-[#B91C1C]/35 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-[#B91C1C]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};
