import { PackageJson } from '@universal-packages/package-json'
import path from 'path'

import { AdapterResolver } from './AdapterResolver'
import { assert, assertEquals, runTest } from './utils.test'

export async function adapterResolverTest() {
  console.log('🧪 Running AdapterResolver Tests')
  console.log('='.repeat(50))

  // Helper function to mock PackageJson
  function mockPackageJson(dependencies: Record<string, string>, devDependencies: Record<string, string> = {}) {
    const originalRead = PackageJson.prototype.read

    // Override the read method to set the mock data directly on the instance
    PackageJson.prototype.read = function () {
      ;(this as any).dependencies = dependencies
      ;(this as any).devDependencies = devDependencies
    }

    return () => {
      // Restore original read method
      PackageJson.prototype.read = originalRead
    }
  }

  // Test gather functionality
  await runTest('gather all adapters in a domain of the same type', async () => {
    const restore = mockPackageJson(
      {},
      {
        [path.resolve('./src/__fixtures__/my_domain_technology')]: '1.0.0',
        [path.resolve('./src/__fixtures__/my_domain_other')]: '1.0.0',
        './src/__fixtures__/other_domain_thing': '1.0.0',
        './src/__fixtures__/jest_domain_jest': '1.0.0'
      }
    )

    try {
      const resolver = new AdapterResolver({ domain: 'my_domain', type: 'engine' })
      const adapters = await resolver.gather()

      assertEquals(adapters.technology, 'TechnologyEngine', 'Should have technology adapter')
      assertEquals(adapters.other, 'OtherEngine', 'Should have other adapter')
    } finally {
      restore()
    }
  })

  await runTest('gather all adapters in a domain of the same type plus all the specified internals', async () => {
    const restore = mockPackageJson(
      {},
      {
        [path.resolve('./src/__fixtures__/my_domain_technology')]: '1.0.0',
        [path.resolve('./src/__fixtures__/my_domain_other')]: '1.0.0',
        './src/__fixtures__/other_domain_thing': '1.0.0',
        './src/__fixtures__/jest_domain_jest': '1.0.0'
      }
    )

    try {
      const resolver = new AdapterResolver({
        domain: 'my_domain',
        type: 'engine',
        internal: { internal: 'InternalEngine' }
      })
      const adapters = await resolver.gather()

      assertEquals(adapters.internal, 'InternalEngine', 'Should have internal adapter')
      assertEquals(adapters.technology, 'TechnologyEngine', 'Should have technology adapter')
      assertEquals(adapters.other, 'OtherEngine', 'Should have other adapter')
    } finally {
      restore()
    }
  })

  await runTest('gather all adapters in a domain all that exists in the same package', async () => {
    const restore = mockPackageJson(
      {},
      {
        [path.resolve('./src/__fixtures__/my_domain_all')]: '1.0.0',
        './src/__fixtures__/other_domain_thing': '1.0.0',
        './src/__fixtures__/jest_domain_jest': '1.0.0'
      }
    )

    try {
      const resolver = new AdapterResolver({ domain: 'my_domain', type: 'engine' })
      const adapters = await resolver.gather()

      assertEquals(adapters.technology, 'TechnologyEngine', 'Should have technology adapter')
      assertEquals(adapters.other, 'OtherEngine', 'Should have other adapter')
    } finally {
      restore()
    }
  })

  await runTest('throws if one adapter can not be imported during gather', async () => {
    const restore = mockPackageJson(
      {},
      {
        [path.resolve('./src/__fixtures__/my_domain_technology')]: '1.0.0',
        './src/__fixtures__/other_domain_thing': '1.0.0'
      }
    )

    try {
      const resolver = new AdapterResolver({ domain: 'other_domain', type: 'engine' })
      let error: Error | null = null

      try {
        await resolver.gather()
      } catch (err) {
        error = err as Error
      }

      assert(error !== null, 'Should throw an error')
      assert(
        error!.message.includes('Module "./src/__fixtures__/other_domain_thing" is a dependency in package.json but there is a problem importing it'),
        'Should mention the problematic module'
      )
    } finally {
      restore()
    }
  })

  await runTest('ignore packages that match the domain but are obviously meant for jest', async () => {
    const restore = mockPackageJson(
      {},
      {
        [path.resolve('./src/__fixtures__/my_domain_technology')]: '1.0.0',
        [path.resolve('./src/__fixtures__/my_domain_other')]: '1.0.0',
        './src/__fixtures__/other_domain_thing': '1.0.0',
        './src/__fixtures__/jest_domain_jest': '1.0.0'
      }
    )

    try {
      const resolver = new AdapterResolver({ domain: 'jest_domain', type: 'engine' })
      const adapters = await resolver.gather()

      assertEquals(Object.keys(adapters).length, 0, 'Should have no adapters for jest domain')
    } finally {
      restore()
    }
  })

  // Test resolve functionality
  await runTest('resolves the adapter using all the cues', async () => {
    const restore = mockPackageJson(
      {},
      {
        [path.resolve('./src/__fixtures__/my_domain_technology')]: '1.0.0',
        './src/__fixtures__/my_domain_thing': '1.0.0'
      }
    )

    try {
      const resolver = new AdapterResolver({ domain: 'my_domain', type: 'engine' })
      const adapter = await resolver.resolve('technology')

      assertEquals(adapter, 'TechnologyEngine', 'Should resolve to TechnologyEngine')
    } finally {
      restore()
    }
  })

  await runTest('resolves the adapter using internal option', async () => {
    const restore = mockPackageJson(
      {},
      {
        [path.resolve('./src/__fixtures__/my_domain_technology')]: '1.0.0',
        './src/__fixtures__/my_domain_thing': '1.0.0'
      }
    )

    try {
      const resolver = new AdapterResolver({
        domain: 'does not matter',
        type: 'engine',
        internal: { local: 'Yes' }
      })
      const adapter = await resolver.resolve('local')

      assertEquals(adapter, 'Yes', 'Should resolve to internal adapter')
    } finally {
      restore()
    }
  })

  await runTest('throws if the module can not be inferred', async () => {
    const restore = mockPackageJson(
      {},
      {
        [path.resolve('./src/__fixtures__/my_domain_technology')]: '1.0.0',
        './src/__fixtures__/my_domain_thing': '1.0.0'
      }
    )

    try {
      const resolver = new AdapterResolver({ domain: 'other_domain', type: 'engine' })
      let error: Error | null = null

      try {
        await resolver.resolve('some')
      } catch (err) {
        error = err as Error
      }

      assert(error !== null, 'Should throw an error')
      assertEquals(
        error!.message,
        'There isn\'t an installed module that matches the adapter specification for: "some" under "other_domain" domain of "engine" type',
        'Should have correct error message'
      )
    } finally {
      restore()
    }
  })

  await runTest('throws if the export name can be inferred', async () => {
    const restore = mockPackageJson(
      {},
      {
        [path.resolve('./src/__fixtures__/my_domain_technology')]: '1.0.0',
        './src/__fixtures__/my_domain_thing': '1.0.0'
      }
    )

    try {
      const resolver = new AdapterResolver({ domain: 'my_domain', type: 'engine' })
      let error: Error | null = null

      try {
        await resolver.resolve('thing')
      } catch (err) {
        error = err as Error
      }

      assert(error !== null, 'Should throw an error')
      assert(
        error!.message.includes('Module "./src/__fixtures__/my_domain_thing" is a dependency in package.json but there is a problem importing it'),
        'Should mention the problematic module'
      )
    } finally {
      restore()
    }
  })

  await runTest('handles non-Error objects thrown during module import in resolve', async () => {
    const restore = mockPackageJson(
      {},
      {
        [path.resolve('./src/__fixtures__/my_domain_technology')]: '1.0.0'
      }
    )

    try {
      const resolver = new AdapterResolver({ domain: 'my_domain', type: 'broken' })
      let thrownError: any = null

      try {
        await resolver.resolve('technology')
      } catch (err) {
        thrownError = err
      }

      assert(thrownError !== null, 'Should throw an error')
      assertEquals(thrownError instanceof Error, true, 'Should throw the original non-Error object')
      assertEquals(
        thrownError.message,
        `Module "${path.resolve('./src/__fixtures__/my_domain_technology')}" does not provide an export that matches "technology", trying: [technology_broken, TechnologyBroken, technologyBroken, technology_broken,]`,
        'Should be the original string error'
      )
    } finally {
      restore()
    }
  })

  console.log('\n✅ All AdapterResolver tests completed!')
}
