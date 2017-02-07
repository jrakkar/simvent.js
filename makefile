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

css: css/gs-flex.css

css/gs-flex.css: _sass/gs-flex.sass _sass/mix-grid.sass _sass/mix-axes.sass _sass/mix-blackLines.sass
	sass _sass/gs-flex.sass > css/gs-flex.css
