---
title: Lungs models
---

The simvent.js comes with two lung models: a basic model with a linear presure - volume curve 
and a more sofisticated model with a sigmoid presure - volume curve.

## sv.SimpleLung

sv.SimpleLung is a basic one compartment lung model with a linear compliance curve.  
Although it is very basic in regard of lung mechanics, it has the very cool feature
of modelizing CO₂ exhalation.

<figure>
	<svg id="svg1" class="square"></svg>
	<figcaption>SimpleLung model ventilated by a presure controler ventilator.</figcaption>
</figure>



<script>
var lung = new sv.SimpleLung();
var ventilator = new sv.PVCurve();
var data = ventilator.ventilate(lung);

fx = function(d){return d.Palv};
fy1 = function(d){return d.Vt};

var graph = gs.quickGraph( "#svg1", data.timeData, fx, fy1)
	.setidx("Palv")
	.setidy("Volume");
</script>

## sv.SimpleLung

sv.SimpleLung is a basic one compartment lung model with a linear compliance curve.  
Although it is very basic in regard of lung mechanics, it has the very cool feature
of modelizing CO₂ exhalation.


<figure>
	<svg id="svg3" class="square"></svg>
	<figcaption>SygLung model ventilated by a presure controler ventilator.</figcaption>
</figure>


{% highlight html %}
<script>
var lung = new sv.SygLung();
var ventilator = new sv.PVCurve();
var data = ventilator.ventilate(lung);

fx = function(d){return d.Palv};
fy1 = function(d){return d.Vt};

var graph = gs.quickGraph( "#svg3", data.timeData, fx, fy1)
	.setidx("Palv")
	.setidy("Volume");
</script>
{% endhighlight %}
