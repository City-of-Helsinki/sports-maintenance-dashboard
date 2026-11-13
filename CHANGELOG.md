# Changelog

## [1.2.0](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/compare/sports-maintenance-dashboard-v1.1.0...sports-maintenance-dashboard-v1.2.0) (2026-11-13)


### Features

* Support runtime configuration with shared Docker images ([45d6041](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/45d604191b24f7b8a9e4cdd383dbd20a7ea52147))


### Dependencies

* Add glob and minimatch overrides for compatibility ([e157fe1](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/e157fe147b8380268cc1b476be93f92185b3261b))
* Update brace-expansion to versions 1.1.21 and 2.1.7 ([7a6d83c](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/7a6d83ccb85387df1d4e2445dd925af8c1a11614))
* Update compression from 1.8.1 to 1.8.2 ([ae094fe](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/ae094fe838cb806dc60c36f4c478efc703a29814))
* Update fast-uri from 3.1.6 to 3.1.9 ([a8381ad](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/a8381adf9534368e6d8fffef5493c09df933730e))
* Update follow-redirects from 1.16.0 to 1.16.2 ([27c4312](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/27c4312c0882ec456d0a70a99d0b852eff5ae3da))
* Update Jest to 30.5.2 ([ef6ccc7](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/ef6ccc70c44f87820d6e7e9a2fa58b9bc45e21b7))
* Update js-yaml from 3.15.1 to 3.15.2 and 4.3.1 to 4.3.2 ([eb0bd5b](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/eb0bd5b31522fc2b4e56597b999c613b734e6f58))
* Update launch-editor from 2.14.1 to 2.14.2 ([f406351](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/f4063510cc6e5bdb3c7444ef8cb0c7e83c0b7ebf))
* Update pnpm to version 11.28.11 ([de09a10](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/de09a101d40870d08411a78b68f5ad42ad6a8e54))
* Update postcss-selector-parser to version 6.1.5 ([00f3699](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/00f369957ad07e281772c4c9aa614fbc32b94f3e))
* Update qs to version 6.16.1 ([6881b2a](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/6881b2a6b1455a548b707138b41805025ada39fd))
* Update serialize-javascript to version 7.1.3 ([3dc8cb6](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/3dc8cb6b78e92cb3d67263e19725e7f3fd22a627))
* Update shell-quote from 1.10.0 to 1.12.0 ([888ef0b](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/888ef0b0d7ec1ac11cb8ba6cfa40e39c68e64898))
* Update source-map-js from 1.2.1 to 1.2.2 ([4195c78](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/4195c78bb3cfe577dfefce7a83a642f8383c3b41))
* Upgrade webpack-dev-server and React Refresh ([b2318b1](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/b2318b16349cf06dcd2b7135479355efaf1eb544))

## [1.1.0](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/compare/sports-maintenance-dashboard-v1.0.1...sports-maintenance-dashboard-v1.1.0) (2026-10-05)


### Features

* Add Cloud Sentry error tracking to the frontend SPA ([c7f9cd0](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/c7f9cd041c3c2891d33a897dfe182eebab2f0076))
* Add condition-specific button styles ([c283429](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/c283429c27a0412e59f0b90ca04b46e13f067ad3))


### Bug Fixes

* **deps:** Upgrade react-router to v7 to resolve Vulnerabilities ([e109064](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/e109064f7d4e3fce3623f97f643dc5373695e607))
* Pipeline refactor ([#59](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/issues/59)) ([1e574b4](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/1e574b4fd70cf277b225ddaaa7bdbe530a7cc8cd))
* **styles:** Update swimming beach status colors to match map spec ([#86](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/issues/86)) ([13af756](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/13af756fb019d6ce3d17217deb9e5e06e28ccdc5))


### Performance Improvements

* **build:** Mirror vendor splitting in dev config, drop dead bootstrap-sass/jQuery JS ([c2c7d87](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/c2c7d8791ad66d87c85db5f6a89a801c0cbe4697))
* **deps:** Use lodash direct-path imports for tree-shaking ([cbd1e72](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/cbd1e72ef02b6b11e4ed62fe6d273a6bf23e289e))
* **routes:** Lazy-load non-landing routes, use automatic JSX runtime ([36150d9](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/36150d9e882a47bdecbb220aab9b5ef0d63062a5))

## [1.0.1](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/compare/sports-maintenance-dashboard-v1.0.0...sports-maintenance-dashboard-v1.0.1) (2026-01-12)


### Bug Fixes

* Resolve minification issues with Redux DevTools integration ([#53](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/issues/53)) ([3c9e78d](https://github.com/City-of-Helsinki/sports-maintenance-dashboard/commit/3c9e78d07c4caae5745a71b58c57675783fc2fa9))
