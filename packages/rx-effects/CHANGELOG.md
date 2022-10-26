# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.7.0](https://github.com/mnasyrov/rx-effects/compare/v0.6.0...v0.7.0) (2022-10-26)

### Bug Fixes

- Fixed usage of Effect's options by `handleAction()` and `scope.createEffect()` ([#7](https://github.com/mnasyrov/rx-effects/issues/7)) ([e44bd23](https://github.com/mnasyrov/rx-effects/commit/e44bd23b563f7a61ea1ecfa291b311f52d55e577))

### Features

- New scope's methods: `handleQuery()` and `subscribe()` ([#8](https://github.com/mnasyrov/rx-effects/issues/8)) ([5242c3e](https://github.com/mnasyrov/rx-effects/commit/5242c3e91b042b5eb060a0d1899a018c4b29294a))

# [0.6.0](https://github.com/mnasyrov/rx-effects/compare/v0.5.2...v0.6.0) (2022-08-28)

### Features

- `EffectOptions.pipeline` for customising processing of event. ([#4](https://github.com/mnasyrov/rx-effects/issues/4)) ([e927bb3](https://github.com/mnasyrov/rx-effects/commit/e927bb31c5fd7fe5c6c1e54b344d95dffc6ffd97))
- Added `ExternalScope` type. ([#3](https://github.com/mnasyrov/rx-effects/issues/3)) ([11c8a9c](https://github.com/mnasyrov/rx-effects/commit/11c8a9cd181869e2f973233efe42c49dc51b5ad3))
- Refactored Query API ([0ba6d12](https://github.com/mnasyrov/rx-effects/commit/0ba6d12df5f99cf98f04f130a89be814c90180f8))
- Track all unhandled errors of Effects ([#5](https://github.com/mnasyrov/rx-effects/issues/5)) ([3c108a4](https://github.com/mnasyrov/rx-effects/commit/3c108a488eae471337cc727461a7a223f7c367f3))

## [0.5.2](https://github.com/mnasyrov/rx-effects/compare/v0.5.1...v0.5.2) (2022-01-26)

**Note:** Version bump only for package rx-effects

## [0.5.1](https://github.com/mnasyrov/rx-effects/compare/v0.5.0...v0.5.1) (2022-01-11)

### Bug Fixes

- Do not expose internal stores to extensions ([27420cb](https://github.com/mnasyrov/rx-effects/commit/27420cb152ddfafa48f9d7f75b59e558ba982d64))

# [0.5.0](https://github.com/mnasyrov/rx-effects/compare/v0.4.1...v0.5.0) (2022-01-11)

### Bug Fixes

- Fixed eslint rules ([6975806](https://github.com/mnasyrov/rx-effects/commit/69758063de4d9f6b7821b439aad054087df249b9))

### Features

- Introduced store actions and `createStoreActions()` factory. ([c51bd07](https://github.com/mnasyrov/rx-effects/commit/c51bd07fa24c6d111567f75ad190a9f9bd987a5e))
- Introduced Store extensions and StoreLoggerExtension ([931b949](https://github.com/mnasyrov/rx-effects/commit/931b949b0c5134d6261eac7f6381a293dab48599))

## [0.4.1](https://github.com/mnasyrov/rx-effects/compare/v0.4.0...v0.4.1) (2021-11-10)

### Bug Fixes

- Share and replay mapQuery() and mergeQueries() to subscriptions ([8308310](https://github.com/mnasyrov/rx-effects/commit/830831001630d2b2b7318d2e7126706803eff9ff))

# [0.4.0](https://github.com/mnasyrov/rx-effects/compare/v0.3.3...v0.4.0) (2021-09-30)

### Bug Fixes

- Concurrent store updates by its subscribers ([bc29bb5](https://github.com/mnasyrov/rx-effects/commit/bc29bb545587c01386b7351e25c5ce4b5036dc9c))

## [0.3.3](https://github.com/mnasyrov/rx-effects/compare/v0.3.2...v0.3.3) (2021-09-27)

### Features

- Store.update() can apply an array of mutations ([d778ac9](https://github.com/mnasyrov/rx-effects/commit/d778ac99549a9ac1887ea03ab77d5f0fa6527d1f))

## [0.3.1](https://github.com/mnasyrov/rx-effects/compare/v0.3.0...v0.3.1) (2021-09-07)

### Bug Fixes

- `mapQuery()` and `mergeQueries()` produce distinct values by default ([17721af](https://github.com/mnasyrov/rx-effects/commit/17721af837b3a43f047ef67ba475294e58492e80))

# [0.3.0](https://github.com/mnasyrov/rx-effects/compare/v0.2.2...v0.3.0) (2021-09-07)

### Features

- Introduced `StateQueryOptions` for query mappers. Strict equality === is used by default as value comparators. ([5cc97e0](https://github.com/mnasyrov/rx-effects/commit/5cc97e0f7ab1623ffbdc133e5bfbe63911d68b56))

## [0.2.2](https://github.com/mnasyrov/rx-effects/compare/v0.2.1...v0.2.2) (2021-09-02)

### Bug Fixes

- Fixed typings and arguments of `mergeQueries()` ([156abcc](https://github.com/mnasyrov/rx-effects/commit/156abccc4dbe569751c1c79d1dba19e441da91cf))

## [0.2.1](https://github.com/mnasyrov/rx-effects/compare/v0.2.0...v0.2.1) (2021-08-15)

**Note:** Version bump only for package rx-effects

# [0.2.0](https://github.com/mnasyrov/rx-effects/compare/v0.1.0...v0.2.0) (2021-08-09)

### Features

- Renamed `EffectScope` to `Scope`. Extended `Scope` and `declareState()`. ([21d97be](https://github.com/mnasyrov/rx-effects/commit/21d97be080897f33f674d461397e8f1e86ac8eef))

# [0.1.0](https://github.com/mnasyrov/rx-effects/compare/v0.0.8...v0.1.0) (2021-08-03)

### Features

- Introduced 'destroy()' method to Store to complete it. ([199cbb7](https://github.com/mnasyrov/rx-effects/commit/199cbb70ab2163f9f8edc8045b988afd2604595b))
- Introduced `Controller`, `useController()` and `mergeQueries()` ([d84a2e2](https://github.com/mnasyrov/rx-effects/commit/d84a2e2b8d1f57ca59e9664004de844a1f8bcf1f))

## [0.0.8](https://github.com/mnasyrov/rx-effects/compare/v0.0.7...v0.0.8) (2021-07-26)

### Bug Fixes

- Dropped stateEffects for a while. Added stubs for docs. ([566ab80](https://github.com/mnasyrov/rx-effects/commit/566ab8085b6e493942bf908e3000097561a14724))

## [0.0.7](https://github.com/mnasyrov/rx-effects/compare/v0.0.6...v0.0.7) (2021-07-23)

### Bug Fixes

- Types for actions and effects ([49235fe](https://github.com/mnasyrov/rx-effects/commit/49235fe80728a3803a16251d4c163f002b4bb29f))

## [0.0.6](https://github.com/mnasyrov/rx-effects/compare/v0.0.5...v0.0.6) (2021-07-12)

**Note:** Version bump only for package rx-effects

## [0.0.5](https://github.com/mnasyrov/rx-effects/compare/v0.0.4...v0.0.5) (2021-07-11)

**Note:** Version bump only for package rx-effects

## [0.0.4](https://github.com/mnasyrov/rx-effects/compare/v0.0.3...v0.0.4) (2021-07-11)

**Note:** Version bump only for package rx-effects

## [0.0.3](https://github.com/mnasyrov/rx-effects/compare/v0.0.2...v0.0.3) (2021-07-11)

**Note:** Version bump only for package rx-effects

## 0.0.2 (2021-07-11)

**Note:** Version bump only for package rx-effects
