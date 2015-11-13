---
title: Lungs models
order: 4
---

The simvent.js comes with two lung models: a basic model with a linear presure - volume curve 
and a more sofisticated model with a sigmoid presure - volume curve.

Lung models are objects created with constructor function. 

	var lung = new sv.SimpleLung;

Their mechanical property are set by directly accessing the lung object property.

	lung.Raw = 50 // cmH2O/l/s;

Beside their mechanical property, both lung models simulate CO₂ exalation.

## sv.SimpleLung

sv.SimpleLung is a constructor for a basic, one compartment, lung model with a linear compliance curve.  

It's default parameters are as folow:


| Parameter | Default value |
|-----------+---------------|
| Crs       | 50 ml/cmH₂O   |
| Raw       | 5 cmH₂O/l/s   |



<figure>
	<svg id="svg1" class="square"></svg>
	<figcaption>Presure - Volume curve of the sv.SimpleLung model.</figcaption>
</figure>



<script>
	var SimpleLung = new sv.SimpleLung();
	var ventilator = new sv.PVCurve();
	var data = ventilator.ventilate(SimpleLung);

	fx = function(d){return d.Palv};
	fy1 = function(d){return d.Vt};

	var graph = gs.quickGraph( "#svg1", data.timeData, fx, fy1)
		.setidx("Palv")
		.setidy("Volume");
</script>

## sv.SygLung

sv.SygLung is a more sofisticated lung model with a sygmoid presure - volume curve.  


<figure>
	<svg id="svg3" class="square"></svg>
	<figcaption>Presure - Volume curve of the sv.SygLung model.</figcaption>
</figure>


<script>
var SygLung = new sv.SygLung();
var ventilator = new sv.PVCurve();
var data = ventilator.ventilate(SygLung);

fx = function(d){return d.Palv};
fy1 = function(d){return d.Vt};

var graph = gs.quickGraph( "#svg3", data.timeData, fx, fy1)
	.setidx("Palv")
	.setidy("Volume");
</script>
