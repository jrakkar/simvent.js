Title: VDR-4: Quelques figures...

{% content_for :titlepage %}
<script>
var opts = {
	class: 'nogrid',
	padD: .05
}
var lung = new sv.SimpleLung();
var vent = new sv.VDR();	
var data = vent.ventilate(lung).timeData;
var graph = pOverT(data, opts);
</script>
{% end %}

{% content_for :head %}
<script src='../simvent-complete.min.js'></script>
<script>
gs.defaults.margeB = 30;
gs.defaults.margeG = 35;
gs.defaults.margeD = 10;
gs.defaults.margeH = 10;
gs.defaults.padH = .08;
gs.defaults.padPlage=12;

function pOverT(data, opts){
	var index = document.querySelectorAll('svg.gs').length +1;
	var id = 'svg'+index;
	console.log(id);
	document.write("<svg id='"+id+"'></svg>");
	
	var fx = function(d){return d.time;}
	var fy = function fy(d){return d.Pao;}
	var graph = new gs.graph(document.querySelector('#'+id), opts)
		.setscale(data, fx, fy)
		.tracer(data, fx, fy);
	return graph;
}
</script>
{% end %}

{% content_for :js %}
ventyamlEverything("pre");
{% end %}

{% content_for :css %}
{% end %}

# Pression motrice

<script>
var lung1 = new sv.SimpleLung();
var vent = new sv.VDR();	
vent.Tvent=10;

var dat1 = vent.ventilate(lung1).timeData;

function fy2(d){return d.Palv;}

var conf = {
	margeD: 130
};
var plot = pOverT(dat1, conf)
	.pointy(19, 'Moyenne insp.')
	.pointy(6, 'Moyenne exp.')
	.plagey(6,19, 'P. motrice');

</script>

# Cyclage

<script>

var conf = {
	margeB: 70
};

var lung1 = new sv.SimpleLung();
var vent = new sv.VDR();	
vent.Tvent = 7;
var dat1 = vent.ventilate(lung1).timeData;

var plot = pOverT(dat1, conf)
	.plagex(vent.Tec, vent.Tcc, 'Inspiration')
	.plagex(vent.Tcc, vent.Tcc + vent.Tec, 'Expiration');

</script>

# Résistances augmentées

<script>
var conf ={
	class: 'right'
}
function plotRaw(Raw){
	var vent = new sv.VDR();
	vent.Tvent = 5;
	var lung = new sv.SimpleLung();
	lung.Raw = Raw;
	var dat = vent.ventilate(lung).timeData;
	pOverT(dat, conf);
}
plotRaw(9);
plotRaw(5);
</script>
