---
title: simvent.js
---
simvent.js is a mechanical ventilation simulation library. It use mathematicla models to simulate the ventilation of lungs by medical ventilators. At the moment, the simvent.jslibrary provide one lung model - a basic one compartment lung with linear compliance - ant two ventilator models : a time cycled presure controler and a VDR-4-like high frequency ventilator. Using the ventilate method of the ventilators on a lung return a serie of data -JSON format- wich you can plot with you can plot with your favorite javascript plotting library. 

<svg class="graphcurve" id="svg1"></svg>
<script src="https://raw.githubusercontent.com/ProgRT/VDR.js/master/simvent.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js" charset="utf-8"></script>
<script src="https://raw.githubusercontent.com/ProgRT/graphsimple.js/master/graphsimple.js"></script>
<script>
var lung = new sv.SimpleLung();
var vent = new sv.PresureControler();
data = vent.ventilate(lung);

var graph1 = new gs.quickGraph("#svg1", data.timeData, function(d){return d.time}, function(d){return d.Flung});
</script>
