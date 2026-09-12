import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) navigate({ to: "/", replace: true });
  }, [user, navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = login(email);
      setLoading(false);
      if (!res.ok) return setError(res.error ?? "Login failed");
      navigate({ to: "/" });
    }, 300);
  };

  if (user) return null;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
      <div className="mb-6 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[rgb(0,136,242)] to-[rgb(146,100,239)] text-white">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="text-lg font-semibold">IMILearn</span>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back. Use any seed email to explore.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@imi.edu" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          No account? <Link to="/register" className="text-primary hover:underline">Register</Link>
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
        <div className="font-semibold text-foreground">Demo accounts</div>
        <div>admin@imi.edu · prof@imi.edu · asst@imi.edu · marko@imi.edu · elena@imi.edu</div>
      </div>
    </div>
  );
}
