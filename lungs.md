---
title: Lungs models
---

## sv.SimpleLung

The simvent.js comes with one single lung model: *sv.SimpleLung*.

sv.SimpleLung is a basic one compartment lung model with a linear compliance curve.  
Although it is very basic in regard of lung mechanics, it has the very cool feature
of modelizing CO₂ exhalation.

	var lung = new sv.SimpleLung();
	var ventilator = new sv.PresureControler();
	var data = ventilator.ventilate(lung);

	fx = function(d){return d.time};
	fy1 = function(d){return d.Vt};
	fy2 = function(d){return d.PCO2};

	var graph = gs.quickGraph( "#svg1", data.timeData, fx, fy1)
		.setidx("Time")
		.setidy("Tidal volume");
	var graph = gs.quickGraph( "#svg2", data.timeData, fx, fy2)
		.setidx("Time")
		.setidy("CO₂");

<figure>
<svg id="svg1" class="graphcurve"></svg>
<svg id="svg2" class="graphcurve"></svg>

<figcaption>SimpleLung model ventilated by a presure controler ventilator.</figcaption>
</figure>



<script>
var lung = new sv.SimpleLung();
var ventilator = new sv.PresureControler();
var data = ventilator.ventilate(lung);

fx = function(d){return d.time};
fy1 = function(d){return d.Vt};
fy2 = function(d){return d.PCO2};

var graph = gs.quickGraph( "#svg1", data.timeData, fx, fy1)
	.setidx("Time")
	.setidy("Tidal volume");
var graph = gs.quickGraph( "#svg2", data.timeData, fx, fy2)
	.setidx("Time")
	.setidy("CO₂");
</script>

