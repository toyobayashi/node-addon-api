#include <napi.h>

using namespace Napi;

Value NestedCoroutine(const CallbackInfo& info) {
  Env env = info.Env();
  Value async_function = info[0];
  if (!async_function.IsFunction()) {
    NAPI_CO_THROW(Error::New(env, "not function"), Value());
  }
  auto maybe_promise = async_function.As<Function>()({});
  Value result;
#ifdef NODE_ADDON_API_ENABLE_MAYBE
  if (maybe_promise.IsNothing()) {
    NAPI_CO_THROW(env.GetAndClearPendingException(), Value());
  } else {
    result = co_await maybe_promise.Unwrap();
  }
#else
  result = co_await maybe_promise;
#endif
  result = co_await result;
  co_return co_await Number::New(env, result.As<Number>().DoubleValue() * 2);
}

Value Coroutine(const CallbackInfo& info) {
  Env env = info.Env();
  Value number = co_await NestedCoroutine(info);
  co_return Number::New(env, number.As<Number>().DoubleValue() * 2);
}

Value CoroutineThrow(const CallbackInfo& info) {
  Env env = info.Env();
  co_await NestedCoroutine(info);
  NAPI_CO_THROW(Error::New(env, "test error"), Value());
  co_return Value();
}

Object Init(Env env, Object exports) {
  exports.Set("coroutine", Function::New(env, Coroutine));
  exports.Set("coroutineThrow", Function::New(env, CoroutineThrow));
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
