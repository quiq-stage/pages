var QuiqContactUs = (function () {
	'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	createCommonjsModule(function (module) {
	/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var runtime = (function (exports) {

	  var Op = Object.prototype;
	  var hasOwn = Op.hasOwnProperty;
	  var undefined$1; // More compressible than void 0.
	  var $Symbol = typeof Symbol === "function" ? Symbol : {};
	  var iteratorSymbol = $Symbol.iterator || "@@iterator";
	  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

	  function define(obj, key, value) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	    return obj[key];
	  }
	  try {
	    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
	    define({}, "");
	  } catch (err) {
	    define = function(obj, key, value) {
	      return obj[key] = value;
	    };
	  }

	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	    var generator = Object.create(protoGenerator.prototype);
	    var context = new Context(tryLocsList || []);

	    // The ._invoke method unifies the implementations of the .next,
	    // .throw, and .return methods.
	    generator._invoke = makeInvokeMethod(innerFn, self, context);

	    return generator;
	  }
	  exports.wrap = wrap;

	  // Try/catch helper to minimize deoptimizations. Returns a completion
	  // record like context.tryEntries[i].completion. This interface could
	  // have been (and was previously) designed to take a closure to be
	  // invoked without arguments, but in all the cases we care about we
	  // already have an existing method we want to call, so there's no need
	  // to create a new function object. We can even get away with assuming
	  // the method takes exactly one argument, since that happens to be true
	  // in every case, so we don't have to touch the arguments object. The
	  // only additional allocation required is the completion record, which
	  // has a stable shape and so hopefully should be cheap to allocate.
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }

	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";

	  // Returning this object from the innerFn has the same effect as
	  // breaking out of the dispatch switch statement.
	  var ContinueSentinel = {};

	  // Dummy constructor functions that we use as the .constructor and
	  // .constructor.prototype properties for functions that return Generator
	  // objects. For full spec compliance, you may wish to configure your
	  // minifier not to mangle the names of these two functions.
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}

	  // This is a polyfill for %IteratorPrototype% for environments that
	  // don't natively support it.
	  var IteratorPrototype = {};
	  IteratorPrototype[iteratorSymbol] = function () {
	    return this;
	  };

	  var getProto = Object.getPrototypeOf;
	  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
	  if (NativeIteratorPrototype &&
	      NativeIteratorPrototype !== Op &&
	      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	    // This environment has a native %IteratorPrototype%; use it instead
	    // of the polyfill.
	    IteratorPrototype = NativeIteratorPrototype;
	  }

	  var Gp = GeneratorFunctionPrototype.prototype =
	    Generator.prototype = Object.create(IteratorPrototype);
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunction.displayName = define(
	    GeneratorFunctionPrototype,
	    toStringTagSymbol,
	    "GeneratorFunction"
	  );

	  // Helper for defining the .next, .throw, and .return methods of the
	  // Iterator interface in terms of a single ._invoke method.
	  function defineIteratorMethods(prototype) {
	    ["next", "throw", "return"].forEach(function(method) {
	      define(prototype, method, function(arg) {
	        return this._invoke(method, arg);
	      });
	    });
	  }

	  exports.isGeneratorFunction = function(genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor
	      ? ctor === GeneratorFunction ||
	        // For the native GeneratorFunction constructor, the best we can
	        // do is to check its .name property.
	        (ctor.displayName || ctor.name) === "GeneratorFunction"
	      : false;
	  };

	  exports.mark = function(genFun) {
	    if (Object.setPrototypeOf) {
	      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	    } else {
	      genFun.__proto__ = GeneratorFunctionPrototype;
	      define(genFun, toStringTagSymbol, "GeneratorFunction");
	    }
	    genFun.prototype = Object.create(Gp);
	    return genFun;
	  };

	  // Within the body of any async function, `await x` is transformed to
	  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	  // `hasOwn.call(value, "__await")` to determine if the yielded value is
	  // meant to be awaited.
	  exports.awrap = function(arg) {
	    return { __await: arg };
	  };

	  function AsyncIterator(generator, PromiseImpl) {
	    function invoke(method, arg, resolve, reject) {
	      var record = tryCatch(generator[method], generator, arg);
	      if (record.type === "throw") {
	        reject(record.arg);
	      } else {
	        var result = record.arg;
	        var value = result.value;
	        if (value &&
	            typeof value === "object" &&
	            hasOwn.call(value, "__await")) {
	          return PromiseImpl.resolve(value.__await).then(function(value) {
	            invoke("next", value, resolve, reject);
	          }, function(err) {
	            invoke("throw", err, resolve, reject);
	          });
	        }

	        return PromiseImpl.resolve(value).then(function(unwrapped) {
	          // When a yielded Promise is resolved, its final value becomes
	          // the .value of the Promise<{value,done}> result for the
	          // current iteration.
	          result.value = unwrapped;
	          resolve(result);
	        }, function(error) {
	          // If a rejected Promise was yielded, throw the rejection back
	          // into the async generator function so it can be handled there.
	          return invoke("throw", error, resolve, reject);
	        });
	      }
	    }

	    var previousPromise;

	    function enqueue(method, arg) {
	      function callInvokeWithMethodAndArg() {
	        return new PromiseImpl(function(resolve, reject) {
	          invoke(method, arg, resolve, reject);
	        });
	      }

	      return previousPromise =
	        // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(
	          callInvokeWithMethodAndArg,
	          // Avoid propagating failures to Promises returned by later
	          // invocations of the iterator.
	          callInvokeWithMethodAndArg
	        ) : callInvokeWithMethodAndArg();
	    }

	    // Define the unified helper method that is used to implement .next,
	    // .throw, and .return (see defineIteratorMethods).
	    this._invoke = enqueue;
	  }

	  defineIteratorMethods(AsyncIterator.prototype);
	  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	    return this;
	  };
	  exports.AsyncIterator = AsyncIterator;

	  // Note that simple async functions are implemented on top of
	  // AsyncIterator objects; they just return a Promise for the value of
	  // the final result produced by the iterator.
	  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
	    if (PromiseImpl === void 0) PromiseImpl = Promise;

	    var iter = new AsyncIterator(
	      wrap(innerFn, outerFn, self, tryLocsList),
	      PromiseImpl
	    );

	    return exports.isGeneratorFunction(outerFn)
	      ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function(result) {
	          return result.done ? result.value : iter.next();
	        });
	  };

	  function makeInvokeMethod(innerFn, self, context) {
	    var state = GenStateSuspendedStart;

	    return function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }

	      if (state === GenStateCompleted) {
	        if (method === "throw") {
	          throw arg;
	        }

	        // Be forgiving, per 25.3.3.3.3 of the spec:
	        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	        return doneResult();
	      }

	      context.method = method;
	      context.arg = arg;

	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          var delegateResult = maybeInvokeDelegate(delegate, context);
	          if (delegateResult) {
	            if (delegateResult === ContinueSentinel) continue;
	            return delegateResult;
	          }
	        }

	        if (context.method === "next") {
	          // Setting context._sent for legacy support of Babel's
	          // function.sent implementation.
	          context.sent = context._sent = context.arg;

	        } else if (context.method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw context.arg;
	          }

	          context.dispatchException(context.arg);

	        } else if (context.method === "return") {
	          context.abrupt("return", context.arg);
	        }

	        state = GenStateExecuting;

	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          // If an exception is thrown from innerFn, we leave state ===
	          // GenStateExecuting and loop back for another invocation.
	          state = context.done
	            ? GenStateCompleted
	            : GenStateSuspendedYield;

	          if (record.arg === ContinueSentinel) {
	            continue;
	          }

	          return {
	            value: record.arg,
	            done: context.done
	          };

	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	          // Dispatch the exception by looping back around to the
	          // context.dispatchException(context.arg) call above.
	          context.method = "throw";
	          context.arg = record.arg;
	        }
	      }
	    };
	  }

	  // Call delegate.iterator[context.method](context.arg) and handle the
	  // result, either by returning a { value, done } result from the
	  // delegate iterator, or by modifying context.method and context.arg,
	  // setting context.delegate to null, and returning the ContinueSentinel.
	  function maybeInvokeDelegate(delegate, context) {
	    var method = delegate.iterator[context.method];
	    if (method === undefined$1) {
	      // A .throw or .return when the delegate iterator has no .throw
	      // method always terminates the yield* loop.
	      context.delegate = null;

	      if (context.method === "throw") {
	        // Note: ["return"] must be used for ES3 parsing compatibility.
	        if (delegate.iterator["return"]) {
	          // If the delegate iterator has a return method, give it a
	          // chance to clean up.
	          context.method = "return";
	          context.arg = undefined$1;
	          maybeInvokeDelegate(delegate, context);

	          if (context.method === "throw") {
	            // If maybeInvokeDelegate(context) changed context.method from
	            // "return" to "throw", let that override the TypeError below.
	            return ContinueSentinel;
	          }
	        }

	        context.method = "throw";
	        context.arg = new TypeError(
	          "The iterator does not provide a 'throw' method");
	      }

	      return ContinueSentinel;
	    }

	    var record = tryCatch(method, delegate.iterator, context.arg);

	    if (record.type === "throw") {
	      context.method = "throw";
	      context.arg = record.arg;
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    var info = record.arg;

	    if (! info) {
	      context.method = "throw";
	      context.arg = new TypeError("iterator result is not an object");
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    if (info.done) {
	      // Assign the result of the finished delegate to the temporary
	      // variable specified by delegate.resultName (see delegateYield).
	      context[delegate.resultName] = info.value;

	      // Resume execution at the desired location (see delegateYield).
	      context.next = delegate.nextLoc;

	      // If context.method was "throw" but the delegate handled the
	      // exception, let the outer generator proceed normally. If
	      // context.method was "next", forget context.arg since it has been
	      // "consumed" by the delegate iterator. If context.method was
	      // "return", allow the original .return call to continue in the
	      // outer generator.
	      if (context.method !== "return") {
	        context.method = "next";
	        context.arg = undefined$1;
	      }

	    } else {
	      // Re-yield the result returned by the delegate method.
	      return info;
	    }

	    // The delegate iterator is finished, so forget it and continue with
	    // the outer generator.
	    context.delegate = null;
	    return ContinueSentinel;
	  }

	  // Define Generator.prototype.{next,throw,return} in terms of the
	  // unified ._invoke helper method.
	  defineIteratorMethods(Gp);

	  define(Gp, toStringTagSymbol, "Generator");

	  // A Generator should always return itself as the iterator object when the
	  // @@iterator function is called on it. Some browsers' implementations of the
	  // iterator prototype chain incorrectly implement this, causing the Generator
	  // object to not be returned from this call. This ensures that doesn't happen.
	  // See https://github.com/facebook/regenerator/issues/274 for more details.
	  Gp[iteratorSymbol] = function() {
	    return this;
	  };

	  Gp.toString = function() {
	    return "[object Generator]";
	  };

	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };

	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }

	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }

	    this.tryEntries.push(entry);
	  }

	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }

	  function Context(tryLocsList) {
	    // The root entry object (effectively a try statement without a catch
	    // or a finally block) gives us a place to store values thrown from
	    // locations where there is no enclosing try statement.
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset(true);
	  }

	  exports.keys = function(object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();

	    // Rather than returning an object with a next method, we keep
	    // things simple and return the next function itself.
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }

	      // To avoid creating an additional object, we just hang the .value
	      // and .done properties off the next function object itself. This
	      // also ensures that the minifier will not anonymize the function.
	      next.done = true;
	      return next;
	    };
	  };

	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }

	      if (typeof iterable.next === "function") {
	        return iterable;
	      }

	      if (!isNaN(iterable.length)) {
	        var i = -1, next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }

	          next.value = undefined$1;
	          next.done = true;

	          return next;
	        };

	        return next.next = next;
	      }
	    }

	    // Return an iterator with no values.
	    return { next: doneResult };
	  }
	  exports.values = values;

	  function doneResult() {
	    return { value: undefined$1, done: true };
	  }

	  Context.prototype = {
	    constructor: Context,

	    reset: function(skipTempReset) {
	      this.prev = 0;
	      this.next = 0;
	      // Resetting context._sent for legacy support of Babel's
	      // function.sent implementation.
	      this.sent = this._sent = undefined$1;
	      this.done = false;
	      this.delegate = null;

	      this.method = "next";
	      this.arg = undefined$1;

	      this.tryEntries.forEach(resetTryEntry);

	      if (!skipTempReset) {
	        for (var name in this) {
	          // Not sure about the optimal order of these conditions:
	          if (name.charAt(0) === "t" &&
	              hasOwn.call(this, name) &&
	              !isNaN(+name.slice(1))) {
	            this[name] = undefined$1;
	          }
	        }
	      }
	    },

	    stop: function() {
	      this.done = true;

	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }

	      return this.rval;
	    },

	    dispatchException: function(exception) {
	      if (this.done) {
	        throw exception;
	      }

	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;

	        if (caught) {
	          // If the dispatched exception was caught by a catch block,
	          // then let that catch block handle the exception normally.
	          context.method = "next";
	          context.arg = undefined$1;
	        }

	        return !! caught;
	      }

	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;

	        if (entry.tryLoc === "root") {
	          // Exception thrown outside of any try block that could handle
	          // it, so set the completion value of the entire function to
	          // throw the exception.
	          return handle("end");
	        }

	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");

	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }

	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },

	    abrupt: function(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev &&
	            hasOwn.call(entry, "finallyLoc") &&
	            this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }

	      if (finallyEntry &&
	          (type === "break" ||
	           type === "continue") &&
	          finallyEntry.tryLoc <= arg &&
	          arg <= finallyEntry.finallyLoc) {
	        // Ignore the finally entry if control is not jumping to a
	        // location outside the try/catch block.
	        finallyEntry = null;
	      }

	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;

	      if (finallyEntry) {
	        this.method = "next";
	        this.next = finallyEntry.finallyLoc;
	        return ContinueSentinel;
	      }

	      return this.complete(record);
	    },

	    complete: function(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }

	      if (record.type === "break" ||
	          record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = this.arg = record.arg;
	        this.method = "return";
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }

	      return ContinueSentinel;
	    },

	    finish: function(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          this.complete(entry.completion, entry.afterLoc);
	          resetTryEntry(entry);
	          return ContinueSentinel;
	        }
	      }
	    },

	    "catch": function(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }

	      // The context.catch method must only be called with a location
	      // argument that corresponds to a known catch block.
	      throw new Error("illegal catch attempt");
	    },

	    delegateYield: function(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };

	      if (this.method === "next") {
	        // Deliberately forget the last sent value so that we don't
	        // accidentally pass it on to the delegate.
	        this.arg = undefined$1;
	      }

	      return ContinueSentinel;
	    }
	  };

	  // Regardless of whether this script is executing as a CommonJS module
	  // or not, return the runtime object so that we can declare the variable
	  // regeneratorRuntime in the outer scope, which allows this module to be
	  // injected easily by `bin/regenerator --include-runtime script.js`.
	  return exports;

	}(
	  // If this script is executing as a CommonJS module, use module.exports
	  // as the regeneratorRuntime namespace. Otherwise create a new empty
	  // object. Either way, the resulting object will be used to initialize
	  // the regeneratorRuntime variable at the top of this file.
	  module.exports 
	));

	try {
	  regeneratorRuntime = runtime;
	} catch (accidentalStrictMode) {
	  // This module should not be running in strict mode, so the above
	  // assignment should always work unless something is misconfigured. Just
	  // in case runtime.js accidentally runs in strict mode, we can escape
	  // strict mode using a global Function call. This could conceivably fail
	  // if a Content Security Policy forbids using Function, but in that case
	  // the proper solution is to fix the accidental strict mode problem. If
	  // you've misconfigured your bundler to force strict mode and applied a
	  // CSP to forbid Function, and you're not willing to fix either of those
	  // problems, please detail your unique predicament in a GitHub issue.
	  Function("r", "regeneratorRuntime = r")(runtime);
	}
	});

	/**
	 * Look through the configuration for problems and log them in the console
	 */
	function validateConfiguration(config) {
	  var _config$channels$webc, _config$channels$webc2, _config$channels$webc3, _config$channels$webc4;
	  // Make sure all the included channels are configured
	  config.order.forEach(function (channel) {
	    if (!config.channels[channel]) {
	      warnLoudly("The ".concat(channel, " channel is specified, but not configured"));
	    }
	  });

	  // Check for 'chat' instead of 'webchat'
	  if (config.channels.chat) {
	    warn('"chat" was included in channels configuration. Do you mean "webchat"?');
	  }
	  if (config.order.includes('chat')) {
	    warn('"chat" was included in order configuration. Do you mean "webchat"?');
	  }

	  // Check for unknown channels
	  var realOrCloseChannels = ['sms', 'facebook', 'webchat', 'abc', 'chat']; // Including 'chat' because we warn above
	  config.order.forEach(function (channel) {
	    if (!realOrCloseChannels.includes(channel)) {
	      warn("".concat(channel, " is not a valid channel, but was specified in the order"));
	    }
	  });
	  Object.keys(config.channels).forEach(function (channel) {
	    if (!realOrCloseChannels.includes(channel)) {
	      warn("".concat(channel, " is not a valid channel, but was specified in the configuration"));
	    }
	  });

	  // Channel specific validation
	  if (config.channels.sms && !config.channels.sms.phoneNumber) {
	    warnLoudly('phoneNumber is required when using SMS');
	  }
	  if (config.channels.webchat && !config.channels.webchat.tenant) {
	    warnLoudly('tenant is required when using webchat');
	  }
	  if (config.channels.webchat && !config.channels.webchat.options) {
	    warn('No webchat options were specified');
	  }
	  if ((_config$channels$webc = config.channels.webchat) !== null && _config$channels$webc !== void 0 && (_config$channels$webc2 = _config$channels$webc.options) !== null && _config$channels$webc2 !== void 0 && _config$channels$webc2.contactPoint && (_config$channels$webc3 = config.channels.webchat) !== null && _config$channels$webc3 !== void 0 && (_config$channels$webc4 = _config$channels$webc3.options) !== null && _config$channels$webc4 !== void 0 && _config$channels$webc4.pageConfigurationId) {
	    throw new Error("Both contactPoint and pageConfigurationId are set, but it's only valid to set one or the other. \nPlease set pageConfigurationId to use the current version of chat or contactPoint if you're using legacy webchat.");
	  }
	  if (config.channels.facebook && !config.channels.facebook.id) {
	    warnLoudly('id is required when using Facebook');
	  }
	  if (config.channels.abc && !config.channels.abc.appleBusinessId) {
	    warnLoudly('appleBusinessId is required when using ABC');
	  }

	  // Auto Pop
	  if (config.autoPop) {
	    if (!config.autoPop.message) {
	      warnLoudly('You need to specify a `message` to use autoPop');
	    }
	    if (!config.autoPop.wait) {
	      warnLoudly('You need to specify a `wait` time to use autoPop');
	    }
	  }
	}
	function warn() {
	  var _console;
	  for (var _len = arguments.length, message = new Array(_len), _key = 0; _key < _len; _key++) {
	    message[_key] = arguments[_key];
	  }
	  (_console = console).warn.apply(_console, ['QuiqContactUs -'].concat(message));
	}
	function warnLoudly() {
	  var _console2;
	  for (var _len2 = arguments.length, message = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	    message[_key2] = arguments[_key2];
	  }
	  (_console2 = console).error.apply(_console2, ['QuiqContactUs -'].concat(message));
	}

	function asyncGeneratorStep(n, t, e, r, o, a, c) {
	  try {
	    var i = n[a](c),
	      u = i.value;
	  } catch (n) {
	    return void e(n);
	  }
	  i.done ? t(u) : Promise.resolve(u).then(r, o);
	}
	function _asyncToGenerator(n) {
	  return function () {
	    var t = this,
	      e = arguments;
	    return new Promise(function (r, o) {
	      var a = n.apply(t, e);
	      function _next(n) {
	        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
	      }
	      function _throw(n) {
	        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
	      }
	      _next(void 0);
	    });
	  };
	}

	function renderContainer(_ref) {
	  var renderTarget = _ref.renderTarget;
	  var container = document.createElement('div');
	  container.id = 'QuiqContactUsButtons';
	  container.style.display = 'none';
	  var shadow = document.createElement('div');
	  shadow.classList.add('channelOptionShadow');
	  container.appendChild(shadow);
	  var buttons = document.createElement('div');
	  buttons.classList.add('channelButtons');
	  container.appendChild(buttons);
	  renderTarget.appendChild(container);
	}

	function renderMainButton(_ref) {
	  var toggle = _ref.toggle,
	    color = _ref.color,
	    renderTarget = _ref.renderTarget,
	    useChatV2 = _ref.useChatV2;
	  var button = document.createElement('button');
	  button.id = 'QuiqContactUsButton';
	  button.onclick = function () {
	    return toggle();
	  };
	  button.style.backgroundColor = color || '#3f4654';
	  if (useChatV2) {
	    // Hide the button at first if chat2.0 is loaded. Otherwise there can be a weird
	    // delay after selecting webchat if it's still initializing
	    button.style.display = 'none';
	  } else {
	    // Add a class for legacy chat. The button shows up in a slightly different spot
	    button.classList.add('legacy-chat');
	  }
	  var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	  icon.setAttribute('width', '30');
	  icon.setAttribute('height', '30');
	  icon.setAttribute('viewBox', '0 0 576 500');
	  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	  path.setAttribute('d', 'M416,160 C416,71.6 322.9,0 208,0 C93.1,0 0,71.6 0,160 C0,194.3 14.1,225.9 38,252 C24.6,282.2 2.5,306.2 2.2,306.5 C2.66453526e-15,308.8 -0.6,312.2 0.7,315.2 C2,318.2 4.8,320 8,320 C44.6,320 74.9,307.7 96.7,295 C128.9,310.7 167,320 208,320 C322.9,320 416,248.4 416,160 Z M538,380 C561.9,354 576,322.3 576,288 C576,221.1 522.5,163.8 446.7,139.9 C447.6,146.5 448,153.2 448,160 C448,265.9 340.3,352 208,352 C197.2,352 186.7,351.2 176.3,350.1 C207.8,407.6 281.8,448 368,448 C409,448 447.1,438.8 479.3,423 C501.1,435.7 531.4,448 568,448 C571.2,448 574.1,446.1 575.3,443.2 C576.6,440.3 576,436.9 573.8,434.5 C573.5,434.2 551.4,410.3 538,380 Z');
	  icon.appendChild(path);
	  button.appendChild(icon);
	  renderTarget.appendChild(button);
	}

	function importAppleScript() {
	  return new Promise(function (resolve) {
	    var script = document.createElement('script');
	    script.setAttribute('src', 'https://static.cdn-apple.com/businesschat/start-chat-button/2/index.js');
	    script.onload = resolve;
	    document.body.appendChild(script);
	  });
	}

	function importWebchat(_ref) {
	  var tenant = _ref.tenant,
	    options = _ref.options;
	  return new Promise(function (resolve) {
	    var shouldLoadV2 = !!options.pageConfigurationId;
	    var script = document.createElement('script');
	    script.setAttribute('src', "https://".concat(tenant, ".quiq-api.com/app/").concat(shouldLoadV2 ? 'chat-ui' : 'webchat', "/index.js"));
	    script.setAttribute('charset', 'UTF-8');
	    script.onload = function () {
	      resolve(Quiq(options));
	    };
	    document.body.appendChild(script);
	  });
	}

	function formatNumber(smsNumber) {
	  var numbers = smsNumber.replace(/\D/g, '');
	  if (numbers.length !== 11) {
	    console.warn('Skipping auto formatting of number for SMS modal');
	    return smsNumber;
	  }
	  return "".concat(numbers.slice(1, 4), "-").concat(numbers.slice(4, 7), "-").concat(numbers.slice(7, 11));
	}
	function showSmsModal() {
	  var container = document.getElementById('QuiqContactUsSmsModal');
	  container.dataset.visible = true;
	}
	function hideSmsModal() {
	  var container = document.getElementById('QuiqContactUsSmsModal');
	  container.dataset.visible = false;
	}
	function renderSmsModal(_ref) {
	  var smsNumber = _ref.smsNumber,
	    fontFamily = _ref.fontFamily,
	    modalTitle = _ref.modalTitle,
	    modalPrompt = _ref.modalPrompt,
	    _ref$direction = _ref.direction,
	    direction = _ref$direction === void 0 ? 'ltr' : _ref$direction;
	  var container = document.createElement('div');
	  container.id = 'QuiqContactUsSmsModal';
	  container.classList.add('QuiqContactUs-modalContainer');
	  container.dataset.visible = false;
	  var modal = document.createElement('div');
	  modal.classList.add('QuiqContactUs-modal');
	  var closeButton = document.createElement('button');
	  closeButton.classList.add('QuiqContactUs-modalClose');
	  if (direction === 'rtl') {
	    closeButton.classList.add('QuiqContactUs-modalClose-rightToLeft');
	  }
	  closeButton.innerText = '×';
	  closeButton.onclick = hideSmsModal;
	  modal.appendChild(closeButton);
	  var title = document.createElement('h1');
	  title.classList.add('QuiqContactUs-modalTitle');
	  title.style.fontFamily = fontFamily || 'Inter';
	  title.innerText = modalTitle || 'Text Us';
	  modal.appendChild(title);
	  var body = document.createElement('div');
	  body.style.fontFamily = fontFamily || 'Inter';
	  body.classList.add('QuiqContactUs-modalBody');
	  var prompt = document.createElement('p');
	  prompt.classList.add('QuiqContactUs-modalPrompt');
	  prompt.innerText = modalPrompt || 'Please text us at';
	  body.appendChild(prompt);
	  var formattedNumber = document.createElement('p');
	  formattedNumber.classList.add('QuiqContactUs-modalPrompt');
	  formattedNumber.innerText = formatNumber(smsNumber);
	  body.appendChild(formattedNumber);
	  modal.appendChild(body);
	  container.appendChild(modal);
	  return container;
	}

	function renderFacebookMessengerIcon() {
	  var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	  icon.setAttribute('width', '45');
	  icon.setAttribute('height', '45');
	  icon.setAttribute('viewBox', '0 0 1000 1000');
	  icon.setAttribute('enable-background', 'new 0 0 1000 1000');
	  icon.setAttribute('xml:space', 'preserve');
	  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	  path.setAttribute('fill', '#ffffff');
	  path.setAttribute('d', 'M499.5,103.503c-217.049,0-393.002,164.533-393.002,367.496 c0,115.46,56.945,218.482,146.002,285.854V897.5l134.118-74.394c35.754,10.009,73.646,15.389,112.882,15.389 c217.049,0,393.002-164.534,393.002-367.497S716.549,103.503,499.5,103.503z M540.891,596.308L439.247,490.714L243.5,598.967 l214.609-227.741L559.754,476.82L755.5,368.567L540.891,596.308z');
	  icon.appendChild(path);
	  return icon;
	}

	function renderWhatsAppIcon() {
	  var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	  icon.setAttribute('width', '45');
	  icon.setAttribute('height', '45');
	  icon.setAttribute('viewBox', '0 0 448 512');
	  icon.setAttribute('xml:space', 'preserve');
	  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	  path.setAttribute('fill', '#ffffff');
	  path.setAttribute('d', 'M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z');
	  icon.appendChild(path);
	  return icon;
	}

	function isMobile() {
	  var check = false;
	  (function (a) {
	    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
	  })(navigator.userAgent || navigator.vendor || window.opera);
	  return check;
	}

	function styleInject(css, ref) {
	  if ( ref === void 0 ) ref = {};
	  var insertAt = ref.insertAt;

	  if (!css || typeof document === 'undefined') { return; }

	  var head = document.head || document.getElementsByTagName('head')[0];
	  var style = document.createElement('style');
	  style.type = 'text/css';

	  if (insertAt === 'top') {
	    if (head.firstChild) {
	      head.insertBefore(style, head.firstChild);
	    } else {
	      head.appendChild(style);
	    }
	  } else {
	    head.appendChild(style);
	  }

	  if (style.styleSheet) {
	    style.styleSheet.cssText = css;
	  } else {
	    style.appendChild(document.createTextNode(css));
	  }
	}

	var css_248z = "@import url(\"https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap\");\n@keyframes chatButtonIn {\n  0% {\n    transform: scale(1);\n  }\n  50% {\n    transform: scale(1.3);\n  }\n  100% {\n    transform: scale(1);\n  }\n}\n@keyframes chatButtonOut {\n  0% {\n    transform: scale(1);\n  }\n  100% {\n    transform: scale(0);\n  }\n}\n@keyframes autoPopIn {\n  0% {\n    opacity: 0;\n    transform: scale(0.5) translateX(30%);\n  }\n  65% {\n    opacity: 50%;\n    transform: scale(1.05) translateX(-1%);\n  }\n  100% {\n    opacity: 1;\n    transform: scale(1) translateX(0);\n  }\n}\n@keyframes autoPopOut {\n  0% {\n    opacity: 1;\n    transform: scale(1) translateX(0);\n  }\n  100% {\n    opacity: 0;\n    transform: scale(0.5) translateX(30%);\n  }\n}\n.quiq-widget-element {\n  display: none;\n}\n\n.quiq-enable-chat .quiq-widget-element {\n  display: block;\n}\n\n#QuiqContactUsButton {\n  border: none;\n  border-radius: 100%;\n  z-index: 999999;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  position: fixed;\n  box-sizing: border-box;\n  bottom: 1rem;\n  right: 1rem;\n  width: 60px;\n  height: 60px;\n  color: #fff;\n  fill: #fff;\n  cursor: pointer;\n  transition: all 0.15s ease-in-out;\n  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);\n  animation: chatButtonIn 0.3s ease-in-out 1;\n}\n#QuiqContactUsButton.legacy-chat {\n  bottom: 24px;\n  right: 24px;\n}\n#QuiqContactUsButton.closed {\n  animation: chatButtonOut 0.3s ease-in-out 1;\n  animation-fill-mode: forwards;\n}\n#QuiqContactUsButton:hover, #QuiqContactUsButton:focus {\n  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.7);\n  outline: none;\n}\n#QuiqContactUsButton:active {\n  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);\n}\n#QuiqContactUsButton .autoPopBubble {\n  animation: autoPopIn 0.5s linear 1;\n  animation-fill-mode: both;\n  position: fixed;\n  bottom: 24px;\n  right: 100px;\n  background: #fff;\n  color: #333;\n  padding: 12px;\n  font-size: 14px;\n  max-width: 300px;\n  border-radius: 5px;\n  box-shadow: 0px 1px 4px 0 rgba(0, 0, 0, 0.3);\n  text-align: left;\n}\n#QuiqContactUsButton .autoPopBubble.animateOut {\n  animation: autoPopOut 0.25s linear 1;\n  animation-fill-mode: both;\n}\n\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n    box-shadow: 0px 50px 50px 0px rgba(0, 0, 0, 0.25);\n  }\n  to {\n    opacity: 1;\n    box-shadow: -150px 0 200px 20px rgba(0, 0, 0, 0.25);\n  }\n}\n@keyframes fadeOut {\n  from {\n    opacity: 1;\n    box-shadow: -150px 0 200px 20px rgba(0, 0, 0, 0.25);\n  }\n  to {\n    opacity: 0;\n    box-shadow: 0px 50px 50px 0px rgba(0, 0, 0, 0.25);\n  }\n}\n@keyframes channelButtonIn {\n  0% {\n    transform: translateX(280px);\n  }\n  80% {\n    transform: translateX(-10px);\n  }\n  100% {\n    transform: translateX(0);\n  }\n}\n@keyframes channelButtonOut {\n  0% {\n    transform: translateX(0);\n  }\n  20% {\n    transform: translateX(-10px);\n  }\n  100% {\n    transform: translateX(280px);\n  }\n}\n#QuiqContactUsButtons .channelOptionShadow {\n  position: fixed;\n  bottom: 0;\n  right: -310px;\n  width: 310px;\n  height: 310px;\n  border-top-left-radius: 100%;\n  background: rgba(0, 0, 0, 0);\n  animation: 0.5s fadeIn 1;\n  animation-fill-mode: both;\n  z-index: 100;\n}\n#QuiqContactUsButtons .channelButtons {\n  position: fixed;\n  bottom: 100px;\n  right: 24px;\n  z-index: 101;\n}\n#QuiqContactUsButtons .channelButton {\n  width: 255px;\n  height: 64px;\n  color: #fff;\n  font-family: Inter, sans-serif;\n  font-weight: 600;\n  font-size: 16px;\n  border-radius: 7px;\n  margin-bottom: 10px;\n  display: flex;\n  align-items: center;\n  transition: 0.15s ease-in-out all;\n  cursor: pointer;\n}\n#QuiqContactUsButtons .channelButton:hover {\n  border-color: rgba(0, 0, 0, 0.05);\n}\n#QuiqContactUsButtons .channelButton:active {\n  border-color: rgba(0, 0, 0, 0.15);\n}\n#QuiqContactUsButtons .channelLabel {\n  padding-inline-start: 10px;\n  padding-inline-end: 10px;\n  flex: 1 1 auto;\n  text-align: center;\n}\n#QuiqContactUsButtons .channelButtons a {\n  text-decoration: none;\n}\n#QuiqContactUsButtons .channelButton .channelIcon {\n  width: 45px;\n  text-align: center;\n  margin-inline-start: 12px;\n  margin-inline-end: 0;\n}\n#QuiqContactUsButtons .channelButton .channelIcon img {\n  width: 45px;\n}\n#QuiqContactUsButtons .channelButton .channelIcon svg {\n  margin: 0 auto;\n}\n#QuiqContactUsButtons #smsButton {\n  background: #404552;\n}\n#QuiqContactUsButtons #smsButton:hover {\n  background: #313744;\n}\n#QuiqContactUsButtons #smsButton:active {\n  background: #272d3a;\n}\n#QuiqContactUsButtons #webchatButton {\n  background: #090442;\n}\n#QuiqContactUsButtons #webchatButton:hover {\n  background: #060236;\n}\n#QuiqContactUsButtons #webchatButton:active {\n  background: #040123;\n}\n#QuiqContactUsButtons #facebookButton {\n  background: #3a5ca9;\n  letter-spacing: 0.5px;\n}\n#QuiqContactUsButtons #facebookButton:hover {\n  background: #33539e;\n}\n#QuiqContactUsButtons #facebookButton:active {\n  background: #2e4c94;\n}\n#QuiqContactUsButtons #whatsAppButton {\n  background: #25d366;\n  letter-spacing: 0.5px;\n}\n#QuiqContactUsButtons #whatsAppButton:hover {\n  background: #1fb255;\n}\n#QuiqContactUsButtons #whatsAppButton:active {\n  background: #1da54f;\n}\n#QuiqContactUsButtons #abcButton {\n  background: #6e7883;\n}\n#QuiqContactUsButtons #abcButton:hover {\n  background: #626d7a;\n}\n#QuiqContactUsButtons #abcButton:active {\n  background: #54606d;\n}\n#QuiqContactUsButtons .channelButtonIn {\n  animation: channelButtonIn 0.3s ease-in-out 1;\n  animation-fill-mode: both;\n}\n#QuiqContactUsButtons.channelButtonsOut .channelButtonIn {\n  animation-name: channelButtonOut;\n}\n#QuiqContactUsButtons.channelButtonsOut .channelOptionShadow {\n  animation-name: fadeOut;\n}\n#QuiqContactUsButtons .channelButtonIn-0 {\n  animation-delay: 0;\n}\n#QuiqContactUsButtons .channelButtonIn-1 {\n  animation-delay: 0.1s;\n}\n#QuiqContactUsButtons .channelButtonIn-2 {\n  animation-delay: 0.2s;\n}\n#QuiqContactUsButtons .channelButtonIn-3 {\n  animation-delay: 0.3s;\n}\n#QuiqContactUsButtons .channelButtonIn-4 {\n  animation-delay: 0.4s;\n}\n\n@keyframes popupIn {\n  0% {\n    opacity: 0;\n    transform: scale(0.9);\n  }\n  50% {\n    opacity: 0.7;\n    transform: scale(1.05);\n  }\n  100% {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n@keyframes popupOut {\n  0% {\n    opacity: 1;\n    transform: scale(1);\n  }\n  100% {\n    opacity: 0;\n    transform: scale(0.8);\n  }\n}\n.QuiqContactUs-modalContainer {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  transition: 0.2s ease-in-out all;\n}\n.QuiqContactUs-modalContainer[data-visible=true] {\n  background: rgba(0, 0, 0, 0.3);\n}\n.QuiqContactUs-modalContainer[data-visible=true] .QuiqContactUs-modal {\n  animation: popupIn 0.3s 1;\n}\n.QuiqContactUs-modalContainer[data-visible=false] {\n  background: transparent;\n  pointer-events: none;\n  visibility: hidden;\n}\n.QuiqContactUs-modalContainer[data-visible=false] .QuiqContactUs-modal {\n  animation: popupOut 0.3s 1;\n}\n\n.QuiqContactUs-modal {\n  box-sizing: border-box;\n  background: #fff;\n  border-radius: 5px;\n  width: 300px;\n  margin: calc(50vh - 5rem) auto;\n  padding: 1rem;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n  z-index: 1000;\n}\n\n.QuiqContactUs-modalTitle {\n  color: hsl(0, 0%, 13%);\n  margin: 0;\n  font-size: 2rem;\n  line-height: 1;\n}\n\n.QuiqContactUs-modalClose {\n  float: right;\n  border: none;\n  font-size: 2rem;\n  line-height: 1;\n  margin: -0.5rem -0.5rem 0 0;\n  padding: 0 0.5rem 0.25rem;\n  color: rgba(0, 0, 0, 0.5);\n  border-radius: 5px;\n  transition: ease-in-out 0.15s background-color;\n  cursor: pointer;\n}\n.QuiqContactUs-modalClose.QuiqContactUs-modalClose-rightToLeft {\n  float: left;\n  margin: -0.5rem 0 0 -0.5rem;\n}\n.QuiqContactUs-modalClose:hover, .QuiqContactUs-modalClose:focus {\n  background-color: rgba(0, 0, 0, 0.1);\n  outline: none;\n}\n.QuiqContactUs-modalClose:active {\n  background-color: rgba(0, 0, 0, 0.3);\n}\n\n.QuiqContactUs-modalPrompt,\n.QuiqContactUs-modalNumber {\n  font-size: 1.25rem;\n  margin: 1rem 0 0;\n  text-align: center;\n}\n\n.QuiqContactUs-modalNumber {\n  font-weight: 600;\n  margin-bottom: 1rem;\n}";
	styleInject(css_248z);

	var chat;
	// TODO: Come up with a better solution for this
	var config$1;
	var _timeout = undefined;
	function render(_x) {
	  return _render.apply(this, arguments);
	}
	function _render() {
	  _render = _asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref) {
	    var _config$channels$webc, _config$channels$webc2, _config$styles6;
	    var configuration, _ref$renderTarget, renderTarget, useChatV2, container, totalChannels;
	    return regeneratorRuntime.wrap(function _callee2$(_context2) {
	      while (1) {
	        switch (_context2.prev = _context2.next) {
	          case 0:
	            configuration = _ref.config, _ref$renderTarget = _ref.renderTarget, renderTarget = _ref$renderTarget === void 0 ? document.body : _ref$renderTarget;
	            config$1 = configuration;

	            // Chat2.0 needs to do things a bit differently because of how it bootstraps
	            useChatV2 = config$1.order.includes('webchat') && !!((_config$channels$webc = config$1.channels.webchat) !== null && _config$channels$webc !== void 0 && (_config$channels$webc2 = _config$channels$webc.options) !== null && _config$channels$webc2 !== void 0 && _config$channels$webc2.pageConfigurationId);
	            renderContainer({
	              renderTarget: renderTarget
	            });
	            renderMainButton({
	              toggle: toggle,
	              color: (_config$styles6 = config$1.styles) === null || _config$styles6 === void 0 ? void 0 : _config$styles6.buttonColor,
	              renderTarget: renderTarget,
	              useChatV2: useChatV2
	            });
	            // Load external scripts if we need them
	            _context2.next = 7;
	            return config$1.order.includes('abc') ? importAppleScript() : Promise.resolve();
	          case 7:
	            _context2.next = 9;
	            return config$1.order.includes('webchat') ? importWebchat(config$1.channels.webchat) : Promise.resolve();
	          case 9:
	            chat = _context2.sent;
	            if (chat && useChatV2) {
	              window.chat = chat;
	              // Hide chat first. Otherwise, it will think it's supposed to be open and try to
	              // set up some things too early
	              chat.hide();
	              // When chat initializes, see if there's a conversation in progress already.
	              // If there is, just render that instead of the boxes
	              chat.on('statusChanged', /*#__PURE__*/function () {
	                var _ref2 = _asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee(event) {
	                  var status;
	                  return regeneratorRuntime.wrap(function _callee$(_context) {
	                    while (1) {
	                      switch (_context.prev = _context.next) {
	                        case 0:
	                          document.querySelector('#QuiqContactUsButton').style.display = 'none';
	                          if (!(event.data.status === 'initialized')) {
	                            _context.next = 6;
	                            break;
	                          }
	                          _context.next = 4;
	                          return chat.defaultWebchat.getState();
	                        case 4:
	                          status = _context.sent.conversationStatus;
	                          if (status === 'webchatConversationStatusActive') {
	                            launchWebchat(true);
	                          } else {
	                            document.querySelector('#QuiqContactUsButton').style.display = 'block';

	                            // Start the autoPop timer once chat is ready
	                            if (config$1.autoPop) {
	                              autoPop();
	                            }
	                          }
	                        case 6:
	                        case "end":
	                          return _context.stop();
	                      }
	                    }
	                  }, _callee);
	                }));
	                return function (_x2) {
	                  return _ref2.apply(this, arguments);
	                };
	              }());
	            } else if (config$1.autoPop) {
	              // We don't need to wait for chat to load, so start the autoPop timer now
	              autoPop();
	            }
	            container = document.querySelector('#QuiqContactUsButtons .channelButtons');
	            totalChannels = (config$1.order || []).length;
	            (config$1.order || []).forEach(function (channel, i) {
	              var button;
	              switch (channel) {
	                case 'sms':
	                  if (config$1.channels.sms && config$1.channels.sms.phoneNumber) {
	                    button = _renderSms(totalChannels - i - 1, renderTarget);
	                  }
	                  break;
	                case 'webchat':
	                  if (config$1.channels.webchat.useMobileChat || !isMobile()) {
	                    button = _renderWebchat(totalChannels - i - 1, useChatV2);
	                  }
	                  break;
	                case 'facebook':
	                  if (config$1.channels.facebook && config$1.channels.facebook.id) {
	                    button = _renderFacebook(totalChannels - i - 1);
	                  }
	                  break;
	                case 'whatsApp':
	                  if (config$1.channels.whatsApp && config$1.channels.whatsApp.phoneNumber) {
	                    button = _renderWhatsApp(totalChannels - i - 1);
	                  }
	                  break;
	                case 'abc':
	                  if (config$1.channels.abc && config$1.channels.abc.appleBusinessId && window.appleBusinessChat.isSupported()) {
	                    button = _renderAbc(totalChannels - i - 1);
	                  }
	                  break;
	              }
	              if (button) {
	                container.appendChild(button);
	              }
	            });
	            if (config$1.order.includes('abc')) {
	              window.appleBusinessChat.refresh();
	            }
	            return _context2.abrupt("return", {
	              chat: chat || null
	            });
	          case 16:
	          case "end":
	            return _context2.stop();
	        }
	      }
	    }, _callee2);
	  }));
	  return _render.apply(this, arguments);
	}
	function _wrapInLinkTag(element, href) {
	  var buttonLink = document.createElement('a');
	  buttonLink.href = href;
	  buttonLink.target = '_blank';
	  buttonLink.rel = 'noopener';
	  buttonLink.appendChild(element);
	  return buttonLink;
	}
	function _renderAnimationContainer(i) {
	  var container = document.createElement('div');
	  container.classList.add('channelButtonIn');
	  container.classList.add('channelButtonIn-' + i);
	  return container;
	}
	function _renderIconContainer(icon) {
	  var container = document.createElement('div');
	  container.classList.add('channelIcon');
	  container.appendChild(icon);
	  return container;
	}
	function _renderText(text) {
	  var container = document.createElement('div');
	  container.classList.add('channelLabel');
	  container.appendChild(document.createTextNode(text));
	  return container;
	}
	function _renderBasicButton(i, id, imgUrl, text) {
	  var _config$styles;
	  var button = document.createElement('div');
	  button.id = id;
	  button.classList.add('channelButton');
	  if ((_config$styles = config$1.styles) !== null && _config$styles !== void 0 && _config$styles.fontFamily) {
	    button.style.fontFamily = config$1.styles.fontFamily;
	  }
	  var img = document.createElement('img');
	  img.src = imgUrl;
	  var icon = _renderIconContainer(img);
	  var text = _renderText(text);
	  button.appendChild(icon);
	  button.appendChild(text);
	  var parent = _renderAnimationContainer(i);
	  parent.appendChild(button);
	  return parent;
	}
	function _renderSms(i, modalRenderTarget) {
	  var buttonLabel = config$1.channels.sms.buttonLabel || 'SMS/Text';
	  var button = _renderBasicButton(i, 'smsButton', 'https://www.quiq-cdn.com/wp-content/uploads/2018/08/SMS_white_150px.png', buttonLabel);
	  if (isMobile()) {
	    // If we're on a phone, this should just be an sms link
	    return _wrapInLinkTag(button, 'sms:+' + config$1.channels.sms.phoneNumber);
	  } else {
	    var _config$styles2;
	    button.onclick = showSmsModal;
	    var modalContainer = renderSmsModal({
	      smsNumber: config$1.channels.sms.phoneNumber,
	      fontFamily: (_config$styles2 = config$1.styles) === null || _config$styles2 === void 0 ? void 0 : _config$styles2.fontFamily,
	      modalTitle: config$1.channels.sms.modalTitle,
	      modalPrompt: config$1.channels.sms.modalPrompt,
	      direction: getComputedStyle(modalRenderTarget).direction
	    });
	    modalRenderTarget.appendChild(modalContainer);
	    return button;
	  }
	}

	/**
	 *
	 * @param {number} i The index of the button
	 * @param {boolean} useV2 If chat2.0 should be used
	 */
	function _renderWebchat(i, useV2) {
	  var buttonLabel = config$1.channels.webchat.buttonLabel || 'Web Chat';
	  var button = _renderBasicButton(i, 'webchatButton', 'https://www.quiq-cdn.com/wp-content/uploads/2018/08/webchat-white.png', buttonLabel);
	  button.onclick = function () {
	    return launchWebchat(useV2);
	  };
	  return button;
	}
	function _renderFacebook(i) {
	  var _config$styles3;
	  var button = document.createElement('div');
	  button.id = 'facebookButton';
	  button.classList.add('channelButton');
	  if ((_config$styles3 = config$1.styles) !== null && _config$styles3 !== void 0 && _config$styles3.fontFamily) {
	    button.style.fontFamily = config$1.styles.fontFamily;
	  }
	  var img = renderFacebookMessengerIcon();
	  var spacer = document.createElement('div');
	  spacer.style.width = '45px';
	  spacer.style.textAlign = 'center';
	  spacer.appendChild(img);
	  var icon = _renderIconContainer(spacer);
	  var buttonLabel = config$1.channels.facebook.buttonLabel || 'Facebook Messenger';
	  var text = _renderText(buttonLabel);
	  button.appendChild(icon);
	  button.appendChild(text);
	  var buttonLink = _wrapInLinkTag(button, 'https://www.messenger.com/t/' + config$1.channels.facebook.id);
	  var parent = _renderAnimationContainer(i);
	  parent.appendChild(buttonLink);
	  return parent;
	}
	function _renderWhatsApp(i) {
	  var _config$styles4;
	  var button = document.createElement('div');
	  button.id = 'whatsAppButton';
	  button.classList.add('channelButton');
	  if ((_config$styles4 = config$1.styles) !== null && _config$styles4 !== void 0 && _config$styles4.fontFamily) {
	    button.style.fontFamily = config$1.styles.fontFamily;
	  }
	  var img = renderWhatsAppIcon();
	  var spacer = document.createElement('div');
	  spacer.style.width = '45px';
	  spacer.style.textAlign = 'center';
	  spacer.appendChild(img);
	  var icon = _renderIconContainer(spacer);
	  var buttonLabel = config$1.channels.whatsApp.buttonLabel || 'WhatsApp';
	  var text = _renderText(buttonLabel);
	  button.appendChild(icon);
	  button.appendChild(text);
	  var buttonLink = _wrapInLinkTag(button, 'https://wa.me/' + config$1.channels.whatsApp.phoneNumber);
	  var parent = _renderAnimationContainer(i);
	  parent.appendChild(buttonLink);
	  return parent;
	}
	function _renderAbc(i) {
	  var _config$styles5;
	  var button = document.createElement('div');
	  button.id = 'abcButton';
	  button.classList.add('channelButton');
	  if ((_config$styles5 = config$1.styles) !== null && _config$styles5 !== void 0 && _config$styles5.fontFamily) {
	    button.style.fontFamily = config$1.styles.fontFamily;
	  }
	  var icon = document.createElement('div');
	  icon.classList.add('apple-business-chat-message-container');
	  icon.dataset.appleIconBackgroundColor = '#ffffff';
	  icon.dataset.appleIconColor = '#6e7883';
	  icon.dataset.appleBusinessId = config$1.channels.abc.appleBusinessId;
	  var spacer = document.createElement('div');
	  spacer.style.width = '45px';
	  spacer.style.textAlign = 'center';
	  spacer.appendChild(icon);
	  var icon = _renderIconContainer(spacer);
	  var buttonLabel = config$1.channels.abc.buttonLabel || 'Apple Business Chat';
	  var text = _renderText(buttonLabel);
	  button.appendChild(icon);
	  button.appendChild(text);
	  var buttonLink = _wrapInLinkTag(button, 'https://bcrw.apple.com/urn:biz:' + config$1.channels.abc.appleBusinessId);
	  var parent = _renderAnimationContainer(i);
	  parent.appendChild(buttonLink);
	  return parent;
	}

	/**
	 * @param {boolean} useV2 If using chat2.0
	 */
	function launchWebchat(useV2) {
	  document.querySelector('#QuiqContactUsButton').style.display = 'none';
	  document.querySelector('#QuiqContactUsButtons').style.display = 'none';
	  if (useV2) {
	    document.body.classList.add('quiq-enable-chat');
	    chat.show();
	  } else {
	    chat.toggle();
	  }
	}
	function toggle() {
	  var container = document.querySelector('#QuiqContactUsButtons');
	  document.querySelector('#QuiqContactUsButton');
	  var open = container.style.display !== 'none';
	  if (_timeout) {
	    clearTimeout(_timeout);
	  }
	  document.querySelectorAll('#QuiqContactUsButton .autoPopBubble').forEach(function (bubble) {
	    bubble.classList.add('animateOut');
	    setTimeout(function () {
	      bubble.style.display = 'none';
	    }, 500);
	  });
	  if (open) {
	    container.classList.add('channelButtonsOut');
	    setTimeout(function () {
	      container.classList.remove('channelButtonsOut');
	      container.style.display = 'none';
	    }, 700);
	  } else {
	    container.style.display = 'block';
	  }
	}
	var autoPop = function autoPop() {
	  if (_timeout) {
	    clearTimeout(_timeout);
	  }
	  _timeout = setTimeout(function () {
	    var container = document.getElementById('QuiqContactUsButton');
	    container.appendChild(_renderAutoPopMessage(config$1.autoPop.message));
	  }, config$1.autoPop.wait);
	};
	function _renderAutoPopMessage(message) {
	  var bubble = document.createElement('div');
	  bubble.classList.add('autoPopBubble');
	  bubble.appendChild(document.createTextNode(message));
	  return bubble;
	}

	var isMergeableObject = function isMergeableObject(value) {
		return isNonNullObject(value)
			&& !isSpecial(value)
	};

	function isNonNullObject(value) {
		return !!value && typeof value === 'object'
	}

	function isSpecial(value) {
		var stringValue = Object.prototype.toString.call(value);

		return stringValue === '[object RegExp]'
			|| stringValue === '[object Date]'
			|| isReactElement(value)
	}

	// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
	var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
	var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

	function isReactElement(value) {
		return value.$$typeof === REACT_ELEMENT_TYPE
	}

	function emptyTarget(val) {
		return Array.isArray(val) ? [] : {}
	}

	function cloneUnlessOtherwiseSpecified(value, options) {
		return (options.clone !== false && options.isMergeableObject(value))
			? deepmerge(emptyTarget(value), value, options)
			: value
	}

	function defaultArrayMerge(target, source, options) {
		return target.concat(source).map(function(element) {
			return cloneUnlessOtherwiseSpecified(element, options)
		})
	}

	function getMergeFunction(key, options) {
		if (!options.customMerge) {
			return deepmerge
		}
		var customMerge = options.customMerge(key);
		return typeof customMerge === 'function' ? customMerge : deepmerge
	}

	function getEnumerableOwnPropertySymbols(target) {
		return Object.getOwnPropertySymbols
			? Object.getOwnPropertySymbols(target).filter(function(symbol) {
				return target.propertyIsEnumerable(symbol)
			})
			: []
	}

	function getKeys(target) {
		return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
	}

	function propertyIsOnObject(object, property) {
		try {
			return property in object
		} catch(_) {
			return false
		}
	}

	// Protects from prototype poisoning and unexpected merging up the prototype chain.
	function propertyIsUnsafe(target, key) {
		return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
			&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
				&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
	}

	function mergeObject(target, source, options) {
		var destination = {};
		if (options.isMergeableObject(target)) {
			getKeys(target).forEach(function(key) {
				destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
			});
		}
		getKeys(source).forEach(function(key) {
			if (propertyIsUnsafe(target, key)) {
				return
			}

			if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
				destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
			} else {
				destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
			}
		});
		return destination
	}

	function deepmerge(target, source, options) {
		options = options || {};
		options.arrayMerge = options.arrayMerge || defaultArrayMerge;
		options.isMergeableObject = options.isMergeableObject || isMergeableObject;
		// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
		// implementations can use it. The caller may not replace it.
		options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

		var sourceIsArray = Array.isArray(source);
		var targetIsArray = Array.isArray(target);
		var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

		if (!sourceAndTargetTypesMatch) {
			return cloneUnlessOtherwiseSpecified(source, options)
		} else if (sourceIsArray) {
			return options.arrayMerge(target, source, options)
		} else {
			return mergeObject(target, source, options)
		}
	}

	deepmerge.all = function deepmergeAll(array, options) {
		if (!Array.isArray(array)) {
			throw new Error('first argument should be an array')
		}

		return array.reduce(function(prev, next) {
			return deepmerge(prev, next, options)
		}, {})
	};

	var deepmerge_1 = deepmerge;

	var cjs = deepmerge_1;

	var config = {};
	var rendered = false;
	var QuiqContactUs = {
	  configure: function configure(configuration) {
	    validateConfiguration(configuration);
	    config = configuration;
	  },
	  reconfigure: function reconfigure(newConfig) {
	    this.configure(cjs(config, newConfig));
	    if (rendered) {
	      this.unrender();
	      this.render();
	    }
	  },
	  render: function render$1() {
	    rendered = true;
	    return render({
	      config: config
	    });
	  },
	  unrender: function unrender() {
	    var container = document.querySelector('#QuiqContactUsButtons');
	    var button = document.querySelector('#QuiqContactUsButton');
	    var modal = document.querySelector('.QuiqContactUs-modalContainer');
	    container.remove();
	    button.remove();
	    modal.remove();
	  },
	  close: function close() {
	    var container = document.querySelector('#QuiqContactUsButtons');
	    container.style.display = 'none';
	  }
	};
	window['QuiqContactUs'] = QuiqContactUs;

	return QuiqContactUs;

})();
