// Creation of the front panel object

fp = {};

// *****************************
// Configurations
// *****************************


fp.dygraphConf = {
			fillGraph:false,
		  	drawGrid:false,
		  	drawAxesAtZero:true,
			//showRoller:true,
			//rollPeriod:4,
			digitsAfterDecimal:3,
			animatedZooms:true,
			drawYGrid:true,
			axes:{
				x:{pixelsPerLabel:30},
				y:{pixelsPerLabel:15}
			},
			valueFormatter:function(v){return Math.round(1000 * v)/1000}
};

fp.flotConf = {
	yaxis:{labelWidth:30},
	xaxis:{ticks:10},
	legend:{
		position:"nw",
		backgroundOpacity: 0.7,
		backgroundColor: "white",
	},
	series:{
		lines:{lineWidth:1.5},
		shadowSize:0
	},
	selection: {
		mode:"x"
	}
};


fp.filters = [
	"meanOfTwo",
	"skipPeak"
];

fp.lowPassFactor = 3;

// Initialisation des modeles

fp.lung = new sv.SimpleLung();
fp.lung.Raw = 5;

fp.VDR = new sv.PresureControler();
/*
fp.VDR.Tsampl=0.002;
fp.VDR.Fiph=3;
fp.VDR.Fipl=.2;
fp.VDR.Tvent=6;
*/

// *****************************
// Filters
// *****************************

fp.noFilter = function(d){
	return d
};

fp.meanOfTwo = function(d,i,a){
	if (i == a.length - 1){
		return d;
	}
	else{
		return [
			d[0],
			(d[1] + a[i + 1][1])/2
			];
	}
};

fp.skipPeak = function(d,i,a){

	if (i > a.length - 3  | i == 0){return d;}
	else if(d[1] > 1.05 * a[i - 1][1] && d[1] > 1.05  * a[i + 2][1]){
		return [d[0], a[i + 2][1]];
		//return null;
	}
	else {return d};
}

fp.downSample = function(d,i,a){
	return i % 2 == 0;
};

fp.cropData = function(d,i,a){
	return d.time > fp.xmin && d.time < fp.xmax;
};

fp.lowPass = function(arr){
	var smoothed = arr[0][1];
	for (var index = 1, len = arr.length; index<len; ++index){
		var currentValue = arr[index][1];
		smoothed += (currentValue - smoothed) / fp.lowPassFactor;
		arr[index][1] = smoothed;
	}
	return arr;
}



// **********************************
// Translation of the user interface
// **********************************

fp.translate = function(obj){
	if(obj[navigator.language]){
		var text =obj[navigator.language];
	}

	else{
		var text = obj["en"];
	}
	return text;
};

fp.titles = [
	"Help",
	"About",
	"Simulator",
	"Parameters",
	"Lung"
];

for (i in fp.titles) {
	var element = $("#" + fp.titles[i]);
	var label = dict[fp.titles[i]];
	element.text(fp.translate(label));
}

var text = fp.translate(dict.aboutText);
$("#aboutText").text(text);



// **********************************
// Other unsorted functions
// **********************************

fp.updateFconv = function(){
	fp.updateModels()
	var f = Math.round(60 / (fp.VDR.Tic + fp.VDR.Tec));
	$("#dataFconv").text(f);
};

fp.updateFperc = function(){
	fp.updateModels()
	var f = Math.round(10 * fp.VDR.Fperc / 60)/10;
	$("#dataFperc").text(f);
};



fp.updateModels = function(){

	for(i in simParams){
		fp.VDR[simParams[i].id] = parseFloat($("#input" + simParams[i].id).val());
	}

	for(i in fp.VDR.ventParams){
		id = fp.VDR.ventParams[i].id;
		fp.VDR[id] = parseFloat($("#input" + id).val());
	}

	fp.lung = new sv.SimpleLung();

	for(i in lungParams){
		fp.lung[lungParams[i].id] = parseFloat($("#input" + lungParams[i].id).val());
	}
}

fp.ventilate = function(){

	fp.VDR.time = 0;
	fp.data = fp.VDR.ventilate(fp.lung);
	fp.timeData = fp.data.timeData
}

fp.download = function(objArray)
{
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
     
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if(line != '') line += ','
         
            line += array[i][index];
        }
 
        str += line + '\r\n';
    }
 
    if (navigator.appName != 'Microsoft Internet Explorer')
    {
        window.open('data:text/csv;charset=utf-8,' + escape(str));
    }
    else
    {
        var popup = window.open('','csv','');
        popup.document.body.innerHTML = '<pre>' + str + '</pre>';
    }          
}


// **********************************
// Création du tableau des paramètres
// **********************************

fp.paramTable = function(params, obj, tableId){
	var table = $("#" + tableId);

	for(i in params){

		var param = params[i];
		var id = param.id;
		//var abrev = fp.translate(dict[id].short);
		var abrev = id;
		var unit = param.unit;

		var tr = $("<tr></tr>");

		var td = $("<td></td>")
				//.attr("title", fp.translate(dict[id].long))
				.html(abrev + " :")
				.appendTo(tr);

		var td = $("<td class=\"data\"></td>");
		if (param.update){
			var dataSpan = $("<span></span")
				.attr("id", "data" + id)
				.appendTo(td);
		}
		else{
			var input = $("<input></input>")
							.attr("id", 'input' + id)
							.attr("value", obj[id])
							.attr("size", '6')
							.attr("type", 'number')
							.attr("step", param.step)
							.click(function(){this.select()})
							.appendTo(td);
		}
		tr.append(td);
		var unitSpan = $("<td class='unit'>" + unit + "</td>")
			.appendTo(tr);


		table.append(tr);

		if(param.callback){
			$("#input" + id).change(param.callback);
		}
	}
} 

var simParams = [
	{id: "Tvent", unit: "s", step: 1},
	{id: "Tsampl", unit: "s", step: 0.0001},
	{id: "rolingAverage", unit: "", step: 1},
	{id: "lowPassFactor", unit: "", step: 1},
	{id: "Rexp", unit: "mbar/l/s", step: 1}
];

var params = [
	{id: "Fperc", unit: "/m", step: 50,callback: fp.updateFperc},
	{id: "Fperc", unit: "Hz", update: 1},
	{id: "Rit", unit: "", step:.1},
	{id: "Tic", unit: "s", step: .1,callback: fp.updateFconv},
	{id: "Tec", unit: "s", step: .1,callback: fp.updateFconv},
	{id: "Fconv", unit: "/m", update: 1},
	{id:"Fiph", unit: "l/m", step: .1},
	{id:"Fipl", unit: "l/m", step: .01}
];

var lungParams = [
	{id: "Crs", unit: "ml/mbar", step: 1},
	{id:"Raw",unit:"mbar/l/s", step: 1}
];

//fp.paramTable(simParams, fp.VDR, "simParams"); 
fp.paramTable(fp.VDR.ventParams, fp.VDR, "params"); 
fp.paramTable(lungParams, fp.lung, "lung"); 

//fp.dataTable(fp.dataParams, "data");



/***************************************
 * Creating the graphs
 **************************************/

var graphics = [];

var graphParams = [
	"Pao",
	//"Fop",
	"Flung",
	"Palv",
	"Vt",
	];


var graphParams2 = [
	{
		id: "Pao", 
		dataSets:[
			{ dataSet: "timeData", key: "Pao"}
		]
	},
	{
		id: "Flung", 
		dataSets:[
			{ dataSet: "timeData", key: "Flung"}
		]
	},
	{
		id: "Palv", 
		dataSets:[
			{ dataSet: "timeData", key: "Palv"}
		]
	}
];

fp.initDyGraph2 = function(){
	for (index in graphParams2){

		var id = graphParams2[index].id;
		var idgraph = "#graph" + id;
		var label = fp.translate(dict[id].long);

		var conf = fp.dygraphConf;
		//conf.ylabel = label;
		conf.title = label;
		conf.labels = ["Time", id];

		$("#graphics").append("<div class='graph' id='graph" + id + "'></div>");
		var  div = document.getElementById("graph" + id);

		graphics.push(new Dygraph(div, [[0,0]], fp.dygraphConf));
	}
	fp.sync = Dygraph.synchronize(
			graphics,
			{
				selection: true,
				zoom: true,
				range: false
			}
			);
}
fp.initDyGraph = function(){
	for (index in graphParams){

		var id = graphParams[index];
		var idgraph = "#graph" + id;
		var label = fp.translate(dict[graphParams[index]].long);

		var conf = fp.dygraphConf;
		//conf.ylabel = label;
		conf.title = label;
		conf.labels = ["Time", id];

		$("#graphics").append("<div class='graph' id='graph" + id + "'></div>");
		var  div = document.getElementById("graph" + id);

		graphics.push(new Dygraph(div, [[0,0]], fp.dygraphConf));
	}
	fp.sync = Dygraph.synchronize(
			graphics,
			{
				selection: true,
				zoom: true,
				range: false
			}
			);

	// Interacton with graphics
	/*

	$(".graph").bind("plotselected", function( event, ranges){
		fp.xmin = ranges.xaxis.from;
		fp.xmax = ranges.xaxis.to;

		fp.plot();

		for (i in graphics){graphics[i].clearSelection();}
	});

	$(".graph").dblclick(function(){
		fp.xmin = null;
		fp.xmax = null;
		fp.plot();
	});
	*/
}
fp.initFlotGraph = function(){
	for (index in graphParams){

		var id = graphParams[index];
		var idgraph = "#graph" + id;
		var label = fp.translate(dict[graphParams[index]].long);

		$("#graphics").append("<div class='graph' id='graph" + id + "'></div>");

		graphics.push($("#graph" + id).plot([], fp.flotConf).data("plot"));
	}

	// Interacton with graphics

	$(".graph").bind("plotselected", function( event, ranges){
		fp.xmin = ranges.xaxis.from;
		fp.xmax = ranges.xaxis.to;

		fp.plot();

		for (i in graphics){graphics[i].clearSelection();}
	});

	$(".graph").dblclick(function(){
		fp.xmin = null;
		fp.xmax = null;
		fp.plot();
	});
}

// *****************************
// Mise à jour des graphiques
// *****************************


fp.filter = function(set){

	for (i in fp.filters){
		set = set.map(fp[fp.filters[i]]);
	}
	return set;
};

fp.plotFlot = function(){

	if(fp.xmin && fp.xmax){
		var dataSet = fp.timeData.filter(fp.cropData);
	}
	else{
		var dataSet = fp.timeData;
	}

	for (index in graphParams){

		var param = graphParams[index];
		var id = param;
		var label = fp.translate(dict[id].long);

		function f1(d, i, a){ return [ d["time"], d[id] ]; }
		
		var data = dataSet.map(f1);

		data = fp.filter(data);
		
		while(data > $("#graphics").width()){
			data = data.filter(fp.downSample);
		}


		
		var flotData = [ {data:data, label:label} ];

		graphics[index].setData(flotData);
		graphics[index].setupGrid();
		graphics[index].draw();
	}
}

fp.plotDygraph2 = function(){

	for (index in graphParams2){

		var param = graphParams2[index];
		console.log(param);
		var data = [];

		function f1(d, i, a){ 
			var sample = [d["time"]]; 
			for (i in param.dataSets){
				dataset  = param.dataSets[i].dataSet;
				key  = param.dataSets[i].key;
				function f1(d, i, a){ return [ d["time"], d[key] ]; }
				var data = fp.lowPass(fp.timeData.map(f1));
			}
			return sample;		
		}
		var data = fp.lowPass(fp.timeData.map(f1));
		console.log(data);

		graphics[index].updateOptions({file: data});
		

	}
	graphics[0].resetZoom();
}

fp.plotDygraph = function(){

	/*
	if(fp.xmin && fp.xmax){
		var dataSet = fp.timeData.filter(fp.cropData);
	}
	else{
		var dataSet = fp.timeData;
	}
	*/
	for (index in graphParams){

		var param = graphParams[index];
		var id = param;
		var label = fp.translate(dict[id].long);

		function f1(d, i, a){ return [ d["time"], d[id] ]; }
		
		var data = fp.timeData.map(f1);

		graphics[index].updateOptions({file: data});
		

	}
	graphics[0].resetZoom();
}

function maj() {
	
	fp.updateModels();
	fp.updateFconv();
	fp.updateFperc();
	fp.ventilate()
	fp.xmin = null;
	fp.ymin = null;
	fp.plotDygraph()
}

fp.init = function(){

	fp.initDyGraph()
	maj();
	
	// Gestion des racourcis clavier
	$("#panel input").keypress(function(event){
		if (event.which == 13){ $("#ventiler").click(); }
	});

};
