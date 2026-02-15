import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '../api/admin';

export const useCompanies = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['companies', page, limit],
    queryFn: () => adminApi.getCompanies(page, limit),
  });
};

export const useCampaigns = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['campaigns', page, limit],
    queryFn: () => adminApi.getCampaigns(page, limit),
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.createCompanyOwner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-aggregates'] });
    },
  });
};

export const useRemoveCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.removeCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-aggregates'] });
    },
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] }); // Also update companies as they have counts/nested campaigns
      queryClient.invalidateQueries({ queryKey: ['dashboard-aggregates'] });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useRemoveCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.removeCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-aggregates'] });
    },
  });
};

export const useDashboardAggregates = () => {
  return useQuery({
    queryKey: ['dashboard-aggregates'],
    queryFn: adminApi.getDashboardAggregates,
  });
};
