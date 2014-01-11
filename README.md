codemash-async
==============

Async slides and code from my Codemash 2014 session on async programming in node

## What's in the box

* slides - Slides from my talk. You can view them online [here] (https://rawgithub.com/glennblock/codemash-async/master/slides/index.html#)
* search_raw.js - raw javascript version, a monolithic, nested-callback, unmaintainable mess.
* search_clean.js - refactored version without nested callbacks
* search_async.js - using the [async] (https://npmjs.org/package/async) module.
* search_bluebird - using the [bluebird] (https://npmjs.org/package/bluebird) promises module
* search_rx.js - using [Rx] (https://npmjs.org/package/rx) - javascript reactive extensions.
* search_fibers.js - using [fibers] (https://npmjs.org/package/fibers).
* search_gen-run.js - using ES6 generators and the [gen-run] (https://npmjs.org/package/gen-run) module.

## Installing Splunk

To run the samples as is requires having a Splunk instance. Installing is easy and free. Go download Splunk from [here] (http://www.splunk.com/download?r=header)

You can find out how to install [here] (http://docs.splunk.com/Documentation/Splunk/latest/Installation/Whatsinthismanual)

Once Splunk installed, start your instance. You can by going to your $SPLUNK_HOME/bin folder and running "./splunk start". Splunk just needs to be running for the sample code. You do not have to add any data.

## Running the samples

1. Clone this repo
2. Go into the root of the repo on disk and run `npm install` to install all the dependencies. To run the fibers example, you need to have fibers installed which is a native node module.
3. To run the generators example:
* Requires using a node version >= 11.0 as it supports haromny proxies and generators. 
* I recommend using a node version manager like [nvm] (https://npmjs.org/package/nvm) or [nodist] (https://npmjs.org/package/nodist) to allow multiple versions side-by-side as you only want to use the 11.x version for running the generator sample.
* To run the sample pass the --harmony command i.e. `node --harmony search_gen-run.js'

## License

Apache 2.0
