.PHONY: nothing

nothing:
	@echo Please enter a target. No default target in this makefile.

dist/simvent-legacy.js: src/simvent.js
	babel --presets es2015 -o dist/simvent-legacy.js src/simvent.js
