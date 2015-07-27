---
title: Ventilator models
---
The simvent.js library comes with two ventilators models.

# sv.PresureControler

sv.PresureControler is a basic time trigered, presure controled, time cycled ventilator model. As you, wise respiratory therapist, have guessed, ventilating a lung with this ventilator result in a tipical decelerating flow patern.

<figure>
<svg id="svg1" class="graphcurve"></svg>
<figcaption>Flow waveform produced by the PresureControler ventilator</figcaption>
</figure>
<script>
var lung = new sv.SimpleLung();
var ventilator = new sv.PresureControler();
var data = ventilator.ventilate(lung);

fx = function(d){return d.time};
fy1 = function(d){return f.Flung};
var graph = gs.quickGraph( "#svg1", data.timeData, fx, fy1).setidx("Temps").setidy("Flow");
</script>
