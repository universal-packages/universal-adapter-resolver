import path from 'path'

import { gatherAdapters } from '../src'

jest.mock('@universal-packages/package-json', (): any => ({
  readPackageJson: (): any => ({
    devDependencies: {
      [path.resolve('./tests/__fixtures__/my_domain_technology')]: '1.0.0',
      [path.resolve('./tests/__fixtures__/my_domain_other')]: '1.0.0',
      './tests/__fixtures__/other_domain_thing': '1.0.0',
      './tests/__fixtures__/jest_domain_jest': '1.0.0'
    }
  })
}))

describe(gatherAdapters, (): void => {
  it('gather all adapters in a domain of the same type', async (): Promise<void> => {
    const adapters = gatherAdapters({ domain: 'my_domain', type: 'engine' })

    expect(adapters).toEqual({ technology: 'TechnologyEngine', other: 'OtherEngine' })
  })

  it('gather all adapters in a domain of the same type plus all the specified internals', async (): Promise<void> => {
    const adapters = gatherAdapters({ domain: 'my_domain', type: 'engine', internal: { internal: 'InternalEngine' } })

    expect(adapters).toEqual({ internal: 'InternalEngine', technology: 'TechnologyEngine', other: 'OtherEngine' })
  })

  it('gather all adapters in a domain all that exists in the same package', async (): Promise<void> => {
    jest.mock('@universal-packages/package-json', (): any => ({
      readPackageJson: (): any => ({
        devDependencies: {
          [path.resolve('./tests/__fixtures__')]: '1.0.0',
          './tests/__fixtures__/other_domain_thing': '1.0.0',
          './tests/__fixtures__/jest_domain_jest': '1.0.0'
        }
      })
    }))

    const adapters = gatherAdapters({ domain: 'my_domain', type: 'engine' })

    expect(adapters).toEqual({ technology: 'TechnologyEngine', other: 'OtherEngine' })
  })

  it('throws if one adapter can not be imported', async (): Promise<void> => {
    let error: Error

    try {
      gatherAdapters({ domain: 'other_domain', type: 'engine' })
    } catch (err) {
      error = err
    }
    expect(error.message).toMatch(
      /Module ".\/tests\/__fixtures__\/other_domain_thing" is a dependency in package.json but there is a problem importing it, try running "npm install".*/
    )
  })

  it('ignore packages that match teh domain but are obviously meant for jest', async (): Promise<void> => {
    const adapters = gatherAdapters({ domain: 'jest_domain', type: 'engine' })

    expect(adapters).toEqual({})
  })
})
