import { getValue } from './path';
import { DataSourceType } from './types';
import type { DataContext, DataSource, FormValues, SelectOption } from './types';

export interface ResolveDataContext<Values extends object = FormValues> extends DataContext {
  values?: Readonly<Values>;
  signal?: AbortSignal;
}
export type DataSourceDescriptor<Values extends object = FormValues> = Exclude<DataSource<Values>, string>;
export type DataSourceResolver<Values extends object = FormValues> = (
  source: DataSourceDescriptor<Values>,
  context: ResolveDataContext<Values>,
) => readonly SelectOption[] | Promise<readonly SelectOption[]>;

function checkAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const error = new Error('The data-source request was aborted.');
    error.name = 'AbortError';
    throw error;
  }
}

const apiResolver: DataSourceResolver = async (source, context) => {
  if (source.type !== DataSourceType.API) throw new TypeError('Expected an API data source.');
  const params = typeof source.params === 'function' ? source.params(context.values ?? {}) : source.params;
  const method = source.method ?? 'GET';
  let url = source.url;
  if (method === 'GET' && params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) search.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
    const query = search.toString();
    if (query) url += (url.includes('?') ? '&' : '?') + query;
  }
  const response = await fetch(url, {
    method,
    signal: context.signal,
    headers: { ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}), ...source.headers },
    ...(method === 'POST' && params ? { body: JSON.stringify(params) } : {}),
  });
  if (!response.ok) throw new Error('Data-source request failed with HTTP ' + response.status + '.');
  const result: unknown = await response.json();
  return source.select ? source.select(result) : (result as readonly SelectOption[]);
};

export class DataSourceManager<Values extends object = FormValues> {
  private definitions = new Map<string, { source: DataSourceDescriptor<Values>; token: symbol }>();
  private resolvers = new Map<DataSourceType, DataSourceResolver<Values>>();
  private listeners = new Set<() => void>();
  private revision = 0;

  constructor(resolvers: Partial<Record<DataSourceType, DataSourceResolver<Values>>> = {}) {
    this.resolvers.set(DataSourceType.INLINE, (source) =>
      source.type === DataSourceType.INLINE ? source.options : [],
    );
    this.resolvers.set(DataSourceType.STORE, (source, context) => {
      if (source.type !== DataSourceType.STORE) return [];
      const value = context.store?.[source.module];
      return (
        ((source.storeKey === undefined ? value : getValue(value, source.storeKey)) as readonly SelectOption[]) ?? []
      );
    });
    this.resolvers.set(DataSourceType.CEPT, (source, context) =>
      source.type === DataSourceType.CEPT ? (context.enums?.[source.enumName] ?? []) : [],
    );
    this.resolvers.set(DataSourceType.API, apiResolver as DataSourceResolver<Values>);
    for (const [type, resolver] of Object.entries(resolvers))
      if (resolver) this.resolvers.set(type as DataSourceType, resolver);
  }

  get version(): number {
    return this.revision;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.revision += 1;
    this.listeners.forEach((listener) => listener());
  }

  register(key: string, source: DataSourceDescriptor<Values>): () => void {
    const token = Symbol(key);
    this.definitions.set(key, { source, token });
    this.notify();
    return () => {
      if (this.definitions.get(key)?.token === token) {
        this.definitions.delete(key);
        this.notify();
      }
    };
  }

  get(source: DataSource<Values>): DataSourceDescriptor<Values> {
    if (typeof source !== 'string') return source;
    const registered = this.definitions.get(source);
    if (!registered) throw new Error('Unknown data source: ' + source);
    return registered.source;
  }

  async resolve(
    source: DataSource<Values>,
    context: ResolveDataContext<Values> = {},
  ): Promise<readonly SelectOption[]> {
    checkAborted(context.signal);
    const descriptor = this.get(source);
    const resolver = this.resolvers.get(descriptor.type);
    if (!resolver) throw new Error('No resolver for data source type: ' + descriptor.type);
    const result = await resolver(descriptor, context);
    checkAborted(context.signal);
    if (!Array.isArray(result)) throw new TypeError('A data-source resolver must return an array of options.');
    return result;
  }

  static getDataSource(source: DataSource): DataSourceDescriptor {
    return defaultDataSourceManager.get(source);
  }
  static registerDataSource(key: string, source: DataSourceDescriptor): () => void {
    return defaultDataSourceManager.register(key, source);
  }
  static getDataSources(keys: readonly string[]): Record<string, DataSourceDescriptor> {
    return Object.fromEntries(keys.map((key) => [key, defaultDataSourceManager.get(key)]));
  }
}

export const defaultDataSourceManager = new DataSourceManager();
