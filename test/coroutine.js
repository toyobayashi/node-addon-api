const path = require('path');
const { whichBuildType } = require('./common');
const assert = require('assert');

async function runTestWithBindingPath (test, buildType, buildPathRoot = process.env.BUILD_PATH || '') {
  buildType = buildType || await whichBuildType();
  const bindings = [
    path.join(buildPathRoot, `./build/${buildType}/binding_cpp20.node`),
    path.join(buildPathRoot, `./build/${buildType}/binding_cpp20_noexcept.node`),
    path.join(buildPathRoot, `./build/${buildType}/binding_cpp20_noexcept_maybe.node`),
    path.join(buildPathRoot, `./build/${buildType}/binding_cpp20_custom_namespace.node`)
  ].map(it => require.resolve(it));

  for (const item of bindings) {
    await test(item);
  }
}

module.exports = runTestWithBindingPath(test, undefined, __dirname);

async function test (path) {
  const binding = require(path);
  const promise = binding.coroutine(function () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(42);
      }, 1000);
    });
  });
  assert.ok(promise instanceof Promise);
  assert.strictEqual(await promise, 42 * 4);

  try {
    await binding.coroutine(function () {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('42'));
        }, 1000);
      });
    });
    throw new Error('should throw');
  } catch (err) {
    assert.strictEqual(err.message, '42');
  }

  try {
    await binding.coroutineThrow(function () {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(42);
        }, 1000);
      });
    });
  } catch (err) {
    assert.strictEqual(err.message, 'test error');
  }
}
