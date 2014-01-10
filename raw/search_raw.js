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

service.login(function(err,success) {
    if (err) throw err;
    service.search("search index=azure sourcetype=website-iis-log | head 100", {}, function(err, newJob) {
        job = newJob;

        function onSearch() {
            if (!job.properties().isDone) {
                setTimeout(function() {
                    job.fetch(function(err) {
                        if(err) throw err;
                        console.log("-- fetching, " + (job.properties().eventCount || 0) + " events so far");
                        onSearch();
                    });
                },1000);
                return;
            }
            
            console.log("-- job done --");
            console.log("Job Statistics: ");
            console.log("  Event Count: " + job.properties().eventCount);
            console.log("  Disk Usage: " + job.properties().diskUsage + " bytes");
            console.log("  Priority: " + job.properties().priority);

            job.results({}, function(err, results) {
                if (err) throw err;
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
            });
        }
        onSearch();
    });
});

