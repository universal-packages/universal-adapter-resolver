export interface ResolveAdapterOptions<A = any> {
  domain?: string
  internal?: Record<string, A>
  type?: string
}
