---
title: simvent.js
extra_head: 
	<script src="https://raw.githubusercontent.com/ProgRT/VDR.js/master/simvent.js"></script>
---
simvent.js is a mechanical ventilation simulation library. It use mathematicla models to simulate the ventilation of lungs by medical ventilators. At the moment, the simvent.jslibrary provide one lung model - a basic one compartment lung with linear compliance - ant two ventilator models : a time cycled presure controler and a VDR-4-like high frequency ventilator. Using the ventilate method of the ventilators on a lung return a serie of data -JSON format- wich you can plot with you can plot with your favorite javascript plotting library. 
