import path from 'path'

import { resolveAdapter } from '../src'

jest.mock('@universal-packages/package-json', (): any => ({
  readPackageJson: (): any => ({
    devDependencies: {
      [path.resolve('./tests/__fixtures__/my_domain_technology')]: '1.0.0',
      './tests/__fixtures__/my_domain_thing': '1.0.0'
    }
  })
}))

describe(resolveAdapter, (): void => {
  it('resolves the adapter using all the cues', async (): Promise<void> => {
    const adapter = resolveAdapter({ name: 'technology', domain: 'my_domain', type: 'engine' })

    expect(adapter).toEqual('TechnologyEngine')
  })

  it('resolves the adapter using internal option', async (): Promise<void> => {
    const adapter = resolveAdapter({ name: 'local', domain: 'does not matter', type: 'engine', internal: { local: 'Yes' } })

    expect(adapter).toEqual('Yes')
  })

  it('throws if the module can not be inferred', async (): Promise<void> => {
    let error: Error

    try {
      resolveAdapter({ name: 'some', domain: 'other_domain', type: 'engine' })
    } catch (err) {
      error = err
    }

    expect(error.message).toEqual('There isn\'t an installed module that matches the adapter specification for: "some" under "other_domain" domain of "engine" type')
  })

  it('throws if the export name can be inferred', async (): Promise<void> => {
    let error: Error

    try {
      resolveAdapter({ name: 'thing', domain: 'my_domain', type: 'engine' })
    } catch (err) {
      error = err
    }
    expect(error.message).toMatch(
      /Module ".\/tests\/__fixtures__\/my_domain_thing" is a dependency in package.json but there is a problem importing it, try running "npm install".*/
    )
  })
})
