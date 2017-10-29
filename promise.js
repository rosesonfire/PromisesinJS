const { XMLHttpRequest } = require('xmlhttprequest');

const url = "/";

function httpCaller(url, callback, async) {

    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback("here");
        }
    };
    xhttp.open("GET", url, async);
    xhttp.send();
}

function MyPromise(someAsyncWork, successC, failureC) {

    this.response = null;
    this.subs = [];
    this.status = "Pending";
    this.successCallBack = successC;
    this.failureCallBack = failureC;

    this.success = function(successR) {        
        if (this.successCallBack) {
            try {
                this.response = this.successCallBack(successR);
                this.callChildSuccesses();
            } catch (e) {
                this.response = e;
                this.callChildFailures();
            }
        } else {
            this.response = successR;
            this.callChildSuccesses();
        }
    };

    this.failure = function(failureR) {
        if (this.failureCallBack) {
            try {
                this.response = this.failureCallBack(failureR);
            } catch (e) {
                this.response = e;
            }
        } else {
            this.response = failureR;
        }     
        this.callChildFailures();
    };

    this.then = function(successCallBack, failureCallBack) {
        const newSub = new MyPromise(false, successCallBack, failureCallBack);
        this.subs.push(newSub);
        if (this.status === "Succeeded") {
            newSub.success(this.response);
        } else if (this.status === "Failed") {
            newSub.failure(this.response);
        }
        return newSub;
    };

    this.callChildSuccesses = function() {
        this.status="Succeeded";
        for (let I = 0; I < this.subs.length; I++) {
            this.subs[I].success(this.response);
        }
    };

    this.callChildFailures = function() {
        this.status="Failed";
        for (let I = 0; I < this.subs.length; I++) {
            this.subs[I].failure(modifiedResponse);
        }
    };

    if (someAsyncWork) {
        try {
            someAsyncWork(this.success.bind(this), this.failure.bind(this));
        } catch (e) {
            this.failure(e);
        }
    }
}

function test1() {

    console.log("test1");

    let result = "still not populated, this proves that this is asycn.";

    new MyPromise(function(successFunc, failureFunc){
        httpCaller(url, function(value){
            // this is the part that we have to do on our own,
            // the promise object does not know how to do it.
            if (value) {
                successFunc(value);
            } else {
                failureFunc(value);
            }
        }, true);
    }).then(function(response){
        return response + " Adding 1";
    }).then(function(response){
        return response + " Adding 2";
    }).then(function(response){
        return response + " Adding 3";
    }).then(function(response){
        return response + " Adding 4";
    }).then(function(response){
        result = response;
    }).then(function(response){
        console.log(result);
    });

    console.log(result);
}

function test2() {

    console.log("test2");

    let result = "still not populated.";

    new MyPromise(function(successFunc, failureFunc){
        httpCaller(url, function(value){
            // this is the part that we have to do on our own,
            // the promise object does not know how to do it.
            if (value) {
                successFunc(value);
            } else {
                failureFunc(value);
            }
        }, false);
    }).then(function(response){
        return response + " Adding 1";
    }).then(function(response){
        return response + " Adding 2";
    }).then(function(response){
        return response + " Adding 3";
    }).then(function(response){
        return response + " Adding 4";
    }).then(function(response){
        result = response;
    }).then(function(response){
        console.log(result);
    });

    console.log(result);
}

function test3() {

    console.log("test3");

    const myTask = new MyPromise(function(successFunc, failureFunc){
        httpCaller(url, function(value){
            // this is the part that we have to do on our own,
            // the promise object does not know how to do it.
            if (value) {
                successFunc(value);
            } else {
                failureFunc(value);
            }
        }, true);
    });

    const mySecondTask = myTask.then(function(response){
        return response + " Adding 1";
    });

    myTask.then(function(response){
        console.log(response + " Adding 2");
    });

    mySecondTask.then(function(response){
        console.log(response + " Adding 3");
    });

    mySecondTask.then(function(response){
        console.log(response + " Adding 4");
    });
}

// if first task is async and rest are sync
test1();

// if all the tasks are sync
// test2();

// multiple then
// test3();