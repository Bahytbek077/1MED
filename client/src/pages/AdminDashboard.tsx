import { useStore } from "@/lib/store";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { DollarSign, Users, Activity, Search } from "lucide-react";

export default function AdminDashboard() {
  const { users, subscriptions, plans, toggleSubscription, updatePlan } = useStore();
  const [search, setSearch] = useState("");

  const patientSubs = subscriptions.map(sub => ({
    ...sub,
    user: users.find(u => u.id === sub.userId),
    plan: plans.find(p => p.id === sub.planId)
  })).filter(item => 
    item.user?.name.toLowerCase().includes(search.toLowerCase()) || 
    item.user?.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = subscriptions.reduce((acc, sub) => {
    const plan = plans.find(p => p.id === sub.planId);
    return acc + (plan?.price || 0);
  }, 0);

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Панель Администратора</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} ₽</div>
              <p className="text-xs text-muted-foreground">+20.1% к прошлому месяцу</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Активные пациенты</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.role === 'patient').length}</div>
              <p className="text-xs text-muted-foreground">+12 новых на этой неделе</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Активные подписки</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">98% уровень удержания</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions Management */}
        <Card>
          <CardHeader>
            <CardTitle>Управление подписками</CardTitle>
            <CardDescription>Управление доступом и статусами пациентов</CardDescription>
            <div className="pt-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Поиск пациентов..." 
                  className="pl-8 max-w-sm"
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
                  <TableHead>Пациент</TableHead>
                  <TableHead>Тариф</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата начала</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientSubs.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>{item.user?.name}</div>
                      <div className="text-xs text-muted-foreground">{item.user?.email}</div>
                    </TableCell>
                    <TableCell>{item.plan?.name}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status === 'active' ? 'Активна' : 'Неактивна'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(item.startDate).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <span className="text-xs text-muted-foreground">Доступ</span>
                        <Switch 
                          checked={item.status === 'active'} 
                          onCheckedChange={() => toggleSubscription(item.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

         {/* Plan Editor (Simplified) */}
         <div className="grid md:grid-cols-3 gap-6">
           {plans.map(plan => (
             <Card key={plan.id}>
               <CardHeader>
                 <CardTitle>{plan.name}</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Цена (₽)</label>
                   <Input 
                      type="number" 
                      value={plan.price} 
                      onChange={(e) => updatePlan(plan.id, { price: parseInt(e.target.value) })}
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Описание</label>
                   <Input 
                      value={plan.description} 
                      onChange={(e) => updatePlan(plan.id, { description: e.target.value })}
                   />
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
      </div>
    </Layout>
  );
}
