import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "@/components/ui/spinner";
import loginImg from "@/assets/images/loginimg.png";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(phone, password);
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Image (75%) - Hidden on small screens */}
      <div className="hidden lg:flex lg:w-3/4 items-center justify-center overflow-hidden">
        <img
          src={loginImg}
          alt="Login illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Form (25% on large screens, 100% on mobile) */}
      <div className="w-full lg:w-1/4 min-h-screen bg-background flex items-center justify-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Send size={28} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Sent</h1>
            <p className="text-muted-foreground text-[15px] mt-1">Send messages through time</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="bg-card rounded-lg p-4">
              <label className="text-sm text-muted-foreground mb-1.5 block">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none"
              />
            </div>

            <div className="bg-card rounded-lg p-4">
              <label className="text-sm text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent pr-10 text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-[15px] mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="border-primary-foreground border-t-transparent" />
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </motion.button>

            <p className="text-center text-muted-foreground text-sm mt-4">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-primary font-medium"
              >
                Sign Up
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
