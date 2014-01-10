var splunkjs = require('splunk-sdk');
var Fiber = require('fibers');

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

function search() {
    Fiber(function() {
        var fiber = Fiber.current;
        var job;
        service.login(function(err, success) {
            if (!success) {
                console.log("Error logging in");
            }
            fiber.run();
        });
        Fiber.yield();
        service.search("search index=azure sourcetype=website-iis-log | head 5", {}, function(err, job) {
            fiber.run(job);
        });
        var job = Fiber.yield();
        while(!job.properties().isDone) {
            setTimeout(function() {
                job.fetch(function(err) {
                   console.log("-- fetching, " + (job.properties().eventCount || 0) + " events so far"); 
                   fiber.run();
                });
            }, 1000);
            Fiber.yield();
        }

        console.log("-- job done --");
        console.log("Job Statistics: ");
        console.log("  Event Count: " + job.properties().eventCount);
        console.log("  Disk Usage: " + job.properties().diskUsage + " bytes");
        console.log("  Priority: " + job.properties().priority);

        job.results({}, function(err, results, job) {
            fiber.run(results);
        });
        var results = Fiber.yield();

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
        job.cancel(function() {
            console.log("cancelled");
            fiber.run();
        });
        Fiber.yield();
        console.log("done");
    }).run();
}

search();


