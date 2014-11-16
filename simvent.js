var ssv = {} // SSV pour Simplified SimVent

ssv.PoumonCool = function(){

	// Propriété statiques
	this.echantillonnage = 0.001; // Secondes
	this.compliance = 50.0 ;// ml/cmH2O
	this.resistance = 5.0 ;// cmH2O/l/s
	this.Vem = 0.1;
	this.PiCO2 = 0.0;
	this.PACO2 = 35.0;
	this.Pente2 = 0.003;
	this.Pente3 = 5;

	//Propriété dynamiques
	this.pco2 = 0;
	this.fco2 = 0;
	this.vc = 0.0;
	this.palv = 0.0;
	this.debit = 0.0;
	this.vcmax = 0;
	this.veco2 = 0;
	
	this.appliquer_pression = function (pression, duree){

		var temps = 0.0;
		var deltaVolume = 0.0;

		while (temps < duree){

			this.debit = (pression - this.palv) / this.resistance ; // l/s
			deltaVolume = this.debit * this.echantillonnage; // l
			this.vc += deltaVolume; // l
			this.palv = (1000 *this.vc)  / (this.compliance);

			if (this.debit > 0){
				this.vcmax = this.vc;
				this.pco2 = 0;
				this.vce = 0;
				this.fco2 = 0;
				this.veco2 = 0;
			}
			else {
				this.vce = this.vcmax - this.vc;
				this.pco2 = this.co2(this.vce);
				this.fco2 = this.pco2/(760-47);
				this.veco2 += this.fco2 * (-deltaVolume);
			}

			temps += this.echantillonnage;
		}
	};

	this.co2 = function(volume){

		this.VcAlv = this.vcmax - this.Vem;
		this.PplCO2 = this.PACO2 - (this.Pente3 * (this.VcAlv / 2));

		co2 = this.PiCO2 + (this.PplCO2 - this.PiCO2)/(1 + Math.pow(Math.E,((this.Vem - volume)/this.Pente2)))

		if (volume > this.Vem) {
			co2 += this.Pente3 * (volume - this.Vem);
		}

		return co2;
	};


};


ssv.GenerateurPression = function(){
	this.Pinspi = 10;
	this.PEP = 0;
	this.Ti = 1;
	this.temps = 0;
	this.echantillonnage = 0.001;
	this.nbcycles = 3;
	
	this.ventiler = function(poumon){

		var ventd = [];
		var respd = [];
		this.temps = 0.0;
		for (c=0;c < this.nbcycles;c++){
			var tdeb = this.temps;

			while(this.temps < (tdeb + this.Ti)){
				poumon.appliquer_pression(this.Pinspi, this.echantillonnage)

				ventd.push({
					temps: this.temps,
					debit: poumon.debit,
					palv: poumon.palv,
					pcirc: this.Pinspi,
					vc: poumon.vc,
					vce: poumon.vce,
					pco2: poumon.pco2,
					fco2: poumon.fco2,
					vco2: poumon.veco2
				});

				this.temps += this.echantillonnage;	
			}

			while(this.temps < (tdeb + this.Ti *3)){
				poumon.appliquer_pression(this.PEP, this.echantillonnage)
				ventd.push({
					temps: this.temps,
					debit: poumon.debit,
					palv: poumon.palv,
					pcirc: this.PEP,
					vc: poumon.vc,
					vce: poumon.vce,
					pco2: poumon.pco2,
					fco2: poumon.fco2,
					vco2: poumon.veco2
				});
				this.temps += this.echantillonnage;	
			}
			var pmeco2 = ((760-47) * poumon.veco2/poumon.vce);
			respd.push({
				pmeco2:pmeco2,
				petco2:poumon.pco2,
				pAco2: poumon.PACO2,
				fowler: poumon.Vem/poumon.vce,
				bohr: (poumon.PACO2 - pmeco2)/poumon.PACO2,
			});
		}

		return {ventd: ventd, respd:respd};
	};

};
