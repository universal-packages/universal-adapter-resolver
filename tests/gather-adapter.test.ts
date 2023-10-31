import path from 'path'

import { gatherAdapters } from '../src'

jest.mock('@universal-packages/package-json', (): any => ({
  readPackageJson: (): any => ({
    devDependencies: {
      [path.resolve('./tests/__fixtures__/my_domain_technology')]: '1.0.0',
      [path.resolve('./tests/__fixtures__/my_domain_other')]: '1.0.0',
      './tests/__fixtures__/other_domain_thing': '1.0.0'
    }
  })
}))

describe(gatherAdapters, (): void => {
  it('gather all adapters in a domain of the same type', async (): Promise<void> => {
    const adapters = gatherAdapters({ domain: 'my_domain', type: 'engine' })

    expect(adapters).toEqual(['TechnologyEngine', 'OtherEngine'])
  })

  it('gather all adapters in a domain of the same type plus all the specified internals', async (): Promise<void> => {
    const adapters = gatherAdapters({ domain: 'my_domain', type: 'engine', internal: ['InternalEngine'] })

    expect(adapters).toEqual(['InternalEngine', 'TechnologyEngine', 'OtherEngine'])
  })

  it('ignores packages that can not be gathered', async (): Promise<void> => {
    const adapters = gatherAdapters({ domain: 'other_domain', type: 'engine' })

    expect(adapters).toEqual([])
  })
})
