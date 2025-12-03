import { useStore, type User, type Subscription } from "@/lib/store";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Users, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Calendar as CalendarIcon,
  UserCog,
  Save,
  FileText,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function DoctorDashboard() {
  const { users, subscriptions, plans, services, updateStepStatus, addStep, removeStep, messages, sendMessage, currentUser, updateUser, updateStepDate, updateSubscriptionNotes, loadData, isLoading } = useStore();
  
  useEffect(() => {
    loadData();
  }, []);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState(""); 
  const [msgInput, setMsgInput] = useState("");
  
  // Profile State
  const [profileData, setProfileData] = useState<Partial<User>>({});

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name,
        email: currentUser.email,
        specialization: currentUser.specialization || '',
        experience: currentUser.experience || 0,
        phone: currentUser.phone || '',
        bio: currentUser.bio || ''
      });
    }
  }, [currentUser]);

  const myPatientIds = users.filter(u => u.role === 'patient' && u.doctorId === currentUser?.id).map(u => u.id);
  const activeSubs = subscriptions.filter(s => s.status === 'active' && myPatientIds.includes(s.userId));

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

  const handleSaveProfile = () => {
    if (currentUser) {
      updateUser(currentUser.id, profileData);
    }
  };

  const handleUpdateNotes = (notes: string) => {
    if (selectedSubId) {
      updateSubscriptionNotes(selectedSubId, notes);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Tabs defaultValue="patients" className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex justify-between items-center mb-4">
           <TabsList>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Пациенты
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Мой Профиль
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="patients" className="flex-1 mt-0 overflow-hidden">
          <div className="flex h-full gap-6">
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
                      <TabsTrigger value="notes">Заметки</TabsTrigger>
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
                            <div key={step.id} className="flex items-start gap-3 p-4 bg-card rounded-lg border hover:shadow-sm transition-all group">
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
                                
                                {/* Date Picker */}
                                <div className="mt-2 flex items-center gap-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                          "h-7 text-xs justify-start text-left font-normal w-[130px]",
                                          !step.date && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-3 w-3" />
                                        {step.date ? format(new Date(step.date), "d MMM yyyy", { locale: ru }) : <span>Выбрать дату</span>}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={step.date ? new Date(step.date) : undefined}
                                        onSelect={(date) => date && updateStepDate(selectedSub.id, step.id, date.toISOString())}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeStep(selectedSub.id, step.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notes" className="flex-1 mt-0 overflow-hidden">
                    <Card className="h-full flex flex-col">
                      <CardHeader>
                         <CardTitle className="text-lg flex items-center gap-2">
                           <FileText className="h-5 w-5" />
                           Заметки о пациенте
                         </CardTitle>
                         <CardDescription>Личные комментарии и рекомендации (пациент их не видит)</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <Textarea 
                           className="h-full resize-none p-4 text-base" 
                           placeholder="Введите историю болезни, особые рекомендации или заметки..."
                           value={selectedSub.doctorNotes || ''}
                           onChange={(e) => handleUpdateNotes(e.target.value)}
                        />
                      </CardContent>
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
        </TabsContent>

        <TabsContent value="profile" className="flex-1 mt-0">
          <Card className="max-w-2xl mx-auto">
             <CardHeader>
               <CardTitle>Профиль Врача</CardTitle>
               <CardDescription>Информация, которую видят пациенты</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Имя</Label>
                   <Input value={profileData.name || ''} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label>Email</Label>
                   <Input value={profileData.email || ''} onChange={e => setProfileData({...profileData, email: e.target.value})} />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Специализация</Label>
                   <Input 
                      placeholder="Например: Терапевт" 
                      value={profileData.specialization || ''} 
                      onChange={e => setProfileData({...profileData, specialization: e.target.value})} 
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Стаж (лет)</Label>
                   <Input 
                      type="number" 
                      value={profileData.experience || 0} 
                      onChange={e => setProfileData({...profileData, experience: parseInt(e.target.value)})} 
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <Label>Телефон</Label>
                 <Input 
                    placeholder="+7 (___) ___-__-__" 
                    value={profileData.phone || ''} 
                    onChange={e => setProfileData({...profileData, phone: e.target.value})} 
                 />
               </div>

               <div className="space-y-2">
                 <Label>О себе</Label>
                 <Textarea 
                    placeholder="Краткая биография, образование, подход к лечению..." 
                    className="min-h-[100px]"
                    value={profileData.bio || ''} 
                    onChange={e => setProfileData({...profileData, bio: e.target.value})} 
                 />
               </div>
             </CardContent>
             <CardFooter>
               <Button onClick={handleSaveProfile} className="ml-auto">
                 <Save className="h-4 w-4 mr-2" />
                 Сохранить изменения
               </Button>
             </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
