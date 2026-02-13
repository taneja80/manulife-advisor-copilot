import { useState } from "react";
import { DailyBriefing } from "@/components/advisor/daily-briefing";
import { TaskInbox } from "@/components/advisor/task-inbox";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Phone, FileText, Calendar as CalendarIcon, MoreHorizontal } from "lucide-react";
import { useClients } from "@/hooks/useClients"; // Reuse for simple list
import { Skeleton } from "@/components/ui/skeleton";

export default function AdvisorHome() {
    const [, setLocation] = useLocation();
    const { data: clients, isLoading } = useClients();

    const handleNewClient = () => {
        setLocation("/onboarding");
    };

    const handleViewAllClients = () => {
        // We'll map this to a specific list route if we separate it, 
        // but for now we might need to adjust App.tsx routing
        setLocation("/clients-list");
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background/50">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                {/* Top Section: Briefing & Market Context */}
                <section>
                    <DailyBriefing />
                </section>

                {/* Middle Section: Main Workflow Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">

                    {/* Left Col: Task Inbox (2/3 width on large screens? No, maybe 1/3) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Quick Actions Bar */}
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            <Button onClick={handleNewClient} className="bg-[#00A758] hover:bg-[#008a47] shrink-0">
                                <Plus className="w-4 h-4 mr-2" />
                                New Client
                            </Button>
                            <Button variant="outline" className="shrink-0" onClick={handleViewAllClients}>
                                <Users className="w-4 h-4 mr-2" />
                                All Clients
                            </Button>
                            <Button variant="outline" className="shrink-0">
                                <Phone className="w-4 h-4 mr-2" />
                                Log Activity
                            </Button>
                            <Button variant="outline" className="shrink-0">
                                <FileText className="w-4 h-4 mr-2" />
                                Compliance Center
                            </Button>
                        </div>

                        {/* Calendar / Schedule Widget (Mocked for Phase 3) */}
                        <Card className="flex-1 bg-card/50">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-primary" />
                                    Today's Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Mock Schedule Items */}
                                <div className="divide-y">
                                    {[
                                        { time: "10:00 AM", title: "Portfolio Review: Maria Santos", type: "Zoom", status: "completed" },
                                        { time: "2:00 PM", title: "Intro Meeting: New Prospect", type: "In-Person", status: "upcoming" },
                                        { time: "4:30 PM", title: "Team Sync", type: "Zoom", status: "upcoming" }
                                    ].map((event, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                                            <div className="w-16 text-xs font-bold text-muted-foreground text-right">{event.time}</div>
                                            <div className="w-1 rounded-full h-8 bg-primary/20">
                                                <div className={`w-full h-full rounded-full ${event.status === 'upcoming' ? 'bg-primary' : 'bg-muted-foreground/50'}`}></div>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-medium ${event.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{event.title}</h4>
                                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{event.type}</span>
                                            </div>
                                            {event.status === 'upcoming' && (
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Col: Task Inbox */}
                    <div className="lg:col-span-1 h-full">
                        <TaskInbox />
                    </div>
                </div>

                {/* Bottom Section: Recent Clients Teaser */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Recent Clients</h3>
                        <Button variant="ghost" onClick={handleViewAllClients} className="text-primary h-auto p-0 text-xs hover:bg-transparent hover:underline">View Directory &rarr;</Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)
                        ) : (
                            clients?.slice(0, 4).map(client => (
                                <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation(`/clients/${client.id}`)}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${client.riskProfile === 'Aggressive' ? 'bg-orange-500' : 'bg-[#00A758]'}`}>
                                                {client.name.charAt(0)}
                                            </div>
                                            {client.needsAction && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                                        </div>
                                        <h4 className="font-bold text-sm truncate">{client.name}</h4>
                                        <p className="text-xs text-muted-foreground">{client.riskProfile} · {client.goals.length} Goals</p>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}
