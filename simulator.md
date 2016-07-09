---
title: Simulator
layout: simulator
order: 1
---
<div id="graphics"></div>
<div id="control" class="hidden"></div>

<script src="https://rawgit.com/ProgRT/FrontPanelJS/master/dygraph-combined.js"></script>
<script src="https://rawgit.com/ProgRT/FrontPanelJS/master/synchronizer.js"></script>
<script src="https://rawgit.com/ProgRT/FrontPanelJS/master/dict.js"></script>
<script src="https://rawgit.com/ProgRT/FrontPanelJS/master/frontPanel.js"></script>
<script>
fp.dygraphConf.axisLabelWidth = 25;
fp.dygraphConf.titleHeight = 30;
fp.paramContainer = "#control";
fp.jparamContainer = "control";
		fp.timeSeries = ["Pao","Flung","Vt", "PCO2"];
		fp.ventModels = ["FlowControler", "PresureControler", "VDR", "PVCurve"];
		fp.ventModel = "FlowControler";
		fp.lungModel = "SimpleLung";
		fp.init()
</script>
<script>
function togglecontrol(){
	var ctrlClass = document.getElementById("control").classList
	if(ctrlClass.contains("hidden")){
		ctrlClass.remove("hidden");
	}
	else{
		ctrlClass.add("hidden");
	}

	
}
setTimeout(togglecontrol,1000);
</script>
