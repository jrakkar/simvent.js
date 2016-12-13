class ventyaml {
	constructor(textarea) {
		if (! YAML){throw "ventyaml: YAML library not loaded."}
		this.textarea = document.getElementById(textarea);
		this.textarea.classList.add("ventyamlSource");
		this.textarea.classList.add("hidden");
		this.textarea.contentEditable = true;

		// Replace source element with codemirror if available
		
		if(typeof window.CodeMirror !== "undefined"){
			console.log("Codemirror is available");
			function cmf(elt){
				this.textarea.parentNode.replaceChild(elt, this.textarea);
			}
			this.cm = CodeMirror(cmf, {value: this.textarea.textContent});
		}
		else{console.log("Codemirror not available");}

		// Create waveform container div
		this.parentDiv = this.textarea.parentNode;
		this.waveformContainer = document.createElement("div");
		this.waveformContainer.classList.add("vyamlwc");
		var containerId = "vyamlwc" + (document.getElementsByClassName("vyamlwc").length +1);
		this.waveformContainer.id = containerId;
		this.parentDiv.insertBefore(this.waveformContainer, this.textarea);
		this.waveformContainer.addEventListener("click", this.toggleSource.bind(this));

		// Operate the magic

		this.update();
	}

	update(){
		this.yaml = this.textarea.value;
		this.json = YAML.parse(this.yaml);
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
		this.data = this.vent.ventilate(this.lung).timeData;
	}

	initGraph(){}

	updateGraph(){
		console.log("Updating graph");
// 1- Clear all graph
		var wc = this.waveformContainer;
		while(wc.firstChild){
			wc.removeChild(wc.firstChild);
		}
		/*
		this.waveformContainer.innerHtml = "";
		*/
// 2- Check what must be ploted and plot it
		if("Courbes" in this.json){
			var courbes = this.json.Courbes;
			if(typeof courbes == "object"){
				console.log("We seem to have a waveform list");
				for(var i in courbes){
					if(typeof courbes[i] == "string"){
						function fx(d){return d.time;}
						function fy(d){return d[courbes[i]];}
						/*
						var graphid = "graph" + (document.getElementsByTagName("svg").length +1);
						this.svg = document.createElement("svg");
						this.svg.classList.add("half");
						this.svg.id = graphid;
						this.waveformContainer.appendChild(this.svg);

						var graph = gs.graph("#container");
						graph.setscale(this.data.timeData, fx, fy);
						graph.tracer(this.data.timeData, fx, fy);
						graph.setidx(courbes[i]);
						*/
						gs.addGraph(this.waveformContainer.id, this.data, fx, fy, {class: "square"});
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

	toggleSource(){
	//	this.textarea.classList.toggle("hidden");	
		if(this.textarea.classList.contains("hidden")){
			this.textarea.classList.remove("hidden");
			}
		else{
			this.update();
			this.textarea.classList.add("hidden");
			}
	}

}
