simvent-complete.min.js: simvent.min.js ventyaml.min.js graphsimple.min.js d3.v3.min.js
	cat yaml.min.js > simvent-complete.min.js
	cat d3.v3.min.js >> simvent-complete.min.js
	cat graphsimple.min.js >> simvent-complete.min.js
	cat simvent.min.js >> simvent-complete.min.js
	cat ventyaml.min.js >> simvent-complete.min.js
ventyaml.min.js: ventyaml.js
	uglifyjs -mc -o ventyaml.min.js ventyaml.js
simvent.min.js: simvent.js
	uglifyjs -mc -o simvent.min.js simvent.js
graphsimple.min.js: graphsimple.js
	uglifyjs -mc -o graphsimple.min.js graphsimple.js
