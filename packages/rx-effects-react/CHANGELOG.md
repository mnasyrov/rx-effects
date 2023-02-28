# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0-beta.2](https://github.com/mnasyrov/rx-effects/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2023-02-28)

**Note:** Version bump only for package rx-effects-react

# [2.0.0-beta.1](https://github.com/mnasyrov/rx-effects/compare/v2.0.0-beta.0...v2.0.0-beta.1) (2023-02-27)

**Note:** Version bump only for package rx-effects-react

# [1.1.0](https://github.com/mnasyrov/rx-effects/compare/v1.0.1...v1.1.0) (2023-02-01)

### Features

- Made `ViewController` to accept queries for external parameters (breaking change) ([#17](https://github.com/mnasyrov/rx-effects/issues/17)) ([ad49f8a](https://github.com/mnasyrov/rx-effects/commit/ad49f8a70eda02a415c37de7de320582f4a91d0e))

## [1.0.1](https://github.com/mnasyrov/rx-effects/compare/v1.0.0...v1.0.1) (2023-01-23)

### Bug Fixes

- Fixed rerendering by `useObserver()` and reduced excess unsubscribe/subscribe on rerendering a parent component ([#13](https://github.com/mnasyrov/rx-effects/issues/13)) ([469b251](https://github.com/mnasyrov/rx-effects/commit/469b251797980b6280eb98d097e1b24747675879))

# [1.0.0](https://github.com/mnasyrov/rx-effects/compare/v0.7.2...v1.0.0) (2022-12-20)

### Features

- Updated API for the library. Introduced tooling for ViewControllers with Ditox.js DI container. ([7cffcd0](https://github.com/mnasyrov/rx-effects/commit/7cffcd03f915337fa27e3b55f30fd1ad0c45a087))

## [0.7.2](https://github.com/mnasyrov/rx-effects/compare/v0.7.1...v0.7.2) (2022-10-29)

### Features

- Introduced `scope.onDestroy()` and `scope.subscribe()`. Added info about API deprecation. ([#9](https://github.com/mnasyrov/rx-effects/issues/9)) ([4467782](https://github.com/mnasyrov/rx-effects/commit/44677829f889aa4fbca12fb467f149cd0fab6869))

## [0.7.1](https://github.com/mnasyrov/rx-effects/compare/v0.7.0...v0.7.1) (2022-10-26)

**Note:** Version bump only for package rx-effects-react

# [0.7.0](https://github.com/mnasyrov/rx-effects/compare/v0.6.0...v0.7.0) (2022-10-26)

**Note:** Version bump only for package rx-effects-react

# [0.6.0](https://github.com/mnasyrov/rx-effects/compare/v0.5.2...v0.6.0) (2022-08-28)

### Features

- Refactored Query API ([0ba6d12](https://github.com/mnasyrov/rx-effects/commit/0ba6d12df5f99cf98f04f130a89be814c90180f8))

## [0.5.2](https://github.com/mnasyrov/rx-effects/compare/v0.5.1...v0.5.2) (2022-01-26)

**Note:** Version bump only for package rx-effects-react

## [0.5.1](https://github.com/mnasyrov/rx-effects/compare/v0.5.0...v0.5.1) (2022-01-11)

**Note:** Version bump only for package rx-effects-react

# [0.5.0](https://github.com/mnasyrov/rx-effects/compare/v0.4.1...v0.5.0) (2022-01-11)

### Bug Fixes

- Fixed eslint rules ([6975806](https://github.com/mnasyrov/rx-effects/commit/69758063de4d9f6b7821b439aad054087df249b9))
- **rx-effects-react:** Fixed calling `destroy()` of a class-based controller by `useController()` ([1bdf6b5](https://github.com/mnasyrov/rx-effects/commit/1bdf6b55df6f41988bf7b481ec2019c97731f127))

## [0.4.1](https://github.com/mnasyrov/rx-effects/compare/v0.4.0...v0.4.1) (2021-11-10)

**Note:** Version bump only for package rx-effects-react

# [0.4.0](https://github.com/mnasyrov/rx-effects/compare/v0.3.3...v0.4.0) (2021-09-30)

**Note:** Version bump only for package rx-effects-react

## [0.3.3](https://github.com/mnasyrov/rx-effects/compare/v0.3.2...v0.3.3) (2021-09-27)

### Features

- Store.update() can apply an array of mutations ([d778ac9](https://github.com/mnasyrov/rx-effects/commit/d778ac99549a9ac1887ea03ab77d5f0fa6527d1f))

## [0.3.2](https://github.com/mnasyrov/rx-effects/compare/v0.3.1...v0.3.2) (2021-09-14)

### Bug Fixes

- useController() hook triggers rerenders if it is used without dependencies. ([f0b5582](https://github.com/mnasyrov/rx-effects/commit/f0b5582b7e801bd86882694d8d7dbb5456ca33bb))

## [0.3.1](https://github.com/mnasyrov/rx-effects/compare/v0.3.0...v0.3.1) (2021-09-07)

**Note:** Version bump only for package rx-effects-react

# [0.3.0](https://github.com/mnasyrov/rx-effects/compare/v0.2.2...v0.3.0) (2021-09-07)

### Features

- Introduced `StateQueryOptions` for query mappers. Strict equality === is used by default as value comparators. ([5cc97e0](https://github.com/mnasyrov/rx-effects/commit/5cc97e0f7ab1623ffbdc133e5bfbe63911d68b56))

## [0.2.2](https://github.com/mnasyrov/rx-effects/compare/v0.2.1...v0.2.2) (2021-09-02)

**Note:** Version bump only for package rx-effects-react

## [0.2.1](https://github.com/mnasyrov/rx-effects/compare/v0.2.0...v0.2.1) (2021-08-15)

### Bug Fixes

- Added a missed export for `useController()` hook ([a5e5c92](https://github.com/mnasyrov/rx-effects/commit/a5e5c92da8a288f44c41dac2cb70c96d788eea38))

# [0.2.0](https://github.com/mnasyrov/rx-effects/compare/v0.1.0...v0.2.0) (2021-08-09)

### Features

- Renamed `EffectScope` to `Scope`. Extended `Scope` and `declareState()`. ([21d97be](https://github.com/mnasyrov/rx-effects/commit/21d97be080897f33f674d461397e8f1e86ac8eef))

# [0.1.0](https://github.com/mnasyrov/rx-effects/compare/v0.0.8...v0.1.0) (2021-08-03)

### Features

- Introduced `Controller`, `useController()` and `mergeQueries()` ([d84a2e2](https://github.com/mnasyrov/rx-effects/commit/d84a2e2b8d1f57ca59e9664004de844a1f8bcf1f))

## [0.0.8](https://github.com/mnasyrov/rx-effects/compare/v0.0.7...v0.0.8) (2021-07-26)

### Bug Fixes

- Dropped stateEffects for a while. Added stubs for docs. ([566ab80](https://github.com/mnasyrov/rx-effects/commit/566ab8085b6e493942bf908e3000097561a14724))

## [0.0.7](https://github.com/mnasyrov/rx-effects/compare/v0.0.6...v0.0.7) (2021-07-23)

**Note:** Version bump only for package rx-effects-react

## [0.0.6](https://github.com/mnasyrov/rx-effects/compare/v0.0.5...v0.0.6) (2021-07-12)

**Note:** Version bump only for package rx-effects-react

## [0.0.5](https://github.com/mnasyrov/rx-effects/compare/v0.0.4...v0.0.5) (2021-07-11)

**Note:** Version bump only for package @rx-effects/react

## [0.0.4](https://github.com/mnasyrov/rx-effects/compare/v0.0.3...v0.0.4) (2021-07-11)

**Note:** Version bump only for package @rx-effects/react

## [0.0.3](https://github.com/mnasyrov/rx-effects/compare/v0.0.2...v0.0.3) (2021-07-11)

**Note:** Version bump only for package @rx-effects/react

## 0.0.2 (2021-07-11)

**Note:** Version bump only for package @rx-effects/react
