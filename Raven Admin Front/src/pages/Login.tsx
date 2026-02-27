import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useMutation } from "@apollo/client/react";

import { useAuth } from "@/contexts/AuthContext";

import { LOGIN_MUTATION } from "@/lib/graphql";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const { login } = useAuth();

  const [loginMutation, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data: any) => {
      login(data.login.user, data.login.token);

      navigate("/register");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) return;

    loginMutation({ variables: { username, password } });
  };

return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0a0a0c]">
      {/* Background grid effect - Cambiado a un tono carbón/grafito muy sutil */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Glow effect - Cambiado a un resplandor carmesí/rojo oscuro muy sobrio */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(185,28,28,0.08),transparent_70%)]" />

      {/* Tarjeta principal con bordes más oscuros */}
      <Card className="relative z-10 w-full max-w-md bg-[#121214]/80 border-[#27272a] backdrop-blur-md shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-950/30 ring-1 ring-red-900/50 shadow-[0_0_15px_rgba(185,28,28,0.2)]">
            <ShieldCheck className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Raven Admin
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Sistema de validación de credenciales
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-zinc-300">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 bg-[#18181b] border-[#27272a] text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-red-900/50 focus-visible:border-red-800/50 transition-all"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-[#18181b] border-[#27272a] text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-red-900/50 focus-visible:border-red-800/50 transition-all"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-950/50 border border-red-900/50 p-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Credenciales inválidas. Inténtalo de nuevo.</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="h-11 w-full font-semibold bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;