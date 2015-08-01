var sv = {}

sv.log = function(lung, vent){
	return {

		// Lung variables
		
		time: vent.time,
		Flung: lung.flow,
		Palv: lung.Palv,
		Vt: lung.Vt,
		Vti: lung.Vti,
		Vte: lung.Vte,
		PCO2: lung.PCO2,
		SCO2: lung.SCO2,
		VCO2: lung.VtCO2,

		// Ventilator variables

		Pao: vent.Pao,
		Fip: vent.Fip,
		Fop: vent.Fop,
		stateP: vent.stateP,
		Pcirc: vent.Pcirc
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
	
	//console.log("Averaging " + data);
	
	for(i = 0; i < dataset.length - (Nroll -1); i ++){
		
		var curent = i;

		var avged = dataset[curent][data];

		//avged += dataset[curent +1][data];

		for(i2 = curent + 1; i2 < (curent + Nroll) ; i2 ++){
			avged += dataset[i2][data];
		}

		dataset[curent][data] = avged/Nroll;
	}
}

sv.SimpleLung = function(){

	// Propriété statiques
	this.Tsamp = 0.001; // Secondes
	this.Crs = 50.0 ;// ml/cmH2O
	this.Raw = 5.0 ;// cmH2O/l/s
	this.Vdaw = 0.1;
	this.PiCO2 = 0.0;
	this.PACO2 = 35.0;
	this.Pente2 = 0.003;
	this.Pente3 = 5;

	//Propriété dynamiques
	this.PCO2 = 0;
	this.SCO2 = 0;
	this.Vt = 0.0;
	this.Palv = 0.0;
	this.flow = 0.0;
	this.Vtmax = 0;
	this.VtCO2 = 0;
	
	this.appliquer_pression = function (pression, duree){

		var time = 0.0;
		var deltaVolume = 0.0;

		while (time < duree){

			this.flow = (pression - this.Palv) / this.Raw ; // l/s
			deltaVolume = this.flow * this.Tsamp; // l
			this.Vt += deltaVolume; // l
			this.Palv = (1000 *this.Vt)  / (this.Crs);

			if (this.flow > 0){
				this.Vtmax = this.Vt;
				this.PCO2 = 0;
				this.Vte = 0;
				this.SCO2 = 0;
				this.VtCO2 = 0;
			}

			else {
				this.Vte = this.Vtmax - this.Vt;
				this.PCO2 = this.co2(this.Vte);
				this.SCO2 = this.PCO2/(760-47);
				this.VtCO2 += this.SCO2 * (-deltaVolume);
			}

			time += this.Tsamp;
		}
	};

	this.co2 = function(volume){

		this.VcAlv = this.Vtmax - this.Vdaw;
		this.PplCO2 = this.PACO2 - (this.Pente3 * (this.VcAlv / 2));

		co2 = this.PiCO2 + (this.PplCO2 - this.PiCO2)/(1 + Math.pow(Math.E,((this.Vdaw - volume)/this.Pente2)))

		if (volume > this.Vdaw) {
			co2 += this.Pente3 * (volume - this.Vdaw);
		}

		return co2;
	};

};


sv.PresureControler = function(){
	this.Pinspi = 10;
	this.PEEP = 0;
	this.Ti = 1;
	this.time = 0;
	this.echantillonnage = 0.001;
	this.nbcycles = 3;
	
	this.ventilate = function(lung){

		var timeData = [];
		var respd = [];
		this.time = 0.0;
		for (c=0;c < this.nbcycles;c++){
			var tdeb = this.time;

			this.Pao = this.Pinspi;
			while(this.time < (tdeb + this.Ti)){
				lung.appliquer_pression(this.Pao, this.echantillonnage)

				timeData.push(sv.log(lung, this));

				this.time += this.echantillonnage;	
			}

			this.Pao = this.PEEP
			while(this.time < (tdeb + this.Ti *3)){
				this.Pao = this.PEEP
				lung.appliquer_pression(this.Pao, this.echantillonnage)
				timeData.push(sv.log(lung, this));
				this.time += this.echantillonnage;	
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

};


//  *****************************************
//  VDR Ventilator
//  *****************************************


sv.Phasitron = {};
sv.Phasitron.Fop = function(Fip, Pao){
	if(Pao >= 0 && Pao <=40){
		return Fip + (Fip * (5 -(Pao/8)));
	}
	else if(Pao > 40){return Fip;}
	else if(Pao < 0){return 6 * Fip;}
};

sv.VDR = function(){
	this.Tsampl = 0.001;
	this.Tramp= 0.005;
	this.Tvent= 12; //The length of time the lung will be ventilated
	this.Tic= 2; // Convective inspiratory time
	this.Tec= 2; // Convective expiratory time
	this.Fperc= 500;
	this.Rit= 0.5; //Ratio of inspiratory time over total time (percussion)
	this.Fipl= 0.18; // Percussive expiratory time
	this.Fiph= 1.8; // Percussive expiratory time

	/* Presure at the airway openning does not usualy fall
	 * immediatly at zero during expiratory phase. This suggest
	 * a small resistance of the txpiratory circuit.
	 */
	this.Rexp= 0.5; // cmH2O/l/s. To be adjusted based on the visual aspect of the curve.
	
	this.rolingAverage= 2;
	this.lowPassFactor= 2;


	this.dataToFilter= [
			"Pao",
			"Flung"
		];

	//Variable data

	this.time= 0; //The pseudo internal clock of the ventilator
	this.Fop=0; //Phasitron output flow
	this.Fip=0; //Phasitron output flow
	this.Pao=0;//Presure at the ariway openning (phasitron output)

	this.percussiveExpiration = function(lung){
		// Must be executed in a scope where te timeData container is defined
		lung.flow = 0;
		this.Fip = 0;
		this.Fop = 0;
		this.stateP = 0;
		lung.Vtep = 0;
		var tStopPerc = this.time + this.Tep;
		while (this.time < tStopPerc){
			this.Pao = - lung.flow * this.Rexp;
			
			lung.flow = (this.Pao - lung.Palv)/lung.Raw;
			//lung.flow = -9;
			var deltaVol = lung.flow * this.Tsampl;
			lung.Vt += deltaVol;
			lung.Vtep += deltaVol;
			lung.Palv = 1000 * lung.Vt / lung.Crs;
			
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
		var tStopRamp = this.time + this.Tramp;
		var tStopPerc = this.time + this.Tip;

		while (this.time < tStopPerc){

			this.Fip = inFlow;
			this.Pao = (this.Fop * lung.Raw) + lung.Palv;
			this.Fop = sv.Phasitron.Fop(this.Fip, this.Pao);
			lung.flow = this.Fop;

			var deltaVol = this.Fop * this.Tsampl;
			lung.Vt += deltaVol;
			lung.Vtip += deltaVol;
			lung.Palv = 1000 * lung.Vt / lung.Crs;
			
			timeData.push(sv.log(lung, this));
			this.time += this.Tsampl;
		}
		
	}

	this.convectiveInspiration = function(lung){
		var tStopConv = this.time + this.Tic;
		while (this.time < tStopConv && this.time < this.Tvent){
			this.percussiveInspiration(lung, this.Fiph);
			this.percussiveExpiration(lung);
			percData.push(sv.logPerc(lung, this));
		}
	}

	this.convectiveExpiration = function(lung){
		var tStopConv = this.time + this.Tec;
		while (this.time < tStopConv && this.time < this.Tvent){
			this.percussiveInspiration(lung, this.Fipl);
			this.percussiveExpiration(lung);
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

		if(this.lowPassFactor > 1){

			for (index in this.dataToFilter){
				var id = this.dataToFilter[index];
				var smoothed = timeData[0][id];
				for (var jndex = 1, len = timeData.length; jndex<len; ++jndex){
					var currentValue = timeData[jndex][id];
					smoothed += (currentValue - smoothed) / this.lowPassFactor;
					timeData[jndex][id] = smoothed;
				}

			}
		}

		if(this.rolingAverage >= 2){

			for (index in this.dataToFilter){
				sv.avg(timeData, this.dataToFilter[index], this.rolingAverage);
			}
		}
		
		return {
			timeData: timeData,
			percData: percData,
			convData: convData
		};
	};

};
