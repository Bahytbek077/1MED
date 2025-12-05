import { useStore } from "@/lib/store";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, Clock, ArrowRight, MessageSquare, Send, Loader2, UserCircle, Phone, Mail, Stethoscope, Gift, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { differenceInDays } from "date-fns";

export default function PatientDashboard() {
  const { currentUser, users, plans, subscriptions, subscribe, messages, sendMessage, loadData, isLoading } = useStore();
  
  useEffect(() => {
    loadData();
  }, []);
  const mySub = subscriptions.find(s => s.userId === currentUser?.id && s.status === 'active');
  const myPlan = plans.find(p => p.id === mySub?.planId);
  
  const myDoctor = users.find(u => u.id === currentUser?.doctorId && u.role === 'doctor');
  
  const myMessages = messages.filter(m => 
    (m.fromId === currentUser?.id && m.toId === myDoctor?.id) || 
    (m.toId === currentUser?.id && m.fromId === myDoctor?.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const [msgInput, setMsgInput] = useState("");

  if (!currentUser) return null;
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const handleSubscribe = async (planId: string) => {
    await subscribe(currentUser.id, planId);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !myDoctor) return;
    sendMessage(currentUser.id, myDoctor.id, msgInput);
    setMsgInput("");
  };

  const demoPlan = plans.find(p => p.isTrial === 1);
  const paidPlans = plans.filter(p => p.isTrial !== 1);

  if (!mySub) {
    return (
      <Layout>
        <div className="space-y-8">
          {/* Demo Banner */}
          {demoPlan && (
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-lg" data-testid="card-demo-banner">
              <CardContent className="py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Gift className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-primary">Попробуйте бесплатно!</h2>
                      <p className="text-muted-foreground">10 дней демо-доступа с чатом терапевта</p>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="gap-2 px-8" 
                    onClick={() => handleSubscribe(demoPlan.id)}
                    data-testid="button-start-demo"
                  >
                    <Sparkles className="h-5 w-5" />
                    Попробовать демо-версию
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">Выберите ваш тариф</h1>
            <p className="text-muted-foreground">Или оформите подписку прямо сейчас</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {paidPlans.map(plan => (
              <Card key={plan.id} className="relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">{plan.name}</CardTitle>
                  <CardDescription className="text-lg font-semibold mt-2">
                    {plan.price.toLocaleString()} ₸ / год
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg" onClick={() => handleSubscribe(plan.id)}>
                    Выбрать
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const isTrialPlan = myPlan?.isTrial === 1;
  const trialDaysLeft = mySub.endDate 
    ? Math.max(0, differenceInDays(new Date(mySub.endDate), new Date()))
    : (myPlan?.trialDays || 10);
  const isTrialExpired = isTrialPlan && trialDaysLeft <= 0;

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleUpgrade = async (planId: string) => {
    await subscribe(currentUser.id, planId);
    setShowUpgradeModal(false);
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'active': return 'Активна';
      case 'pending': return 'Ожидает';
      case 'inactive': return 'Неактивна';
      default: return status;
    }
  };

  const getStepTypeLabel = (type: string) => {
    switch(type) {
      case 'consultation': return 'Консультация';
      case 'test': return 'Анализ';
      case 'specialist': return 'Специалист';
      default: return type;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Trial Status Banner */}
        {isTrialPlan && (
          <Card className={cn(
            "border-2",
            isTrialExpired 
              ? "bg-red-50 border-red-200" 
              : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
          )} data-testid="card-trial-status">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center",
                    isTrialExpired ? "bg-red-100" : "bg-amber-100"
                  )}>
                    <Calendar className={cn("h-6 w-6", isTrialExpired ? "text-red-600" : "text-amber-600")} />
                  </div>
                  <div>
                    {isTrialExpired ? (
                      <>
                        <h3 className="font-semibold text-red-700">Пробный период закончился</h3>
                        <p className="text-sm text-red-600">Оформите подписку, чтобы продолжить пользоваться сервисом</p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-amber-700">Демо-версия: осталось {trialDaysLeft} дней</h3>
                        <p className="text-sm text-amber-600">Оформите подписку для полного доступа ко всем функциям</p>
                      </>
                    )}
                  </div>
                </div>
                <Button 
                  variant={isTrialExpired ? "destructive" : "default"}
                  className="gap-2"
                  onClick={() => setShowUpgradeModal(true)}
                  data-testid="button-upgrade"
                >
                  <ArrowRight className="h-4 w-4" />
                  Перейти на подписку
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <Card className="border-2 border-primary/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Выберите тариф</CardTitle>
              <CardDescription>Ваша история чата и данные сохранятся при переходе</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {paidPlans.map(plan => (
                  <Card key={plan.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50" onClick={() => handleUpgrade(plan.id)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription className="font-semibold text-primary">
                        {plan.price.toLocaleString()} ₸ / год
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1 text-sm">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="ghost" onClick={() => setShowUpgradeModal(false)}>
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Journey */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary">Ваш маршрут здоровья</h1>
                <p className="text-muted-foreground">Тариф: {myPlan?.name}</p>
              </div>
              <Badge variant={mySub.status === 'active' ? 'default' : 'secondary'} className="text-base px-4 py-1">
                {getStatusLabel(mySub.status)}
              </Badge>
            </div>

          <Card className="border-none shadow-md bg-white/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="relative space-y-8 pl-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {mySub.route.map((step, i) => (
                  <div key={step.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={cn(
                      "absolute -left-[34px] top-1 h-8 w-8 rounded-full border-4 flex items-center justify-center bg-white transition-colors z-10",
                      step.status === 'completed' ? "border-primary text-primary" : "border-muted text-muted-foreground"
                    )}>
                      {step.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </div>

                    <Card className={cn(
                      "transition-all duration-300 hover:shadow-md",
                      step.status === 'pending' ? "border-l-4 border-l-primary" : "opacity-70"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-lg">{step.title}</h3>
                          {step.date && <Badge variant="outline" className="flex gap-1"><Clock className="h-3 w-3" /> {new Date(step.date).toLocaleDateString('ru-RU')}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        <div className="mt-3 flex gap-2">
                          <Badge variant="secondary" className="capitalize">{getStepTypeLabel(step.type)}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Doctor Info + Chat */}
        <div className="lg:col-span-1 space-y-4">
          {/* Doctor Info Card */}
          {myDoctor ? (
            <Card className="shadow-md border-primary/10" data-testid="card-doctor-info">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Ваш лечащий врач
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {myDoctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg" data-testid="text-doctor-name">{myDoctor.name}</h3>
                  {myDoctor.specialization && (
                    <p className="text-sm text-primary font-medium" data-testid="text-doctor-specialization">{myDoctor.specialization}</p>
                  )}
                  {myDoctor.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span data-testid="text-doctor-phone">{myDoctor.phone}</span>
                    </div>
                  )}
                  {myDoctor.email && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span data-testid="text-doctor-email">{myDoctor.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md border-dashed border-2">
              <CardContent className="py-6 text-center text-muted-foreground">
                <UserCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Врач пока не назначен</p>
                <p className="text-xs mt-1">Администратор назначит вам врача в ближайшее время</p>
              </CardContent>
            </Card>
          )}

          {/* Chat Card */}
          <Card className="h-[calc(100vh-20rem)] flex flex-col shadow-lg border-primary/10">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                {myDoctor ? `Чат с ${myDoctor.name.split(' ')[0]}` : 'Чат с врачом'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {myMessages.length === 0 && (
                    <div className="text-center text-muted-foreground py-10 text-sm">
                      Нет сообщений. Начните диалог!
                    </div>
                  )}
                  {myMessages.map(msg => (
                    <div key={msg.id} className={cn(
                      "flex flex-col max-w-[85%]",
                      msg.fromId === currentUser.id ? "ml-auto items-end" : "mr-auto items-start"
                    )}>
                      <div className={cn(
                        "px-4 py-2 rounded-2xl text-sm",
                        msg.fromId === currentUser.id 
                          ? "bg-primary text-primary-foreground rounded-br-sm" 
                          : "bg-muted text-foreground rounded-bl-sm"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 bg-muted/20">
              <form onSubmit={handleSend} className="flex w-full gap-2">
                <Input 
                  placeholder="Задайте вопрос..." 
                  value={msgInput} 
                  onChange={(e) => setMsgInput(e.target.value)}
                  className="bg-white"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
        </div>
      </div>
    </Layout>
  );
}
