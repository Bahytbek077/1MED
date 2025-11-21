import { useStore, Plan, Service } from "@/lib/store";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Edit2, CheckCircle2, Stethoscope, TestTube, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminPlans() {
  const { plans, services, updatePlan } = useStore();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Plan>>({});

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      description: plan.description,
      features: plan.features,
      allowedServiceIds: plan.allowedServiceIds
    });
    setIsEditOpen(true);
  };

  const handleSave = () => {
    if (!editingPlan) return;
    updatePlan(editingPlan.id, formData);
    setIsEditOpen(false);
    setEditingPlan(null);
  };

  const toggleService = (serviceId: string) => {
    const currentIds = formData.allowedServiceIds || [];
    if (currentIds.includes(serviceId)) {
      setFormData({ ...formData, allowedServiceIds: currentIds.filter(id => id !== serviceId) });
    } else {
      setFormData({ ...formData, allowedServiceIds: [...currentIds, serviceId] });
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <Stethoscope className="h-4 w-4" />;
      case 'test': return <TestTube className="h-4 w-4" />;
      case 'specialist': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Управление Тарифами</h1>
          <p className="text-muted-foreground">Настройка доступных услуг для каждого тарифа</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <Card key={plan.id} className="flex flex-col h-full hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-1 font-bold text-primary text-lg">
                      {plan.price.toLocaleString()} ₽
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => openEdit(plan)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Доступные услуги:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.allowedServiceIds.map(svcId => {
                      const svc = services.find(s => s.id === svcId);
                      if (!svc) return null;
                      return (
                        <Badge key={svc.id} variant="secondary" className="text-[10px] flex gap-1 items-center">
                          {getServiceIcon(svc.type)}
                          {svc.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Редактирование тарифа: {editingPlan?.name}</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Название</Label>
                    <Input 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Цена (₽)</Label>
                    <Input 
                      type="number"
                      value={formData.price || 0} 
                      onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Input 
                    value={formData.description || ''} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Доступные услуги в тарифе</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-lg p-4 bg-muted/10">
                    {services.map(service => (
                      <div key={service.id} className="flex items-center space-x-2 p-2 rounded hover:bg-white transition-colors">
                        <Checkbox 
                          id={`svc-${service.id}`} 
                          checked={formData.allowedServiceIds?.includes(service.id)}
                          onCheckedChange={() => toggleService(service.id)}
                        />
                        <Label 
                          htmlFor={`svc-${service.id}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center gap-2"
                        >
                          {getServiceIcon(service.type)}
                          {service.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Отмена</Button>
              <Button onClick={handleSave}>Сохранить изменения</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}
