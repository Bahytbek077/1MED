import { useState } from "react";
import { useStore, Role } from "@/lib/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, ShieldCheck } from "lucide-react";
import generatedImage from "@assets/generated_images/clean_medical_abstract_background_with_soft_blue_gradients.png";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("patient");
  const { login, register } = useStore();
  const [_, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    const user = useStore.getState().currentUser;
    if (user) {
      setLocation(`/${user.role}/dashboard`);
    } else {
      alert("User not found. Try: doctor@1med.com, patient@gmail.com, or admin@1med.com");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(name, email, "patient"); // Default to patient for registration
    setLocation("/patient/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${generatedImage})` }}>
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
      
      <Card className="w-[400px] z-10 shadow-2xl border-white/20 bg-white/90 backdrop-blur-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Stethoscope className="h-7 w-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold font-heading text-primary">1MED</CardTitle>
            <CardDescription className="text-base">Your Personal Health Journey</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    placeholder="name@example.com" 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/50"
                  />
                </div>
                <Button type="submit" className="w-full text-lg h-11">Sign In</Button>
                
                <div className="pt-4 text-xs text-center text-muted-foreground space-y-1 bg-muted/50 p-2 rounded border">
                  <p className="font-semibold">Demo Credentials:</p>
                  <p>Patient: <span className="font-mono text-primary">patient@gmail.com</span></p>
                  <p>Doctor: <span className="font-mono text-primary">doctor@1med.com</span></p>
                  <p>Admin: <span className="font-mono text-primary">admin@1med.com</span></p>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
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
                <Button type="submit" className="w-full text-lg h-11">Create Account</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
