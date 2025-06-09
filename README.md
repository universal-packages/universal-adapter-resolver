# Adapter Resolver

[![npm version](https://badge.fury.io/js/@universal-packages%2Fadapter-resolver.svg)](https://www.npmjs.com/package/@universal-packages/adapter-resolver)
[![Testing](https://github.com/universal-packages/universal-adapter-resolver/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-adapter-resolver/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-adapter-resolver/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-adapter-resolver)

Module loader based on adapter parameters.

## Install

```shell
npm install @universal-packages/adapter-resolver
```

# Usage

## AdapterResolver <small><small>`class`</small></small>

Just instantiate the class and start resolving adapters.

```ts
import { AdapterResolver } from '@universal-packages/adapter-resolver'

const resolver = new AdapterResolver({ domain: 'token-registry', type: 'engine' })

const adapter = await resolver.resolve('redis')

console.log(adapter)

// > [class RedisEngine]
```

### Constructor <small><small>`constructor`</small></small>

```ts
new AdapterResolver(options: AdapterResolverOptions)
```

Creates a new AdapterResolver instance.

#### Options

Adapters need to follow the convention in order to be found. domain and name are use to infer the package name and type is used to infer the export name.

- **`domain`** `String`
  The domain for which the adapter will work for example if the adapter is `redis` and is meant to work with `@universal-packages/token-registry` you provide here `token-registry`.
- **`type`** `String`
  The package needs to export something in the format `<name><type>`, for example if the adapter is an "engine", you provide here `engine` and it will internally will come up with different case variations of the format to find the export ex: redisEngine, RedisEngine, redis_engine.
- **`internal`** `Object` `optional`
  An object which keys match an internal adapter provided by the root library.

  ```ts
  import { AdapterResolver } from '@universal-packages/adapter-resolver'

  const resolver = new AdapterResolver({
    domain: 'token-registry',
    type: 'engine',
    internal: { local: LocalAdapter }
  })

  const adapter = await resolver.resolve('local')

  console.log(adapter)

  // > [class LocalAdapter]
  ```

### Instance Methods

#### resolve

```ts
resolver.resolve(name: string): Promise<A>
```

Tries to infer an installed module name based on the provided name and resolver options, imports it and infers the desired export based on name and options.

```ts
import { AdapterResolver } from '@universal-packages/adapter-resolver'

const resolver = new AdapterResolver({ domain: 'token-registry', type: 'engine' })

const adapter = await resolver.resolve('redis')

console.log(adapter)

// > [class RedisEngine]
```

#### gather

```ts
resolver.gather(): Promise<GatheredAdapters<A>>
```

Gather all the adapters of the configured type under the same domain.

```ts
import { AdapterResolver } from '@universal-packages/adapter-resolver'

const resolver = new AdapterResolver({ domain: 'token-registry', type: 'engine' })

const adapters = await resolver.gather()

console.log(adapters)

// > { redis: [class RedisEngine], local: [class LocalEngine] }
```

When using the `internal` option, internal adapters will be mixed with the gathered adapters:

```ts
import { AdapterResolver } from '@universal-packages/adapter-resolver'

const resolver = new AdapterResolver({
  domain: 'token-registry',
  type: 'engine',
  internal: { local: InternalAdapter }
})

const adapters = await resolver.gather()

console.log(adapters)

// > { local: [class InternalAdapter], redis: [class RedisEngine] }
```

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
