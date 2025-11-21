import { useStore, User, Subscription } from "@/lib/store";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DoctorDashboard() {
  const { users, subscriptions, plans, services, updateStepStatus, addStep, removeStep, messages, sendMessage, currentUser } = useStore();
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState(""); // Fallback if needed, or for note
  const [msgInput, setMsgInput] = useState("");

  const activeSubs = subscriptions.filter(s => s.status === 'active');

  const getPlanName = (id: string) => plans.find(p => p.id === id)?.name || 'Неизвестно';

  const selectedSub = subscriptions.find(s => s.id === selectedSubId);
  const selectedPatient = users.find(u => u.id === selectedSub?.userId);
  const selectedPlan = plans.find(p => p.id === selectedSub?.planId);

  // Available services for this patient based on plan
  const availableServices = services.filter(svc => selectedPlan?.allowedServiceIds.includes(svc.id));

  // Messages for selected patient
  const patientMessages = selectedPatient 
    ? messages.filter(m => 
        (m.fromId === selectedPatient.id && m.toId === currentUser?.id) || 
        (m.fromId === currentUser?.id && m.toId === selectedPatient.id)
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  const handleAddStep = () => {
    if (!selectedSubId || !selectedServiceId) return;
    
    const service = services.find(s => s.id === selectedServiceId);
    if (!service) return;

    addStep(selectedSubId, {
      title: service.name,
      description: customTitle || 'Назначено врачом',
      type: service.type,
      serviceId: service.id
    });
    
    setSelectedServiceId("");
    setCustomTitle("");
  };

  const handleSendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !selectedPatient || !currentUser) return;
    sendMessage(currentUser.id, selectedPatient.id, msgInput);
    setMsgInput("");
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
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* Left: Patient List */}
        <Card className="w-1/3 flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Мои Пациенты
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {activeSubs.map(sub => {
                  const patient = users.find(u => u.id === sub.userId);
                  if (!patient) return null;
                  return (
                    <div 
                      key={sub.id} 
                      onClick={() => setSelectedSubId(sub.id)}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-3",
                        selectedSubId === sub.id ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                      )}
                    >
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{getPlanName(sub.planId)}</p>
                      </div>
                      {sub.route.some(s => s.status === 'pending') && (
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Patient Detail */}
        <div className="flex-1 flex flex-col h-full">
          {selectedSub && selectedPatient ? (
            <Tabs defaultValue="route" className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{getPlanName(selectedSub.planId)}</Badge>
                      <span>Старт {new Date(selectedSub.startDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
                <TabsList>
                  <TabsTrigger value="route">Маршрут</TabsTrigger>
                  <TabsTrigger value="chat">Чат</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="route" className="flex-1 mt-0 overflow-hidden">
                <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Этапы лечения</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Добавить этап</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Назначение услуги</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="bg-muted/20 p-3 rounded-md flex gap-2 items-start text-sm">
                            <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                            <p>В списке доступны только услуги, включенные в тариф пациента <strong>"{selectedPlan?.name}"</strong>.</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Выберите услугу</Label>
                            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите услугу из тарифа" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableServices.length > 0 ? (
                                  availableServices.map(svc => (
                                    <SelectItem key={svc.id} value={svc.id}>
                                      {svc.name} ({getStepTypeLabel(svc.type)})
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-2 text-sm text-muted-foreground text-center">Нет доступных услуг</div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Комментарий (необязательно)</Label>
                            <Input 
                                value={customTitle} 
                                onChange={e => setCustomTitle(e.target.value)} 
                                placeholder="Например: Утром натощак" 
                            />
                          </div>
                          
                          <Button onClick={handleAddStep} className="w-full" disabled={!selectedServiceId}>
                            Назначить
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <ScrollArea className="flex-1 bg-white rounded-lg border p-1">
                    <div className="space-y-2 p-4">
                      {selectedSub.route.map((step, i) => (
                        <div key={step.id} className="flex items-start gap-3 p-4 bg-card rounded-lg border hover:shadow-sm transition-all">
                          <Button
                            size="icon"
                            variant={step.status === 'completed' ? "default" : "outline"}
                            className={cn("h-8 w-8 mt-0.5 shrink-0", step.status === 'completed' ? "bg-green-600 hover:bg-green-700" : "")}
                            onClick={() => updateStepStatus(selectedSub.id, step.id, step.status === 'completed' ? 'pending' : 'completed')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className={cn("font-medium", step.status === 'completed' && "line-through text-muted-foreground")}>
                                {step.title}
                              </h4>
                              <Badge variant="secondary" className="text-[10px] h-5">{getStepTypeLabel(step.type)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeStep(selectedSub.id, step.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </TabsContent>

              <TabsContent value="chat" className="flex-1 mt-0 overflow-hidden">
                <Card className="h-full flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {patientMessages.map(msg => (
                        <div key={msg.id} className={cn(
                          "flex flex-col max-w-[80%]",
                          msg.fromId === currentUser?.id ? "ml-auto items-end" : "mr-auto items-start"
                        )}>
                           <div className={cn(
                            "px-4 py-2 rounded-2xl text-sm",
                            msg.fromId === currentUser?.id 
                              ? "bg-primary text-primary-foreground rounded-br-sm" 
                              : "bg-muted text-foreground rounded-bl-sm"
                          )}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString('ru-RU')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-3 border-t">
                    <form onSubmit={handleSendMsg} className="flex gap-2">
                      <Input value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder="Ответить пациенту..." />
                      <Button type="submit">Отправить</Button>
                    </form>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
              <div className="text-center">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>Выберите пациента для просмотра</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
