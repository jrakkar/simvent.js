sv = {}

sv.log = function(lung, vent){
	return {
		// Lung variables

		time  : vent.time,
		Flung : lung.flow,
		Palv  : lung.Palv,
		Pel   : lung.Pel,
		Pmus  : lung.Pmus,
		Vabs  : lung.Vabs,
		Vti   : lung.Vti,
		Vte   : lung.Vte,
		PCO2  : lung.PCO2,
		SCO2  : lung.SCO2,
		VCO2  : lung.VtCO2,

		// Ventilator variables

		Pao    : vent.Pao,
		Fip    : vent.Fip,
		Fop    : vent.Fop,
		stateP : vent.stateP,
		Pcirc  : vent.Pcirc,
		Fmax   : vent.Fmax,
		Fstop  : vent.Fstop
	};
}

sv.logPerc = function(lung, vent){
	return {
		time: vent.time,
		Vtip: lung.Vtip,
		Vtep: lung.Vtep
	};
}

sv.syg = function(x, ymax, ymin, xid, kid){
	return y;
}

sv.avg = function(dataset, data, Nroll){

	for(i = 0; i < dataset.length - (Nroll -1); i ++){

		var curent = i;
		var avged = dataset[curent][data];

		for(i2 = curent + 1; i2 < (curent + Nroll) ; i2 ++){
			avged += dataset[i2][data];
		}

		dataset[curent][data] = avged/Nroll;
	}
}


sv.Lung = class {
	constructor() {

		this.defaults = {
			Tsampl: 0.001,
			// Gaz exchange parameters
			Vdaw   : 0.1,
			PiCO2  : 0.0,
			PACO2  : 35.0,
			Slope2 : 0.003,
			Slope3 : 5,
			Vabs    : 0
		};

		this.parseDefaults();
	}

	parseDefaults() {
		for (var p in this.defaults) {
			this[p] = this.defaults[p];
		}
	}

	get Palv() {return this.Pel - this.Pmus;}

	appliquer_pression(pression, duree) {

		var time = 0.0;
		var deltaVolume = 0.0;

		while (time < duree){
			var deltaP = pression - this.Palv;
			this.flow = deltaP / this.Raw;
			this.appliquer_debit(this.flow, this.Tsampl);

			time += this.Tsampl;
		}
	};

	appliquer_debit (flow, duration){

		if(isNaN(flow)){
			throw "sv.SimpleLung.appliquer_debit: NaN value passed as flow";
		}

		this.flow = flow ; // l/s
		var deltaVolume = this.flow * duration; // l
		this.Vabs+= deltaVolume; // l
		this.Vti += deltaVolume;

		if (this.flow > 0){
			this.Vtmax = this.Vti;
			this.PCO2 = 0;
			this.Vte = 0;
			this.VtCO2 = 0;
			}

		else {
			//this.Vte = this.Vtmax - this.Vt;
			this.Vte -= deltaVolume;
			this.updateCO2();
			this.VtCO2 += this.SCO2 * (-deltaVolume);
		}
		this.time += duration;
	}

	updateCO2() {

		var co2 = this.PiCO2 +
			(this.PplCO2 - this.PiCO2)/
			(1 + Math.pow(Math.E,((this.Vdaw - this.Vte)/this.Slope2)));

		if (this.Vte > this.Vdaw) {
			co2 += this.Slope3 * (this.Vte - this.Vdaw);
		}

		this.PCO2 = co2;
	};

	get SCO2() { return this.PCO2/(760-47); }
	get VcAlv() { return this.Vtmax - this.Vdaw; }
	get PplCO2() { return this.PACO2 - (this.Slope3 * (this.VcAlv / 2)); }
}

sv.SimpleLung = class extends sv.Lung {
	constructor(params) {
		super();

		this.defaults = {
			Crs : 50.0,// ml/cmH2O
			Raw : 5.0,
			Pmus   : 0,// cmH2O/l/s
			Vfrc: 2.5
			};

		this.parseDefaults();
		this.Vabs = this.Vfrc;
		this.mechParams = {
			Crs: {unit: "ml/cmH₂O"},
			Raw: {unit: "cmH₂O/l/s"}
		}

	}
	get Pel() {return 1000 * (this.Vabs - this.Vfrc)/ this.Crs;}

}

sv.SptLung = class extends sv.Lung{

	constructor() {

		super();
		this.defaults = {
			Crs : 30.0 ,// ml/cmH2O
			Raw : 20.0 ,// cmH2O/l/s
			Fspt : 14.0 ,// c/min
			Ti : 1 , // sec
			Pmax : 6.5, // cmH20
			Vabs: 0, // Have to be initialised
			time : 0 // Have to be initialised
		}

		this.parseDefaults();
		this.mechParams = {
			Crs: {unit: "ml/cmH₂O"},
			Raw: {unit: "cmH₂O/l/s"},
			Fspt: {unit: "/min."},
			Ti: {unit: "sec."},
			Pmax: {unit: "cmH₂O"}
		}
	}

	get Pmus(){
		var mTime = this.time % (60.0/this.Fspt);

		if(mTime<this.Ti && this.Fspt > 0){
			return 0.5 * this.Pmax * (1 + Math.sin(
						(2*Math.PI )* (mTime / this.Ti)- Math.PI/2
					));
		}
		else{ return 0; }
	}

	get Pel() {return 1000 * this.Vabs/ this.Crs;}
}

sv.SygLung = class extends sv.Lung{

	constructor() {

		super();
		this.defaults = {
					 // Mechanical parameters
					 Vmax : 4.0,
					 Vmin : 0.0,
					 Pid : 5.0,
					 Kid : 20.0,
					 Pmus:0,
					 Raw : 5.0 // cmH2O/l/s
					 };

		this.parseDefaults();

		this.mechParams = {
			Vmax: {unit: "l"},
			Vmin: {unit: "l"},
			Pid: {unit: "cmH₂O"},
			Kid: {unit: "cmH₂O"},
			Raw: {unit: "cmH₂O/l/s"}
		};

		this.flow = 0.0;
		this.Vabs = this.volume(0);
		console.log(this.Vabs);
	}


	volume(P){
		return this.Vmin + (this.Vmax - this.Vmin)/(1.0+Math.exp(-(P - this.Pid)/this.Kid))
	}

	get Pel() {
		return this.Pid - (this.Kid * Math.log(((this.Vmax - this.Vmin)/(this.Vabs- this.Vmin))-1));
	}
}

sv.RLung = class extends sv.Lung {

	this.defaults = {
			  // Mechanical parameters
			  Vmax : 4.0,
			  VmaxExp : 4.0,
			  Vmin : 0.0,
			  VminInsp : 0.0,
			  PidInsp : 10.0,
			  PidExp : -10.0,
			  Pid : 0,
			  Kid : 20.0,
			  Raw : 5.0,// cmH2O/l/s
			  flow : 0.0,
			  lastFlow : 0.0,
			  Vtmax : 0
	};

	this.Vabs= this.volume(0);

	this.mechParams = {
		Vmax: {unit: "l"},
		Vmin: {unit: "l"},
		PidInsp: {unit: "cmH₂O"},
		PidExp: {unit: "cmH₂O"},
		Kid: {unit: "cmH₂O"},
		Raw: {unit: "cmH₂O/l/s"}
	};

	volume(P){
		return this.Vmin + (this.Vmax - this.Vmin)/(1.0+Math.exp(-(P - this.Pid)/this.Kid))
	}

	fit(){
			if (this.flow > 0 && this.lastFlow < 0){
				var N = 1 + Math.pow(Math.E,-((this.Palv - this.PidInsp)/this.Kid));
				this.VminInsp = (N * this.Vabs- this.Vmax)/(N-1);
			}
			else if (this.flow < 0 && this.lastFlow > 0){
				var N = 1 + Math.pow(Math.E,-((this.Palv - this.PidExp)/this.Kid));
				this.VmaxExp = this.Vmin + (this.Vabs- this.Vmin) * N;
			}

			this.lastFlow = this.flow;
			}

	appliquer_debit (flow, duration){
			if(isNaN(flow)){throw "Function debit: NaN value passed as flow" }

			this.flow = flow ; // l/s
			deltaVolume = this.flow * duration; // l
			this.Vabs+= deltaVolume; // l
			this.Vti += deltaVolume;

			get Palv(){
				this.fit();

				if (this.flow > 0){
				  return this.PidInsp - (this.Kid * Math.log(((this.Vmax - this.VminInsp)/(this.Vabs- this.VminInsp))-1));
					}

				else {
					return this.PidExp - (this.Kid * Math.log(((this.VmaxExp - this.Vmin)/(this.Vt - this.Vmin))-1));
					}
			}
	}
	};
}
//******************************
//	Ventilator models
//******************************

sv.PressureAssistor = function(){

	this.logParam = sv.logParam;
	this.log = function(){this.logParam("ventParams");}

	this.Passist = 25.0;
	this.PEEP = 0.0;
	this.Cycling = 10;
	this.Ftrig = 0.1;

	this.ventParams = {
		Passist:{unit: "cmH₂O"},
		PEEP:{unit: "cmH₂O"},
		Ftrig:{unit:"l/min."},
		Cycling:{unit: "%"},
	};

	this.Tsampl = 0.02;
	this.Tvent = 12.0;
	//this.nbcycles = 4;

	this.simParams = {
		Tsampl:{unit: "s"},
		Tvent: {uni: "s"}
	//	nbcycles:{}
	};

	this.time = 0;

	this.ventilate = function(lung){

		var timeData = [];
		var respd = [];
		this.time = 0.0;

		//for (c=0;c < this.nbcycles;c++){
		while(this.time <= this.Tvent){
			// Attente d'un declecnchement

			this.Fstop = 0;
			this.Fmax = 0;
			this.Pao = this.PEEP;
			while (lung.flow < this.Ftrig && this.time <= this.Tvent){
				lung.appliquer_pression(this.PEEP, this.Tsampl)
				timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;
				//if (lung.flow > this.Fmax) {this.Fmax = lung.flow;}
				//else {this.Fstop = this.Cycling * this.Fmax / 100;}
			}

			// Phase inspiratoire
			this.Pao = this.Passist;
			while (lung.flow > this.Fstop && this.time <= this.Tvent){
				lung.appliquer_pression(this.Passist, this.Tsampl)
				timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;

				if (lung.flow > this.Fmax) {this.Fmax = lung.flow;}
				this.Fstop = this.Cycling * this.Fmax / 100;
			}
			lung.appliquer_pression(this.PEEP, this.Tsampl)
		}
		return {timeData: timeData};
	};

	this.updateCalcParams = function(){
		for (index in this.ventParams){
			if(this.ventParams[index].calculated == true){
				var fname = "update" + index;
				this[fname]();
			}
		}
	}

	this.updateCalcParams();

};

sv.PressureControler = function(){

	this.logParam = sv.logParam;
	this.log = function(){this.logParam("ventParams");}

	this.Pinspi = 10.0;
	this.PEEP = 0.0;
	this.Ti = 1;
	this.Fconv = 12;

	this.ventParams = {
		Pinspi:{unit: "cmH₂O"},
		PEEP:{unit: "cmH₂O"},
		Fconv:{unit:"/min."},
		Ti:{unit: "cmH₂O"},
		Te:{calculated: true, unit: "sec."},
		Tcycle:{calculated: true, unit: "sec."}
	};

	this.updateTcycle = function(){
		this.Tcycle = 60 / this.Fconv;
	};

	this.updateTe = function(){
		this.Te = (60 / this.Fconv) - this.Ti;
	};

	this.Tsampl = 0.02;
	this.nbcycles = 3;

	this.simParams = {
		Tsampl:{unit: "s"},
		nbcycles:{}
	};

	this.time = 0;

	this.ventilate = function(lung){

		var timeData = [];
		var respd = [];
		this.time = 0.0;
		for (c=0;c < this.nbcycles;c++){
			var tdeb = this.time;

			this.Pao = this.Pinspi;
			lung.Vti = 0;
			while(this.time < (tdeb + this.Ti)){
				lung.appliquer_pression(this.Pao, this.Tsampl)

				timeData.push(sv.log(lung, this));

				this.time += this.Tsampl;
			}


			this.Pao = this.PEEP
			while(this.time < (tdeb + (60/this.Fconv))){
				this.Pao = this.PEEP
				lung.appliquer_pression(this.Pao, this.Tsampl)
				timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;
			}
			var pmeco2 = ((760-47) * lung.veco2/lung.vce);
			respd.push({
				pmeco2:pmeco2,
				petco2:lung.pco2,
				pAco2: lung.PACO2,
				fowler: lung.Vem/lung.vce,
				bohr: (lung.PACO2 - pmeco2)/lung.PACO2,
			});
		}

		return {
			timeData: timeData,
			respd:respd
		};
	};

	this.updateCalcParams = function(){
		for (index in this.ventParams){
			if(this.ventParams[index].calculated == true){
				var fname = "update" + index;
				this[fname]();
			}
		}
	}

	this.updateCalcParams();

};

sv.PVCurve = function(){

	this.Pstart = -100.0;
	this.Pmax = 100;
	this.Pstop = -100;
	this.Pstep = 10;
	this.Tman = 10;

	this.ventParams = {
		Pstart: {unit: "cmH₂O"},
		Pmax: {unit: "cmH₂O"},
		Pstop: {unit: "cmH₂O"},
		Pstep: {unit: "cmH₂O"},
		Tman: {unit: "s"}
	};

	this.Tsampl = 0.001;

	this.time = 0;

	this.ventilate = function(lung){

		var timeData = [];
		var respd = [];

		this.time = 0.0;
		this.nbStep = ((this.Pmax - this.Pstart)+(this.Pmax - this.Pstop)) /this.Pstep
		this.Ti = this.Tman / this.nbStep
		this.Pao = this.Pstart

		while(this.Pao < this.Pmax){

			var tdeb = this.time;
			lung.Vti = 0;

			while(this.time < (tdeb + this.Ti)){
				lung.appliquer_pression(this.Pao, this.Tsampl)
				timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;
			}

			this.Pao += this.Pstep;
		}

		while(this.Pao > this.Pstop){

			var tdeb = this.time;
			lung.Vti = 0;

			while(this.time < (tdeb + this.Ti)){
				lung.appliquer_pression(this.Pao, this.Tsampl)
				timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;
			}

			this.Pao -= this.Pstep;
		}

		return {
			timeData: timeData,
			respd:respd
		};
	};

	this.updateCalcParams = function(){
		for (index in this.ventParams){
			if(this.ventParams[index].calculated == true){
				var fname = "update" + index;
				this[fname]();
			}
		}
	}

	this.updateCalcParams();
};

sv.Phasitron = {};
sv.Phasitron.Fop = function(Fip, Pao){
	if(Pao >= 0 && Pao <=40){
		return Fip + (Fip * (5 -(Pao/8)));
	}
	else if(Pao > 40){return Fip;}
	else if(Pao < 0){return 6 * Fip;}
};

sv.VDR = function(){

	this.Tvent= 12; //The length of time the lung will be ventilated
	this.Tsampl = 0.001;
	this.Tramp= 0.005;
	this.Rexp= 1; // cmH2O/l/s. To be adjusted based on the visual aspect of the curve.
	this.rAvg= 2;
	this.lowPass= 3;

	this.simParams = {
		Tvent: {unit: "s"},
		Tsampl: {unit: "s"},
		Tramp: {unit: "s"},
		Rexp: {unit: "cmH₂O/l/s"},
		rAvg: {},
		lowPass: {}
	};

	this.Tic= 2; // Convective inspiratory time
	this.Tec= 2; // Convective expiratory time
	this.Fperc= 500;
	this.Rit= 0.5; //Ratio of inspiratory time over total time (percussion)
	this.Fipl= 0.18; // 	
	this.Fiph= 1.8; // 
	this.CPR = 0;

	this.ventParams = {
		Tic: {unit: "s"},
		Tec: {unit: "s"},
		Fconv: {unit: "s", calculated: true},
		Fperc: {unit: "/min"},
		Fhz: {unit: "hz", calculated: true},
		Rit: {},
		Fiph: {unit: "l/s"},
		Fipl: {unit: "l/s"},
		CPR: {}
	};

	this.updateFconv = function(){
		this.Fconv = 60 / (this.Tic + this.Tec);
	}

	this.updateFhz = function(){
		this.Fhz = this.Fperc / 60;
	}

	this.dataToFilter= [
			"Pao",
			"Flung"
		];

	//Variable data

	this.time= 0; //The pseudo internal clock of the ventilator
	this.Fop=0; //Phasitron output flow
	this.Fip=0; //Phasitron output flow
	this.Pao=0;//Presure at the ariway openning (phasitron output)
	this.CycleC=0;

	this.percussiveExpiration = function(lung, Rexp){

		// Must be executed in a scope where the timeData container is defined
		lung.flow = 0;
		this.Fip = 0;
		this.Fop = 0;
		this.stateP = 0;
		lung.Vtep = 0;

		var tStopPerc = this.time + this.Tep;
		while (this.time < tStopPerc){
			this.Pao = - lung.flow * Rexp;
			
			flow = (this.Pao - lung.Palv)/lung.Raw;
			lung.appliquer_debit(flow, this.Tsampl);
			timeData.push(sv.log(lung, this));
			this.time += this.Tsampl;
		}
	}

	this.percussiveInspiration = function(lung, inFlow){
		// Must be executed in a scope where te timeData container is defined
		this.stateP = 1;
		lung.Vtip = 0;
		this.Fip = inFlow
		var tStartInsp = this.time;
		var tStopPerc = this.time + this.Tip;

		while (this.time < tStopPerc){

			this.Fip = inFlow;
			this.Pao = (this.Fop * lung.Raw) + lung.Palv;
			this.Fop = sv.Phasitron.Fop(this.Fip, this.Pao);
			lung.appliquer_debit(this.Fop, this.Tsampl);
			
			timeData.push(sv.log(lung, this));
			this.time += this.Tsampl;
		}
		
	}

	this.convectiveInspiration = function(lung){
		var tStopConv = this.time + this.Tic;
		var tCPR = this.time + 0.8;
		this.CycleC=1;
		while (this.time < tStopConv && this.time < this.Tvent){
			if (this.time < tCPR){
				var inflow = this.Fiph;
			}
			else {var inflow = this.Fiph * (1 + this.CPR);}
			this.percussiveInspiration(lung, inflow);

			if (this.time < tCPR){
				this.percussiveExpiration(lung, this.Rexp);
			}
			else {
				this.percussiveExpiration(lung, this.Rexp *  (1 + this.CPR));
			}
			percData.push(sv.logPerc(lung, this));
		}
	}

	this.convectiveExpiration = function(lung){
		var tStopConv = this.time + this.Tec;
		this.CycleC=0;
		while (this.time < tStopConv && this.time < this.Tvent){
			this.percussiveInspiration(lung, this.Fipl);
			this.percussiveExpiration(lung, this.Rexp);
			percData.push(sv.logPerc(lung, this));
		}
	}

	this.ventilate = function(lung){

		this.Ttot = 60 / this.Fperc;
		this.Tip = this.Ttot * this.Rit;
		this.Tep = this.Ttot - this.Tip;

		timeData = [];
		convData = [];
		percData = [];

		while (this.time < this.Tvent){
			
			this.convectiveExpiration(lung);
			//convData.push(this.logConv());
			this.convectiveInspiration(lung);

		}

		if(this.lowPass > 1){

			for (index in this.dataToFilter){
				var id = this.dataToFilter[index];
				var smoothed = timeData[0][id];
				for (var jndex = 1, len = timeData.length; jndex<len; ++jndex){
					var currentValue = timeData[jndex][id];
					smoothed += (currentValue - smoothed) / this.lowPass;
					timeData[jndex][id] = smoothed;
				}

			}
		}

		if(this.rAvg >= 2){

			for (index in this.dataToFilter){
				sv.avg(timeData, this.dataToFilter[index], this.rAvg);
			}
		}
		
		return {
			timeData: timeData,
			percData: percData,
			convData: convData
		};
	};

	this.updateCalcParams = function(){
		for (index in this.ventParams){
			if(this.ventParams[index].calculated == true){
				var fname = "update" + index;
				this[fname]();
			}
		}
	}

	this.updateCalcParams();

};

sv.FlowControler = function(){

	this.logParam = sv.logParam;
	this.log = function(){this.logParam("ventParams");}

	this.Vt = 0.5;
	this.PEEP = 0.0;
	this.Ti = 1;
	this.Fconv = 12;

	this.ventParams = {
		Vt:{unit: "l"},
		PEEP:{unit: "cmH₂O"},
		Fconv:{unit:"/min."},
		Ti:{unit: "cmH₂O"},
		Te:{calculated: true, unit: "sec."},
		Tcycle:{calculated: true, unit: "sec."}
	};

	this.updateTcycle = function(){
		this.Tcycle = 60 / this.Fconv;
	};

	this.updateTe = function(){
		this.Te = (60 / this.Fconv) - this.Ti;
	};

	this.Tsampl = 0.02;
	this.nbcycles = 3;

	this.simParams = {
		Tsampl:{unit: "s"},
		nbcycles:{}
	};

	this.time = 0;
	
	this.ventilate = function(lung){

		var timeData = [];
		var convData = [];
		this.time = 0.0;
		
		this.Flow = this.Vt / this.Ti;
		for (c=0;c < this.nbcycles;c++){
			var tdeb = this.time;

			lung.Vti = 0;
			while(this.time < (tdeb + this.Ti)){
				lung.appliquer_debit(this.Flow, this.Tsampl)
				this.Pao = lung.Palv + (this.Flow * lung.Raw);
				timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;	
			}


			this.Pao = this.PEEP
			while(this.time < (tdeb + (60/this.Fconv))){
				lung.appliquer_pression(this.Pao, this.Tsampl)
				timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;	
			}

			var pmeco2 = ((760-47) * lung.veco2/lung.vce);

			convData.push({
				pmeco2:pmeco2,
				petco2:lung.pco2,
				pAco2: lung.PACO2,
				fowler: lung.Vem/lung.vce,
				bohr: (lung.PACO2 - pmeco2)/lung.PACO2,
			});
		}

		return {
			timeData: timeData,
			convData:convData
		};
	};
	
	this.updateCalcParams = function(){
		for (index in this.ventParams){
			if(this.ventParams[index].calculated == true){
				var fname = "update" + index;
				this[fname]();
			}
		}
	}

	this.updateCalcParams();

}

sv.logParam = function(dataset){
	table = {};
	for (param in this[dataset]){
		table[param] = this[param];
	}
	console.table(table);
}
sv.PresureControler = sv.PressureControler;
