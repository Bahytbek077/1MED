import { useStore } from "@/lib/store";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, Clock, ArrowRight, MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function PatientDashboard() {
  const { currentUser, plans, subscriptions, subscribe, messages, sendMessage } = useStore();
  const mySub = subscriptions.find(s => s.userId === currentUser?.id && s.status === 'active');
  const myPlan = plans.find(p => p.id === mySub?.planId);
  const myMessages = messages.filter(m => m.fromId === currentUser?.id || m.toId === currentUser?.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const [msgInput, setMsgInput] = useState("");

  if (!currentUser) return null;

  const handleSubscribe = (planId: string) => {
    subscribe(currentUser.id, planId);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    // Hardcoded to send to the first doctor for MVP
    sendMessage(currentUser.id, '1', msgInput);
    setMsgInput("");
  };

  if (!mySub) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">Choose Your Care Plan</h1>
            <p className="text-muted-foreground">Select a subscription to start your health journey</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <Card key={plan.id} className="relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">{plan.name}</CardTitle>
                  <CardDescription className="text-lg font-semibold mt-2">
                    ${(plan.price / 100).toFixed(2)} / year
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
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Journey */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Your Health Journey</h1>
              <p className="text-muted-foreground">Plan: {myPlan?.name}</p>
            </div>
            <Badge variant={mySub.status === 'active' ? 'default' : 'secondary'} className="text-base px-4 py-1">
              {mySub.status}
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
                          {step.date && <Badge variant="outline" className="flex gap-1"><Clock className="h-3 w-3" /> {new Date(step.date).toLocaleDateString()}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        <div className="mt-3 flex gap-2">
                          <Badge variant="secondary" className="capitalize">{step.type}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-1 h-[calc(100vh-8rem)] sticky top-24">
          <Card className="h-full flex flex-col shadow-lg border-primary/10">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                Chat with Dr. House
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {myMessages.length === 0 && (
                    <div className="text-center text-muted-foreground py-10 text-sm">
                      No messages yet. Start a conversation!
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
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 bg-muted/20">
              <form onSubmit={handleSend} className="flex w-full gap-2">
                <Input 
                  placeholder="Ask a question..." 
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
    </Layout>
  );
}
