import * as React from "react";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    LayoutDashboard,
    LineChart,
    Briefcase,
    Search,
    UserPlus,
} from "lucide-react";
import { useLocation } from "wouter";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useClients } from "@/hooks/useClients";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const [, setLocation] = useLocation();
    const { data: clients = [] } = useClients();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                data-testid="button-command-menu"
            >
                <span className="hidden lg:inline-flex">Search clients...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading="Clients">
                        {clients.map((client) => (
                            <CommandItem
                                key={client.id}
                                onSelect={() => {
                                    runCommand(() => setLocation(`/clients/${client.id}`));
                                }}
                            >
                                <User className="mr-2 h-4 w-4" />
                                <span>{client.name}</span>
                                <CommandShortcut>Active</CommandShortcut>
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Actions">
                        <CommandItem
                            onSelect={() => {
                                runCommand(() => setLocation("/onboarding"));
                            }}
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span>Add New Client</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Navigation">
                        <CommandItem
                            onSelect={() => {
                                runCommand(() => setLocation("/"));
                            }}
                        >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => {
                                runCommand(() => setLocation("/analytics"));
                            }}
                        >
                            <LineChart className="mr-2 h-4 w-4" />
                            <span>Analytics</span>
                        </CommandItem>
                        {/* 
                        <CommandItem
                            onSelect={() => {
                                runCommand(() => setLocation("/simulator"));
                            }}
                        >
                            <Calculator className="mr-2 h-4 w-4" />
                            <span>Simulator</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => {
                                runCommand(() => setLocation("/portfolios"));
                            }}
                        >
                            <Briefcase className="mr-2 h-4 w-4" />
                            <span>Model Portfolios</span>
                        </CommandItem> 
                        */}
                        <CommandItem
                            onSelect={() => {
                                runCommand(() => setLocation("/settings"));
                            }}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
