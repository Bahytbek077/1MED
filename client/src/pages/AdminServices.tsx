import { useStore, Service, ServiceType } from "@/lib/store";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Edit2, Trash2, Plus, Stethoscope, TestTube, Activity, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminServices() {
  const { services, addService, updateService, deleteService } = useStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [search, setSearch] = useState("");

  // Form State
  const [formData, setFormData] = useState<{ name: string; type: ServiceType }>({ name: '', type: 'consultation' });

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!formData.name) return;
    addService(formData);
    setIsAddOpen(false);
    setFormData({ name: '', type: 'consultation' });
  };

  const handleEdit = () => {
    if (!selectedService || !formData.name) return;
    updateService(selectedService.id, formData);
    setIsEditOpen(false);
    setSelectedService(null);
    setFormData({ name: '', type: 'consultation' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту услугу? Она также будет удалена из всех тарифов.')) {
      deleteService(id);
    }
  };

  const openEdit = (service: Service) => {
    setSelectedService(service);
    setFormData({ name: service.name, type: service.type });
    setIsEditOpen(true);
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <Stethoscope className="h-4 w-4" />;
      case 'test': return <TestTube className="h-4 w-4" />;
      case 'specialist': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'consultation': return 'Консультация';
      case 'test': return 'Анализ / Обследование';
      case 'specialist': return 'Врач-специалист';
      default: return type;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Каталог Услуг</h1>
            <p className="text-muted-foreground">Управление списком доступных медицинских услуг</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData({ name: '', type: 'consultation' })}>
                <Plus className="h-4 w-4 mr-2" /> Добавить услугу
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новая услуга</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="Например: МРТ коленного сустава" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Select value={formData.type} onValueChange={(v: ServiceType) => setFormData({...formData, type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Консультация (Терапевт)</SelectItem>
                      <SelectItem value="specialist">Врач-специалист</SelectItem>
                      <SelectItem value="test">Анализ / Тест / Обследование</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Список услуг</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Поиск услуги..." 
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="p-2 bg-muted rounded-full">
                        {getServiceIcon(service.type)}
                      </div>
                      {service.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(service.type)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(service.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredServices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Услуги не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактирование услуги</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Название</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Тип</Label>
                <Select value={formData.type} onValueChange={(v: ServiceType) => setFormData({...formData, type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Консультация (Терапевт)</SelectItem>
                    <SelectItem value="specialist">Врач-специалист</SelectItem>
                    <SelectItem value="test">Анализ / Тест / Обследование</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEdit}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
