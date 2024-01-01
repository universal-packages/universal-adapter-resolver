# Adapter Resolver

[![npm version](https://badge.fury.io/js/@universal-packages%2Fadapter-resolver.svg)](https://www.npmjs.com/package/@universal-packages/adapter-resolver)
[![Testing](https://github.com/universal-packages/universal-adapter-resolver/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-adapter-resolver/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-adapter-resolver/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-adapter-resolver)

Module loader based on adapter parameters.

## Install

```shell
npm install @universal-packages/adapter-resolver
```

## Global methods

#### **`resolveAdapter(options: Object)`**

Tries to infer an installed module name based on name and options, imports it and infers the desired export based on name and options.

```js
import { resolveAdapter } from '@universal-packages/adapter-resolver'

const adapter = resolveAdapter({ name: 'redis', domain: 'token-registry', type: 'engine' })

console.log(adapter)

// > [class RedisEngine]
```

#### Options

Adapters need to follow the convention in order to be found. domain and name are use to infer the package name and type is used to infer the export name.

- **`name`** `String`
  The name of the adapter, for example `redis`.
- **`domain`** `String`
  The domain for which the adapter will work for example if the adapter is `redis` and is meant to work with `@universal-packages/token-registry` you provide here `token-registry`.
- **`internal`** `Object`
  An object which keys match an internal adapter provided by the root library.

  ```js
  import { resolveAdapter } from '@universal-packages/adapter-resolver'

  const adapter = resolveAdapter('local', { internal: { domain: 'token-registry', type: 'engine', local: LocalAdapter } })

  console.log(adapter)

  // > [class LocalAdapter]
  ```

- **`type`** `String`
  The package needs to export something in the format `<name><type>`, for example if the adapter is an "engine", you provide here `engine` and it will internally will come up with different case variations of the format to find the export ex: redisEngine, RedisEngine, redis_engine.

#### **`gatherAdapters(options: Object)`**

Gather of the adapters of a type under the same domain.

```js
import { gatherAdapters } from '@universal-packages/adapter-resolver'

const adapters = gatherAdapters({ domain: 'token-registry', type: 'engine' })

console.log(adapters)

// > { redis: [class RedisEngine], local: [class LocalEngine] }
```

#### Options

- **`domain`** `String`
  The domain under which the adapters are meant to work, for example all engines for `@universal-packages/token-registry` will have the same domain `token-registry`.
- **`internal`** `Object`
  An object of named internal adapters provided by the root library to be mixed with the gathered adapters.

  ```js
  import { gatherAdapters } from '@universal-packages/adapter-resolver'

  const adapters = gatherAdapters({ domain: 'token-registry', type: 'engine', internal: { local: InternalAdapter } })

  console.log(adapters)

  // > { internal: [class InternalAdapter], redis: [class RedisEngine], local: [class LocalAdapter] }
  ```

- **`type`** `String`
  The type of the adapters, for example `engine`.

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
