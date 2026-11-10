declare global {
  interface Window {
    _env_?: Record<string, unknown>;
  }
}

export function getEnvValue(key: string, fallback?: string): string | undefined {
  const value = globalThis.window?._env_?.[key];
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
}