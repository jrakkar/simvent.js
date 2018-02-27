.PHONY: nothing css

nothing:
	@echo Please enter a target. No default target in this makefile.

css: css/fp-demo.css css/fp-mobile.css

dist/simvent-legacy.js: src/simvent.js
	babel --presets es2015 -o dist/simvent-legacy.js src/simvent.js

css/fp-demo.css: _sass/fp-demo.sass _sass/table.sass _sass/fp-progress.sass _sass/controls.sass _sass/fp-shadow.sass _sass/fp-panel.sass
	sass _sass/fp-demo.sass css/fp-demo.css

css/fp-mobile.css: _sass/fp-mobile.sass _sass/table.sass _sass/fp-progress.sass _sass/controls.sass _sass/fp-panel.sass
	sass _sass/fp-mobile.sass css/fp-mobile.css

test/article.html: test/head.html test/article.md test/tail.html
	cat test/head.html > test/article.html
	kramdown test/article.md >> test/article.html
	cat test/tail.html >> test/article.html
