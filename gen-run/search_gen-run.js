var run = require('gen-run');
var splunkjs = require('splunk-sdk');

var username =  "admin";
var password =  "changeme";
var scheme   =  "https";
var host     =  "localhost";
var port     = "8089";
var version  = "default";
var job, results;

var service = new splunkjs.Service({
    username: username,
    password: password,
    scheme: scheme,
    host: host,
    port: port,
    version: version
});

function login() {
    return function(callback) {
        service.login(function(err, success) {
            if(!success) {
                console.log("Error logging in");
            }
            console.log("logged in");
            callback();
        });
    };
}

function search() {
    return function(callback) {
        service.search("search index=_internal | head 5", {}, function(err, newJob) {
            job = newJob;
            callback();
        });
    };
}

function fetch() {
    return function(callback) {
        job.fetch(function(err) {
            console.log("-- fetching, " + (job.properties().eventCount || 0) + " events so far"); 
            callback();
        });
    };
}

function sleep() {
    return function(callback) {
        setTimeout(function() {
            callback();
        },1000);
    };
}

function getResults() {
    return function(callback) {
        job.results({}, function(err, currentResults, job) {
            results = currentResults;
            callback();
        });
    }
}

function cancelJob() {
    return function(callback) {
        job.cancel(function() {
            callback();
        });
    }
}

run(function*() {
    yield login();
    yield search();

    while(!job.properties().isDone) {
        yield fetch();
        yield sleep();
    }

    console.log("-- job done --");
    console.log("Job Statistics: ");
    console.log("  Event Count: " + job.properties().eventCount);
    console.log("  Disk Usage: " + job.properties().diskUsage + " bytes");
    console.log("  Priority: " + job.properties().priority);

    yield getResults();

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

    yield cancelJob();

    console.log("done");
});



