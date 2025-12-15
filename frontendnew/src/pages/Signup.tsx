import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  registerRegisterPost,
  loginLoginPost,
  refreshTokenRefreshPost,
  getMeMeGet,
  introspectTokenIntrospectPost,
  root_Get,
  healthCheckHealthGet,
  loginGoogleLoginGooglePost,
  loginLinkedinLoginLinkedinPost,
  verifyEmailVerifyEmailPost,
  resendVerificationResendVerificationPost
} from '../hooks/useApis';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };
  
  // Auth mutations
  const registerMutation = registerRegisterPost({
    onSuccess: () => {
      toast.success("Account created successfully!");
      navigate("/login");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create account. Please try again.");
    },
  });

  const loginMutation = loginLoginPost({
    onSuccess: (data) => {
      console.log('Login response:', data);
      const token = data?.access_token; // API returns 'access_token', not 'accessToken'
      if (token) {
        login(token);
        toast.success("Login successful!");
        navigate("/");
      } else {
        console.error('No access token in response:', data);
        toast.error("No access token received from server");
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      toast.error(
        error?.response?.data?.message || "Login failed. Please try again."
      );
    },
  });

  const refreshMutation = refreshTokenRefreshPost({
    onSuccess: (data) => {
      const token = data?.access_token; // API returns 'access_token', not 'accessToken'
      if (token) {
        sessionStorage.setItem("accessToken", token);
      }
    },
    onError: (error: any) => {
      console.error("Token refresh failed:", error);
    },
  });

  // OAuth login mutations
  const googleLoginMutation = loginGoogleLoginGooglePost({
    onSuccess: (data) => {
      const token = data?.access_token;
      if (token) {
        login(token);
        toast.success("Login successful!");
        navigate("/");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Google login failed. Please try again.");
    },
  });

  const linkedinLoginMutation = loginLinkedinLoginLinkedinPost({
    onSuccess: (data) => {
      const token = data?.access_token;
      if (token) {
        login(token);
        toast.success("Login successful!");
        navigate("/");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "LinkedIn login failed. Please try again.");
    },
  });

  // Email verification mutations
  const verifyEmailMutation = verifyEmailVerifyEmailPost({
    onSuccess: () => {
      toast.success("Email verified successfully!");
      navigate("/login");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Email verification failed.");
    },
  });

  const resendVerificationMutation = resendVerificationResendVerificationPost({
    onSuccess: () => {
      toast.success("Verification email sent! Please check your inbox.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to resend verification email.");
    },
  });

  // Health check and user info hooks - only call when authenticated
  const { data: userInfo, refetch: refetchUserInfo } = getMeMeGet({
    enabled: false // Disable automatic calls to prevent 401 errors
  });
  const { data: authHealth, refetch: refetchAuthHealth } = healthCheckHealthGet({
    enabled: false // Disable automatic health checks
  });
  const { data: authRoot, refetch: refetchAuthRoot } = root_Get({
    enabled: false // Disable automatic root calls
  });
  
  
  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Medium";
    return "Strong";
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error("Please enter your first and last name");
      return false;
    }
    if (!formData.email) {
      toast.error("Please enter your email address");
      return false;
    }
    if (!formData.phone) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!formData.password) {
      toast.error("Please enter a password");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setIsLoading(true);
  
    // Transform form data to match API specification
    const registrationData = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      is_active: true,
      is_superuser: false
    };
    
    console.log('Sending registration data:', registrationData);
  
    // Use mutate with callbacks instead of mutateAsync
    registerMutation.mutate(registrationData, {
      onSuccess: (data) => {
        toast.success("Account created successfully! Please verify your email.");
        // Optionally trigger email verification or resend
        setIsLoading(false);
        // Show verification prompt
        const shouldVerify = window.confirm("Account created! Would you like to verify your email now?");
        if (shouldVerify) {
          // Navigate to verification page or show verification form
          navigate("/verify-email", { state: { email: formData.email } });
        } else {
          navigate("/login");
        }
      },
      onError: (error: any) => {
        console.error('Registration error:', error);
        toast.error(error?.response?.data?.message || "Failed to create account.");
        setIsLoading(false);
      },
    });
  };

  const handleGoogleLogin = () => {
    // Google OAuth 2.0 flow
    // Note: You'll need to configure Google OAuth Client ID in environment variables
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    
    if (!googleClientId) {
      toast.error("Google OAuth is not configured. Please contact support.");
      console.warn("VITE_GOOGLE_CLIENT_ID not set in environment variables");
      return;
    }

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('oauth_state', state);

    // Redirect to Google OAuth consent screen
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=id_token&` +
      `scope=openid email profile&` +
      `state=${state}&` +
      `nonce=${Math.random().toString(36).substring(2, 15)}`;
    
    window.location.href = googleAuthUrl;
  };

  const handleLinkedInLogin = () => {
    // LinkedIn OAuth 2.0 flow
    // Note: You'll need to configure LinkedIn OAuth Client ID in environment variables
    const linkedInClientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/linkedin/callback`;
    
    if (!linkedInClientId) {
      toast.error("LinkedIn OAuth is not configured. Please contact support.");
      console.warn("VITE_LINKEDIN_CLIENT_ID not set in environment variables");
      return;
    }

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('oauth_state', state);

    // Redirect to LinkedIn OAuth consent screen
    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${linkedInClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}&` +
      `scope=r_liteprofile r_emailaddress`;
    
    window.location.href = linkedInAuthUrl;
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 to-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-white/30 to-blue-50/50 opacity-60"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-200/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-cyan-300/30 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-[#2D3253]/80 hover:text-[#2D3253] hover:bg-white/80 p-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </motion.div>

          <Card className="shadow-2xl border border-cyan-200/50 bg-white/80 backdrop-blur-xl">
            <CardHeader className="text-center space-y-4 pb-8">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="mx-auto"
              >
                <img
                  src="/logos/AIspire_logo5.jpg"
                  alt="AIspire Logo"
                  className="h-16 w-auto mx-auto rounded-lg shadow-lg"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CardTitle className="text-3xl font-bold text-[#2D3253] mb-2">
                  Create Account
                </CardTitle>
                <CardDescription className="text-[#2D3253]/70 text-lg">
                  Join AInode and start your career journey
                </CardDescription>
              </motion.div>
            </CardHeader>
          
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="firstName" className="text-sm font-medium text-[#2D3253]/90">
                      First Name
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2D3253]/60 group-focus-within:text-cyan-600 transition-colors" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("firstName")}
                        onBlur={() => setFocusedField(null)}
                        className="pl-10 bg-white/80 border-cyan-200/50 text-[#2D3253] placeholder:text-[#2D3253]/50 focus:border-cyan-500 focus:ring-cyan-500/20 backdrop-blur-sm"
                        required
                      />
                      <AnimatePresence>
                        {focusedField === "firstName" && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute -top-2 -right-2"
                          >
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="lastName" className="text-sm font-medium text-[#2D3253]/90">
                      Last Name
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2D3253]/60 group-focus-within:text-cyan-600 transition-colors" />
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("lastName")}
                        onBlur={() => setFocusedField(null)}
                        className="pl-10 bg-white/80 border-cyan-200/50 text-[#2D3253] placeholder:text-[#2D3253]/50 focus:border-cyan-500 focus:ring-cyan-500/20 backdrop-blur-sm"
                        required
                      />
                      <AnimatePresence>
                        {focusedField === "lastName" && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute -top-2 -right-2"
                          >
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-sm font-medium text-[#2D3253]/90">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2D3253]/60 group-focus-within:text-cyan-600 transition-colors" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 bg-white/80 border-cyan-200/50 text-[#2D3253] placeholder:text-[#2D3253]/50 focus:border-cyan-500 focus:ring-cyan-500/20 backdrop-blur-sm"
                      required
                    />
                    <AnimatePresence>
                      {focusedField === "email" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute -top-2 -right-2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-2"
                >
                  <Label htmlFor="phone" className="text-sm font-medium text-[#2D3253]/90">
                    Phone Number
                  </Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2D3253]/60 group-focus-within:text-cyan-600 transition-colors" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="\d{10}"
                      placeholder="Enter 10 digit mobile number"
                      value={formData.phone}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData(prev => ({
                          ...prev,
                          phone: numericValue
                        }));
                      }}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 bg-white/80 border-cyan-200/50 text-[#2D3253] placeholder:text-[#2D3253]/50 focus:border-cyan-500 focus:ring-cyan-500/20 backdrop-blur-sm"
                      required
                    />
                    <AnimatePresence>
                      {focusedField === "phone" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute -top-2 -right-2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-sm font-medium text-[#2D3253]/90">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2D3253]/60 group-focus-within:text-cyan-600 transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 pr-10 bg-white/80 border-cyan-200/50 text-[#2D3253] placeholder:text-[#2D3253]/50 focus:border-cyan-500 focus:ring-cyan-500/20 backdrop-blur-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2D3253]/60 hover:text-[#2D3253] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#2D3253]/70">Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength <= 2 ? "text-red-400" : 
                          passwordStrength <= 3 ? "text-yellow-400" : "text-green-400"
                        }`}>
                          {getPasswordStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength 
                                ? getPasswordStrengthColor(passwordStrength)
                                : "bg-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#2D3253]/90">
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2D3253]/60 group-focus-within:text-cyan-600 transition-colors" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 pr-10 bg-white/80 border-cyan-200/50 text-[#2D3253] placeholder:text-[#2D3253]/50 focus:border-cyan-500 focus:ring-cyan-500/20 backdrop-blur-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2D3253]/60 hover:text-[#2D3253] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    
                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute -top-2 -right-2"
                        >
                          {formData.password === formData.confirmPassword ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="flex items-start space-x-3"
                >
                  <Checkbox
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-[#2D3253]/80 leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-cyan-600 hover:text-cyan-500 hover:underline transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-cyan-600 hover:text-cyan-500 hover:underline transition-colors">
                      Privacy Policy
                    </Link>
                  </Label>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-[#2D3253] font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isLoading || !formData.agreeToTerms}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="mt-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-cyan-200/50" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-[#2D3253]/60">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full border-cyan-200/50 bg-white/80 hover:bg-cyan-50 text-[#2D3253] hover:text-[#2D3253] backdrop-blur-sm"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-cyan-200/50 bg-white/80 hover:bg-cyan-50 text-[#2D3253] hover:text-[#2D3253] backdrop-blur-sm"
                    onClick={handleLinkedInLogin}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="mt-8 text-center"
              >
                <p className="text-sm text-[#2D3253]/70">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-cyan-600 hover:text-cyan-500 font-medium hover:underline transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;