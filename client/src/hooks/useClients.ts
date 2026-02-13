import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Client, Goal } from "@shared/schema";

// ---- Queries ----

export function useClients() {
    return useQuery<Client[]>({
        queryKey: ["/api/clients"],
    });
}

export function useClient(id: string | undefined) {
    return useQuery<Client>({
        queryKey: ["/api/clients", id],
        queryFn: async () => {
            const res = await fetch(`/api/clients/${id}`, { credentials: "include" });
            if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
            return res.json();
        },
        enabled: !!id,
    });
}

// ---- Client Mutations ----

export function useCreateClient() {
    return useMutation({
        mutationFn: async (data: Omit<Client, "id">) => {
            const res = await apiRequest("POST", "/api/clients", data);
            return res.json() as Promise<Client>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
        },
    });
}

export function useUpdateClient() {
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
            const res = await apiRequest("PATCH", `/api/clients/${id}`, data);
            return res.json() as Promise<Client>;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
            queryClient.invalidateQueries({ queryKey: ["/api/clients", variables.id] });
        },
    });
}

export function useDeleteClient() {
    return useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/clients/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
        },
    });
}

// ---- Goal Mutations ----

export function useAddGoal() {
    return useMutation({
        mutationFn: async ({ clientId, data }: { clientId: string; data: Omit<Goal, "id"> }) => {
            const res = await apiRequest("POST", `/api/clients/${clientId}/goals`, data);
            return res.json() as Promise<Goal>;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
            queryClient.invalidateQueries({ queryKey: ["/api/clients", variables.clientId] });
        },
    });
}

export function useUpdateGoal() {
    return useMutation({
        mutationFn: async ({ clientId, goalId, data }: { clientId: string; goalId: string; data: Partial<Goal> }) => {
            const res = await apiRequest("PATCH", `/api/clients/${clientId}/goals/${goalId}`, data);
            return res.json() as Promise<Goal>;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
            queryClient.invalidateQueries({ queryKey: ["/api/clients", variables.clientId] });
        },
    });
}

export function useDeleteGoal() {
    return useMutation({
        mutationFn: async ({ clientId, goalId }: { clientId: string; goalId: string }) => {
            await apiRequest("DELETE", `/api/clients/${clientId}/goals/${goalId}`);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
            queryClient.invalidateQueries({ queryKey: ["/api/clients", variables.clientId] });
        },
    });
}
