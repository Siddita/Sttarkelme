import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { loginGoogleLoginGooglePost } from "@/hooks/useApis";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const googleLoginMutation = loginGoogleLoginGooglePost({
    onSuccess: (data) => {
      const token = data?.access_token;
      if (token) {
        login(token);
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error("No access token received");
        navigate("/login");
      }
    },
    onError: (error: any) => {
      console.error("Google login error:", error);
      toast.error(error?.response?.data?.message || "Google login failed");
      navigate("/login");
    },
  });

  useEffect(() => {
    // Google OAuth returns id_token in URL fragment (hash) for implicit flow
    // or in query params for authorization code flow
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const idToken = params.get("id_token") || searchParams.get("id_token");
    const state = params.get("state") || searchParams.get("state");
    const error = params.get("error") || searchParams.get("error");
    const errorDescription = params.get("error_description") || searchParams.get("error_description");

    // Debug logging
    console.log("Google OAuth Callback Debug:", {
      hash: hash.substring(0, 100),
      idToken: idToken ? idToken.substring(0, 50) + "..." : null,
      state,
      error,
      errorDescription,
      fullUrl: window.location.href,
    });

    // Verify state to prevent CSRF attacks
    const storedState = sessionStorage.getItem("oauth_state");
    if (state && storedState && state !== storedState) {
      console.error("State mismatch:", { received: state, stored: storedState });
      toast.error("Invalid OAuth state. Please try again.");
      navigate("/login");
      return;
    }

    if (error) {
      console.error("Google OAuth error:", error, errorDescription);
      toast.error(`OAuth error: ${error}${errorDescription ? ` - ${errorDescription}` : ""}`);
      navigate("/login");
      return;
    }

    if (idToken) {
      console.log("ID token received, sending to backend...");
      // Send id_token to backend
      // Note: Backend decodes the token but does NOT verify the signature
      // This is acceptable for development/demo but NOT for production
      // In production, backend should verify the token signature using Google's public keys
      googleLoginMutation.mutate({ id_token: idToken });
      sessionStorage.removeItem("oauth_state");
    } else {
      console.error("No ID token found in URL:", {
        hash: hash.substring(0, 200),
        searchParams: Object.fromEntries(searchParams.entries()),
        fullUrl: window.location.href,
      });
      toast.error("No ID token received from Google. Please check the console for details.");
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-100 to-white">
      <Card className="p-8">
        <CardContent className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
          <p className="text-lg text-gray-700">Completing Google sign-in...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCallback;

