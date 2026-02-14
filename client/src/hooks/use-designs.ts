import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type DesignInput, type DesignParamsInput } from "@shared/routes";
import { useLocation } from "wouter";

export function useDesigns() {
  return useQuery({
    queryKey: [api.designs.list.path],
    queryFn: async () => {
      const res = await fetch(api.designs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch gallery");
      return api.designs.list.responses[200].parse(await res.json());
    },
  });
}

export function useDesign(id: number) {
  return useQuery({
    queryKey: [api.designs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.designs.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch design");
      return api.designs.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateDesign() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: DesignInput) => {
      const res = await fetch(api.designs.create.path, {
        method: api.designs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.designs.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create design");
      }
      
      return api.designs.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.designs.list.path] });
      // Navigate to the result page immediately
      setLocation(`/design/${data.id}`);
    },
  });
}

export function useUpdateDesignParams(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DesignParamsInput) => {
      const url = buildUrl(api.designs.updateParams.path, { id });
      const res = await fetch(url, {
        method: api.designs.updateParams.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.designs.updateParams.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) {
          const error = api.designs.updateParams.responses[404].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to update design params");
      }

      return api.designs.updateParams.responses[200].parse(await res.json());
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [api.designs.get.path, id] }),
        queryClient.invalidateQueries({ queryKey: [api.designs.list.path] }),
      ]);
    },
  });
}
