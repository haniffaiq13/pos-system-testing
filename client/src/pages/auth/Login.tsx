import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { useSessionStore } from "@/store/session";
import { useLocation, Link } from "wouter";
import { AuthLayout } from "./AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";
import { ROLE_HOME } from "@/utils/routes";

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Gunakan format email yang valid"),
  password: z.string().min(6, "Minimal 6 karakter"),
});

type LoginValues = z.infer<typeof loginSchema>;

const demoAccounts: Array<{ email: string; role: "admin" | "pos" | "user"; label: string }> = [
  { email: "admin@demo.io", role: "admin", label: "Admin Dashboard" },
  { email: "pos@demo.io", role: "pos", label: "POS Operator" },
  { email: "hanif@demo.io", role: "user", label: "Loyalty Member" },
];

export default function LoginPage() {
  const { toast } = useToast();
  const { setCurrentUser } = useSessionStore();
  const [, setLocation] = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) => api.login(values.email, values.password),
    onSuccess: (user) => {
      setCurrentUser(user);
      toast({
        title: "Berhasil masuk",
        description: `Kamu sekarang login sebagai ${user.email}`,
      });
      setLocation(ROLE_HOME[user.role]);
    },
    onError: (error: Error) => {
      toast({
        title: "Login gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: LoginValues) => loginMutation.mutate(values);

  const handleDemoLogin = (email: string) => {
    setValue("email", email);
    setValue("password", "password");
    loginMutation.mutate({ email, password: "password" });
  };

  return (
    <AuthLayout
      title="Masuk ke PointHub"
      description="Gunakan akun demo atau kredensial Anda untuk mengakses dashboard."
      footer={
        <span>
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Daftar sekarang
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="form-login">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
            className="h-12 rounded-2xl"
          />
          {errors.email && (
            <p className="text-sm text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
            className="h-12 rounded-2xl"
          />
          {errors.password && (
            <p className="text-sm text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Masuk
            </>
          )}
        </Button>
      </form>

      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Atau pilih akun demo
        </div>
        <div className="grid gap-2">
          {demoAccounts.map((account) => (
            <Button
              key={account.email}
              type="button"
              variant="outline"
              className="h-12 justify-between rounded-2xl border-dashed"
              onClick={() => handleDemoLogin(account.email)}
              disabled={loginMutation.isPending}
            >
              <span className="font-medium">{account.label}</span>
              <span className="text-sm text-muted-foreground">{account.email}</span>
            </Button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
