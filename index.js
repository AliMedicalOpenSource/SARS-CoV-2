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
const csvFilePath='<path to csv file>';
const csv=require('csvtojson');


var url_casesComfirmed='https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
var url_casesRecovered='https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';
var url_casesDeaths="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";


var url_distribution = "https://cors-anywhere.herokuapp.com/http://opendata.ecdc.europa.eu/covid19/casedistribution/json/";
var url_distribution1="https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_daily_reports/03-27-2020.csv";

var url_us =	"https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
var url_mexico ="https://raw.githubusercontent.com/aaronali/click_that_hood/master/public/data/mexico.geojson";

var url_usDataSheet = 'https://raw.githubusercontent.com/AliMedicalOpenSource/SARS-CoV-2/master/data/us-covid-datashhet';



var countryData=[];
var caseDisribution; 

var dataRecovered = [];
var dataDeaths = [];
var dataComfirmed={};


function getDateString(d){ 
	if(d===undefined){
		d = new Date();
	} 
	return d.toLocaleString().split(',')[0];
}





//function getCaseDistribution( ) {
//$.getJSON({
//url: url_distribution,
//success: function(data){
//caseDisribution=data;
//console.log(data);

//},
//error: function (e){
//console.log(e);
//}
//})
//}    
var caseDataMaster="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";
function getDailyReport(){
//	var d = new Date();
//	var n =  url_casesComfirmed ;
//	$.getJSON({
//	url: caseDataMaster+n,
//	success: function(data){
//	caseDisribution=data; 
//	for( var temp = 0 ; temp <data.length; temp++){
//	var f = data[temp];
//	if(countryData[f.Country_Region]==undefined){
//	countryData[f.Country_Region]=[]
//	}
//	countryData[f.Country_Region].push(f);
//	} 
//	const jsonArray=  csv().fromFile(url_casesComfirmed);
//	console.log(jsonArray);
//	},
//	error: function (e){
//	console.log(e.responseText);
//	var s = e.responseText.split(/\n/);
//	console.log(s);
//	}
//	})

	$.get(url_casesComfirmed, function( data ) {
		$( ".result" ).html( data );


		csv( )
		.fromString(data)
		.subscribe((jsonObj)=>{

			countryData.push(jsonObj);
		}); 
	});



	$.get(url_casesRecovered, function( data ) {
		$( ".result" ).html( data );


		csv( )
		.fromString(data)
		.subscribe((jsonObj)=>{

			dataRecovered.push(jsonObj);
		}); 
	});

	$.get(url_casesDeaths, function( data ) {
		$( ".result" ).html( data );


		csv( )
		.fromString(data)
		.subscribe((jsonObj)=>{

			dataDeaths.push(jsonObj);
		}); 
	});


	var canadaPopDay ;
	$.getJSON( {
		url: "https://raw.githubusercontent.com/AliMedicalOpenSource/SARS-CoV-2/master/data/canadaPopulation.json",
		success: function(data){
			canadaPopDay=data; 

		},
		error: function (e){
			console.log(e);
		}
	});




//	var tt="https://cors-anywhere.herokuapp.com/https://coronavirus.health.ny.gov/county-county-breakdown-positive-cases";
//	var xhttp = new XMLHttpRequest();
//	xhttp.onreadystatechange = function() {
//	if (this.readyState == 4 && this.status == 200) {

//	console.log(xhttp.responseText);
//	}
//	};
//	xhttp.open("GET",tt, true);
//	xhttp.send();
}



//getCaseDistribution(); 
var selectedCountry='';
var selectedCountryName='';
//Async / await usage


getDailyReport();


function calculate(){
	var dr;
	var cr;
	var cc;
	if(!isNaN( document.getElementById('dr').innerHTML)){
		dr = document.getElementById('dr').innerHTML;
		if(!isNaN( document.getElementById('cr').innerHTML)){
			cr = document.getElementById('cr').innerHTML;
			if(!isNaN( document.getElementById('cc').innerHTML)){
				var cc=  document.getElementById('cc').innerHTML;
				var cfr = (new Number(dr)/new Number(cc))*100;
				cfr =Math.round(cfr * 100) / 100 ;
				if(!isNaN(cfr)){ 
					document.getElementById('cfr').innerHTML=  cfr;
				}else{

					document.getElementById('cfr').innerHTML=  0;
				}
			}
		}
	}
}
/**
 * Get the country selected from the main map
 * @param code
 * @param name
 * @returns
 */
function getCountryCases(code, name){ 
	document.getElementById("info1").innerHTML+= "<span >"+
	"<center><i>Cases Comfirmed </i>: <span id='cc'>n/a</span><br>"+
	"<i>Deaths Reported </i>: <span id='dr'>n/a</span></br>"+
	"<i>Cases Recovered </i>: <span id='cr'>n/a</span></br>"+
	"<i>Regional CFR    </i>: <span id='cfr'>n/a</span></br></center></span>"; 
	var smart=false;
	var url1 ="http://127.0.0.1:3000/api/time_series_covid19_recovered_global/";
	if(name.toLowerCase().trim()=='united states of america'){
		url1 ="http://127.0.0.1:3000/api/getSmartData/";
		smart=true;
	}

	$.getJSON( {
		url: url1+name.toLowerCase(),
		success: function(data){   
			var i = data.data;
			document.getElementById("cr").innerHTML=(!smart)?i.cases:i.Recovered ;
			calculate();
		},
		error: function (e){
			console.log(e);
		}
	});

	var url4 ="http://127.0.0.1:3000/api/time_series_covid19_confirmed_global/";
	if(name.toLowerCase().trim()=='united states of america'){
		url4 ="http://127.0.0.1:3000/api/getSmartData/";
	}
	$.getJSON( {
		url: url4+name.toLowerCase(),
		success: function(data){   
			var i = data.data;
			document.getElementById("cc").innerHTML=(!smart)?i.cases:i.Confirmed;
			calculate();
		},
		error: function (e){
			console.log(e);
		}
	});

	var url3 ="http://127.0.0.1:3000/api/time_series_covid19_deaths_global/";
	if(name.toLowerCase().trim()=='united states of america'){
		url3 ="http://127.0.0.1:3000/api/getSmartData/";
	}
	$.getJSON( {
		url:url3+name.toLowerCase(),
		success: function(data){   
			var i = data.data;
			document.getElementById("dr").innerHTML=(!smart)?i.cases:i.Deaths ;
			calculate(); 
		},
		error: function (e){
			console.log(e);
		}
	}); 

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
/**
 * 
 * @returns
 */
function clearInfo(){
	document.getElementById('info1').innerHTML='';
	document.getElementById('info').innerHTML='';
	document.getElementById('info2').innerHTML='';
}
/**
 * 
 */
var displayFeatureInfo = function(pixel, m) { 
	var feature = m.forEachFeatureAtPixel(pixel, function(feature) {
		return feature;
	});  

	var info = document.getElementById('info');
	if (feature) { 
		document.getElementById('info1').innerHTML='';
		document.getElementById('info').innerHTML='';
		document.getElementById('info2').innerHTML='';
		info.innerHTML = "<center><h3>"+feature.getId() + ': ' + feature.get('name')+"</center></h3>";
		selectedCountry=feature.getId() ;
		selectedCountryName=feature.get('name');
		getCountryCases(selectedCountry ,feature.get('name') );
	} else {
		// info.innerHTML = '&nbsp;';
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
var selectedProvice;
/**
 * Display country specific  info 
 * 
 */
var displayProvinceFeature = function(pixel, m) { 
	console.log(m);
	var feature = m.forEachFeatureAtPixel(pixel, function(feature) {
		return feature;
	});  
 
	if (feature) {
		info2.innerHTML = "<center><h4>"+feature.get('name')+"</center></h4>";

	var name =selectedCountryName+"/"+feature.get('name');	
		
		document.getElementById("info2").innerHTML+= "<span >"+
		"<center><i>Cases Comfirmed </i>: <span id='cc1'>n/a</span><br>"+
		"<i>Deaths Reported </i>: <span id='dr1'>n/a</span></br>"+
		"<i>Cases Recovered </i>: <span id='cr1'>n/a</span></br>"+
		"<i>Regional CFR    </i>: <span id='cfr1'>n/a</span></br></center></span>"; 
	var smart=false;
	var url1 ="http://127.0.0.1:3000/api/time_series_covid19_recovered_global/";
	if(name.toLowerCase().trim()=='united states of america'){
		url1 ="http://127.0.0.1:3000/api/getSmartData/";
		smart=true;
	}
	
	$.getJSON( {
		url: url1+name.toLowerCase(),
		success: function(data){   
			var i = data.data;
			document.getElementById("cr1").innerHTML=(!smart)?i.cases:i.Recovered ;
			console.log(this);
			calculateProvince();
		},
		error: function (e){
			console.log(e);
		}
	});
		
	var url4 ="http://127.0.0.1:3000/api/time_series_covid19_confirmed_global/";
	if(name.toLowerCase().trim()=='united states of america'){
		url4 ="http://127.0.0.1:3000/api/getSmartData/";
	}
	$.getJSON( {
		url: url4+name.toLowerCase(),
		success: function(data){   
			var i = data.data;
			document.getElementById("cc1").innerHTML=(!smart)?i.cases:i.Confirmed;
			calculateProvince();
		},
		error: function (e){
			console.log(e);
		}
	});

	var url3 ="http://127.0.0.1:3000/api/time_series_covid19_deaths_global/";
	if(name.toLowerCase().trim()=='united states of america'){
		url3 ="http://127.0.0.1:3000/api/getSmartData/";
	}
	$.getJSON( {
		url:url3+name.toLowerCase(),
		success: function(data){   
			var i = data.data;
			document.getElementById("dr1").innerHTML=(!smart)?i.cases:i.Deaths ;
			calculateProvince(); 
		},
		error: function (e){
			console.log(e);
		}
	});


		 
	} else {
		info2.innerHTML = '&nbsp;';
	} 
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
	vectorLayerCountry.setSource(null);
	if (evt.dragging) { 
		return;
	}
	var pixel = map.getEventPixel(evt.originalEvent); 
	displayFeatureInfo(evt.pixel, map);
	var cord = map.getEventCoordinate(evt); 
	cord = evt.coordinate;  
	var size = map.getSize(); 
	view.setCenter(cord);
//	view.setZoom(4);
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
	displayProvinceFeature(evt.pixel,countryMap);


});



var usCDCData;
function getUSAStatsFromCDC(){
	var rr = 'http://localhost:3000/api/getUSAStatsFromCDC/District%20of%20Columbia'

		loadWholePage(rr);
	$(function($){
		$('#info').load(rr); 
		console.log(document.getElementById('2019coronavirus-summary'));
		$('#info').load(document.getElementById('2019coronavirus-summary'))
	});

} 






function getBody(content) 
{
	test = content.toLowerCase();    // to eliminate case sensitivity
	var x = test.indexOf("<body");
	if(x == -1) return "";

	x = test.indexOf(">", x);
	if(x == -1) return "";

	var y = test.lastIndexOf("</body>");
	if(y == -1) y = test.lastIndexOf("</html>");
	if(y == -1) y = content.length;    // If no HTML then just grab everything till end

	return content.slice(x + 1, y);   
} 

/**
	Loads a HTML page
	Put the content of the body tag into the current page.
	Arguments:
		url of the other HTML page to load
		id of the tag that has to hold the content
 */		

function loadHTML(url, fun, storage, param)
{
	var xhr = createXHR();
	xhr.onreadystatechange=function()
	{ 
		if(xhr.readyState == 4)
		{
			//if(xhr.status == 200)
			{
				storage.innerHTML = getBody(xhr.responseText);
				fun(storage, param);
			}
		} 
	}; 

	xhr.open("GET", url , true);
	xhr.send(null); 

} 

/**
		Callback
		Assign directly a tag
 */		


function processHTML(temp, target)
{
	target.innerHTML = temp.innerHTML;
}

function loadWholePage(url)
{
	var y = document.getElementById("storage");
	var x = document.getElementById("displayed");
	loadHTML(url, processHTML, x, y);
}	


/**
		Create responseHTML
		for acces by DOM's methods
 */	

function processByDOM(responseHTML, target)
{
	target.innerHTML = "Extracted by id:<br />";

	// does not work with Chrome/Safari
	//var message = responseHTML.getElementsByTagName("div").namedItem("two").innerHTML;
	var message = responseHTML.getElementsByTagName("div").item(1).innerHTML;

	target.innerHTML += message;

	target.innerHTML += "<br />Extracted by name:<br />";

	message = responseHTML.getElementsByTagName("form").item(0);
	target.innerHTML += message.dyn.value;
}

function accessByDOM(url)
{
	//var responseHTML = document.createElement("body");	// Bad for opera
	var responseHTML = document.getElementById("storage");
	var y = document.getElementById("displayed");
	loadHTML(url, processByDOM, responseHTML, y);
}	

