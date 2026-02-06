const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5279';
const STORAGE_TOKEN_KEY = 'settlr_token';
const STORAGE_EXPIRES_KEY = 'settlr_token_expires';
const STORAGE_USER_KEY = 'settlr_user';

export const authStorage = {
    getToken: () => localStorage.getItem(STORAGE_TOKEN_KEY),
    getExpiresAt: () => localStorage.getItem(STORAGE_EXPIRES_KEY),
    getUser: () => {
        const raw = localStorage.getItem(STORAGE_USER_KEY);
        return raw ? JSON.parse(raw) : null;
    },
    setAuth: ({ token, expiresAt, user }) => {
        localStorage.setItem(STORAGE_TOKEN_KEY, token);
        localStorage.setItem(STORAGE_EXPIRES_KEY, expiresAt);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    },
    clear: () => {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_EXPIRES_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
    },
};

const buildUrl = (endpoint) => {
    const base = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;
    return new URL(endpoint.replace(/^\//, ''), base).toString();
};

const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json() : null;

    if (!response.ok || (payload && payload.succeeded === false)) {
        const error = new Error(payload?.message || `Request failed (${response.status})`);
        error.status = response.status;
        error.errors = payload?.errors || [];
        throw error;
    }

    if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) {
        return payload.data;
    }

    return payload;
};

const request = async (method, endpoint, { body, headers } = {}) => {
    const token = authStorage.getToken();
    const response = await fetch(buildUrl(endpoint), {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    return parseResponse(response);
};

export const apiClient = {
    get: (endpoint) => request('GET', endpoint),
    post: (endpoint, body) => request('POST', endpoint, { body }),
    put: (endpoint, body) => request('PUT', endpoint, { body }),
    delete: (endpoint) => request('DELETE', endpoint),
};
