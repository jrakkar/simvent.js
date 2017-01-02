class ventyaml {
	constructor(sourceNode) {
		if (! YAML){throw "ventyaml: YAML library not loaded."}
		this.parentDiv = sourceNode.parentNode;

		this.container = document.createElement("figure");
		this.container.classList.add("ventyaml");

		this.parentDiv.insertBefore(this.container, sourceNode);

		if(sourceNode.tagName == "TEXTAREA"){
			this.textarea = sourceNode;
		}
		else{
			this.textarea = document.createElement("textarea");
			this.textarea.value = sourceNode.textContent;
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
		this.lungs = [];
		if ('Poumon' in this.json){
			//this.lung = this.createlung(this.json.Poumon);
			this.lungs.push(this.createlung(this.json.Poumon));
		}
		else if ('Poumons' in this.json){
			for(var i in this.json.Poumons){
				this.lungs.push(this.createlung(this.json.Poumons[i]));
			}
		}
		else{
			//this.lung = this.createlung('SimpleLung');
			this.lungs.push(this.createlung(his.json.Poumons[i]));
		}
	}

	createlung(lungDesc){
		if(typeof lungDesc == 'string'){
			if(lungDesc in sv){
				var lung = new sv[lungDesc]();
			}
		}
		else if(typeof lungDesc == 'object'){
			if(!("Type" in lungDesc)){
				var lung = new sv.SimpleLung();
			}

			else if(lungDesc.Type in sv){
				var lung = new sv[lungDesc.Type]();
			}
			else {console.log( "Does not seems to be a valid lung type")}

			for(var id in lungDesc){
				if(id!=="Type" && typeof lungDesc[id] == 'number'){
					lung[id] = lungDesc[id];
				}
			}
		}
		if(typeof lung != 'undefined'){return lung;}
	}

	run(){
		//this.data = this.vent.ventilate(this.lung).timeData;
		this.data = [];
		for(var i in this.lungs){
			this.vent.time = 0;
			this.data.push(this.vent.ventilate(this.lungs[i]).timeData);
		}
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
				for(var i in courbes){
					this.createWaveform(courbes[i]);
				}
			}
			else{console.log("ventyaml: Value for courbes must be a string list");}
		}
		else if("Courbe" in this.json){
			this.createWaveform(this.json.Courbe);
		}
		if("Boucles" in this.json){
			for(var i in this.json.Boucles){
				this.createLoop(this.json.Boucles[i])
			}
		}

		else if("Boucle" in this.json){
			var boucle = this.json.Boucle;
			this.createLoop(boucle);
		}

		if(!('Courbes' in this.json) 
				&& ! ('Courbe' in this.json)
				&& ! ('Boucle' in this.json)
				&& ! ('Boucles' in this.json)){
			this.createWaveform("Flung");
		}
	}

	createWaveform(courbe){
		if(typeof courbe == "string"){
			function fx(d){return d.time;}
			function fy(d){return d[courbe];}
			var graph = gs.addGraph(this.waveformContainer.id, this.data[0], fx, fy);
			if(this.data.length>1){
				for(var i = 1; i< this.data.length;i++){
					graph.tracer(this.data[i],fx,fy);
				}
			}


		}
		else{console.log("ventyaml: Value for courbes must be a string")}
	}	

	createLoop(boucle){
		if( typeof boucle == "object" && 'x' in boucle && 'y' in boucle && boucle.x != null && boucle.y != null){
			function fx(d){return d[boucle["x"]];}
			function fy(d){return d[boucle["y"]];}
			var graph = gs.addGraph(this.waveformContainer.id, this.data[0], fx, fy, {class: "loop"});
			graph.setidx(boucle["x"]);
			graph.setidy(boucle["y"]);
			if(this.data.length>1){
				for(var i = 1; i< this.data.length;i++){
					graph.tracer(this.data[i],fx,fy);
				}
			}
		}
		else{console.log("ventyaml: invalid loop description")}
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
