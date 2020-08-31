class Promise {
    constructor(exector) {
        if (typeof exector !== "function") {
            throw new TypeError("Promise resolver " + exector + " is not a function")
        }
        this.PromiseStatus = "pending";
        this.PromiseValue = undefined;
        this.resolveFn = Function.prototype;
        this.rejectFn = Function.prototype;

        let change = (status, value) => {
            if (this.PromiseStatus !== "pending") return;
            this.PromiseStatus = status;
            this.PromiseValue = value;

            let delayTimer = setTimeout(() => {
                clearTimeout(delayTimer);
                delayTimer = null;
                if (this.PromiseStatus === "fulfilled") {
                    this.resolveFn.call(this, value);
                } else {
                    this.rejectFn.call(this, value);
                }
            }, 0)
        }

        let resolve = (value) => {
            change("fulfilled", value);
        }

        let reject = (reason) => {
            change("rejected", reason);
        }

        try {
            exector(resolve, reject);
        } catch (error) {
            reject(error.message);
        }

    }

    then(resolveFn, rejectFn) {
        if (typeof resolveFn !== "function") {
            resolveFn = function (value) {
                return Promise.resolve(value);
            }
        }
        if (typeof rejectFn !== "function") {
            rejectFn = function (reason) {
                return Promise.reject(reason);
            }
        }
        // this.resolveFn = resolveFn;
        // this.rejectFn = rejectFn;
        return new Promise((resolve, reject) => {
            this.resolveFn = function (value) {
                try {
                    let x = resolveFn(value);
                    x instanceof Promise ? x.then(resolve, reject) : resolve(x);
                } catch (error) {
                    reject(error.message)
                }
            }
            this.rejectFn = function (reason) {
                try {
                    let x = rejectFn(reason);
                    x instanceof Promise ? x.then(resolve, reject) : resolve(x);
                } catch (error) {
                    reject(error.message)
                }
            }
        })
    }

    catch (rejectFn) {
        return this.then(null, rejectFn);
    }

    static resolve(value) {
        return new Promise(resolve => {
            resolve(value);
        })
    }
    static reject(reason) {
        return new Promise((_, reject) => {
            reject(reason);
        })
    }
    static all(promiseArr) {
        return new Promise((resolve, reject) => {
            let index = 0,
                values = [];
            for (let i = 0; i < promiseArr.length; i++) {
                let item = promiseArr[i];
                if (!(item instanceof Promise)) {
                    item = Promise.resolve(item);
                }
                item.then(value => {
                    index++;
                    values[i] = value;
                    if (index >= promiseArr.length) {
                        resolve(values);
                    }
                }).catch(reason => {
                    reject(reason);
                })
            }
        })
    }
}

// all测试用例
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

var p1 = new Promise(function (resolve, reject) {
    // resolve(10);
    reject(20);
}).then(function (value) {
    console.log("ok", value);
    return new Promise(function (resolve) {
        resolve(666)
    })
}, function (reason) {
    console.log("no", reason)
})
console.log(p1)

// let p1 = new Promise((resolve, reject) => {
//     resolve(10);
//     reject(20);
// }).then(result => {
//     console.log('ok', result);
//     return Promise.reject(20);
// }).then(null, reason => {
//     console.log(reason)
// }).catch(reason => {
//     console.log("no", reason)
// })

// console.log(p1)