import { useState } from "react";
import { useStore, Role } from "@/lib/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, User, Users, Shield, ArrowLeft, Lock } from "lucide-react";
import generatedImage from "@assets/generated_images/clean_medical_abstract_background_with_soft_blue_gradients.png";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

export default function Auth() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { login, register } = useStore();
  const [_, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    
    if (success) {
      const user = useStore.getState().currentUser;
      if (user) {
        if (user.role !== selectedRole) {
           alert(`Ошибка: Этот аккаунт имеет роль "${user.role}", а вы пытаетесь войти как "${selectedRole}".`);
           return;
        }
        setLocation(`/${user.role}/dashboard`);
      }
    } else {
      alert("Неверный email или пароль");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole !== 'patient') {
        alert("Самостоятельная регистрация доступна только для пациентов.");
        return;
    }
    if (!password) {
        alert("Введите пароль");
        return;
    }
    try {
      await register(name, email, password, "patient");
      setLocation("/patient/dashboard");
    } catch (error) {
      alert("Ошибка регистрации");
    }
  };


  if (!selectedRole) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: `url(${generatedImage})` }}>
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
          
          <div className="z-10 w-full max-w-4xl space-y-8">
            <div className="text-center space-y-4 flex flex-col items-center">
                <div className="mb-4">
                  <Logo size="lg" className="text-primary scale-125" />
                </div>
                <p className="text-xl text-muted-foreground font-medium">Выберите вашу роль для входа</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Patient Card */}
                <Card 
                    className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl border-2 hover:border-primary/50 group bg-white/80 backdrop-blur"
                    onClick={() => { setSelectedRole('patient'); }}
                >
                    <CardHeader className="text-center space-y-4 pb-2">
                        <div className="mx-auto h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                            <User className="h-7 w-7" />
                        </div>
                        <CardTitle className="text-2xl">Пациент</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground text-sm">
                        Личный кабинет, запись к врачам, просмотр анализов и маршрута лечения.
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white">Войти как Пациент</Button>
                    </CardFooter>
                </Card>

                {/* Doctor Card */}
                <Card 
                    className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl border-2 hover:border-primary/50 group bg-white/80 backdrop-blur"
                    onClick={() => { setSelectedRole('doctor'); }}
                >
                    <CardHeader className="text-center space-y-4 pb-2">
                        <div className="mx-auto h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                            <Stethoscope className="h-7 w-7" />
                        </div>
                        <CardTitle className="text-2xl">Врач</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground text-sm">
                        Управление пациентами, назначение этапов лечения, консультации в чате.
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white">Войти как Врач</Button>
                    </CardFooter>
                </Card>

                {/* Admin Card */}
                <Card 
                    className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl border-2 hover:border-primary/50 group bg-white/80 backdrop-blur"
                    onClick={() => { setSelectedRole('admin'); }}
                >
                    <CardHeader className="text-center space-y-4 pb-2">
                        <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                            <Shield className="h-7 w-7" />
                        </div>
                        <CardTitle className="text-2xl">Администратор</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground text-sm">
                        Управление подписками, пользователями, тарифами и общей статистикой.
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white">Войти как Админ</Button>
                    </CardFooter>
                </Card>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${generatedImage})` }}>
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
      
      <Card className="w-[400px] z-10 shadow-2xl border-white/20 bg-white/90 backdrop-blur-md">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 top-4"
            onClick={() => { setSelectedRole(null); setEmail(""); setPassword(""); }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center space-y-2 pt-2 flex flex-col items-center">
            <Logo size="md" className="text-primary" showSlogan={false} />
            <div>
              <CardTitle className="text-2xl font-bold font-heading text-primary mt-4">
                {selectedRole === 'patient' && 'Вход для Пациента'}
                {selectedRole === 'doctor' && 'Вход для Врача'}
                {selectedRole === 'admin' && 'Вход для Админа'}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            {selectedRole === 'patient' ? (
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Вход</TabsTrigger>
                    <TabsTrigger value="register">Регистрация</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login">
                        <LoginForm 
                            email={email} 
                            setEmail={setEmail} 
                            password={password}
                            setPassword={setPassword}
                            handleLogin={handleLogin}
                        />
                    </TabsContent>
                    
                    <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                            <Label htmlFor="name">ФИО</Label>
                            <Input 
                                id="name" 
                                placeholder="Иванов Иван Иванович" 
                                required 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white/50"
                            />
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="reg-email">Email</Label>
                            <Input 
                                id="reg-email" 
                                placeholder="name@example.com" 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/50"
                            />
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="reg-pass">Пароль</Label>
                            <div className="relative">
                                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="reg-pass" 
                                    placeholder="******" 
                                    type="password" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/50 pl-8"
                                />
                            </div>
                            </div>
                            <Button type="submit" className="w-full text-lg h-11">Создать аккаунт</Button>
                        </form>
                    </TabsContent>
                </Tabs>
            ) : (
                <LoginForm 
                    email={email} 
                    setEmail={setEmail} 
                    password={password}
                    setPassword={setPassword}
                    handleLogin={handleLogin}
                />
            )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoginForm({ email, setEmail, password, setPassword, handleLogin }: { 
    email: string, 
    setEmail: (s: string) => void, 
    password: string,
    setPassword: (s: string) => void,
    handleLogin: (e: React.FormEvent) => void
}) {
    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                id="email" 
                placeholder="Введите e-mail"
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/50"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="password" 
                        placeholder="Введите пароль" 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/50 pl-8"
                    />
                </div>
            </div>
            <Button type="submit" className="w-full text-lg h-11">Войти</Button>
        </form>
    );
}
