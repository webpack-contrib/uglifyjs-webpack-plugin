import workerFarm from 'worker-farm';

import UglifyJsPlugin from '../src/index';

import { createCompiler, compile, cleanErrorStack } from './helpers';

// Based on https://github.com/facebook/jest/blob/edde20f75665c2b1e3c8937f758902b5cf28a7b4/packages/jest-runner/src/__tests__/test_runner.test.js
let workerFarmMock;

jest.mock('worker-farm', () => {
  const mock = jest.fn(
    () =>
      (workerFarmMock = jest.fn(() => {
        throw new Error('worker-farm failed');
      }))
  );
  mock.end = jest.fn();
  return mock;
});

describe('when applied with `parallel` option', () => {
  let compiler;

  beforeEach(() => {
    workerFarm.mockClear();
    workerFarm.end.mockClear();

    compiler = createCompiler({
      entry: {
        one: `${__dirname}/fixtures/entry.js`,
      },
    });
  });

  it('matches snapshot for errors into `worker-farm`', () => {
    new UglifyJsPlugin({ parallel: true, cache: false }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(workerFarm.mock.calls.length).toBe(1);
      expect(workerFarmMock.mock.calls.length).toBe(
        Object.keys(stats.compilation.assets).length
      );
      expect(workerFarm.end.mock.calls.length).toBe(1);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for errors into `worker-farm` and `cache` is `true`', () => {
    new UglifyJsPlugin({ parallel: true, cache: true }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(workerFarm.mock.calls.length).toBe(1);
      expect(workerFarmMock.mock.calls.length).toBe(
        Object.keys(stats.compilation.assets).length
      );
      expect(workerFarm.end.mock.calls.length).toBe(1);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });
});
