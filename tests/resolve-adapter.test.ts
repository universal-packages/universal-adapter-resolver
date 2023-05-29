import { RedisEngine } from '@universal-packages/token-registry-redis'

import { resolveAdapter } from '../src'

describe('adapter-resolver', (): void => {
  describe('resolveAdapter', (): void => {
    it('resolves the adapter using all the cues', async (): Promise<void> => {
      const adapter = resolveAdapter('redis', { domain: 'token-registry', type: 'engine' })

      expect(adapter).toEqual(RedisEngine)
    })

    it('resolves the adapter using internal option', async (): Promise<void> => {
      const adapter = resolveAdapter('local', { domain: 'token-registry', type: 'engine', internal: { local: 'Yes' } })

      expect(adapter).toEqual('Yes')
    })

    it('throws if the module can not be inferred', async (): Promise<void> => {
      let error: Error

      try {
        resolveAdapter('some', { domain: 'base-library', type: 'engine' })
      } catch (err) {
        error = err
      }

      expect(error.message).toEqual('There isn\'t an installed module that matches the adapter specification for: "some" under "base-library" domain')
    })

    it('throws if the export name can be inferred', async (): Promise<void> => {
      let error: Error

      try {
        resolveAdapter('redis', { domain: 'token-registry' })
      } catch (err) {
        error = err
      }

      expect(error.message).toMatch(
        /Module "@universal-packages\/token-registry-redis" is declared in package.json but there is a problem importing it, try running "npm install".*/
      )
    })
  })
})
