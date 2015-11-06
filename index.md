---
title: simvent.js
order: 10
---

simvent.js is a lung mechanical ventilation simulation library. 
It use mathematical models to simulate the ventilation of lungs by medical ventilators. 

At the moment, the simvent.js library provide two lungs models and three ventilator models. 

## Why ?

Although there is many possible usate to the simvent.js library, it was developed with one simple goal in mind : provide authors or presentors with *beautyful* ventilator vaveforms to
include in their documents. By *beautyful*, we mean realistic, uniform apearance, scalable (vector based).

## How to ?

Using the *ventilate* method of the ventilators on a lung return a serie of data -JSON format- wich you can plot with your favorite javascript plotting library. 

Adding beautyful ventilator waveforms to your documents or presentations is as easy as :

	var lung = new sv.SimpleLung();
	var vent = new sv.PresureControler();
	var timeData = vent.ventilate(lung).timeData;

	// Code below specific to ploting library
	// Feel free to use your favorite one

	fx = function(d){return d.time};
	fy = function(d){return d.Flung};
	var graph1 = new gs.quickGraph("#svg1", timeData, fx, fy);

<svg class="graphcurve" id="svg1"></svg>

<script>
var lung = new sv.SimpleLung();
var vent = new sv.PresureControler();
var timeData = vent.ventilate(lung).timeData;

fx = function(d){return d.time};
fy = function(d){return d.Flung};
var graph1 = new gs.quickGraph("#svg1", timeData, fx, fy);
</script>
