import { useStore, User, Role } from "@/lib/store";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Search, Plus, Edit2, Trash2, Key } from "lucide-react";

export default function AdminUsers() {
  const { users, addUser, updateUser, deleteUser } = useStore();
  const [search, setSearch] = useState("");
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form States
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient' as Role });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.password) return;
    addUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    updateUser(selectedUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        ...(formData.password ? { password: formData.password } : {})
    });
    setIsEditOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        deleteUser(id);
    }
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't show existing password
        role: user.role
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'patient' });
    setSelectedUser(null);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-primary">Аккаунты</h1>
                <p className="text-muted-foreground">Управление пользователями и доступом</p>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                    <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" /> Создать пользователя</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Новый пользователь</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>ФИО</Label>
                            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Иванов Иван" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Пароль</Label>
                            <Input value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} type="text" placeholder="Пароль" />
                        </div>
                        <div className="space-y-2">
                            <Label>Роль</Label>
                            <Select value={formData.role} onValueChange={(v: Role) => setFormData({...formData, role: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="patient">Пациент</SelectItem>
                                    <SelectItem value="doctor">Врач</SelectItem>
                                    <SelectItem value="admin">Администратор</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddUser}>Создать</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Список пользователей</CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Поиск..." 
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
                  <TableHead>Имя</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={
                        user.role === 'admin' ? 'destructive' : 
                        user.role === 'doctor' ? 'default' : 'secondary'
                      }>
                        {user.role === 'admin' ? 'Админ' : user.role === 'doctor' ? 'Врач' : 'Пациент'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(user.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Редактирование пользователя</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>ФИО</Label>
                        <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Новый пароль (оставьте пустым, чтобы не менять)</Label>
                        <div className="relative">
                            <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                className="pl-8"
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                type="text" 
                                placeholder="******" 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Роль</Label>
                        <Select value={formData.role} onValueChange={(v: Role) => setFormData({...formData, role: v})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="patient">Пациент</SelectItem>
                                <SelectItem value="doctor">Врач</SelectItem>
                                <SelectItem value="admin">Администратор</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleEditUser}>Сохранить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}
