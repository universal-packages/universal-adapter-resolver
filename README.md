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

#### **`resolveAdapter(name: string, [options])`**

Tries to infer an installed module name based on name and options, imports it and infers the desired export based on name and options.

```js
import { resolveAdapter } from '@universal-packages/adapter-resolver'

const adapter = resolveAdapter('redis', { domain: 'token-registry', type: 'engine' })

console.log(adapter)

// > [class RedisEngine]
```

#### Options

Options are meant for inferring the matching adapter so the parent library can have a single simple adapter name requirement instead of the whole path of library and export.

- **`domain`** `String`
  To help infer the module name for example if the adapter is `redis` and is meant to work with `@universal-packages/token-registry` you can just provide here `token-registry`.
- **`internal`** `Object`
  An object which keys match an internal adapter provided by the root library.
  ```js
  import { resolveAdapter } from '@universal-packages/adapter-resolver'

  const adapter = resolveAdapter('local', { internal: { local: LocalAdapter } })

  console.log(adapter)

  // > [class LocalAdapter]
  ```
- **`type`** `String`
  To help infer the export name, for example if the adapter is an "engine", you can provide here `engine` and it will internally will come up with different case variations to try to find the export ex: redisEngine, RedisEngine, redis_engine.

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
