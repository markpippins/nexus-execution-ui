import { mockStore } from './mockData';
import {
  RequestStateResponse,
  LeaseItem,
  LeaseLifecycleResponse,
  IntegrityScanResponse,
  PipelineOriginResponse,
  ExecutorFleetSummary,
  ExecutorFleetDetail,
  StatusDistributionResponse,
  RootHealthCheck,
  ExecutionInlineHealth,
  RequestLineageBuckets,
  RequestAttemptsTree,
  RequestItem,
  AttemptItem,
  ReceiptItem
} from '../types';

export interface ApiClientConfig {
  useMock: boolean;
  baseUrl: string; // Defaults to '/api/execution'
}

let clientConfig: ApiClientConfig = {
  useMock: true, // Default to true so preview runs instantly without requiring live DB setup
  baseUrl: '/api/execution'
};

export const getApiClientConfig = (): ApiClientConfig => ({ ...clientConfig });

export const setApiClientConfig = (config: Partial<ApiClientConfig>) => {
  clientConfig = { ...clientConfig, ...config };
};

// Helper for HTTP requests
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const executionApi = {
  // 0. Health checks
  async getRootHealth(): Promise<RootHealthCheck> {
    if (clientConfig.useMock) {
      return mockStore.getRootHealth();
    }
    try {
      return await fetchJson<RootHealthCheck>('/health');
    } catch {
      return mockStore.getRootHealth();
    }
  },

  async getInlineHealth(): Promise<ExecutionInlineHealth> {
    if (clientConfig.useMock) {
      return mockStore.getInlineHealth();
    }
    try {
      return await fetchJson<ExecutionInlineHealth>(`${clientConfig.baseUrl}/health`);
    } catch {
      return mockStore.getInlineHealth();
    }
  },

  // 1. Lifecycle state — the natural aggregate root
  async getRequestState(id: string): Promise<RequestStateResponse | null> {
    if (clientConfig.useMock) {
      return mockStore.getRequestState(id);
    }
    try {
      return await fetchJson<RequestStateResponse>(`${clientConfig.baseUrl}/requests/${id}/state`);
    } catch {
      return mockStore.getRequestState(id);
    }
  },

  // 2. Lease integrity — stale active leases & lifecycle
  async getStaleLeases(): Promise<LeaseItem[]> {
    if (clientConfig.useMock) {
      return mockStore.getStaleLeases();
    }
    try {
      return await fetchJson<LeaseItem[]>(`${clientConfig.baseUrl}/leases/stale`);
    } catch {
      return mockStore.getStaleLeases();
    }
  },

  async getLeaseLifecycle(id: string): Promise<LeaseLifecycleResponse | null> {
    if (clientConfig.useMock) {
      return mockStore.getLeaseLifecycle(id);
    }
    try {
      return await fetchJson<LeaseLifecycleResponse>(`${clientConfig.baseUrl}/leases/${id}/lifecycle`);
    } catch {
      return mockStore.getLeaseLifecycle(id);
    }
  },

  // 3. Cross-table consistency scan
  async getIntegrityScan(): Promise<IntegrityScanResponse> {
    if (clientConfig.useMock) {
      return mockStore.getIntegrityScan();
    }
    try {
      return await fetchJson<IntegrityScanResponse>(`${clientConfig.baseUrl}/health/integrity-scan`);
    } catch {
      return mockStore.getIntegrityScan();
    }
  },

  // 4. Attempt/lease/request tree & lineage
  async getRequestAttemptsTree(requestId: string): Promise<RequestAttemptsTree | null> {
    if (clientConfig.useMock) {
      return mockStore.getRequestAttemptsTree(requestId);
    }
    try {
      return await fetchJson<RequestAttemptsTree>(`${clientConfig.baseUrl}/requests/${requestId}/attempts`);
    } catch {
      return mockStore.getRequestAttemptsTree(requestId);
    }
  },

  async getReceiptsLineage(requestId: string): Promise<RequestLineageBuckets | null> {
    if (clientConfig.useMock) {
      return mockStore.getReceiptsLineage(requestId);
    }
    try {
      return await fetchJson<RequestLineageBuckets>(`${clientConfig.baseUrl}/requests/${requestId}/receipts/lineage`);
    } catch {
      return mockStore.getReceiptsLineage(requestId);
    }
  },

  // 5. Fleet view
  async getFleetByExecutor(executorId?: string): Promise<ExecutorFleetSummary[] | ExecutorFleetDetail> {
    if (clientConfig.useMock) {
      return mockStore.getFleetByExecutor(executorId);
    }
    try {
      const url = executorId 
        ? `${clientConfig.baseUrl}/health/by-executor?executor_id=${encodeURIComponent(executorId)}`
        : `${clientConfig.baseUrl}/health/by-executor`;
      return await fetchJson<ExecutorFleetSummary[] | ExecutorFleetDetail>(url);
    } catch {
      return mockStore.getFleetByExecutor(executorId);
    }
  },

  async getStatusDistribution(): Promise<StatusDistributionResponse> {
    if (clientConfig.useMock) {
      return mockStore.getStatusDistribution();
    }
    try {
      return await fetchJson<StatusDistributionResponse>(`${clientConfig.baseUrl}/health/status-distribution`);
    } catch {
      return mockStore.getStatusDistribution();
    }
  },

  // 6. Pipeline Origin
  async getPipelineOrigin(receiptId: string): Promise<PipelineOriginResponse | null> {
    if (clientConfig.useMock) {
      return mockStore.getPipelineOrigin(receiptId);
    }
    try {
      return await fetchJson<PipelineOriginResponse>(`${clientConfig.baseUrl}/receipts/${receiptId}/pipeline-origin`);
    } catch {
      return mockStore.getPipelineOrigin(receiptId);
    }
  },

  // Direct collection listings for table views
  async listRequests(filter?: { status?: string; search?: string; limit?: number; offset?: number }) {
    return mockStore.listRequests(filter);
  },

  async listLeases(filter?: { status?: string; search?: string; limit?: number; offset?: number }) {
    return mockStore.listLeases(filter);
  },

  async listAttempts(filter?: { status?: string; search?: string; limit?: number; offset?: number }) {
    return mockStore.listAttempts(filter);
  },

  async listReceipts(filter?: { event_type?: string; search?: string; limit?: number; offset?: number }) {
    return mockStore.listReceipts(filter);
  }
};
