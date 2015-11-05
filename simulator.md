---
title: Simulator
layout: simulator
---
<div id="graphics"></div>
<div id="control"></div>

<script src="https://rawgit.com/ProgRT/FrontPanelJS/master/dygraph-combined.js"></script>
<script src="https://rawgit.com/ProgRT/FrontPanelJS/master/synchronizer.js"></script>
<script src="https://rawgit.com/ProgRT/FrontPanelJS/master/dict.js"></script>
<script src="https://rawgit.com/ProgRT/FrontPanelJS/master/frontPanel.js"></script>
<script>
fp.paramContainer = "#control";
fp.jparamContainer = "control";
		fp.timeSeries = ["Pao","Flung","Vt"];
		fp.ventModel = "PresureControler";
		fp.lungModel = "SimpleLung";
		fp.init()
</script>
