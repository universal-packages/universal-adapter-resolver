export interface AdapterResolverOptions<A = any> {
  domain: string
  type: string
  internal?: Record<string, A>
}

export interface GatheredAdapters<A = any> {
  [key: string]: A
}
