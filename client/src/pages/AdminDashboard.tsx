import { useStore } from "@/lib/store";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { DollarSign, Users, Activity, Search, TrendingUp, UserMinus, AlertCircle, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const { users, subscriptions, plans, toggleSubscription, updatePlan, messages, loadData, isLoading } = useStore();
  
  useEffect(() => {
    loadData();
  }, []);
  const [search, setSearch] = useState("");

  const patientSubs = subscriptions.map(sub => ({
    ...sub,
    user: users.find(u => u.id === sub.userId),
    plan: plans.find(p => p.id === sub.planId)
  })).filter(item => 
    item.user?.name.toLowerCase().includes(search.toLowerCase()) || 
    item.user?.email.toLowerCase().includes(search.toLowerCase())
  );

  // 1. Active Subscriptions per Plan
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const subsByPlan = plans.map(plan => ({
    name: plan.name,
    count: activeSubs.filter(s => s.planId === plan.id).length,
    value: activeSubs.filter(s => s.planId === plan.id).length // for PieChart
  }));

  // 2. New Subscriptions (Mock Logic: Assume active subs started within last 30 days for demo)
  const newSubsCount = activeSubs.length; 
  
  // 3. Churn (Inactive Subs)
  const inactiveSubs = subscriptions.filter(s => s.status === 'inactive');
  const churnCount = inactiveSubs.length;

  // 4. Route Completion
  const totalSteps = activeSubs.reduce((acc, sub) => acc + sub.route.length, 0);
  const completedSteps = activeSubs.reduce((acc, sub) => acc + sub.route.filter(s => s.status === 'completed').length, 0);
  const completionRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // 5. Patient Activity (Messages)
  const totalMessages = messages.length;
  
  // 6. Doctor Workload
  const doctorsCount = users.filter(u => u.role === 'doctor').length;
  const patientsPerDoctor = doctorsCount > 0 ? (activeSubs.length / doctorsCount).toFixed(1) : 0;

  // 7. Overdue Steps (Mock Logic: Pending steps with date in past)
  // Since we don't have real dates in all seed data, we'll check pending steps that have a date string < now
  const overdueSteps = activeSubs.flatMap(sub => 
    sub.route
      .filter(step => step.status === 'pending' && step.date && new Date(step.date) < new Date())
      .map(step => ({ ...step, patientName: users.find(u => u.id === sub.userId)?.name, planName: plans.find(p => p.id === sub.planId)?.name }))
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Панель Администратора</h1>
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium">Активные подписки</CardTitle>
               <Activity className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{activeSubs.length}</div>
               <p className="text-xs text-muted-foreground">Всего активных</p>
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium">Новые за месяц</CardTitle>
               <TrendingUp className="h-4 w-4 text-green-500" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">+{newSubsCount}</div>
               <p className="text-xs text-muted-foreground">Рост базы</p>
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium">Отток (Churn)</CardTitle>
               <UserMinus className="h-4 w-4 text-red-500" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{churnCount}</div>
               <p className="text-xs text-muted-foreground">Не продлили подписку</p>
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium">Загрузка врачей</CardTitle>
               <Users className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{patientsPerDoctor}</div>
               <p className="text-xs text-muted-foreground">Пациентов на врача</p>
             </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Chart: Active Subs per Plan */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Распределение по тарифам</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subsByPlan}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

           {/* Chart: Route Completion */}
           <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Прохождение маршрутов</CardTitle>
              <CardDescription>Средний прогресс по всем пациентам</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-center h-[300px] space-y-6">
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span>Выполнено шагов</span>
                   <span className="font-bold">{completionRate}%</span>
                 </div>
                 <Progress value={completionRate} className="h-4" />
                 <p className="text-xs text-muted-foreground text-right">{completedSteps} из {totalSteps} шагов завершено</p>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                 <div>
                   <p className="text-sm font-medium text-muted-foreground">Сообщений в чате</p>
                   <p className="text-2xl font-bold">{totalMessages}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-muted-foreground">Врачей онлайн</p>
                   <p className="text-2xl font-bold">{doctorsCount}</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Steps List */}
        {overdueSteps.length > 0 && (
           <Card className="border-destructive/50 bg-destructive/5">
             <CardHeader>
               <CardTitle className="text-destructive flex items-center gap-2">
                 <AlertCircle className="h-5 w-5" />
                 Просроченные этапы
               </CardTitle>
               <CardDescription>Список пациентов с пропущенными дедлайнами</CardDescription>
             </CardHeader>
             <CardContent>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Пациент</TableHead>
                     <TableHead>Этап</TableHead>
                     <TableHead>Тариф</TableHead>
                     <TableHead>Дата дедлайна</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {overdueSteps.map((step, i) => (
                     <TableRow key={i}>
                       <TableCell className="font-medium">{step.patientName}</TableCell>
                       <TableCell>{step.title}</TableCell>
                       <TableCell>{step.planName}</TableCell>
                       <TableCell className="text-destructive font-bold">
                         {step.date ? new Date(step.date).toLocaleDateString('ru-RU') : 'Нет даты'}
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
        )}

        {/* Subscriptions Management */}
        <Card>
          <CardHeader>
            <CardTitle>Управление подписками</CardTitle>
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
                  <TableHead>Прогресс</TableHead>
                  <TableHead>Дата начала</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientSubs.map((item) => {
                  const subCompleted = item.route.filter(s => s.status === 'completed').length;
                  const subTotal = item.route.length;
                  const subProgress = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;
                  
                  return (
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={subProgress} className="w-[60px] h-2" />
                        <span className="text-xs text-muted-foreground">{subProgress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(item.startDate).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Switch 
                          checked={item.status === 'active'} 
                          onCheckedChange={() => toggleSubscription(item.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

         {/* Plan Editor */}
         <div className="grid md:grid-cols-3 gap-6">
           {plans.map(plan => (
             <Card key={plan.id}>
               <CardHeader>
                 <CardTitle>{plan.name}</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Цена (₸)</label>
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
