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
const apiPort=8010;
const webPort=8000;
function Request(url , callback, method,fail){ 
	this.url = url;	this.xhr = new XMLHttpRequest();	
	this.xhr.open(method?method:'GET', url, true); 
	//this.xhr.setRequestHeader("origin", 'www.opensourcemedical.com'); 
		this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');	
		this.xhr.onload = function() {  
		if(this.status==404){			console.slog("Request : Failed " +url); 	console.log(this)	}else{	
				callback(this.responseText); 		 
		}		RequestHelper(this);	}; 
		this.xhr.onerror = !fail?function() {	  RequestHelper(this);console.log(this);	}:fail;
		this.response=function (){	return this.xhr.response;	};
		this.responseText==function(){		return this.xhr.responseText	}
		this.xhr.send();	 
}
function RequestHelper(request){	request.response=request.response;	request.responseText = request.responseText;}


var url_casesComfirmed='https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
var url_casesRecovered='https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';
var url_casesDeaths="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";

var countriesISO={}
$.getJSON( {
	url: 'https://pkgstore.datahub.io/core/country-list/data_json/data/8c458f2d15d9f2119654b29ede6e45b8/data_json.json',
	success: function(data){ 
		countriesISO = data;
		countriesISO.get= function(value){
			for(var count =0; count < countriesISO.length; count++){
				if(countriesISO[count].Name.toLowerCase().trim()==value.toLowerCase().trim() ||
						countriesISO[count].Code.toLowerCase().trim()==value.toLowerCase()){
					return  countriesISO[count];
				}
			}
		}
		console.log(data.get('CA'))
	}
	});

function getDateString(d){ 
	if(d===undefined){
		d = new Date();
	} 
	return d.toLocaleString().split(',')[0];
}

function log(str){
	var d = new Date;
	console.log(d.toLocaleString() + " : " +str); 
}


 function getDailyReport(){ 
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
 
} 
var selectedCountry='';
var selectedCountryName='';
  
 
/**
 * Get the country selected from the main map
 * @param code
 * @param name
 * @returns
 */
function getCountryCases(code, name){ 
	log('getCountryCases : '+code+','+name+')');
	document.getElementById("info1").innerHTML+= "<span >"+
	"<center><i>Cases Comfirmed </i>: <span id='cc'>n/a</span><br>"+
	"<i>Deaths Reported </i>: <span id='dr'>n/a</span></br>"+
	"<i>Cases Recovered </i>: <span id='cr'>n/a</span></br>"+
	"<i>Cases Active </i>: <span id='ca'>n/a</span></br>"+
	"<i>Hospitalized </i>: <span id='ch'>n/a</span></br>"+
	"<i>Regional CFR  </i>: <span id='cfr'>n/a</span></br></center></span>"; 
	var smart=false;
	var url1 ="http://127.0.0.1:"+apiPort+"/api/data/";

	if(name.toLowerCase().trim()=='united states of america'){

	}

	url1 ="http://127.0.0.1:"+apiPort+"/api/data/"+selectedCountryName;
	log('getCountryCases : ' +url1);
	log()
	$.getJSON( {
		url: url1,
		success: function(data){
			document.getElementById('mouse-position').innerHTML=selectedCountryName;
			log('getCountryCases : Success ' +url1);
			data = data.data;
			setElement('cc', data.caseData.confirmed!=''?data.caseData.confirmed:" - ");
			setElement('cr', data.caseData.recovered!=''?data.caseData.recovered:" - ");
			setElement('dr', data.caseData.deaths!=''?data.caseData.deaths:" - ");
			setElement('cfr', data.caseData.cfr!=''?data.caseData.cfr:" - ");   
			setElement('ca', data.caseData.active!=''?data.caseData.active:" - ");   
			setElement('ch', data.caseData.hospitalized!=''?data.caseData.hospitalized:" - ")   
		},
		error: function (e){
			console.log(e);
			log('getCountryCases : Fail ' +url1);
		}
	});

	log('getCountryCases() : END ');
}; 

function setElement(id, value){
	log("setElement("+id+','+value+')');
	var ele = document.getElementById(id);
	ele.innerHTML=value;
	log("setElement() : " +( ele!=undefined )?"PASS": "FAIL");
	log("setElement() : END");
}



var mousePositionControl = new MousePosition({
	coordinateFormat: createStringXY(4),
	projection: 'EPSG:4326',
	// comment the following two lines to have the mouse position
	// be placed within the map.
	className: 'custom-mouse-position',
	//target: document.getElementById('mouse-position'),
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
	log("displayFeatureInfo()");
	var feature = m.forEachFeatureAtPixel(pixel, function(feature) {
		return feature;
	});    
	var d = document.getElementById('countryMap');
	 
		d.style.width=0;
	var info = document.getElementById('info');
	if (feature) { 
 
	d.style.width='50%'
;
		document.getElementById('info1').innerHTML='';
		document.getElementById('info').innerHTML='';
		document.getElementById('info2').innerHTML='';
		
		selectedCountry=feature.getId() ;
		selectedCountryName=feature.get('name'); 
		getCountryCases(selectedCountry ,feature.get('name') );
		var imgUrl='';
		var additionText='';
	 
		 
		if(selectedCountryName=='Taiwan'){ 
			additionText='Republic Of China';
				imgUrl ='https://weathered-dew-3079.corsweb.workers.dev/?https://www.countryflags.io/tw/shiny/64.png' ; 
			}else if(selectedCountryName=='Macedonia'){ 
				additionText='the Former Yugoslav Republic Of';
				imgUrl ='https://weathered-dew-3079.corsweb.workers.dev/?https://www.countryflags.io/mk/shiny/64.png' ; 
			}else if(selectedCountryName=='Somaliland'){
			selectedCountryName='Somalia';
		}else 	if(selectedCountryName=='Republic of Serbia'){
				selectedCountryName='Serbia';
				imgUrl ='https://weathered-dew-3079.corsweb.workers.dev/?https://www.countryflags.io/rs/shiny/64.png' ; 
			}else
		if(selectedCountryName=='Moldova'){
			imgUrl ='https://weathered-dew-3079.corsweb.workers.dev/?https://www.countryflags.io/mv/shiny/64.png'; 
		}else if(selectedCountryName=='Vietnam'){
			imgUrl ='https://weathered-dew-3079.corsweb.workers.dev/?https://www.countryflags.io/vi/shiny/64.png'; 
		}else if(selectedCountryName=='Laos'){
			additionText='People\'s Democratic Republic';
		}else if(selectedCountryName=='Iran'){
			imgUrl ='https://weathered-dew-3079.corsweb.workers.dev/?https://www.countryflags.io/ir/shiny/64.png'; 
			adiitionText='Islamic Republic Of';
		}else if(selectedCountryName=='United Republic of Tanzania'){
			selectedCountryName='Tanzania';
		}else if(selectedCountryName=='Democratic Republic of the Congo'){
			selectedCountryName='Congo';
		}else if(selectedCountryName=='Ivory Coast'){
			selectedCountryName="Cote d'Ivoire";
			additionText='<br>Ivory Coast'
		}else if(selectedCountryName=='West Bank'){
			selectedCountryName='Palestinian territories';
		}else if(selectedCountryName=='United Republic of Tanzania'){
			selectedCountryName='Tanzania';
		}else	if(selectedCountryName=='Russia'){
			imgUrl ='https://weathered-dew-3079.corsweb.workers.dev/?https://www.countryflags.io/ru/shiny/64.png'; 
		}else	if(selectedCountryName=='Russia'){
			imgUrl ='https://weathered-dew-3079.corsweb.workers.dev/?https://www.countryflags.io/ru/shiny/64.png'; 
		}else	
			imgUrl ='https://weathered-dew-3079.corsweb.workers.dev/?https://www.countryflags.io/'+countriesISO.get(selectedCountryName).Code +'/shiny/64.png' ;
		 
			 document.getElementById('flg').innerHTML='<img src="'+imgUrl+'">';
			 
		 info.innerHTML = "<center><h3>"+feature.getId() + ': ' +selectedCountryName+" </h3><br><h4>" +additionText+" </center></h4>";
			 
		 
	} else {
		selectedCountryName="";
		// info.innerHTML = '&nbsp;';
	} 
	if(selectedCountryName!=""){
		document.getElementById('countryMap').setAttribute("display", "block")
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
	switch(selectedCountryName){
	case 'Canada':
		showHealthAuthoriy('https://www.canada.ca/en/public-health/services/diseases/2019-novel-coronavirus-infection.html');
	}
	log("displayFeatureInfo() -- "+feature.getId() + ': ' + feature.get('name'));
	log("displayFeatureInfo() -- END");
};

function camelCase(str) {
	log("camelCase("+str+")");
	var s = str 
	.replace(/\s(.)/g, function(a) { 
		return a.toUpperCase(); 
	}) 
	.replace(/\s/g, '') 
	.replace(/^(.)/, function(b) { 
		return b.toLowerCase(); 
	}); 
	s = str.substr(0,1)+s.substr(1,s.length);

	log("returning "+s); 
	log("camelCase("+s+")");
	return str.substr(0,1)+s.substr(1,s.length);
} 


var selectedProvice;
/**
 * Display country specific  info 
 * 
 */
var displayProvinceFeature = function(pixel, m) { 
	console.log('displayProvinceFeature()');
	var feature = m.forEachFeatureAtPixel(pixel, function(feature) {
		return feature;
	});  

	if (feature) { 
		selectedProvice =feature.get('name');
		if(!selectedProvice){
			selectedProvice =feature.get('NAME');
		}
		console.log('displayProvinceFeature() : featurename :' + selectedProvice );
		info2.innerHTML = "<center><h4>"+feature.get('name')+"</center></h4>";
 
//		document.getElementById("info2").innerHTML+= "<span >"+
//		"<center><i>Cases Comfirmed </i>: <span id='cc1'>n/a</span><br>"+
//		"<i>Deaths Reported </i>: <span id='dr1'>n/a</span></br>"+
//		"<span id='cr-1'><i>Cases Recovered </i>: <span id='cr1'>n/a</span></br></span>"+
//		"<i>Cases Active </i>: <span id='ca1'>n/a</span></br>"+
//		"<span id='ch-1'><i>Hospitalized </i>: <span id='ch1'>n/a</span></br></span>"+
//		"<i>Tested </i>: <span id='test1'>n/a</span></br>"+
//		"<i>Regional CFR  </i>: <span id='cfr1'>n/a</span></br></center></span>";   
		var url1 ="http://127.0.0.1:"+apiPort+"/api/data/";
		if(name.toLowerCase().trim()=='united states of america'){
			url1 ="http://127.0.0.1:"+apiPort+"/api/data/";
			 
		}	
		 
		$.getJSON( {
			url: url1+selectedCountryName+'/'+selectedProvice,
			success: function(data){ 
				console.log(data);  
				document.getElementById("info2").innerHTML+= "<span >"+
				"<center><i>Cases Comfirmed </i>: <span id='cc1'>n/a</span><br>"+
				"<i>Deaths Reported </i>: <span id='dr1'>n/a</span></br>"+
((!isNaN(data.data.caseData.recovered) && data.data.caseData.recovered>0)?"<span id='cr-1'><i>Cases Recovered </i>: "+data.data.caseData.recovered+"</br></span>":'')+
((!isNaN(data.data.caseData.active) && data.data.caseData.active>0)?"<i>Cases Active </i>: "+data.data.caseData.active+"</br>":"")+
((!isNaN(data.data.caseData.hospitalized) && data.data.caseData.hospitalized>0)?"<span id='ch-1'><i>Hospitalized </i>: <span id='ch1'>"+data.data.caseData.hospitalized+"</span></br></span>":"")+
((!isNaN(data.data.caseData.tested) && data.data.caseData.tested>0)?"<i>Tested </i>: <span id='test1'>"+data.data.caseData.tested+"</span></br>":"")+
				"<i>Regional CFR  </i>: <span id='cfr1'>n/a</span></br></center></span>";   
				 
				//document.getElementById("cr1").innerHTML=data.data.caseData.recovered;
				document.getElementById("cc1").innerHTML=data.data.caseData.confirmed;
				document.getElementById("dr1").innerHTML=data.data.caseData.deaths;
				document.getElementById("cfr1").innerHTML=data.data.caseData.cfr; 
				document.getElementById("ch1").innerHTML=data.data.caseData.hospitalized ; 
				//document.getElementById("ca1").innerHTML=data.data.caseData.active!=''?data.data.caseData.active:'n/a'
				//document.getElementById("test1").innerHTML=data.data.caseData.tested; 
			},
			error: function (e){
				console.log(e);
			}
		});
//
//		var url4 ="http://127.0.0.1:3000/api/time_series_covid19_confirmed_global/";
//		if(name.toLowerCase().trim()=='united states of america'){
//			url4 ="http://127.0.0.1:3000/api/getSmartData/";
//		}
//		$.getJSON( {
//			url: url4+name.toLowerCase(),
//			success: function(data){   
//				var i = data.data;
//				document.getElementById("cc1").innerHTML=(!smart)?i.cases:i.Confirmed;
//				calculateProvince();
//			},
//			error: function (e){
//				console.log(e);
//			}
//		});
//
//		var url3 ="http://127.0.0.1:3000/api/time_series_covid19_deaths_global/";
//		if(name.toLowerCase().trim()=='united states of america'){
//			url3 ="http://127.0.0.1:3000/api/getSmartData/";
//		}
//		$.getJSON( {
//			url:url3+name.toLowerCase(),
//			success: function(data){   
//				var i = data.data;
//				document.getElementById("dr1").innerHTML=(!smart)?i.cases:i.Deaths ;
//				calculateProvince(); 
//			},
//			error: function (e){
//				console.log(e);
//			}
//		});



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

 
	console.log('displayProvinceFeature() - END');
};
function showHealthAuthoriy( url, id ){
	document.getElementById(id!=undefined?id:'info2').innerHTML='<a href="'+url+'" target=blank>Canada Government</a>';
}


function hide(el){
	document.getElementById(el).setAttribute("display", "none")
}
function show(el){
	document.getElementById(el).setAttribute("display", "block")
}
hide('countryMap') 
map.stek =null;
map.on('click', function(evt) { 
	var geeos='https://raw.githubusercontent.com/AliMedicalOpenSource/GeneralDataSets/master/World/maps/country.geojson';
	vectorLayerCountry.setSource(null);
	if (evt.dragging) { 
		return;
	}
	hide('countryMap') 
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
//	if(selectedCountry=="CAN"){ 
//	vectorLayerCountry.setSource(new VectorSource({
//	url: 'https://raw.githubusercontent.com/aaronali/click_that_hood/master/public/data/canada.geojson',
//	format: new GeoJSON()
//	}) );
//	}


//	if(selectedCountry=="USA"){ 
//	vectorLayerCountry.setSource(new VectorSource({
//	url: url_us_geo_Json,
//	format: new GeoJSON()
//	}) );
//	}
	var vecLayUrl=null;
	switch(selectedCountry){
	case " 1":
	default:
		var url =   'https://raw.githubusercontent.com/AliMedicalOpenSource/GeneralDataSets/master/World/maps/'+selectedCountryName.toLowerCase().split(' ').join('-')+'.geojson';
	vectorLayerCountry.setSource(new VectorSource({
		url: url,
		format: new GeoJSON()
	}) );
	} 

});



countryMap.on('click', function(evt) {
	console.log(evt);
	//  vectorLayerCountry.setSource(null);
	if (evt.dragging) { 
		return;
	}
	var pixel = countryMap.getEventPixel(evt.originalEvent) 
	displayProvinceFeature(evt.pixel,countryMap);


});









