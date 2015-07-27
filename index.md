---
title: simvent.js
---
simvent.js is a mechanical ventilation simulation library. 
It use mathematical models to simulate the ventilation of lungs by medical ventilators. 

At the moment, the simvent.js library provide one lung model - a basic one compartment lung with linear compliance - ant two ventilator models : a time cycled presure controler and a VDR-4-like high frequency ventilator. 

Using the ventilate method of the ventilators on a lung return a serie of data -JSON format- wich you can plot with you can plot with your favorite javascript plotting library. 

Adding beautyful ventilator waveforms to your documents or presentations is as easy as :

	var lung = new sv.SimpleLung();
	var vent = new sv.PresureControler();
	var timeData = vent.ventilate(lung).timeData;

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
