var Rx = require('rx');
var splunkjs = require('splunk-sdk');

var username =  "admin";
var password =  "changeme";
var scheme   =  "https";
var host     =  "localhost";
var port     = "8089";
var version  = "default";
var util = require('util');

var service = new splunkjs.Service({
    username: username,
    password: password,
    scheme: scheme,
    host: host,
    port: port,
    version: version
});

var job;

function login() {
    return Rx.Observable.fromNodeCallback(service.login)();
}

function search() {
    return Rx.Observable.fromNodeCallback(service.search.bind(service))("search index=azure sourcetype=website-iis-log | head 5", {});
}

function fetch(newJob) {
    job = newJob;
    return Rx.Observable.while(
        function() {
            console.log("-- fetching, " + (job.properties().eventCount || 0) + " events so far");
            return !job.properties().isDone;
        },
        Rx.Observable.fromNodeCallback(job.fetch)()
            .delay(1000)
    );
}

function getResults() {
    console.log("-- job done --");
    console.log("Job Statistics: ");
    console.log("  Event Count: " + job.properties().eventCount);
    console.log("  Disk Usage: " + job.properties().diskUsage + " bytes");
    console.log("  Priority: " + job.properties().priority);

    return Rx.Observable.fromNodeCallback(job.results)({});
}


function showResults(args) {
    var results = args[0];

    var rawIndex = results.fields.indexOf("_raw");
    var sourcetypeIndex = results.fields.indexOf("sourcetype");
    var userIndex = results.fields.indexOf("user");
    
    // Print out each result and the key-value pairs we want
    console.log("Results: ");
    for(var i = 0; i < results.rows.length; i++) {
        console.log("  Result " + i + ": ");
        console.log("    sourcetype: " + results.rows[i][sourcetypeIndex]);
        console.log("    user: " + results.rows[i][userIndex]);
        console.log("    _raw: " + results.rows[i][rawIndex]);
    }
    
    // Once we're done, cancel the job.
    return Rx.Observable.fromNodeCallback(job.cancel)();
}

function displayStatus() {
    getResults()
        .flatMap(showResults)
        .subscribe();
}

login()
    .flatMap(search)
    .flatMap(fetch)
    .finally(displayStatus)
    .subscribe();




