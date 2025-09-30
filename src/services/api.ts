const API_BASE_URL = import.meta.env.VITE_API_URL + "api/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API request failed");
  }
  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
};

// Voucher API
export const voucherAPI = {
  getVouchers: async (params?: any) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const response = await fetch(`${API_BASE_URL}vouchers${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getVoucher: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}vouchers/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createVoucher: async (voucherData: any) => {
    const response = await fetch(`${API_BASE_URL}vouchers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(voucherData),
    });
    return handleResponse(response);
  },

  submitVoucher: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}vouchers/${id}/submit`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  approveVoucher: async (id: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}vouchers/${id}/approve`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  rejectVoucher: async (id: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}vouchers/${id}/reject`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  simulateImpact: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}vouchers/${id}/simulate`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Vote Book API
export const voteBookAPI = {
  getAccounts: async (params?: any) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const response = await fetch(`${API_BASE_URL}votebooks${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAccount: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}votebooks/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createAccount: async (accountData: any) => {
    const response = await fetch(`${API_BASE_URL}votebooks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(accountData),
    });
    return handleResponse(response);
  },

  updateAccount: async (id: number, accountData: any) => {
    const response = await fetch(`${API_BASE_URL}votebooks/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(accountData),
    });
    return handleResponse(response);
  },

  freezeAccount: async (id: number, freeze: boolean) => {
    const response = await fetch(`${API_BASE_URL}votebooks/${id}/freeze`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ freeze }),
    });
    return handleResponse(response);
  },

  getAccountDetail: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}votebooks/${id}/detail`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Budget Adjustment API
export const budgetAdjustmentAPI = {
  getAdjustments: async (params?: any) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const response = await fetch(
      `${API_BASE_URL}budget-adjustments${queryString}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getAdjustment: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}budget-adjustments/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createAdjustment: async (adjustmentData: any) => {
    const response = await fetch(`${API_BASE_URL}budget-adjustments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(adjustmentData),
    });
    return handleResponse(response);
  },

  approveAdjustment: async (id: number, data?: any) => {
    const response = await fetch(
      `${API_BASE_URL}budget-adjustments/${id}/approve`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data || {}),
      }
    );
    return handleResponse(response);
  },

  rejectAdjustment: async (id: number, data?: any) => {
    const response = await fetch(
      `${API_BASE_URL}budget-adjustments/${id}/reject`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data || {}),
      }
    );
    return handleResponse(response);
  },

  postAdjustment: async (id: number) => {
    const response = await fetch(
      `${API_BASE_URL}budget-adjustments/${id}/post`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  simulateAdjustment: async (id: number) => {
    const response = await fetch(
      `${API_BASE_URL}budget-adjustments/${id}/simulate`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// NCOA API
export const ncoaAPI = {
  getCodes: async (params?: any) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const response = await fetch(`${API_BASE_URL}ncoa${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getCode: async (code: string) => {
    const response = await fetch(`${API_BASE_URL}ncoa/${code}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getHierarchy: async (level: number) => {
    const response = await fetch(`${API_BASE_URL}ncoa/hierarchy/${level}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getByType: async (economicType: string) => {
    const response = await fetch(`${API_BASE_URL}ncoa/type/${economicType}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}ncoa/stats/summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// User API
export const userAPI = {
  getUsers: async (params?: any) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const response = await fetch(`${API_BASE_URL}users${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUser: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createUser: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}users`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  updateUser: async (id: number, userData: any) => {
    const response = await fetch(`${API_BASE_URL}users/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  updateUserPermissions: async (id: number, permissionsData: any) => {
    const response = await fetch(`${API_BASE_URL}users/${id}/permissions`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(permissionsData),
    });
    return handleResponse(response);
  },

  deleteUser: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const fiscalYearAPI = {
  getFiscalYears: async (params?: any) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const response = await fetch(`${API_BASE_URL}fiscal-years${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getFiscalYear: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}fiscal-years/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createFiscalYear: async (fiscalYearData: any) => {
    const response = await fetch(`${API_BASE_URL}fiscal-years`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(fiscalYearData),
    });
    return handleResponse(response);
  },

  updateFiscalYear: async (id: number, fiscalYearData: any) => {
    const response = await fetch(`${API_BASE_URL}fiscal-years/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(fiscalYearData),
    });
    return handleResponse(response);
  },

  closeFiscalYear: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}fiscal-years/${id}/close`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  setCurrentFiscalYear: async (id: number) => {
    const response = await fetch(
      `${API_BASE_URL}fiscal-years/${id}/set-current`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// PDF API
export const pdfAPI = {
  generatePdf: async (entityName: string, filterStructure: any) => {
    const response = await fetch(`${API_BASE_URL}/pdf/generate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ entityName, filterStructure }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "PDF generation failed");
    }

    return response.blob();
  },

  getAvailableEntities: async () => {
    const response = await fetch(`${API_BASE_URL}/pdf/entities`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export default {
  auth: authAPI,
  vouchers: voucherAPI,
  votebooks: voteBookAPI,
  budgetAdjustments: budgetAdjustmentAPI,
  ncoa: ncoaAPI,
  users: userAPI,
  fiscalYears: fiscalYearAPI,
  pdf: pdfAPI,
};
