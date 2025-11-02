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
import { Loader2, UserPlus } from "lucide-react";
import { ROLE_HOME } from "@/utils/routes";

const registerSchema = z
  .object({
    email: z.string().min(1, "Email wajib diisi").email("Gunakan format email yang valid"),
    password: z.string().min(6, "Minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Minimal 6 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sesuai",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const { setCurrentUser } = useSessionStore();
  const [, setLocation] = useLocation();

  const {
    register: formRegister,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterValues) =>
      api.register({ email: values.email, password: values.password, role: "user" }),
    onSuccess: (user) => {
      setCurrentUser(user);
      toast({
        title: "Akun berhasil dibuat",
        description: `Selamat datang, ${user.email}`,
      });
      reset();
      setLocation(ROLE_HOME[user.role]);
    },
    onError: (error: Error) => {
      toast({
        title: "Registrasi gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: RegisterValues) => registerMutation.mutate(values);

  return (
    <AuthLayout
      title="Buat akun PointHub"
      description="Daftar sebagai loyalty member untuk mulai mengumpulkan poin dan rewards."
      footer={
        <span>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Masuk di sini
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="form-register">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...formRegister("email")}
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
            autoComplete="new-password"
            {...formRegister("password")}
            className="h-12 rounded-2xl"
          />
          {errors.password && (
            <p className="text-sm text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...formRegister("confirmPassword")}
            className="h-12 rounded-2xl"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Daftar
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
