const { XMLHttpRequest } = require('xmlhttprequest');

const url = "http://localhost:8080/service/etc";

function asyncCaller(url, callback) {

    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(xhttp.responseText);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function MyPromise(someAsyncWork, successC, failureC) {

    this.response = null;
    this.subs = [];
    this.status = "Pending";
    this.successCallBack = successC;
    this.failureCallBack = failureC;

    this.success = function(successR) {
        this.status="Succeeded";
        this.response = successR;
        let modifiedResponse = successR;
        if (this.successCallBack) {
            modifiedResponse = this.successCallBack(successR);
        }
        for (let I = 0; I < this.subs.length; I++) {
            this.subs[I].success(modifiedResponse);
        }
    }

    this.failure = function(failureR) {
        this.status="Failed";
        this.response = failureR;
        let modifiedResponse = failureR;
        if (this.failureCallBack) {
            modifiedResponse = this.failureCallBack(failureR);
        }
        for (let I = 0; I < this.subs.length; I++) {
            this.subs[I].failure(modifiedResponse);
        }
    }

    this.then = function(successCallBack, failureCallBack) {
        const newSub = new MyPromise(false, successCallBack, failureCallBack);
        this.subs.push(newSub);
        if (this.status === "Succeeded") {
            newSub.succeed(this.response);
        } else if (this.status === "Failed") {
            newSub.fail(this.response);
        }
        return newSub;
    }

    if (someAsyncWork) {
        someAsyncWork(this.success.bind(this), this.failure.bind(this));    
    }
}

let result = "still not populated, this proves that this is asycn.";

new MyPromise(function(successFunc, failureFunc){
    asyncCaller(url, function(value){
        // this is the part that we have to do on our own,
        // the promise object does not know how to do it.
        if (value) {
            successFunc(value);
        } else {
            failureFunc(value);
        }
    });
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
