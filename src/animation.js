class graph {
		  constructor(dataName, ymin, ymax, xScale, target){
					 this.dataName = dataName;

					 this.echellex = xScale;
					 this.svg = target.append('svg');
					 this.path = this.svg.append('path');
					 this.coord = '';

					 this.id = this.svg.append('text')
					 .attr('x', 5)
					 .attr('y', 25)
					 .attr('text-anchor', 'start')
					 .text(dataName);
		  }

		  setLf(){
					 this.lf = d3.svg.line()
								.x(d => this.echellex(d.time - this.tStart))
								.y(d => this.echelley(d[this.dataName]))
								.interpolate("linear");
		  }

		  setNLf(){
					 this.lf = function(d){
								var l = d.length;
								var point = d[l -1];
								if(l == 0){
									console.log('NLF: no data to plot');
								}
								else if (l == 1){
									this.coord = this.coord + 'M' + this.echellex(point.time - this.tStart) + ',' + this.echelley(point[this.dataName]);
								}
								else {
									this.coord = this.coord + 'L' + this.echellex(point.time - this.tStart) + ',' + this.echelley(point[this.dataName]);
								}
								return this.coord;
					 }
		  }

}

class simulator {
		  constructor(){
					 this.target = d3.select(document.body);

					 this.datasets = [
								{name: 'Pao', ymin: 0, ymax: 60},
								{name: 'Flung', ymin: -5, ymax: 5},
								{name: 'PCO2', ymin: 0, ymax: 60}
					 ];

					 this.timePerScreen = 12;
					 this.graphData = [];
					 this.data = [];
					 this.graphData = [];
					 this.graphStack = [];
					 this.tStart = 0;

					 this.lung = new sv.SimpleLung();
					 this.vent = new sv.VDR();	
					 this.vent.Tsampl = 0.006;
					 this.vent.Tvent = 60 / this.vent.Fconv;
					 this.pointsPerScreen = this.timePerScreen / this.vent.Tsampl;

					 this.xScale = d3.scale.linear()
								.domain([0, this.timePerScreen])
								.range([0, 800]);

					 for(var id in this.datasets){
								var ds = this.datasets[id];
								var gr = new graph(ds.name, ds.ymin, ds.ymax, this.xScale, this.target);
								gr.tStart = 0;
								this.graphStack.push(gr);
					 }
		  }

		  setYscale(graph){
					 if(this.graphData.length > 0){
								for(graph of this.graphStack){
										  var ymin = d3.min(this.graphData, d => d[graph.dataName]);
										  var ymax = d3.max(this.graphData, d => d[graph.dataName]);
										  graph.echelley = d3.scale.linear()
													 .domain([ymin, ymax])
													 .range([200, 0]);
										  //graph.setLf();
										  graph.setNLf();
								}
					 }
					 else{
								for(graph of this.graphStack){
										  var ymin = d3.min(this.data, d => d[graph.dataName]);
										  var ymax = d3.max(this.data, d => d[graph.dataName]);
										  graph.echelley = d3.scale.linear()
													 .domain([ymin, ymax])
													 .range([200, 0]);
										  //graph.setLf();
										  graph.setNLf();
								}
					 }
		  }

		  lf(){
					//Unused function for the moment
					 var l = this.graphData.length;
					 var point = d[l -1];
					 if(l == 0){
								console.log('NLF: no data to plot');
					 }
					 else if (l == 1){
								this.coord = this.coord + 'M' + this.echellex(point.time - this.tStart) + ',' + this.echelley(point[this.dataName]);
					 }
					 else {
								this.coord = this.coord + 'L' + this.echellex(point.time - this.tStart) + ',' + this.echelley(point[this.dataName]);
					 }
					 return this.coord;
		  }
		  ventLoop(){
					 //console.log((this.data.length * this.vent.Tsampl) + 'secondes en réserve');
					 if(this.data.length <= 1/this.vent.Tsampl){
								var newDat = this.vent.ventilate(this.lung).timeData;
								this.data = this.data.concat(newDat);
					 }
		  }

		  graphLoop(){
					 if(this.data.length == 0){ throw 'Stoped; no more data to plot.'}

					 if(this.graphData.length >= this.pointsPerScreen){
								this.tStart = this.data[0].time;
								for(graph of this.graphStack){
										  graph.tStart = this.tStart;
										  graph.coord = '';
								}
								this.graphData = [];
					 }

					 this.graphData.push(this.data.shift());
					 for(var gr of this.graphStack){
								var coord = gr.lf(this.graphData);
								gr.path.attr('d', coord);
					 }
		  }

		  start(){
					 this.ventLoop();
					 this.setYscale();
					 this.ventInt = setInterval(()=>this.ventLoop(), 500);
					 this.graphInt = setInterval(()=>this.graphLoop(), this.vent.Tsampl * 1000);
		  }

		  stop(){
					 clearInterval(this.ventInt);
					 clearInterval(this.graphInt);
		  }
}
