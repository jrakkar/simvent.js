class ventyaml {
	constructor(sourceNode) {
		if (! YAML){throw "ventyaml: YAML library not loaded."}
		this.parentDiv = sourceNode.parentNode;

		this.container = document.createElement("figure");
		this.container.classList.add("ventyaml");

		this.parentDiv.insertBefore(this.container, sourceNode);

		if(sourceNode.tagName == "TEXTAREA"){
			this.textarea = sourceNode;
			//this.parentDiv.removeChild(this.textarea);
			//this.container.appendChild(this.textarea);
		}
		else{
			this.textarea = document.createElement("textarea");
			this.textarea.value = sourceNode.textContent;
			//this.parentDiv.insertBefore(this.textarea, sourceNode);
			this.parentDiv.removeChild(sourceNode);
		}

		this.container.appendChild(this.textarea);

		this.textarea.classList.add("ventyamlSource");
		this.textarea.classList.add("hidden");
		this.textarea.value = this.textarea.value.trim();


		// Create waveform container div
		this.waveformContainer = document.createElement("div");
		this.waveformContainer.classList.add("vyamlwc");
		var containerId = "vyamlwc" + (document.getElementsByClassName("vyamlwc").length +1);
		this.waveformContainer.id = containerId;
		this.container.insertBefore(this.waveformContainer, this.textarea);
		this.waveformContainer.addEventListener("click", this.toggleSource.bind(this));

		// Operate the magic

		this.update();
	}

	createCM(){

		// Replace source element with codemirror if available
		
		if(typeof window.CodeMirror !== "undefined"){
			console.log("Codemirror is available");
			function cmf(elt){
				this.textarea.parentNode.replaceChild(elt, this.textarea);
			}
			this.cm = CodeMirror(cmf, {value: this.textarea.textContent});
		}
		else{console.log("Codemirror not available");}
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
				if(id!=="Mode" && ventDesc[id] != null){
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
				if(id!=="Type" && typeof lungDesc[id] == 'number'){
					console.log(id + ": " + typeof lungDesc[id]);
					this.lung[id] = lungDesc[id];
				}
			}
		}
	}

	run(){
		this.data = this.vent.ventilate(this.lung).timeData;
	}

	updateGraph(){
// 1- Clear all graph
		var wc = this.waveformContainer;
		while(wc.firstChild){
			wc.removeChild(wc.firstChild);
		}
		
// 2- Check what must be ploted and plot it

		if("Courbes" in this.json){
			var courbes = this.json.Courbes;
			
			if(typeof courbes == "object"){
				console.log("We seem to have a waveform list");
				for(var i in courbes){
					if(typeof courbes[i] == "string"){
						function fx(d){return d.time;}
						function fy(d){return d[courbes[i]];}
						var graph = gs.addGraph(this.waveformContainer.id, this.data, fx, fy);
						graph.setidx("Time (s)");
						graph.setidy(courbes[i]);
					}
				}
			}
			else{console.log("ventyaml: Value for courbes must be a string list")}
		}
		else if("Courbe" in this.json){
			var courbe = this.json.Courbe;
			
			if(typeof courbe == "string"){
				console.log("We seem to have a single waveform");
				function fx(d){return d.time;}
				function fy(d){return d[courbe];}
				gs.addGraph(this.waveformContainer.id, this.data, fx, fy);
			}
			else{console.log("ventyaml: Value for courbes must be a string")}
		}
		else{
			var courbe = "Flung";
			
			if(typeof courbe == "string"){
				console.log("Using default waveform");
				function fx(d){return d.time;}
				function fy(d){return d[courbe];}
				gs.addGraph(this.waveformContainer.id, this.data, fx, fy);
			}
			else{console.log("ventyaml: Value for courbes must be a string")}
		}
		if("Boucles" in this.json){
			var courbes = this.json.Courbes;
			
			if(typeof courbes == "object"){
				console.log("We seem to have a waveform list");
				for(var i in courbes){
					if(typeof courbes[i] == "string"){
						function fx(d){return d.time;}
						function fy(d){return d[courbes[i]];}
						var graph = gs.addGraph(this.waveformContainer.id, this.data, fx, fy);
						graph.setidx("Time (s)");
						graph.setidy(courbes[i]);
					}
				}
			}
			else{console.log("ventyaml: Value for courbes must be a string list")}
		}
		else if("Boucle" in this.json){
			var boucle = this.json.Boucle;
			
			if(typeof boucle == "object"){
				function fx(d){return d[boucle["x"]];}
				function fy(d){return d[boucle["y"]];}
				var graph = gs.addGraph(this.waveformContainer.id, this.data, fx, fy, {class: "loop"});
				graph.setidx(boucle["x"]);
				graph.setidy(boucle["y"]);
			}
			else{console.log("ventyaml: invalid loop description")}
		}
		
	}


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

function ventyamlEverything(selector){
	var preS = document.querySelectorAll(selector);
	for(var i in preS){
		var ventyamlInstance = new ventyaml(preS[i]);
	}
}
