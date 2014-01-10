var splunkjs = require('splunk-sdk');
var Async  = require('async');

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
    Async.waterfall([
            // First, we log in
            function(done) {
                service.login(done);
            },
            // Perform the search
            function(success, done) {
                if (!success) {
                    done("Error logging in");
                }
                
                service.search("search index=azure sourcetype=website-iis-log | head 5", {}, done);
            },
            // Wait until the job is done
             function(job, done) {
                Async.whilst(
                    // Loop until it is done
                    function() { return !job.properties().isDone; },
                    // Refresh the job on every iteration, but sleep for 1 second
                    function(iterationDone) {
                        setTimeout(function() {
                            // Refresh the job and note how many events we've looked at so far
                            job.fetch(function(err) {
                                console.log("-- fetching, " + (job.properties().eventCount || 0) + " events so far");
                                iterationDone();
                            });
                        },1000);
                    },
                    // When we're done, just pass the job forward
                    function(err) {
                        console.log("-- job done --");
                        done(err, job);
                    }
                );
            },
            // Print out the statistics and get the results
            function(job, done) {
                // Print out the statics
                console.log("Job Statistics: ");
                console.log("  Event Count: " + job.properties().eventCount);
                console.log("  Disk Usage: " + job.properties().diskUsage + " bytes");
                console.log("  Priority: " + job.properties().priority);
                
                // Ask the server for the results
                job.results({}, done);
            },
            // Print the raw results out
            function(results, job, done) {
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
                job.cancel(done);
            }
        ],
        function(err) {
            console.log(err);        
        }
    );
}
search();


