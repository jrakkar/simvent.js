---
title: Ventilator models
---
The simvent.js library comes with two ventilators models.

# sv.PresureControler

sv.PresureControler is a basic time trigered, presure controled, time cycled ventilator model. As you, wise respiratory therapist, have guessed, ventilating a lung with this ventilator result in a tipical decelerating flow patern.

<figure>
<svg id="svg1" class="graphcurve"></svg>
<figcaption>Flow waveform produced by the PresureControler ventilator</figcaption>
<figure>
<script>
var lung = new sv.SimpleLung();
var ventilator = new sv.PresureControler();
var data = ventilator.ventilate(lung);

var graph = gs.quickGraph(
"svg1",
data.timeData,
function(d){return d.time},
function(d){return d.Flung).setidx("Temps").setidy("Flow");
