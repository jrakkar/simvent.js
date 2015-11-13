---
title: Ventilator models
order: 3
---

## sv.PresureControler

sv.PresureControler is a basic time triggered, pressure controlled, time cycled ventilator model. As you, wise respiratory therapist, have guessed, ventilating a lung with this ventilator result in a typical decelerating flow pattern.

<figure>
<svg id="svg1" class="graphcurve"></svg>
<figcaption>Flow waveform produced by the PresureControler ventilator.</figcaption>
</figure>

## sv.FlowControler

sv.FlowControler is a basic time triggered, flow controlled, time cycled ventilator model.

<figure>
<svg id="svg2" class="graphcurve"></svg>
<figcaption>Flow waveform produced by the FlowControler ventilator.</figcaption>
</figure>

## sv.VDR

sv.VDR is high frequency ventilator aiming to mimic Percussionaire's VDR-4.

<figure>
<svg id="svg3" class="graphcurve"></svg>
<figcaption>Pressure waveform produced by the VDR ventilator.</figcaption>
</figure>

The following ventilation parameters can be set :

| Variable name | Meaning                                                      |
|---------------+--------------------------------------------------------------|
| Fiph          | Phasitron input flow during the convective inspiration phase |
| Fipl          | Phasitron input flow during the convective expiration phase  |
| Tic           | Convective inspiration time                                  |
| Tec           | Convective expiration time                                   |
| Fperc         | Percussion frequency                                         |
| Rit           | Percussion inspiratory over expiratory time ratio            |


## sv.PVCurve

sv.PVCurve is a pressure steps based low flow pressure - volume curve maneuver. 


<figure>
<svg id="svg4" class="graphcurve"></svg>
<figcaption>Pressure waveform produced by the PVCurve ventilator.</figcaption>
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


	var ventilator = new sv.FlowControler();
	var data = ventilator.ventilate(lung);
	var graph = gs.quickGraph( "#svg2", data.timeData, fx, fy1).setidx("Time").setidy("Flow");

	var ventilator = new sv.VDR();
	var data = ventilator.ventilate(lung);
	var graph = gs.quickGraph( "#svg3", data.timeData, fx, fy2).setidx("Time").setidy("Pressure");

	var ventilator = new sv.PVCurve();
	var data = ventilator.ventilate(lung);
	var graph = gs.quickGraph( "#svg4", data.timeData, fx, fy2).setidx("Time").setidy("Pressure");
</script>
