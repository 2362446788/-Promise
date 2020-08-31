function Promise(exector) {
    if (typeof exector !== "function") {
        throw new TypeError("Promise resolver " + exector + " is not a function")
    }
    this.PromiseStatus = "pending";
    this.PromiseValue = undefined;
    var _this = this;
    this.resFn = Function.prototype;
    this.rejFn = Function.prototype;

    function change(status, value) {
        if (_this.PromiseStatus !== "pending") return;
        _this.PromiseStatus = status;
        _this.PromiseValue = value;

        var delayTimer = setTimeout(function (value) {
            clearTimeout(delayTimer);
            delayTimer = null;

            var status = _this.PromiseStatus,
                value = _this.PromiseValue;
            status === "fulfilled" ? _this.resFn.call(_this, value) : _this.rejFn.call(_this, value);
        }, 0)
    }

    function resolve(value) {
        change("fulfilled", value);
    }

    function reject(reason) {
        change("rejected", reason)
    }

    try {
        exector(resolve, reject);
    } catch (error) {
        reject(error.message)
    }

}

Promise.prototype.then = function (resFn, rejFn) {
    if (typeof resFn !== "function") {
        resFn = function (value) {
            return new Promise(function (resolve) {
                resolve(value)
            })
        }
    }
    if (typeof rejFn !== "function") {
        rejFn = function (reason) {
            return new Promise(function (_, reject) {
                reject(reason)
            })
        }
    }
    // this.resFn = resFn;
    // this.rejFn = rejFn;
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.resFn = function (value) {
            try {
                var res = resFn(value);
                res instanceof Promise ? res.then(resolve, reject) : resolve(res);
            } catch (error) {
                reject(error.message)
            }
        }
        _this.rejFn = function (reason) {
            try {
                var res = rejFn(reason);
                res instanceof Promise ? res.then(resolve, reject) : resolve(res);
            } catch (error) {
                reject(error.message)
            }
        }
    })
}

Promise.prototype.catch = function (rejFn) {
    return this.then(null, rejFn);
}

Promise.resolve = function (value) {
    return new Promise(function (resolve) {
        resolve(value);
    })
}

Promise.reject = function (value) {
    return new Promise(function (_, reject) {
        reject(value);
    })
}

Promise.all = function (promiseArr) {
    return new Promise(function (resolve, reject) {
        var index = 0,
            values = [];
        for (var i = 0; i < promiseArr.length; i++) {
            (function (i) {
                var item = promiseArr[i];
                if (!(item instanceof Promise)) {
                    item = Promise.resolve(item);
                }
                item.then(function (value) {
                    index++;
                    values[i] = value;
                    if (index >= promiseArr.length) {
                        resolve(values);
                    }
                }).catch(function (err) {
                    reject(err);
                })
            })(i)
        }
    })
}

var p1 = new Promise(function (resolve, reject) {
    resolve(10);
    // reject(20);
}).then(function (value) {
    console.log("ok", value);
    // return new Promise(function(resolve){resolve(666)});
    return Promise.reject(777)
}).then(function (value) {
    console.log("okk", value)

}, function (err) {
    console.log("no", err)
    return Promise.reject(err)
}).catch(function (err) {
    console.log(err)
})
console.log(p1)

function fn1() {
    return Promise.resolve(1);
}

function fn2() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(2);
        }, 2000);
    });
}

function fn3() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(3);
        }, 1000);
    });
}

Promise.all([fn1(), fn2(), fn3(), 10])
    .then(function (values) {
        console.log(values);
    }).catch(function (reason) {
        console.log("NO", reason);
    })
