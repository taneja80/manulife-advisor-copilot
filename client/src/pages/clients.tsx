import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPHP, riskColors, getClientRiskMetrics } from "@/lib/mockData";
import { useClients } from "@/hooks/useClients";
import {
  Search,
  UserPlus,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Users,
  Wallet,
  Activity,
  X,
} from "lucide-react";
import { ActionQueue } from "@/components/action-queue";

interface ClientsPageProps {
  onAddNewClient?: () => void;
}

export default function ClientsPage({ onAddNewClient }: ClientsPageProps) {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: clients = [], isLoading, isError } = useClients();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-destructive">Failed to load clients. Please try again.</p>
      </div>
    );
  }

  const sortedClients = [...clients].sort((a, b) => {
    if (a.needsAction && !b.needsAction) return -1;
    if (!a.needsAction && b.needsAction) return 1;
    return b.totalPortfolio - a.totalPortfolio;
  });

  const filtered = sortedClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.riskProfile.toLowerCase().includes(search.toLowerCase())
  );

  const searchResults = search.length > 0 ? filtered : sortedClients;

  const actionCount = clients.filter((c) => c.needsAction).length;
  const totalAUM = clients.reduce((sum, c) => sum + c.totalPortfolio, 0);
  const totalGoals = clients.reduce((sum, c) => sum + c.goals.length, 0);
  const avgReturn = totalAUM > 0
    ? clients.reduce((sum, c) => sum + c.returns.ytd * c.totalPortfolio, 0) / totalAUM
    : 0;

  const handleClientSelect = (clientId: string) => {
    setIsSearchOpen(false);
    setSearch("");
    setLocation(`/clients/${clientId}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-clients-title">
            Clients
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your client portfolio and track action items
          </p>
        </div>
        <Button
          className="bg-[#00A758] border-[#00A758]"
          onClick={onAddNewClient}
          data-testid="button-add-client"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Add New Client
        </Button>
      </div>

      <ActionQueue />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs text-muted-foreground font-medium">Total Clients</span>
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00A758]/10">
                <Users className="w-3.5 h-3.5 text-[#00A758]" />
              </div>
            </div>
            <p className="text-lg font-bold" data-testid="text-total-clients">{clients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs text-muted-foreground font-medium">Total AUM</span>
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00A758]/10">
                <Wallet className="w-3.5 h-3.5 text-[#00A758]" />
              </div>
            </div>
            <p className="text-lg font-bold" data-testid="text-total-aum">{formatPHP(totalAUM)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs text-muted-foreground font-medium">Active Goals</span>
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00A758]/10">
                <Target className="w-3.5 h-3.5 text-[#00A758]" />
              </div>
            </div>
            <p className="text-lg font-bold" data-testid="text-total-goals">{totalGoals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs text-muted-foreground font-medium">Avg YTD Return</span>
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00A758]/10">
                <TrendingUp className="w-3.5 h-3.5 text-[#00A758]" />
              </div>
            </div>
            <p className="text-lg font-bold text-[#00A758]" data-testid="text-avg-return">+{avgReturn.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {actionCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300" data-testid="text-action-alert">
            {actionCount} client{actionCount > 1 ? "s" : ""} need{actionCount === 1 ? "s" : ""} your attention
          </p>
        </div>
      )}

      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search clients by name or risk profile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="pl-10 pr-10"
            data-testid="input-search-clients"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setIsSearchOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              data-testid="button-clear-search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {isSearchOpen && search.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border rounded-md shadow-lg max-h-[320px] overflow-y-auto"
              data-testid="dropdown-search-results"
            >
              {searchResults.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">No clients found matching "{search}"</p>
                </div>
              ) : (
                <div className="py-1">
                  {searchResults.map((client) => {
                    const offTrack = client.goals.filter((g) => g.status === "off-track").length;
                    return (
                      <button
                        key={client.id}
                        onClick={() => handleClientSelect(client.id)}
                        className="w-full text-left px-3 py-2.5 hover-elevate flex items-center gap-3"
                        data-testid={`dropdown-client-${client.id}`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[#0C7143]/10 text-[#0C7143] text-xs font-semibold">
                            {client.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{client.name}</span>
                            {client.needsAction && (
                              <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="w-3 h-3" />
                                Action
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatPHP(client.totalPortfolio)}</span>
                            <span>{client.riskProfile}</span>
                            {offTrack > 0 && (
                              <span className="text-[#D9534F]">{offTrack} off-track</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        {filtered.map((client, index) => {
          const goalsOnTrack = client.goals.filter((g) => g.status !== "off-track").length;
          const offTrackGoals = client.goals.filter((g) => g.status === "off-track").length;
          const metrics = getClientRiskMetrics(client);
          const isPositive = client.returns.ytd >= 0;

          return (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
            >
              <Card
                className="hover-elevate cursor-pointer"
                onClick={() => setLocation(`/clients/${client.id}`)}
                data-testid={`card-client-${client.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[#0C7143]/10 text-[#0C7143] text-sm font-semibold">
                        {client.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold" data-testid={`text-client-name-${client.id}`}>
                          {client.name}
                        </p>
                        {client.needsAction && (
                          <Badge variant="destructive" className="text-[10px]" data-testid={`badge-action-${client.id}`}>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Action Needed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">Age {client.age}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] border-current"
                          style={{ color: riskColors[client.riskProfile] }}
                          data-testid={`badge-risk-${client.id}`}
                        >
                          <Shield className="w-3 h-3 mr-0.5" />
                          {client.riskProfile}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Target className="w-3 h-3" />
                          {goalsOnTrack}/{client.goals.length} on track
                          {offTrackGoals > 0 && (
                            <span className="text-[#D9534F] font-medium">
                              ({offTrackGoals} off)
                            </span>
                          )}
                        </span>
                      </div>
                      {client.needsAction && client.actionReason && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          {client.actionReason}
                        </p>
                      )}
                    </div>

                    <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-wide">Vol</p>
                        <p className="font-semibold text-foreground">{metrics.volatility.toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-wide">Sharpe</p>
                        <p className="font-semibold text-foreground">{metrics.sharpeRatio.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-sm font-bold" data-testid={`text-client-portfolio-${client.id}`}>
                        {formatPHP(client.totalPortfolio)}
                      </p>
                      <div className="flex items-center gap-1 justify-end">
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3 text-[#00A758]" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-[#D9534F]" />
                        )}
                        <span className={`text-xs font-medium ${isPositive ? "text-[#00A758]" : "text-[#D9534F]"}`}>
                          {isPositive ? "+" : ""}{client.returns.ytd}% YTD
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No clients found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
