import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, authStorage } from '../services/api';

const makeJsonResponse = (payload, ok = true, status = 200) => ({
  ok,
  status,
  headers: {
    get: () => 'application/json',
  },
  json: async () => payload,
});

describe('authStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves auth data', () => {
    authStorage.setAuth({
      token: 'token-123',
      expiresAt: '2099-01-01T00:00:00.000Z',
      user: { id: 'u1', name: 'Ada' },
    });

    expect(authStorage.getToken()).toBe('token-123');
    expect(authStorage.getExpiresAt()).toBe('2099-01-01T00:00:00.000Z');
    expect(authStorage.getUser()).toEqual({ id: 'u1', name: 'Ada' });
  });

  it('clears auth data', () => {
    authStorage.setAuth({
      token: 'token-123',
      expiresAt: '2099-01-01T00:00:00.000Z',
      user: { id: 'u1' },
    });

    authStorage.clear();

    expect(authStorage.getToken()).toBeNull();
    expect(authStorage.getExpiresAt()).toBeNull();
    expect(authStorage.getUser()).toBeNull();
  });
});

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('sends auth headers and returns data payloads', async () => {
    localStorage.setItem('settlr_token', 'token-xyz');

    global.fetch = vi.fn().mockResolvedValue(
      makeJsonResponse({ data: { ok: true } })
    );

    const data = await apiClient.get('/api/test');

    expect(data).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/api/test');
    expect(options.headers.Authorization).toBe('Bearer token-xyz');
  });

  it('throws when response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      makeJsonResponse({ message: 'Bad request' }, false, 400)
    );

    await expect(apiClient.get('/api/test')).rejects.toMatchObject({
      status: 400,
    });
  });

  it('throws when succeeded is false', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      makeJsonResponse({ succeeded: false, message: 'Nope' }, true, 200)
    );

    await expect(apiClient.get('/api/test')).rejects.toMatchObject({
      status: 200,
    });
  });
});
