# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.2](https://github.com/mnasyrov/rx-effects/compare/v0.3.1...v0.3.2) (2021-09-14)

### Bug Fixes

- useController() hook triggers rerenders if it is used without dependencies. ([f0b5582](https://github.com/mnasyrov/rx-effects/commit/f0b5582b7e801bd86882694d8d7dbb5456ca33bb))

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

### Bug Fixes

- Added a missed export for `useController()` hook ([a5e5c92](https://github.com/mnasyrov/rx-effects/commit/a5e5c92da8a288f44c41dac2cb70c96d788eea38))

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

**Note:** Version bump only for package rx-effects-root

## [0.0.5](https://github.com/mnasyrov/rx-effects/compare/v0.0.4...v0.0.5) (2021-07-11)

**Note:** Version bump only for package @rx-effects/root

## [0.0.4](https://github.com/mnasyrov/rx-effects/compare/v0.0.3...v0.0.4) (2021-07-11)

**Note:** Version bump only for package @rx-effects/root

## [0.0.3](https://github.com/mnasyrov/rx-effects/compare/v0.0.2...v0.0.3) (2021-07-11)

**Note:** Version bump only for package @rx-effects/root

## 0.0.2 (2021-07-11)

**Note:** Version bump only for package @rx-effects/root
