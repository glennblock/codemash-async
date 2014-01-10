var Promise = require('bluebird');
var splunkjs = require('splunk-sdk');

var username =  "admin";
var password =  "changeme";
var scheme   =  "https";
var host     =  "localhost";
var port     = "8089";
var version  = "default";

var service = new splunkjs.Service({
    username: username,
    password: password,
    scheme: scheme,
    host: host,
    port: port,
    version: version
});

service = Promise.promisifyAll(service);
    var currentJob;

function search() {
    service.loginAsync()
        .then(onLogin)
        .then(function(currentJob) {
            job = Promise.promisifyAll(currentJob);
        })
        .delay(1000)
        .then(function() {
            getResults(job);
        });
}

function onLogin(success) {
    if (!success) {
        throw "Error logging on";
    }
    return service.searchAsync("search index=azure sourcetype=website-iis-log | head 5", {});
}

function getResults(job, originalJob) {
    process();
}

function process() {
    console.log("-- fetching, " + (job.properties().eventCount || 0) + " events so far");
    if (!job.properties().isDone)
        fetch();
    else
        display();
}

function fetch() {
    job.fetchAsync()
        .delay(1000)
        .then(function() {
            process();
        });
}

function display() {
    console.log("-- job done --");
    console.log("Job Statistics: ");
    console.log("  Event Count: " + job.properties().eventCount);
    console.log("  Disk Usage: " + job.properties().diskUsage + " bytes");
    console.log("  Priority: " + job.properties().priority);

    job.resultsAsync({})
        .spread(displayResults);
}

function displayResults(results, job) {
    // Find the index of the fields we want
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
    return job.cancelAsync();  
}

search();


