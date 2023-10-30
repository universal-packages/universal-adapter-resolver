export interface ResolveAdapterOptions<A = any> {
  domain: string
  internal?: Record<string, A>
  name: string
  type: string
}

export interface GatherAdaptersOptions<A = any> {
  domain: string
  type: string
  internal?: A[]
}
