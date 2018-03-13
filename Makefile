VPATH = css _sass src lib dist

.PHONY: nothing css js

nothing:
	@echo Please enter a target. No default target in this makefile.

css: css/fp-demo.css css/fp-mobile.css

js: dist/simvent.min.js dist/graphsimple.min.js dist/ventyaml.min.js

# ----------
# CSS things
# ----------

fp-demo.css: _sass/fp-demo.sass _sass/table.sass _sass/fp-progress.sass _sass/controls.sass _sass/fp-shadow.sass _sass/fp-panel.sass
	sass _sass/fp-mobile.sass css/fp-mobile.css

fp-mobile.css: _sass/fp-mobile.sass _sass/table.sass _sass/fp-progress.sass _sass/controls.sass _sass/fp-panel.sass
	sass $< css/$@

fp-scratch.css: _sass/fp-scratch.sass
	sass $< css/$@

# ------------
# Random tests
# ------------

test/article.html: test/head.html test/article.md test/tail.html
	cat test/head.html > test/article.html
	kramdown test/article.md >> test/article.html
	cat test/tail.html >> test/article.html

# --------------
# Legacification
# --------------

dist/simvent-legacy.js: src/simvent.js
	babel --presets es2015 -o dist/simvent-legacy.js src/simvent.js

dist/ventyaml-legacy.js: src/ventyaml.js
	babel --presets es2015 -o dist/ventyaml-legacy.js src/ventyaml.js

dist/graphsimple-legacy.js: src/graphsimple.js
	babel --presets es2015 -o dist/graphsimple-legacy.js src/graphsimple.js

# --------------
# Packaging
# --------------

dist/simvent.min.js: dist/simvent-legacy.js
	uglifyjs -mc -o dist/simvent.min.js dist/simvent-legacy.js

dist/ventyaml.min.js: dist/ventyaml-legacy.js lib/yaml.min.js
	uglifyjs -mc -o dist/ventyaml.min.js dist/ventyaml-legacy.js lib/yaml.min.js

dist/graphsimple.min.js: dist/graphsimple-legacy.js lib/d3.v3.min.js
	uglifyjs -mc -o dist/graphsimple.min.js lib/d3.v3.min.js dist/graphsimple-legacy.js

dist/frontPanel.min.js: src/frontPanel.js lib/jquery.min.js lib/dygraph-combined.js lib/synchronizer.js
	uglifyjs -mc -o dist/frontPanel.min.js src/frontPanel.js lib/dygraph-combined.js lib/synchronizer.js lib/jquery.min.js
