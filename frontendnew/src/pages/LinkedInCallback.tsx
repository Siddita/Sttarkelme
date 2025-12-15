import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { loginLinkedinLoginLinkedinPost } from "@/hooks/useApis";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

const LinkedInCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [isExchangingToken, setIsExchangingToken] = useState(true);

  const linkedinLoginMutation = loginLinkedinLoginLinkedinPost({
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
      console.error("LinkedIn login error:", error);
      toast.error(error?.response?.data?.message || "LinkedIn login failed");
      navigate("/login");
    },
  });

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Verify state to prevent CSRF attacks
    const storedState = sessionStorage.getItem("oauth_state");
    if (state && storedState && state !== storedState) {
      toast.error("Invalid OAuth state. Please try again.");
      navigate("/login");
      return;
    }

    if (error) {
      toast.error(`OAuth error: ${error}`);
      navigate("/login");
      return;
    }

    if (code) {
      // Exchange authorization code for access_token
      // Note: In a production app, this should be done on the backend for security
      // For now, we'll try to get the access_token from LinkedIn directly
      const linkedInClientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
      const linkedInClientSecret = import.meta.env.VITE_LINKEDIN_CLIENT_SECRET;
      const redirectUri = `${window.location.origin}/auth/linkedin/callback`;

      // For LinkedIn, we need to exchange the authorization code for an access_token
      // In production, this should be done on the backend for security
      // For now, we'll try to exchange it on the frontend if client secret is available
      // Otherwise, we'll send the code to the backend (if backend supports it)
      
      if (linkedInClientId && linkedInClientSecret) {
        // Exchange code for access_token on frontend (not recommended for production)
        fetch("https://www.linkedin.com/oauth/v2/accessToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUri,
            client_id: linkedInClientId,
            client_secret: linkedInClientSecret,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.access_token) {
              // Send access_token to backend
              linkedinLoginMutation.mutate({ access_token: data.access_token });
              sessionStorage.removeItem("oauth_state");
            } else {
              toast.error("Failed to get LinkedIn access token: " + (data.error_description || "Unknown error"));
              navigate("/login");
            }
          })
          .catch((error) => {
            console.error("LinkedIn token exchange error:", error);
            toast.error("Failed to complete LinkedIn login");
            navigate("/login");
          })
          .finally(() => {
            setIsExchangingToken(false);
          });
      } else {
        // If client secret is not available, show error
        // In production, backend should handle token exchange
        toast.error("LinkedIn OAuth is not fully configured. Please contact support.");
        console.warn("VITE_LINKEDIN_CLIENT_ID or VITE_LINKEDIN_CLIENT_SECRET not set");
        navigate("/login");
        setIsExchangingToken(false);
      }
    } else {
      toast.error("No authorization code received from LinkedIn");
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-100 to-white">
      <Card className="p-8">
        <CardContent className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
          <p className="text-lg text-gray-700">Completing LinkedIn sign-in...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkedInCallback;

