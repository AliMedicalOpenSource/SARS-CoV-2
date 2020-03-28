import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Fill, Stroke, Style, Text} from 'ol/style';
import {defaults as defaultControls} from 'ol/control';
import MousePosition from 'ol/control/MousePosition';
import {createStringXY} from 'ol/coordinate';
import $ from "jquery";
var url_distribution = "https://cors-anywhere.herokuapp.com/http://opendata.ecdc.europa.eu/covid19/casedistribution/json/";
var url_distribution1="https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_daily_reports/03-27-2020.csv";

var url_us =	"https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
var url_mexico ="https://raw.githubusercontent.com/aaronali/click_that_hood/master/public/data/mexico.geojson";

var caseDisribution; 
function getCaseDistribution( ) {
	$.getJSON({
		url: url_distribution,
		success: function(data){
			caseDisribution=data;
			console.log(data);

			getDailyReport();
		},
		error: function (e){
			console.log(e);
		}
	})
} 

var caseDataMaster="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";
function getDailyReport(){
	 var d = new Date();
	  var n = "03-27-2020.csv";
	$.getJSON({
		url: caseDataMaster+n,
		success: function(data){
			caseDisribution=data;
			console.log(data);
		},
		error: function (e){
			console.log(e.responseText);
			var s = e.responseText.split(/\n/);
			console.log(s);
		}
	})
	
}
getCaseDistribution(); 
var selectedCountry='';
 
function getCountryCases(code){
	var data=null;

	for(var temp = 0 ; temp < caseDisribution.records.length-1;temp++){
		if(caseDisribution.records[temp].countryterritoryCode.toLowerCase().indexOf(code.toLowerCase())==0	){
			if(data==null){ 
				data = caseDisribution.records[temp];
			}

			var d1 = new Date(data.dateRep);
			var d2 = new Date(caseDisribution.records[temp].dateRep);
			if(d1<d2){
				data = caseDisribution.records[temp];
			}

		}
	} 

	var cfr =  (((data.deaths!=null?data.deaths:0)/(data.cases!=null?data.cases:0))*100);
	document.getElementById("info1").innerHTML="<center><i>Date Reported </i><br>"+data.dateRep+'</br>'+
	"<i>Cases Reported </i><br>"+data.cases+'</br>'+
	"<i>Deaths Reported </i><br>"+data.deaths+'</br>'+
	"<i>Population (2018) </i><br>"+data.popData2018+'</br>'+
	"<i>Total Infection </i><br>"+((data.cases/data.popData2018)*100)+'</br>'+
	"<i>CFR</i><br>"+(isNaN(cfr)?0:cfr)+'</br></center>';
}; 





var mousePositionControl = new MousePosition({
	coordinateFormat: createStringXY(4),
	projection: 'EPSG:4326',
	// comment the following two lines to have the mouse position
	// be placed within the map.
	className: 'custom-mouse-position',
	target: document.getElementById('mouse-position'),
	undefinedHTML: '&nbsp;'
});





var style = new Style({
	fill: new Fill({
		color: 'rgba(255, 255, 255, 0.6)'
	}),
	stroke: new Stroke({
		color: '#319FD3',
		width: 1
	}),
	text: new Text({
		font: '12px Calibri,sans-serif',
		fill: new Fill({
			color: '#000'
		}),
		stroke: new Stroke({
			color: '#fff',
			width: 3
		})
	})
});





var vectorLayer = new VectorLayer({
	source: new VectorSource({
		url: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
		format: new GeoJSON()
	}),
	style: function(feature) {
		style.getText().setText(feature.get('name'));
		return style;
	}
});




//SOURCES
var source =  new VectorSource({
	url: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
	format: new GeoJSON()
});
var source2 =  new VectorSource({
	url: 'https://raw.githubusercontent.com/aaronali/click_that_hood/master/public/data/canada.geojson',
	format: new GeoJSON()
});


//VECTOR LAYERS
var vectorLayer1 = new VectorLayer({
	source:source2,
	style: function(feature) {
		style.getText().setText(feature.get('name'));
		return style;
	}
});




var vectorLayerCountry = new VectorLayer({
	source: source,
	style: function(feature) {
		style.getText().setText(feature.get('name'));
		return style;
	}
});

//VIEWS
var view =  new View({
	center: [0, 0],
	zoom: 1
});



var viewCountry =  new View({
	center: [0, 0],
	zoom: 1
});





var map = new Map({

	controls: defaultControls().extend([mousePositionControl]),
	layers: [vectorLayer],
	target: 'map',
	view:  new View({
		center: [0, 0],
		zoom: 1
	})
});


var countryMap = new Map({
	layers: [vectorLayerCountry],
	target: 'countryMap',
	view: viewCountry
});


var highlightStyle = new Style({
	stroke: new Stroke({
		color: '#f00',
		width: 1
	}),
	fill: new Fill({
		color: 'rgba(255,0,0,0.1)'
	}),
	text: new Text({
		font: '12px Calibri,sans-serif',
		fill: new Fill({
			color: '#000'
		}),
		stroke: new Stroke({
			color: '#f00',
			width: 3
		})
	})
});

var featureOverlay = new VectorLayer({
	source: new VectorSource(),
	map: map,
	style: function(feature) {
		highlightStyle.getText().setText(feature.get('name'));
		return highlightStyle;
	}
});

var featureOverlayCountry = new VectorLayer({
	source: new VectorSource(),
	map: countryMap,
	style: function(feature) {
		highlightStyle.getText().setText(feature.get('name'));
		return highlightStyle;
	}
});



var highlight;
var highlightCountry;


var displayFeatureInfo = function(pixel, m) { 
	var feature = m.forEachFeatureAtPixel(pixel, function(feature) {
		return feature;
	}); 
	console.log(m); 
	var info = document.getElementById('info');
	if (feature) {
		info.innerHTML = "<center><h3>"+feature.getId() + ': ' + feature.get('name')+"</center></h3>";
		selectedCountry=feature.getId() ;
		getCountryCases(selectedCountry);
	} else {
		info.innerHTML = '&nbsp;';
	} 
	if (feature !== highlight) {
		if (highlight) {
			featureOverlay.getSource().removeFeature(highlight);
		}
		if (feature) {
			featureOverlay.getSource().addFeature(feature);
		}
		highlight = feature;
	} 
};
/**
 * Display country specific  info 
 * 
 */
var displayCountryFeatureInfo = function(pixel, m) { 
	console.log(m);
	var feature = m.forEachFeatureAtPixel(pixel, function(feature) {
		return feature;
	}); 
	console.log(m); 
	var info = document.getElementById('info');
//	if (feature) {
//	info.innerHTML = "<center><h3>"+feature.getId() + ': ' + feature.get('name')+"</center></h3>";
//	selectedCountry=feature.getId() ;
//	getCountryCases(selectedCountry);
//	} else {
//	info.innerHTML = '&nbsp;';
//	} 
	if (feature !== highlight) {
		if (highlightCountry) {
			featureOverlayCountry.getSource().removeFeature(highlightCountry);
		}
		if (feature) {
			featureOverlayCountry.getSource().addFeature(feature);
		}
		highlightCountry = feature;
	} 
};




map.stek =null;
map.on('click', function(evt) {
	console.log(evt);
	vectorLayerCountry.setSource(null);
	if (evt.dragging) { 
		return;
	}
	var pixel = map.getEventPixel(evt.originalEvent);
	displayFeatureInfo(pixel, map);
	displayFeatureInfo(evt.pixel, map);
	var cord = map.getEventCoordinate(evt); 
	cord = evt.coordinate; 
	console.log(mousePositionControl);
	var size = map.getSize(); 
	view.setCenter(cord);
	view.setZoom(4);
	viewCountry.setZoom(3);
	viewCountry.setCenter(cord);
	if(map.stek!=null){
		countryMap.layers=map.stek;
	}
	map.stek = countryMap.getLayers();
	if(selectedCountry=="CAN"){ 
		vectorLayerCountry.setSource(new VectorSource({
			url: 'https://raw.githubusercontent.com/aaronali/click_that_hood/master/public/data/canada.geojson',
			format: new GeoJSON()
		}) );
	}


	if(selectedCountry=="USA"){ 
		vectorLayerCountry.setSource(new VectorSource({
			url: url_us_geo_Json,
			format: new GeoJSON()
		}) );
	}
	var vecLayUrl=null;
	switch(selectedCountry){
	case "MEX":{
		vecLayUrl=url_mexico;
	}
	}

	if(vecLayUrl!=null){
		vectorLayerCountry.setSource(new VectorSource({
			url: vecLayUrl,
			format: new GeoJSON()
		}) );
	}
});

var url_us_geo_Json =	"https://raw.githubusercontent.com/aaronali/click_that_hood/master/public/data/united-states.geojson";



countryMap.on('click', function(evt) {
	console.log(evt);
	//  vectorLayerCountry.setSource(null);
	if (evt.dragging) { 
		return;
	}
	var pixel = countryMap.getEventPixel(evt.originalEvent) 
	displayCountryFeatureInfo(evt.pixel,countryMap);
});


