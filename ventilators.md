---
title: Ventilator models
order: 3
---
The simvent.js library comes with two ventilators models.

## sv.PresureControler

sv.PresureControler is a basic time trigered, presure controled, time cycled ventilator model. As you, wise respiratory therapist, have guessed, ventilating a lung with this ventilator result in a tipical decelerating flow patern.

<figure>
<svg id="svg1" class="graphcurve"></svg>
<figcaption>Flow waveform produced by the PresureControler ventilator.</figcaption>
</figure>

## sv.VDR

sv.VDR is high frequency ventilator aiming to mimic Percussionaire's VDR-4.

<figure>
<svg id="svg2" class="graphcurve"></svg>
<figcaption>Presure waveform produced by the VDR ventilator.</figcaption>
</figure>

## sv.PVCurve

sv.PVCurve is a presure steps based low flow presure - volume curve maneuver. 


<figure>
	<svg id="svg3" class="graphcurve"></svg>
	<figcaption>Presure waveform produced by the PVCurve ventilator.</figcaption>
</figure>

<script>
	var lung = new sv.SimpleLung();

	fx = function(d){return d.time};
	fy1 = function(d){return d.Flung};
	fy2 = function(d){return d.Pao};
	fy3 = function(d){return d.Palv};

	var ventilator = new sv.PresureControler();
	var data = ventilator.ventilate(lung);
	var graph = gs.quickGraph( "#svg1", data.timeData, fx, fy1).setidx("Time").setidy("Flow");

	var ventilator = new sv.VDR();
	var data = ventilator.ventilate(lung);
	var graph = gs.quickGraph( "#svg2", data.timeData, fx, fy2).setidx("Time").setidy("Presure");

	var ventilator = new sv.PVCurve();
	var data = ventilator.ventilate(lung);
	var graph = gs.quickGraph( "#svg3", data.timeData, fx, fy2).setidx("Time").setidy("Presure");
</script>
