// Creation of the front panel object

fp = {};

// *****************************
// Configurations
// *****************************


fp.dygraphConf = {
includeZero: true,
			strokeWidth: 2,
			color: "hsl(220, 100%, 36%)",
			fillGraph:false,
		  	drawGrid:false,
		  	drawAxesAtZero:true,
			//showRoller:true,
			//rollPeriod:4,
			digitsAfterDecimal:3,
			animatedZooms:true,
			//drawYGrid:true,
			axes:{
				x:{
					pixelsPerLabel:30,
					drawGrid: false
				  },
				y:{
					pixelsPerLabel:15,
					drawGrid: true
				  }
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

fp.paramContainer = "#panel";
fp.jparamContainer = "panel";
fp.lungModels = [
	"SimpleLung",
	"SygLung"
	];
fp.lungModel = "SimpleLung";

fp.ventModels = [
	"PresureControler",
	"VDR",
	"PVCurve"
	]
fp.progressDelay = 50;

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

fp.updateModels = function(){

	for(i in fp.ventilator.ventParams){
		if(fp.ventilator.ventParams[i].calculated != true){
			fp.ventilator[i] = parseFloat($("#input" + i).val());
		}
	}

	fp.ventilator.updateCalcParams();
	for(i in fp.ventilator.ventParams){
		if(fp.ventilator.ventParams[i].calculated == true){
			document.getElementById("data"+i).textContent = ""+ Math.round(10 * fp.ventilator[i])/10;
		}
	}

	for(i in fp.ventilator.simParams){
		fp.ventilator[i] = parseFloat($("#input" + i).val());
	}

	fp.lung = new sv[fp.lungModel]();
	for(i in fp.lung.mechParams){
		fp.lung[i] = parseFloat($("#input" + i).val());
	}
}

fp.ventilate = function(){

	fp.ventilator.time = 0;
	fp.data = fp.ventilator.ventilate(fp.lung);
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

fp.paramTable = function(object, paramSet, container, label){
	if(typeof object[paramSet] != "undefined"){
		$(label).detach();
		$(container).append("<table id="+label+"></table>");
		var table = $("#" + label) ; 
		if(typeof label != "undefined"){table.append("<caption>"+label+"</caption>");}

		for(id in object[paramSet]){

			var param = object[paramSet][id];
			var abrev = id; // abrev will eventualy beset to a translated value
			if (typeof param.unit != "undefined"){var unit = param.unit;}
			else {var unit = "";}

			var tr = $("<tr></tr>");

			var td = $("<td></td>")
					//.attr("title", fp.translate(dict[id].long))
					.html(abrev + " :")
					.appendTo(tr);

			var td = $("<td class=\"data\"></td>");
			if (param.calculated == true){
				var value = Math.round(10 * fp.ventilator[id])/10;
				var dataSpan = $("<span></span>")
					.attr("id", "data" + id)
					.html(value)
					.appendTo(td);
			}
			else{
				var input = $("<input></input>")
								.attr("id", 'input' + id)
								.attr("value", object[id])
								.attr("size", '6')
								.attr("type", 'number')
								.attr("step", param.step)
								//.click(function(){this.select()})
								.appendTo(td);
			}
			tr.append(td);
			var unitSpan = $("<td class='unit'>" + unit + "</td>")
				.appendTo(tr);


			tr.appendTo(table);
		}
	}
} 

/***************************************
 * Creating the graphs
 **************************************/

fp.graphics = [];

fp.timeSeries = [
	"Pao",
	//"Fop",
	"Flung",
	"Palv",
	"Vt",
	];


fp.timeSeries2 = [
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

fp.initDyGraph = function(){
	$(".graph").detach();
	for (index in fp.timeSeries){

		var id = fp.timeSeries[index];
		var idgraph = "#graph" + id;
		if (typeof dict[id] != "undefined"){
			var label = fp.translate(dict[fp.timeSeries[index]].long);
		}
		else { label = id}

		var conf = fp.dygraphConf;
		//conf.ylabel = label;
		conf.title = label;
		conf.labels = ["Time", id];

		$("#graphics").append("<div class='graph' id='graph" + id + "'></div>");
		var  div = document.getElementById("graph" + id);

		fp.graphics.push(new Dygraph(div, [[0,0]], fp.dygraphConf));
	}
	fp.sync = Dygraph.synchronize(
			fp.graphics,
			{
				selection: true,
				zoom: true,
				range: false
			}
			);

}
fp.initFlotGraph = function(){
	for (index in fp.timeSeries){

		var id = fp.timeSeries[index];
		var idgraph = "#graph" + id;
		var label = fp.translate(dict[fp.timeSeries[index]].long);

		$("#graphics").append("<div class='graph' id='graph" + id + "'></div>");

		fp.graphics.push($("#graph" + id).plot([], fp.flotConf).data("plot"));
	}

	// Interacton with graphics

	$(".graph").bind("plotselected", function( event, ranges){
		fp.xmin = ranges.xaxis.from;
		fp.xmax = ranges.xaxis.to;

		fp.plot();

		for (i in fp.graphics){fp.graphics[i].clearSelection();}
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

	for (index in fp.timeSeries){

		var param = fp.timeSeries[index];
		var id = param;
		var label = fp.translate(dict[id].long);

		function f1(d, i, a){ return [ d["time"], d[id] ]; }
		
		var data = dataSet.map(f1);

		data = fp.filter(data);
		
		while(data > $("#graphics").width()){
			data = data.filter(fp.downSample);
		}


		
		var flotData = [ {data:data, label:label} ];

		fp.graphics[index].setData(flotData);
		fp.graphics[index].setupGrid();
		fp.graphics[index].draw();
	}
}


fp.plotDygraph1 = function(){

	for (index in fp.timeSeries){

		var param = fp.timeSeries[index];
		var id = param;
		//var label = fp.translate(dict[id].long);

		function f1(d, i, a){ return [ d["time"], d[id] ]; }
		
		var data = fp.timeData.map(f1);

		fp.graphics[index].updateOptions({file: data});
		

	}
	fp.graphics[0].resetZoom();
}

fp.plotDygraph = function(index){

		var param = fp.timeSeries[index];
		var id = param;
		//var label = fp.translate(dict[id].long);

		function f1(d, i, a){ return [ d["time"], d[id] ]; }
		
		var data = fp.timeData.map(f1);

		fp.graphics[index].updateOptions({file: data});
		fp.pBarr.value = (index + 1)/fp.timeSeries.length;
		
	if(index < fp.timeSeries.length - 1){
		++ index;
		setTimeout(function(){
			fp.plotDygraph(index)
		}, 10);
	}
	else{
		//fp.stopProgress();
		setTimeout(function(){fp.stopProgress();},50);
	}
	fp.graphics[0].resetZoom();
}

fp.progressBar = function(){
	fp.pbTimer = setTimer(function(){

	}, fp.pbDelay);
}

fp.initProgress = function(){
	fp.pDiv = document.createElement("div");
	fp.pDiv.id = "pDiv";
	fp.pDiv.textContent = "Updating graphics...";
	fp.pBarr = document.createElement("progress");
	fp.pBarr.value = 0;
	fp.pDiv.appendChild(fp.pBarr);
	document.body.appendChild(fp.pDiv);

};

fp.progress = function(fname){
	
}


fp.stopProgress = function(){
	setTimeout(function(){
		document.body.removeChild(fp.pDiv);
	},100);
};

function maj() {
	fp.initProgress();
	setTimeout(function(){
		fp.updateModels();
		fp.ventilate()
		fp.xmin = null;
		fp.ymin = null;
		fp.plotDygraph(0)
		//fp.plotDygraph1()
	}, 50);
}

fp.ventMenu = function(){
	var container = document.getElementById(fp.jparamContainer);
	var select = document.createElement("select");
	select.id = "ventSelect";
	select.onchange = fp.ventChange;
	container.appendChild(select);

	for (i in fp.ventModels){
		var option = document.createElement("option");
		option.value = fp.ventModels[i];
		option.textContent = fp.ventModels[i];
		select.appendChild(option);
	}
	select.selectedIndex = fp.ventModels.indexOf(fp.ventModel);
}

fp.ventChange = function(){
	var select = document.getElementById("ventSelect");
	var newVent = select.options[select.selectedIndex].value;
	fp.ventModel = newVent;
	fp.ventilator = new sv[newVent];
	fp.reinit();
}

fp.init = function(){
	if(typeof fp.ventilator == "undefined"){fp.ventilator = new sv[fp.ventModel]();}
	if(typeof fp.lung == "undefined"){fp.lung = new sv[fp.lungModel]();}

	$(fp.paramContainer).children().remove();
	fp.ventMenu();

	fp.paramTable(fp.ventilator, "ventParams", fp.paramContainer, "Parameters"); 
	fp.paramTable(fp.ventilator, 'simParams', fp.paramContainer, "Simulator"); 
	fp.paramTable(fp.lung, "mechParams", fp.paramContainer, "Lung"); 

	$(fp.paramContainer).append('<button id="ventiler" value="ventiler" onClick="maj()">Ventiler</button>');

	fp.graphics = [];
	fp.initDyGraph()
	maj();
	
	// Gestion des racourcis clavier
	$("#panel input").keypress(function(event){
		if (event.which == 13){ $("#ventiler").click(); }
	});
	$("input").change(function(){
		fp.updateModels();
	});
	$("input").keyup(function(){
		fp.updateModels();
	});
};
fp.reinit = function(){
	if(typeof fp.lung == "undefined"){fp.lung = new sv[fp.lungModel]();}
	$(fp.paramContainer + " table").children().remove();
	//fp.ventMenu();

	fp.paramTable(fp.ventilator, "ventParams", fp.paramContainer, "Parameters"); 
	fp.paramTable(fp.ventilator, 'simParams', fp.paramContainer, "Simulator"); 
	fp.paramTable(fp.lung, "mechParams", fp.paramContainer, "Lung"); 

	//$(fp.paramContainer).append('<button id="ventiler" value="ventiler" onClick="maj()">Ventiler</button>');

	fp.graphics = [];
	fp.initDyGraph()
	maj();
	
	// Gestion des racourcis clavier
	$("#panel input").keypress(function(event){
		if (event.which == 13){ $("#ventiler").click(); }
	});
	$("input").change(function(){
		fp.updateModels();
	});
	$("input").keyup(function(){
		fp.updateModels();
	});
};
