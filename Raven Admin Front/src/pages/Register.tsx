import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useAuth } from "@/contexts/AuthContext";
import { ADD_STUDENT_MUTATION } from "@/lib/graphql";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, UserPlus, CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [career, setCareer] = useState("");
  const [success, setSuccess] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [addStudent, { loading, error }] = useMutation(ADD_STUDENT_MUTATION, {
    onCompleted: () => {
      setSuccess(true);
      setStudentId("");
      setName("");
      setCareer("");
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !name.trim() || !career.trim()) return;
    setSuccess(false);
    addStudent({ variables: { id: studentId, name, career } });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isValid = studentId.trim() && name.trim() && career.trim();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
          <span className="gradient-text font-semibold">zen-credential-gateway</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.username}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,hsl(199_89%_48%/0.06),transparent_60%)]" />

        <Card className="glass-card relative z-10 w-full max-w-lg">
          <CardHeader className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">Registro de Estudiante</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa los datos del estudiante para generar su credencial escolar.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-sm font-medium text-secondary-foreground">
                  ID del Estudiante
                </Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Ej: STU-2024-001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="h-11 bg-muted/50 border-border/50 placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-secondary-foreground">
                  Nombre Completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nombre y apellidos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 bg-muted/50 border-border/50 placeholder:text-muted-foreground/50 focus-visible:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="career" className="text-sm font-medium text-secondary-foreground">
                  Carrera
                </Label>
                <Input
                  id="career"
                  type="text"
                  placeholder="Ej: Ingeniería en Sistemas"
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  className="h-11 bg-muted/50 border-border/50 placeholder:text-muted-foreground/50 focus-visible:ring-primary/50"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Error al registrar estudiante. Inténtalo de nuevo.</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--success)/0.1)] p-3 text-sm text-[hsl(var(--success))]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Estudiante registrado exitosamente.</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !isValid}
                className="h-11 w-full font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Estudiante"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Register;
