export const API_BASE_URL = import.meta.env.VITE_API_URL + "api/";

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
      },
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
      },
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
      },
    );
    return handleResponse(response);
  },

  postAdjustment: async (id: number) => {
    const response = await fetch(
      `${API_BASE_URL}budget-adjustments/${id}/post`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  simulateAdjustment: async (id: number) => {
    const response = await fetch(
      `${API_BASE_URL}budget-adjustments/${id}/simulate`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      },
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
      },
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

export const assetApi = {
  getDashboard: async (unitId: string) => {
    const response = await fetch(
      `${API_BASE_URL}assets/dashboard?unitId=${unitId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },
  listAssets: async (params?: any) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const response = await fetch(`${API_BASE_URL}assets${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAsset: async (assetId: string) => {
    const response = await fetch(`${API_BASE_URL}assets/${assetId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  getAssetDetail: async (assetId: string) => {
    const response = await fetch(`${API_BASE_URL}assets/detail/${assetId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  listCategories: async (unitType: string) => {
    const response = await fetch(
      `${API_BASE_URL}assets/categories/all?unitType=${unitType}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },
  listAssetTransactions: async (assetId: string) => {
    const response = await fetch(
      `${API_BASE_URL}assets/${assetId}/transactions`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },
  getPeriodsReadiness: async (unitId: string) => {
    const response = await fetch(
      `${API_BASE_URL}assets/periods-readiness?unitId=${unitId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },
  reportListing: async (unitId: string, params?: any) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const response = await fetch(
      `${API_BASE_URL}assets/reports/listing?unitId=${unitId}${queryString}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  reportValuation: async (unitId: string, params?: any) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const response = await fetch(
      `${API_BASE_URL}assets/reports/valuation?unitId=${unitId}${queryString}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  reportDepSummary: async (unitId: string, period: string) => {
    const response = await fetch(
      `${API_BASE_URL}assets/reports/dep-summary?unitId=${unitId}&period=${period}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  runDepreciation: async (payload: any) => {
    const response = await fetch(`${API_BASE_URL}assets/depreciation/run`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  createAsset: async (payload: any) => {
    const response = await fetch(`${API_BASE_URL}assets`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  updateAsset: async (assetId: string, payload: any) => {
    const response = await fetch(`${API_BASE_URL}assets/${assetId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  capitalizeAsset: async (assetId: string, payload: any) => {
    const response = await fetch(
      `${API_BASE_URL}assets/${assetId}/capitalize`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      },
    );
    return handleResponse(response);
  },

  disposeAsset: async (assetId: string, payload: any) => {
    const response = await fetch(`${API_BASE_URL}assets/${assetId}/dispose`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  createCategory: async (payload: any) => {
    const response = await fetch(`${API_BASE_URL}assets/categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  updateCategory: async (id: string, payload: any) => {
    const response = await fetch(`${API_BASE_URL}assets/categories/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  deleteCategory: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}assets/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const financeApi = {
  listUnits: async (params?: any) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const response = await fetch(`${API_BASE_URL}finance/units${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  createUnit: async (payload: any) => {
    const response = await fetch(`${API_BASE_URL}finance/units`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  updateUnit: async (id: string, payload: any) => {
    const response = await fetch(`${API_BASE_URL}finance/units/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  listPeriods: async (unitId: string) => {
    const response = await fetch(
      `${API_BASE_URL}finance/periods?unitId=${unitId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  openPeriod: async (unitId: string, period: string) => {
    const response = await fetch(`${API_BASE_URL}finance/periods/open`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ unitId, period }),
    });
    return handleResponse(response);
  },

  closePeriod: async (unitId: string, period: string) => {
    const response = await fetch(`${API_BASE_URL}finance/periods/close`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ unitId, period }),
    });
    return handleResponse(response);
  },

  listJournals: async (params: any) => {
    const queryString = `?${new URLSearchParams(params).toString()}`;
    const response = await fetch(
      `${API_BASE_URL}finance/journals${queryString}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  downloadVoucherPdf: async (journalId: string) => {
    const response = await fetch(
      `${API_BASE_URL}finance/journals/${journalId}/voucher.pdf`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to download voucher PDF");
    }
    return response.blob();
  },

  downloadReportPdf: async (params: {
    unitId: string;
    period: string;
    reportType: string;
    accountId?: string;
  }) => {
    const queryString = `?${new URLSearchParams(params).toString()}`;
    const response = await fetch(
      `${API_BASE_URL}finance/reports/${params.reportType}.pdf${queryString}`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to download report PDF");
    }
    return response.blob();
  },

  listAccounts: async (unitId: string) => {
    const response = await fetch(
      `${API_BASE_URL}finance/accounts?unitId=${unitId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  listAllAccounts: async (accountType: string) => {
    const response = await fetch(
      `${API_BASE_URL}finance/accounts/all?accountType=${accountType}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  createAccount: async (payload: any) => {
    const response = await fetch(`${API_BASE_URL}finance/accounts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  updateAccount: async (id: string, payload: any) => {
    const response = await fetch(`${API_BASE_URL}finance/accounts/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  saveJournal: async (payload: any) => {
    const response = await fetch(`${API_BASE_URL}finance/journals`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  updateJournal: async (id: string, payload: any) => {
    const response = await fetch(`${API_BASE_URL}finance/journals/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  submitJournal: async (id: string) => {
    const response = await fetch(
      `${API_BASE_URL}finance/journals/${id}/submit`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  approveJournal: async (id: string) => {
    const response = await fetch(
      `${API_BASE_URL}finance/journals/${id}/approve`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  postJournal: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}finance/journals/${id}/post`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  getJournal: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}finance/journals/${id}`, {
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
  finance: financeApi,
  asset: assetApi,
};
