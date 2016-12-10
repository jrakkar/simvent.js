class ventyaml {
	constructor(textarea) {
		if (! YAML){throw "ventyaml: YAML library not loaded."}
		this.textarea = document.getElementById(textarea);
		this.yaml = this.textarea.value;
		this.json = YAML.parse(this.yaml);

		// Create waveform container div
		this.parentDiv = this.textarea.parentNode;
		this.waveformContainer = document.createElement("div");
		this.waveformContainer.classList.add("vyamlwc");
		this.parentDiv.insertBefore(this.waveformContainer, this.textarea);

		// Operate the magic

		this.update();
	}

	update(){
		this.updateLung();
		this.updateVent();
		this.run();
		this.updateGraph();
	}

	updateVent(){

		if(!("Ventilateur" in this.json)){
			this.vent = new sv.PressureControler();
		}

		else if(typeof this.json.Ventilateur == 'string'){
			if(this.json.Ventilateur in sv){
				this.vent = new sv[this.json.Ventilateur]();
			}
		}

		else if(typeof this.json.Ventilateur == 'object'){
			var ventDesc = this.json.Ventilateur;
			if(!("Mode" in ventDesc)){
				this.vent = new sv.PressureControler();
			}

			else if(ventDesc.Mode in sv){
				this.vent = new sv[ventDesc.Mode]();
			}
			else {console.log( "Does not seems to be a valid ventilator mode")}

			for(var id in ventDesc){
				if(id!=="Mode"){
					this.vent[id] = ventDesc[id];
				}
			}
		}
	}

	updateLung(){
		if(!("Poumon" in this.json)){
			this.lung = new sv.SimpleLung();
		}

		else if(typeof this.json.Poumon == 'string'){
			if(this.json.Poumon in sv){
				this.lung = new sv[this.json.Poumon]();
			}
		}

		else if(typeof this.json.Poumon == 'object'){
			var lungDesc = this.json.Poumon;
			if(!("Type" in lungDesc)){
				this.lung = new sv.SimpleLung();
			}

			else if(lungDesc.Type in sv){
				this.lung = new sv[lungDesc.Type]();
			}
			else {console.log( "Does not seems to be a valid lung type")}

			for(var id in lungDesc){
				if(id!=="Type"){
					this.lung[id] = lungDesc[id];
				}
			}
		}
	}

	run(){
		this.data = this.vent.ventilate(this.lung);
	}

	initGraph(){}

	updateGraph(){
		console.log("Updating graph");
// 1- Clear all graph

// 2- Check what must be ploted and plot it
		if("Courbes" in this.json){
			var courbes = this.json.Courbes;
			if(typeof courbes == "object"){
				console.log("We seem to have a waveform list");
				for(var i in courbes){
					if(typeof courbes[i] == "string"){
						function fx(d){return d.time;}
						function fy(d){return d[courbes[i]];}
						var graphid = "graph" + (document.getElementsByTagName("svg").length +1);
						this.svg = document.createElement("svg");
						this.svg.id = graphid;
						this.waveformContainer.appendChild(this.svg);

						var graph = gs.graph("#" + graphid, this.data.timeData, fx, fy);
						graph.setscale(this.data.timeData, fx, fy);
						graph.tracer(this.data.timeData, fx, fy);
						graph.setidX(d[courbes[i]]);
					}
				}
			}
		}
	}

	addWave(yParam){
		// Create new svg element in waveform container div
		
		// Plot the data
	}

	addLoop(yParam, xParam){}

}
