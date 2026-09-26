const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('stocksense_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An unexpected server error occurred.');
    }

    return data;
  }

  // --- Auth APIs ---
  async login(payload: { email: string; password: string }) {
    return this.request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async register(payload: { email: string; password: string; fullName: string; role?: string }) {
    return this.request<{ success: boolean; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async googleAuth(payload: { credential?: string; email?: string; name?: string; picture?: string }) {
    return this.request<{ success: boolean; token: string; user: any }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string; simulatedOtp?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(payload: { email: string; otp: string; newPassword: string }) {
    return this.request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getCurrentUser() {
    return this.request<{ success: boolean; user: any }>('/auth/me');
  }

  async updateProfile(payload: { fullName?: string; avatarUrl?: string; role?: string }) {
    return this.request<{ success: boolean; user: any; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // --- Dashboard APIs ---
  async getDashboardStats(warehouseId?: string) {
    const query = warehouseId ? `?warehouseId=${encodeURIComponent(warehouseId)}` : '';
    return this.request<{ success: boolean; data: any }>(`/dashboard/stats${query}`);
  }

  // --- Products APIs ---
  async getProducts(params?: { search?: string; categoryId?: string; status?: string; warehouseId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.warehouseId) searchParams.append('warehouseId', params.warehouseId);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/products${qs}`);
  }

  async getProduct(id: string) {
    return this.request<{ success: boolean; data: any }>(`/products/${id}`);
  }

  async createProduct(payload: any) {
    return this.request<{ success: boolean; data: any; message: string }>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateProduct(id: string, payload: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // --- Categories APIs ---
  async getCategories() {
    return this.request<{ success: boolean; data: any[] }>('/categories');
  }

  async createCategory(payload: { name: string; code?: string; description?: string }) {
    return this.request<{ success: boolean; data: any; message: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Warehouses & Locations APIs ---
  async getWarehouses() {
    return this.request<{ success: boolean; data: any[] }>('/warehouses');
  }

  async createWarehouse(payload: { name: string; code: string; address?: string }) {
    return this.request<{ success: boolean; data: any; message: string }>('/warehouses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateWarehouse(id: string, payload: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getLocations(params?: { type?: string; warehouseId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.warehouseId) searchParams.append('warehouseId', params.warehouseId);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/warehouses/locations/all${qs}`);
  }

  async createLocation(payload: { name: string; code: string; warehouseId?: string; type?: string }) {
    return this.request<{ success: boolean; data: any; message: string }>('/warehouses/locations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Transfers APIs ---
  async getTransfers(params?: { type?: string; status?: string; search?: string; warehouseId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.warehouseId) searchParams.append('warehouseId', params.warehouseId);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/transfers${qs}`);
  }

  async getTransfer(id: string) {
    return this.request<{ success: boolean; data: any }>(`/transfers/${id}`);
  }

  async createTransfer(payload: any) {
    return this.request<{ success: boolean; data: any; message: string }>('/transfers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTransfer(id: string, payload: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/transfers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async markTransferReady(id: string) {
    return this.request<{ success: boolean; message: string }>(`/transfers/${id}/action-mark-ready`, {
      method: 'POST',
    });
  }

  async validateTransfer(id: string, lineUpdates?: { lineId: string; doneQty: number }[]) {
    return this.request<{ success: boolean; data: any; message: string }>(`/transfers/${id}/action-validate`, {
      method: 'POST',
      body: JSON.stringify({ lineUpdates }),
    });
  }

  async cancelTransfer(id: string) {
    return this.request<{ success: boolean; message: string }>(`/transfers/${id}/action-cancel`, {
      method: 'POST',
    });
  }

  // --- Adjustments APIs ---
  async getAdjustments() {
    return this.request<{ success: boolean; data: any[] }>('/adjustments');
  }

  async createAdjustment(payload: { productId: string; locationId: string; countedQty: number; reason?: string }) {
    return this.request<{ success: boolean; data: any; message: string }>('/adjustments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Moves APIs (Stock Ledger) ---
  async getMoves(params?: { productId?: string; locationId?: string; search?: string; warehouseId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.productId) searchParams.append('productId', params.productId);
    if (params?.locationId) searchParams.append('locationId', params.locationId);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.warehouseId) searchParams.append('warehouseId', params.warehouseId);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ success: boolean; total: number; data: any[] }>(`/moves${qs}`);
  }
}

export const api = new ApiService();
export default api;
