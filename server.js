var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
const csv=require('csvtojson');
var $ = jQuery = require('jquery')(window);

var fs = require('fs');
var static = require('node-static'); 
//Load HTTP module
const http = require("http");
const hostname = '127.0.0.1';
const webServerPort = 3000;
const apiServerPort = 8080;

var url_casesComfirmed='https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
var url_casesRecovered='https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';
var url_casesDeaths="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
var url_usDataSheet="https://raw.githubusercontent.com/AliMedicalOpenSource/SARS-CoV-2/master/data/us-covid-datashhet";
var url_caGovDataSheet='https://raw.githubusercontent.com/AliMedicalOpenSource/CovidDataSets/master/canada/covid19.csv';
var url_caGovPopulation='https://raw.githubusercontent.com/AliMedicalOpenSource/GeneralDataSets/master/Canada/2020.csv';
var url_caGovDataSheet_json='https://raw.githubusercontent.com/AliMedicalOpenSource/CovidDataSets/master/canada/covid19.json';
var url_usCDCDataSheet_json='https://raw.githubusercontent.com/AliMedicalOpenSource/CovidDataSets/master/United%20States%20of%20America/us-cases-current.json';
var url_usGovPopulation_json='https://raw.githubusercontent.com/AliMedicalOpenSource/GeneralDataSets/master/United%20States%20of%20America/nst-est2019-popchg2010_2019.json';
var url_usCovidData_json='https://raw.githubusercontent.com/AliMedicalOpenSource/CovidDataSets/master/United%20States%20of%20America/us-cases-current.json';

/*******
 *  LOGGING
 */
var env_loggging = 'verbose'
//	var env_loggging = error
//	var env_loggging = debug
	const logginLevels= 'verbose debug error off' ;

function setLoggingLevel(level){
	if(logginLevels.indexOf(logginLevels)>=0){ 
		let env_loggging = level;
	}else{
		console.log("ERR : Unable to set loggin level to " +level);
		console.log("ERR : Use : " +logginLevels); 
	}
}
function log(method, message, error){
	var d= new Date();
	var err=(error==undefined || error==null)?" :: DEBUG :: ":" :: ERROR :: ";
	if(env_loggging=='off'){return} 
	if(env_loggging=='verbose'){ 
		if(method!=undefined){
			console.log( d.toLocaleString("en-CA") + err  +method);
		}
		if(message!=undefined){
			console.log(d.toLocaleString("en-CA") + err  +message);
		}
		if(error!=undefined){
			console.log(d.toLocaleString("en-CA")  + err  +error.toString());
		}
	}
	if(env_loggging=='error'){ 
		err = 'ERROR :: ';
		if(error!=undefined && err != null){
			if(method!=undefined){
				console.log(d.toLocaleString("en-CA") + err  +method);
			}
			if(message!=undefined){
				console.log(d.toLocaleString("en-CA")  + err  +message);
			}else{
				console.log(d.toLocaleString("en-CA")  + err  + "Sysem Error");
			}
			console.log(d.toLocaleString("en-CA")  + err  +error.toString());
		}

	}else if(env_loggging=='debug'){
		err="DEBUG :: ";
		if(method!=undefined){
			console.log(d.toLocaleString("en-CA")  + err  +method);
		}
		if(message!=undefined){
			console.log(d.toLocaleString("en-CA")  + err  +message);
		}
		if(error!=undefined){
			console.log(d.toLocaleString("en-CA")  + err  +error.toString());
		} 
	} 
}
setLoggingLevel(env_loggging); 
var covidDataSet={};



/***************************************************************************************
 *                       API Server Initialization and start listening
 ***************************************************************************************/
const server = http.createServer((req, res) => {

	//Set the response HTTP header with HTTP status and Content type
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json'); 
	res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:8080");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
	var response={};
	try{ 
		var data  =getApiData(req);
		response["status"]=200;
		response.data=data; 
	}catch(e){
		console.log('ERR'); 
		console.log(e); 
		response["status"]=400;
	}
	res.end( JSON.stringify(response));
});

server.listen(apiServerPort, hostname, () => {
	console.log(`Server running at http://${hostname}:${apiServerPort}/`);
}); 
/***************************************************************************************
 *                       Web Server Initialization and start listening
 ***************************************************************************************/
var file = new(static.Server)();
const staticServer = http.createServer(function (req, res) {
	var url = req.url;
	console.log( url);
	req.url = "dist/"+ url.toString();
	file.serve(req, res);
	log("staticServerRequest()",  req.url);
}) ;

staticServer.listen(webServerPort, hostname, () => {
	log(`Server running at http://${hostname}:${webServerPort}/`);
});


/***************************************************************************************
 *                                 OBJECT DEFINITIONS
 ***************************************************************************************/

function DataSet(continent,country, province, jurisdiction, confirmed,deaths, recovered,active,tested,hospitalized,icu){
	this.caseData={
			confirmed:confirmed,
			deaths:deaths,
			recovered:recovered,
			active:active,
			tested:tested	,
			hospitalized:hospitalized,
			icu:icu

	};
	this.location={
			continent:continent,
			country:country,
			province:province,
			jurisdiction:jurisdiction,
			population: 0
	}  
	this.key=country+ ' ' +province+ ' ' +jurisdiction!=undefined?jurisdiction:'';
	this.add = function(dataSet){
			console.log(this.caseData.confirmed+ " " +dataSet.caseData.confirmed);
		if(!isNaN(this.caseData.confirmed)){
			if(!isNaN(dataSet.caseData.confirmed)){
			this.caseData.confirmed =new Number(this.caseData.confirmed)+new Number(dataSet.caseData.confirmed);
		}}
		if(!isNaN(this.caseData.deaths)){
			this.caseData.deaths =new Number(this.caseData.deaths)+new Number(dataSet.caseData.deaths);
		}
		if(!isNaN(this.caseData.recovered)){
			this.caseData.recovered =new Number(this.caseData.recovered)+new Number(dataSet.caseData.recovered);
		}
		if(!isNaN(this.caseData.active)){
			this.caseData.recovered =new Number(this.caseData.active)+new Number(dataSet.caseData.active);
		}
		if(!isNaN(this.caseData.tested)){
			this.caseData.tested =new Number(this.caseData.tested)+new Number(dataSet.caseData.tested);
		}
		if(!isNaN(this.caseData.hospitalized)){
			this.caseData.hospitalized =new Number(this.caseData.hospitalized)+new Number(dataSet.caseData.hospitalized);
		}
		if(!isNaN(this.caseData.icu)){
			this.caseData.icu =new Number(this.caseData.icu)+new Number(dataSet.caseData.icu); 
		} 
		if(!isNaN(this.location.population)){
			this.location.population =new Number(this.location.population)+new Number(this.location.population); 
		} 

	}
}
function DemoGrpahs(a,b,c,d,e,f,g,h,i,male,female,unknown){
	this.ages={ 
			"0-9":a,
			"10-19":b,
			"20-29":c,
			"30-39":d,
			"40-49":e,
			"50-59":f,
			"60-69":g,
			"70-79":h,
			"80+":i,
	}
	this.sex = {
			male:male,
			female:female,
			unknoen:unknown
	}
	this.status=400; 
	 
}

function Population(  jurisdiction, persons) { 
	this.jurisdiction=jurisdiction;
	this.population=persons;


}
Population.prototype.getPopulation = function(){
	var temp=new String(this.population) ;
	while(temp.indexOf(',')>=0){temp=temp.replace(',','').trim();}
	return new Number(temp);
}
/**
 * UTILITY FUNCTIONS
 */


function stringToDate(string){
	var d = new Date(string.split('-')[2]+'-'+string.split('-')[1]+'-'+string.split('-')[0]);
	return d;
}


function calcludateCFR(deaths, confirmed){  
	var cfr = (new Number(deaths)/new Number(confirmed))*100;
	cfr =Math.round(cfr * 100) / 100 ;
	return cfr;
}
function calculateInfectedPercentage(confirmed, pop){

}

function Sanatize(string ){ 
	string=string.split('%20')
	string = string.join(' ');
	string = string.split('/');
	string = string.join(' '); 
	return string.trim() ;
}


var data_populations={}; 
data_populations["Canada"]=[] ;
/**
 * Returns the population by first looking for the country then 
 * searching for the jurisdiction.
 * @param country
 * @param juristictionToReturn
 * @returns
 */
function getPopulation(country,jurisdictionToReturn){ 
	country = Sanatize(country);
	jurisdictionToReturn = Sanatize(jurisdictionToReturn); 
	try{   
		var temp = data_populations[country];  
		var result ;   
		temp.forEach(function (population){   
			if( population['jurisdiction'].toLowerCase().trim()==jurisdictionToReturn.toLowerCase().trim()){
				result =  population; 
			}
		}); 
		return result;
	}catch(e){
		console.log("ERR: unable to getPopulation");
		console.log("ERR:  getPopulation(country,jurisdictionToReturn)"); 
		console.log("ERR:  getPopulation("+country+" , " +jurisdictionToReturn+')');
		console.log(e)
	}
	return null;
}
function populateCanadaPopulationData(data){  
	var temp =new Population(data.Geography.trim(),data.Persons ); 
	data_populations["Canada"].push(temp); 
}
function populatePopulationData(country, province,persons){  
	if(data_populations[country] == undefined ){
		data_populations[country]=[];
	}
	var temp =new Population(province.trim(),persons);
	data_populations[country].push(temp);  
}
/*********************************************************************/
/             CONVERSION FROM COUNTRY DATA TO USABLE JSON            */
/*********************************************************************/
/**
 * Conversion for Canadas data sets
 * @param data
 * @returns
 */ 

covidDataSet['Canada']=[];

function populateCanadaData(jsonArray){   
	for(var count=0;count<jsonArray.length;count++){
		var data = jsonArray[count] 
		var x =new DataSet("North America","Canada", data.prname!=undefined?data.prname:'', '', data.numconf
				,data.numdeaths, '',data.numtoday,data.numtested,'','');  
		if(data.numdeaths>0){
			x.caseData.cfr =calcludateCFR(data.numdeaths,data.numconf);  
		}else{
			x.caseData.cfr =0;
		}

		var temp=getPopulation('Canada',x.location.province);
		if(temp!=null)temp = temp.getPopulation();
		x.location.population=temp!=null?temp:' - '; 
		x.lastUpdate=  stringToDate(data.date); 
		var ha=false;  
		for(temp = 0 ; temp <covidDataSet['Canada'].length; temp++){

			if(covidDataSet['Canada'][temp].location.province==x.location.province){
				ha=true;
			}
		} 
		if(!ha){
			covidDataSet['Canada'].push(x); 
		}	 
		for(temp = 0 ; temp <covidDataSet['Canada'].length; temp++){  
			if(covidDataSet['Canada'][temp].location.province==x.location.province && covidDataSet['Canada'][temp].lastUpdate.getTime() < x.lastUpdate.getTime()){
				covidDataSet['Canada'][temp]=x; 
			} 
		} 
	} 
}    

covidDataSet['United States of America']=[];
const string_USA = 'United States of America';
function populateUSCovidData(jsonArray){  
	jsonArray =jsonArray.data;
	for(var count=0;count<jsonArray.length;count++){
		var data = jsonArray[count];
		if(data.Jurisdiction!=null){ 
			var x =new DataSet("North America",string_USA, data.Jurisdiction,'',new Number(data['Cases Reported']), '', ''
					,'', '','','','','');   

			var temp=getPopulation(string_USA,x.location.province);
			if(temp!=null){ 
				temp = temp.getPopulation();
			}
			x.location.population=temp!=null?temp:' - '; 

			var ha=false;  
			for(temp = 0 ; temp <covidDataSet[string_USA].length; temp++){

				if(covidDataSet[string_USA][temp].location.province==x.location.province){
					ha=true;
				}
			} 
			if(!ha){
				covidDataSet[string_USA].push(x); 
			}	 
			for(temp = 0 ; temp <covidDataSet[string_USA].length; temp++){  
				if(covidDataSet[string_USA][temp].location.province==x.location.province){
					covidDataSet[string_USA][temp]=x; 
				} 
			} 
		}
	} 

}   
function populateUSAData2(data){
	console.log(data);
}
/*********************************************************************/
/*                            LOAD GENERAL DATA                      */
/*********************************************************************/
function populateUSAData(jsonArray){   
	for(var count =0;count<jsonArray.length;count++){
		var item = jsonArray[count];
		var pop=[];
		pop.push(jsonArray[count].PPOPCHG_2019);
		pop.push(jsonArray[count].PPOPCHG_2018);
		pop.push(jsonArray[count].PPOPCHG_2017);
		pop.push(jsonArray[count].PPOPCHG_2016);
		pop.push(jsonArray[count].PPOPCHG_2015);
		pop.push(jsonArray[count].PPOPCHG_2014);
		pop.push(jsonArray[count].PPOPCHG_2013);
		pop.push(jsonArray[count].PPOPCHG_2012);
		pop.push(jsonArray[count].PPOPCHG_2011);
		pop.push(jsonArray[count].PPOPCHG_2010);
		// get average growth
		var avg = (pop[0]+pop[1]+pop[2]+pop[3]+pop[4]  )/5; 
		// get popgrowth per dat for 2020
		var grow = Math.round((item.POPESTIMATE2019*avg*.01));
		grow=Math.round(grow/365); 
		var now = new Date();
		var start = new Date(now.getFullYear(), 0, 0);
		var diff = now - start;
		var oneDay = 1000 * 60 * 60 * 24;
		var day = Math.floor(diff / oneDay); 
		grow=Math.round(grow*day);
		pop = grow+item.POPESTIMATE2019; 
		var avg = item.PPOPCHG_2019;
		populatePopulationData('United States of America',jsonArray[count].NAME,pop) 
	}
}
/**
 * 
 * @returns
 */
function loadCanadaData(){
	log("loadCanadaData()");
	getCSVJsonArray(url_caGovPopulation,populateCanadaPopulationData);
}
function loadCUSAData(){
	getJsonData(url_usGovPopulation_json,populateUSAData);
}



/**
 * 
 * @param url
 * @param cb
 * @returns
 */
function getJsonData(url, cb){ 
	if(cb==undefined || cb==null || url==undefined || url==null){
		console.log('ERR : getJsonData');console.log('Invalid data');return;
	}
	$.get(url, function( data ) {   
		if(cb!=null){ cb(JSON.parse(data))}  
	})  ;
} 
/**
 * CSV to JSON array. cb is called on each 'row' of the csv and sent the JSON 
 * equivalent of the data
 * @param url
 * @param cb 
 * @returns
 */
function getCSVJsonArray(url, cb){ 
	$.get(url, function( data ) { 
		csv( )
		.fromString(data)
		.subscribe((jsonObj)=> {  
			cb(jsonObj); 	 
		});  
	})  
} 

loadCanadaData();
loadCUSAData();



/**
 * API Service 
 * @param req
 * @returns
 */
function getApiData(req){ 
	log('getApiData',req.url); 
	if(req.url.startsWith("/api")){ 
		req.url=req.url.replace("/api/",''); 
		var swtch = (req.url.split('/')[0]).length>0?(req.url.split('/')[0]): req.url;
		console.log(swtch);
		switch(swtch){

		case "data":
			req.url=req.url.replace(swtch+'/',''); 
			var region =req.url.split('/')[0]; 
			req.url=req.url.replace(region ,'');
			region =Sanatize(region); 
			var temp=covidDataSet[region]; 
			var lookingFor;
			if(req.url.length==0){
				lookingFor= region;
			}else{
				lookingFor=req.url.split('/')[1];
				console.log(lookingFor);
			} 
			lookingFor=Sanatize(lookingFor);
			for(var count =0 ;count<covidDataSet[region].length;count++){ 
				if(covidDataSet[region][count].location.province.toLowerCase().trim()==
					lookingFor.toLowerCase().trim()){
					return covidDataSet[region][count]
				}

			}	
			var da = covidDataSet[region][0];

			if(req.url.length==0){
				for(count =1 ;count<covidDataSet[region].length;count++){ 
					 if(covidDataSet[region]!=undefined){
						 da.add( covidDataSet[region][count]);
						 
					 }
					}
				} 
			return da;
//			case "time_series_covid19_confirmed_global":
//			var resp = time_series_covid19_confirmed_global(req.url.replace("time_series_covid19_confirmed_global/",''));
//			return resp; 
//			case "time_series_covid19_deaths_global":
//			var resp = time_series_covid19_deaths_global(req.url.replace("time_series_covid19_deaths_global/",''));
//			return resp; 

//			case "time_series_covid19_recovered_global":
//			var resp = time_series_covid19_recovered_global(req.url.replace("time_series_covid19_recovered_global/",''));
//			return resp; 
//			case "getUSAStatsFromCDC":
//			if(req.url.split("/").length>1){
//			return getUSAStatsFromCDC(req.url.replace("getUSAStatsFromCDC/",'')) 
//			}
//			return usCDCData;  
//			case "csse_covid_19_daily_reports": 
//			if(req.url.split("/").length===1){ 
//			return csse_covid_19_daily_reports; 
//			}else{
//			return getcsse_covid_19_daily_reports(req);
//			}
//			case "getSmartData":
//			console.log(":::");
//			if(req.url.split("/").length>1){
//			return getSmartData(req.url.replace("getSmartData/",'')) 
//			}
//			return cases_usDataSheet;   
//			case "help":
//			var r ={};
//			r["time_series_covid19_confirmed_global"]=[]
//			r.time_series_covid19_confirmed_global.push("time_series_covid19_confirmed_global");
//			r.time_series_covid19_confirmed_global.push("time_series_covid19_confirmed_global/country"); 
//			r["time_series_covid19_deaths_global"]=[]
//			r.time_series_covid19_deaths_global.push("time_series_covid19_deaths_global");
//			r.time_series_covid19_deaths_global.push("time_series_covid19_deaths_global/country");    
//			r["time_series_covid19_recovered_global"]=[]
//			r.time_series_covid19_recovered_global.push("time_series_covid19_recovered_global");
//			r.time_series_covid19_recovered_global.push("time_series_covid19_recovered_global/county"); 
//			r["csse_covid_19_daily_reports"]=[]
//			r.csse_covid_19_daily_reports.push("csse_covid_19_daily_reports");
//			r.csse_covid_19_daily_reports.push("csse_covid_19_daily_reports/country");         
//			r["getUSAStatsFromCDC"]=[]
//			r.csse_covid_19_daily_reports.push("getUSAStatsFromCDC");
//			r.csse_covid_19_daily_reports.push("getUSAStatsFromCDC/county");    
//			r["getSmartData"]=[]
//			r.getSmartData.push("getSmartData");
//			r.getSmartData.push("getSmartData/county");    
//			return r; 


		default:
			return null;


		} 



	}else{
		return null;

	} 
}
/***************************************************************************************
 *                                      CODE TESTING   
 ***************************************************************************************/
var tet ='https://cors-anywhere.herokuapp.com/https://www.alabamapublichealth.gov/infectiousdiseases/2019-coronavirus.html';
var url_usAlabamaData ='https://services7.arcgis.com/4RQmZZ0yaZkGR1zy/arcgis/rest/services/COV19_Public_Dashboard_ReadOnly/FeatureServer/0/query?where=1%3D1&outFields=CNTYNAME%2CCNTYFIPS%2CCONFIRMED%2CDIED%2Creported_death&returnGeometry=false&f=pjson';
function getHTMLPage(url, cb){ 
$.get(url, function( data ) { 
console.log(data);	 
});   
} 
function cd(data){
data=data.split("<table")
console.log(data);
}

getHTMLPage(url_usAlabamaData,cd);

/**************************************************************************************************8
 *                                    REFACTORING BELOW CODE 
 ******************************************************************************************************/
var casesComfirmed=[];
var casesRecovered=[];
var casesDeaths=[];
var csse_covid_19_daily_reports=[]; 

/**
 * Set comfirmed cases from covid data set
 * @param data
 * @returns
 */
function loadCasesComfirmed(data){
	casesComfirmed.push(data); 
}
/**
 * Set recovered cases from covid data sets
 * @param data
 * @returns
 */
function loadCasesRecovered(data){
	casesRecovered.push(data);  
}
/**
 * Set recovered cases 
 * @param data
 * @returns
 */
function loadCasesDeaths(data){
	casesDeaths.push(data); 
}

function loadcsseCovid19DailyReports(date){ 
	var s= date.toLocaleString().split(',')[0] ; 
	s=(s.split('/')[0].length>1?s.split('/')[0]:'0'+s.split('/')[0])+'-'+
	(s.split('/')[1].length>1?s.split('/')[1]:'0'+s.split('/')[0])+'-'+
	(s.split('/')[2].length>1?s.split('/')[2]:'0'+s.split('/')[0])+".csv" ; 
	var caseDataMaster="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";
	$.get(caseDataMaster+s, function( data ) {
		$( ".result" ).html( data ); 
		csv( )
		.fromString(data)
		.subscribe((jsonObj)=>
		{  
			csse_covid_19_daily_reports.push(jsonObj);
		});  
	})
	.fail(function(data) {
		log("ERR");
		console.log(data);
		date.setTime(date.getTime()-(86400000  )); 
		loadcsseCovid19DailyReports(date);
	});
} 

var cases_usDataSheet=[];
function loadUSDataSheet(data){
	cases_usDataSheet.push( data); 
}
var cases_caDataSheet=[];

function loadCADataSheet(data){ 
	cases_caDataSheet.push( data); 
}

//var temp=new Date();
//loadcsseCovid19DailyReports(temp);  
//getCSVJsonArray(url_casesComfirmed, loadCasesComfirmed, console.log);
//getCSVJsonArray(url_casesRecovered, loadCasesRecovered, console.log);
//getCSVJsonArray(url_casesDeaths, loadCasesDeaths, console.log);
//getCSVJsonArray(url_usDataSheet, loadUSDataSheet, console.log);
//getCSVJsonArray(url_caGovDataSheet, loadCADataSheet, console.log);


function getcsse_covid_19_daily_reports(req){
	var region=req.url.split("/")[1];
	var caseType=req.url.split("/")[2];
	var res =[];  
	csse_covid_19_daily_reports.forEach(function(data){
		if(data['Country_Region'].toLowerCase().trim() === region.toLowerCase().trim() ){
			res.push(data); 
		} 
	}); 
	if(caseType===undefined){
		return res;
	}else{
		var res1=[];
		res.forEach(function(data){
			if(new Number(data[caseType])>0){
				res1.push(data);
			} 

		});
		return res1;
	}
}

/**
 * 
 * @param country
 * @returns
 */
function time_series_covid19_confirmed_global(country){  
	var x =0; 
	var data; 

	if(country.indexOf('%20')>0){country=country.split('%20').join(' ');}
	var province;
	if(country.indexOf("/")>0){
		province = country.split('/')[1];
		country = country.split('/')[0];

	}
	casesComfirmed.forEach(function (item){
		data = undefined; 
		var d= new Date();
		var s= d.toLocaleString().split(',')[0].replace('2020','20'); 

		if(item['Country/Region'].toLowerCase().trim()===country.toLowerCase().trim()){
			country = item['Country/Region'];
			if(province==undefined){
				data =  item[s]; 
				if(data === undefined){
					for(var f=0; f<10; f++){
						d.setTime(d.getTime()-(86400000*f)); 
						data =  item[d.toLocaleString().split(',')[0].replace('2020','20')];
						if(data!=undefined){
							x+=new Number(data);
							break;
						}
					}
				}  else{ 
					x+=new Number(data);
				}
			}else{ 
				if(item['Province/State']!=undefined && item['Province/State'].toLowerCase().trim()==province.toLowerCase().trim()){

					data =  item[s]; 
					for(var f=0; f<10; f++){
						d.setTime(d.getTime()-(86400000*f));
						data =  item[d.toLocaleString().split(',')[0].replace('2020','20')];
						if(data!=undefined){
							x+=new Number(data);
							break;
						}
					}
				}
			}
		}
	}) 
	var xx={};
	xx['cases']=x
	return xx;

}
/**
 * time_series_covid19_deaths_global
 * @param country
 * @returns
 */
function time_series_covid19_deaths_global(country){  
	var x =0; 
	var data; 
	if(country.indexOf('%20')>0){country=country.split('%20').join(' ');}
	var province;
	if(country.indexOf("/")>0){
		province = country.split('/')[1];
		country = country.split('/')[0];

	}

	casesDeaths.forEach(function (item){
		data = undefined; 
		var d= new Date();
		var s= d.toLocaleString().split(',')[0].replace('2020','20');  
		if(item['Country/Region'].toLowerCase().trim()===country.toLowerCase().trim()){
			if(province==undefined){
				data =  item[s]; 
				if(data === undefined){
					for(var f=0; f<10; f++){
						d.setTime(d.getTime()-(86400000*f));
						data =  item[d.toLocaleString().split(',')[0].replace('2020','20')];
						if(data!=undefined){
							x+=new Number(data);
							break;
						}
					}
				}  else{ 
					x+=new Number(data);
				}
			}
			else{ 
				if(item['Province/State']!=undefined && item['Province/State'].toLowerCase().trim()==province.toLowerCase().trim()){

					data =  item[s]; 
					for(var f=0; f<10; f++){
						d.setTime(d.getTime()-(86400000*f)); 
						data =  item[d.toLocaleString().split(',')[0].replace('2020','20')];
						if(data!=undefined){
							x+=new Number(data);
							break;
						}
					}
				}

			}}
	}) 
	var xx={};
	xx['cases']=x
	return xx; 
}


/**
 * time_series_covid19_recovered_global
 * @param country
 * @returns
 */
function time_series_covid19_recovered_global(country){  
	var x =0; 
	var data; 

	if(country.indexOf('%20')>0){country=country.split('%20').join(' ');}
	var province;
	if(country.indexOf("/")>0){
		province = country.split('/')[1];
		country = country.split('/')[0]; 
	}

	console.log(country);
	casesRecovered.forEach(function (item){
		data = undefined; 
		var d= new Date();
		var s= d.toLocaleString().split(',')[0].replace('2020','20');  
		if(item['Country/Region'].toLowerCase().trim()===country.toLowerCase().trim()){ 
			if(province==undefined){ 
				data =  item[s]; 
				if(data === undefined){
					for(var f=0; f<10; f++){
						d.setTime(d.getTime()-(86400000*f)); 
						data =  item[d.toLocaleString().split(',')[0].replace('2020','20')];
						if(data!=undefined){
							x+=new Number(data);
							break;
						}
					}
				}  else{ 
					x+=new Number(data);
				}
			}
			else{  
				console.log(province);
				if(item['Province/State']=='Ontario'){
					console.log(item);
				}	console.log(item);
				if(item['Province/State']!=undefined && item['Province/State'].trim().length>0 && item['Province/State'].toLowerCase().trim()==province.toLowerCase().trim()){

					console.log("province");
					console.log(province) 
					console.log(item) 
					data =  item[s]; 
					for(var f=0; f<10; f++){
						d.setTime(d.getTime()-(86400000*f));
						console.log(" - " +d.toLocaleString().split(',')[0].replace('2020','20'));
						data =  item[d.toLocaleString().split(',')[0].replace('2020','20')];
						if(data!=undefined){
							x+=new Number(data);
							break;
						}
					}
				}
			}

		}
	}) 
	var xx={};
	xx['cases']=x
	return xx;

}  
var usCDCData={};
var nassaucountyny=0;

/**
 * parse data from line and adds all the numbers
 * @param data
 * @returns
 */
//var yu='    Ardsley 9 Bedford 16 Briarcliff Manor 9 Bronxville 16 Buchanan 0 Cortlandt 48 Croton-on-Hudson 7 Dobbs Ferry 30 Eastchester 55 Elmsford 8 Greenburgh 81 Harrison 38 Hastings-on-Hudson 13 Irvington 10 Larchmont 15 Lewisboro 15 Mamaroneck Town 22 Mamaroneck Village 19 Mount Kisco 34 Mount Pleasant 49 Mount Vernon 136 New Castle 23 New Rochelle 284 North Castle 20 North Salem 3 Ossining Town 12 Ossining Village 81 Peekskill 41 Pelham 21 Pelham Manor 20 Pleasantville 19 Port Chester 82 Pound Ridge 2 Rye Brook 24 Rye City 22 Scarsdale 45 Sleepy Hollow 24 Somers 16 Tarrytown 22 Tuckahoe 9 White Plains 98 Yonkers 301 Yorktown 55';
//yu = yu.split(' ');
//for(var rt=0;rt<yu.length;rt++){
//if(!isNaN(yu[rt])){
//nassaucountyny+=new Number(yu[rt]);
//console.log('rt='+nassaucountyny);
//}
//}


/**
 * Load CDC Us Data
 * @param data
 * @returns
 */
//function loadCDCData(){ 
//$.get('https://www.cdc.gov/coronavirus/2019-ncov/map-cases-us.json', function( data ) {
//$( ".result" ).html( data ); 

//data['data'].forEach(function (item){
//if(item.Jurisdiction!=undefined){ 
//usCDCData[item.Jurisdiction]=item;
//}else{

//}
//});

//}); 
//lastUpdatedCDC= new Date();
//}

function getUSAStatsFromCDC(state){
	state =  state.split('%20').join(' ').replace(' Of ',' of '); 
	if(usCDCData[state]!=undefined){
		return usCDCData[state.replace('%20',' ')]; 
	}else{
		return null;
	}
}


/***
 * Covert US data to smart set
 * @param regionName
 * @param datafromDataSheet
 * @param cdcData
 * @returns
 */

function combineUSData(regionName, datafromDataSheet, cdcData){
	if(casesSmartSet[regionName]==undefined){
		casesSmartSet[regionName]={};
	}

	if(casesSmartSet[regionName][cdcData.Jurisdiction]==undefined){
		casesSmartSet[regionName][cdcData.Jurisdiction]={};
	}
	var r =datafromDataSheet;
	var data={}
	data.FIPS ='';
	data.Admin2 =  "";
	data.Province_State=cdcData.Jurisdiction
	data.Country_Region=regionName; 
	data.Last_Update='';
	data.Lat= '';
	data.Long='';
	data.Confirmed=cdcData['Cases Reported'];
	data.Deaths=r.Deaths;
	data.Recovered=r.Recovered;
	data.Active='';
	data.Combined_Key= data.Country_Region+' '+ cdcData.Jurisdiction;
	data.tested=r.tested;

	casesSmartSet[regionName][cdcData.Jurisdiction]=data;

}


/***
 * Covert CA DATA TO SMART Set
 * @param regionName
 * @param datafromDataSheet
 * @param cdcData
 * @returns
 */
function combineCAData(regionName, datafromDataSheet, cdcData){
	if(casesSmartSet[regionName]==undefined){
		casesSmartSet[regionName]={};
	}

	if(casesSmartSet[regionName][cdcData.Jurisdiction]==undefined){
		casesSmartSet[regionName][cdcData.Jurisdiction]={};
	}
	var r =datafromDataSheet;
	var data={}
	data.FIPS ='';
	data.Admin2 =  "";
	data.Province_State=cdcData.Jurisdiction
	data.Country_Region=regionName; 
	data.Last_Update='';
	data.Lat= '';
	data.Long='';
	data.Confirmed=cdcData.numconf;
	data.Deaths=cdc.numdeaths
	data.Recovered=cdcData.numconf-cdcData.numtoday
	data.Active=cdcData.numtoday;
	data.Combined_Key= data.Country_Region+' '+ cdcData.prname+ ' '+cdcData.prnameFR;
	data.tested=r.numtested;

	casesSmartSet[regionName][cdcData.Jurisdiction]=data;

}



var casesSmartSet={};

function getUSData(county){ 
	cases_usDataSheet.forEach(function (item){

	});

} 

function getSmartData(url){
	var country = url;
	if(url.indexOf('/')>=0){
		country = url.split('/')[0];
	} 
	var data;
	while(country.indexOf('%20')>=0){country=country.replace('%20',' ');}
	var lookingForCountry=country;
	var lookingForProvince;
	if(url.indexOf('/')>=0){ 
		lookingForProvince=url.split('/')[1].trim();
		if(lookingForProvince.indexOf('%20')>0){lookingForProvince=lookingForProvince.split('%20').join(' ')}
	}else{
		lookingForCountry=country.trim();
	}
	var regionData ;

	if(covidDataSet[country]!=undefined){
		if(lookingForProvince==undefined){
			return covidDataSet[country] ;
		}
		else{ 
			for(var count=0;count<covidDataSet[country].length;count++){
				if(covidDataSet[country][count].location.province==lookingForProvince){
					return covidDataSet[country][count];
				}
			}
		}
	}


//	cases_usDataSheet.forEach(function (country){
//	if( country['Country_Region']!=undefined &&(country['Country_Region'].toLowerCase().trim()==lookingForCountry)){ 
//	if(lookingForProvince!=undefined){
//	cases_usDataSheet.forEach(function (province){
//	if(provice.Province_State ==lookingForProvince){
//	data = province;
//	}
//	} )

//	}else{
//	console.log(country);
//	if(country['Province_State'].trim()==''){ 
//	data = country;
//	}
//	}

//	}
//	});  
	return data; 
}




//init and updateDate variables
var  lastUpdatedCDC=new Date();
//loadCDCData(); 
/**
 * Load Canadian covid19 json
 * @param data
 * @returns
 */
var urls={};
urls.url_caGovDataSheet={};
$.get(url_caGovDataSheet_json, function( data ) {  
	urls.url_caGovDataSheet=data
	urls.url_caGovDataSheet.lastUpdate=new Date();  
	populateCanadaData(JSON.parse(data));
	loadUSACovidData();
})

function loadUSACovidData(){
	getJsonData(url_usCovidData_json,populateUSCovidData);
}
function asdd(){ 
	console.log(getPopulation('United States of America','New Orleans'));
}
setTimeout(asdd,5000);
