import { useStore, type User } from "@/lib/store";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { UserPlus, Users, Stethoscope, Loader2, Check, X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminAssignments() {
  const { users, assignDoctorToPatient, loadData, isLoading } = useStore();
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [searchPatient, setSearchPatient] = useState("");
  const [searchDoctor, setSearchDoctor] = useState("");
  
  useEffect(() => {
    loadData();
  }, []);

  const doctors = users.filter(u => u.role === 'doctor');
  const patients = users.filter(u => u.role === 'patient');
  
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
    p.email.toLowerCase().includes(searchPatient.toLowerCase())
  );
  
  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
    (d.specialization && d.specialization.toLowerCase().includes(searchDoctor.toLowerCase()))
  );

  const getDoctorName = (doctorId: string | null | undefined) => {
    if (!doctorId) return null;
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : null;
  };

  const handleAssign = async (patientId: string, doctorId: string | null) => {
    await assignDoctorToPatient(patientId, doctorId);
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Назначение врачей</h1>
          <p className="text-muted-foreground">Привяжите пациентов к лечащим врачам</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Doctors List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Врачи ({doctors.length})
              </CardTitle>
              <CardDescription>Выберите врача для просмотра его пациентов</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск врача..."
                  value={searchDoctor}
                  onChange={(e) => setSearchDoctor(e.target.value)}
                  className="pl-8"
                  data-testid="input-search-doctor"
                />
              </div>
              
              <div className="space-y-2 max-h-[400px] overflow-auto">
                {filteredDoctors.map(doctor => {
                  const assignedPatients = patients.filter(p => p.doctorId === doctor.id);
                  return (
                    <div
                      key={doctor.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDoctor === doctor.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedDoctor(doctor.id)}
                      data-testid={`card-doctor-${doctor.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doctor.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {doctor.specialization || 'Без специализации'}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {assignedPatients.length} пац.
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {filteredDoctors.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Врачи не найдены</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Patients Assignment Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Пациенты ({patients.length})
              </CardTitle>
              <CardDescription>
                Назначьте врача каждому пациенту
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск пациента..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  className="pl-8"
                  data-testid="input-search-patient"
                />
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пациент</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Назначенный врач</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map(patient => (
                      <TableRow key={patient.id} data-testid={`row-patient-${patient.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{patient.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{patient.email}</TableCell>
                        <TableCell>
                          <Select
                            value={patient.doctorId || "unassigned"}
                            onValueChange={(value) => handleAssign(patient.id, value === "unassigned" ? null : value)}
                          >
                            <SelectTrigger className="w-[200px]" data-testid={`select-doctor-${patient.id}`}>
                              <SelectValue placeholder="Выберите врача" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">
                                <span className="text-muted-foreground">Не назначен</span>
                              </SelectItem>
                              {doctors.map(doctor => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  {doctor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          {patient.doctorId ? (
                            <Badge variant="default" className="gap-1">
                              <Check className="h-3 w-3" />
                              Назначен
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-muted-foreground">
                              <X className="h-3 w-3" />
                              Ожидает
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPatients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Пациенты не найдены
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всего пациентов</p>
                  <p className="text-2xl font-bold">{patients.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">С назначенным врачом</p>
                  <p className="text-2xl font-bold text-green-600">
                    {patients.filter(p => p.doctorId).length}
                  </p>
                </div>
                <Check className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ожидают назначения</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {patients.filter(p => !p.doctorId).length}
                  </p>
                </div>
                <UserPlus className="h-8 w-8 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
