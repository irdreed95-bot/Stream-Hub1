import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, PlayCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Demo Mode",
      description: "This is a demo — authentication is coming soon!",
    });
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-black z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background/80 to-background z-20" />
      </div>

      <div className="max-w-md w-full relative z-30">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,193,7,0.3)]">
            <PlayCircle className="w-10 h-10 fill-primary text-background" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">StreamVault</h1>
        </div>

        {/* Card */}
        <div className="bg-card/90 backdrop-blur-md rounded-2xl border border-border p-8 shadow-2xl">
          
          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border/50 pb-px">
            <button
              onClick={() => setActiveTab("signin")}
              className={`pb-3 font-semibold transition-colors relative ${activeTab === 'signin' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign In
              {activeTab === 'signin' && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_rgba(255,193,7,0.5)]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`pb-3 font-semibold transition-colors relative ${activeTab === 'signup' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Create Account
              {activeTab === 'signup' && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_rgba(255,193,7,0.5)]" />
              )}
            </button>
          </div>

          {/* Forms */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {activeTab === "signup" && (
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Full Name" 
                    className="pl-10 h-12 bg-background/50 border-border focus-visible:ring-primary"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  className="pl-10 h-12 bg-background/50 border-border focus-visible:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  className="pl-10 pr-10 h-12 bg-background/50 border-border focus-visible:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {activeTab === "signup" && (
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Confirm Password" 
                    className="pl-10 pr-10 h-12 bg-background/50 border-border focus-visible:ring-primary"
                    required
                  />
                </div>
              </div>
            )}

            {activeTab === "signin" && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary" />
                  <label htmlFor="remember" className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Forgot Password?
                </a>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 mt-4 shadow-[0_4px_14px_rgba(255,193,7,0.3)] hover:shadow-[0_6px_20px_rgba(255,193,7,0.4)] transition-all">
              {activeTab === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}