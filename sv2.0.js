//**************************
//	Lung models
//**************************

/**
 * Base class upon wich are build lung models.
 */
sv.Lung = class {
	constructor(params) {

		this.defaults = {
			Tsampl: 0.001,

			// Gaz exchange parameters

			Vdaw   : 0.1,
			PiCO2  : 0.0,
			PACO2  : 35.0,
			Slope2 : 0.003,
			Slope3 : 5
		};
		
		document.write(typeof params);
		if (typeof params !== 'undefined'){
			this.initParams(params);
		}
		else {
			this.initParams();
		}
	}

	initParams(params) {
		
		for (data in this.defaults) {
			if (typeof params[data] !== 'undefined'){
			//	this[data] = params[data];
			}
			else {
			//	this[data] = this.defaults[data];
			}
		}

	}

	appliquer_pression(pression, duree) {

		var time = 0.0;
		var deltaVolume = 0.0;

		while (time < duree){

			var flow = (pression - this.Palv) / this.Raw ; // l/s
			this.appliquer_debit(flow, this.Tsampl);

			time += this.Tsampl;
		}
	};

	get co2() {

		this.VcAlv = this.Vtmax - this.Vdaw;
		this.PplCO2 = this.PACO2 - (this.Slope3 * (this.VcAlv / 2));

		var co2 = this.PiCO2 + 
			(this.PplCO2 - this.PiCO2)/
			(1 + Math.pow(Math.E,((this.Vdaw - this.Vte)/this.Slope2)))

		if (this.Vte > this.Vdaw) {
			co2 += this.Slope3 * (this.Vte - this.Vdaw);
		}

		return co2;
	};

	get SCO2() { return this.PCO2/(760-47); }
}
/*
sv.DeuxSimpleLung = class extends sv.Lung {
	constructor(params) {
		super();

		this.defaults = {
			Crs : 50.0,// ml/cmH2O
			Raw : 5.0// cmH2O/l/s
		};

		this.initParams(params);
		this.mechParams = {
			Crs: {unit: "ml/cmH₂O"},
			Raw: {unit: "cmH₂O/l/s"}
		}

		//Propriété dynamiques
		this.PCO2  = 0;
		this.SCO2  = 0;
		this.Vt    = 0.0;
		this.Palv  = 0.0;
		this.flow  = 0.0;
		this.Vtmax = 0;
		this.VtCO2 = 0;
	}	
	get Palv() {return 1000 * this.Vt / this.Crs;}
	
	appliquer_debit (flow, duration){

		if(isNaN(flow)){
			throw "sv.SimpleLung.appliquer_debit: NaN value passed as flow";
		}	

		this.flow = flow ; // l/s
		deltaVolume = this.flow * duration; // l
		this.Vt += deltaVolume; // l
		this.Vti += deltaVolume;

		if (this.flow > 0){
			this.Vtmax = this.Vt;
			this.PCO2 = 0;
			this.Vte = 0;
			this.SCO2 = 0;
			this.VtCO2 = 0;
		}

		else {
			this.Vte = this.Vtmax - this.Vt;
			this.SCO2 = this.PCO2/(760-47);
			this.VtCO2 += this.SCO2 * (-deltaVolume);
		}
	}
}
*/

var lung = new sv.Lung();
