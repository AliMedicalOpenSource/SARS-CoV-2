var jsdom = require("jsdom");const { JSDOM } = jsdom; const request=require('request');const { window } = new JSDOM();
const csv=require('csvtojson');const { document } = (new JSDOM('')).window;var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; 
var static = require('node-static'); global.document = document;var $ = jQuery = require('jquery')(window); var fs = require('fs'); 
const http = require("http");const hostname = '127.0.0.1';const webServerPort = 8000;const apiServerPort = 8010;
var path = require('path');var mime = require('mime'); 
 
	var pdfreader = require("pdfreader");
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

/************************************ KEY DATA Variables  ***********************************/
var covid19Cases= {}
String.prototype.replaceAt=function(index, replacement) { return this.substr(0, index) + replacement+ this.substr(index + replacement.length)}
String.prototype.replaceAll=function(old,replacement) {	var s= this;if(replacement==undefined){replacement=''};	while(s.indexOf(old)>=0){s =s.replace(old,replacement)}	return s; }
var covidDataSet = new covidDataSetClass();  String.prototype.clean  =function(){return this.replace(/\n+/g, '').replace(/\s+/g, '')};String.prototype.toDigit = function() { return new Number(this.replace(/\D/g,''))};

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
			console.log(error);
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
data_statesISOMap={};
$.get(  'https://raw.githubusercontent.com/AliMedicalOpenSource/GeneralDataSets/master/United%20States%20of%20America/stateISOmap.json', function(data){
	console.log(data);
	data_statesISOMap=JSON.parse(data)
	 data_statesISOMap.Get=function(value) {
		for(var temp_1231=0;temp_1231<data_statesISOMap.length;temp_1231++){
			if(data_statesISOMap[temp_1231].name.toLowerCase()==value.toLowerCase().trim()  ||
			data_statesISOMap[temp_1231].iso_code.toLowerCase().indexOf(value.toLowerCase().trim())>=0){
				return data_statesISOMap[temp_1231];
			}
		}
	}
	 console.log(data_statesISOMap.Get('nc'))
}); 
/**
 * COVID-19 Enhanced Data set
 * @returns
 */
function covidDataSetClass(){ 
	this.Get = function (country, province,jurisdiction){  
		if(covidDataSet[country]!=undefined){if(jurisdiction==undefined){jurisdiction=''}
		for(var count = 0 ; count < covidDataSet[country].length;count++){ 
			var pro = covidDataSet[country][count];
			if(pro.location.jurisdiction ==  jurisdiction  && pro.location.province.toLowerCase()==province.toLowerCase()){  
				return pro;
			} 
		}
		}  else{
			console.log("::::::::::::::::::::::::::::::::::::GET FAIL ::::::::::::::::::::::::::::::")
		}
	}

	this.Remove=function(country,province,jurisdiction){
		if(province==undefined){province = country};if(jurisdiction==undefined){jurisdiction=''}
		for(var count = 0 ; count <covidDataSet[country].length;count++){
			if(covidDataSet[country][count].location.province==province &&covidDataSet[country][count].location.jurisdiction==jurisdiction ){
				var result = covidDataSet[country][count];
				covidDataSet[country].splice(count, 1)
				return result; 
			}
		} 
	}
	/**
	 * Adds or replaces the dataSet
	 */ 
	this.Add =function(dataSet){
		if(dataSet.location.jurisdiction==undefined){dataSet.location.jurisdiction=''}
		var country=dataSet.location.country;var province= dataSet.location.province;
		var jurisdiction=dataSet.location.jurisdiction;var test = covidDataSet[country];
		if (test==undefined){
			covidDataSet[country]=[]; 
		} else test=undefined; 
		covidDataSet.Remove(dataSet.location.country,dataSet.location.province,dataSet.location.jurisdiction);
		if (test==undefined){
			covidDataSet[country].push(dataSet); 
	 		return true;
		} else{
			for(var count = 0 ; count <covidDataSet[country].length;count++){
				if(covidDataSet[country][count].location.province.toLowerCase()==province.toLowerCase() && covidDataSet[country][count].location.jurisdiction.toLowerCase()==dataSet.location.jurisdiction.toLowerCase() ){
					covidDataSet[country][count]=dataSet; 
					return covidDataSet[country][count] == dataSet;
					return true;
				}	} 
			covidDataSet[country].push(dataSet);
			return true
		} 
		log('covidDataSet.protoType.Add()',"ERROR : "+dataSet.location.country + " " + dataSet.location.province + " "  +(( dataSet.location.jurisdiction!='')?dataSet.location.jurisdiction:"") + 'has not been ' );
		return false;

	} 

	this.Update =function(dataSet){
		if(dataSet.location.country == undefined || dataSet.location.province==undefined){
			console.log(dataSet);
			throw 9
		}
		if(covidDataSet[dataSet.location.country]==undefined){
			covidDataSet[dataSet.location.country]=[];
			covidDataSet[dataSet.location.country].push(dataSet)
			return covidDataSet[dataSet.location.country] == dataSet;
		}
		for(var count = 0 ; count <covidDataSet[dataSet.location.country].length;count++){
			if(covidDataSet[dataSet.location.country][count].location.province.toLowerCase()==dataSet.location.province.toLowerCase() && covidDataSet[dataSet.location.country][count].location.jurisdiction.toLowerCase()==dataSet.location.jurisdiction.toLowerCase() ){
				var d1 = new Date(dataSet.lastUpdated);
				var d2 = new Date(covidDataSet[dataSet.location.country][count].lastUpdated) 
				if(d1.getTime() > d2.getTime()){ 
					throw (w)
					covidDataSet[dataSet.location.country][count]=dataSet;
					log('covidDataSet.protoType.Add',dataSet.location.country + " " + dataSet.location.province + " "  +(( dataSet.location.jurisdiction!='')?dataSet.location.jurisdiction:"") + 'has been Updated' );
				}
				return covidDataSet[dataSet.location.country][count] == dataSet;
			}
		} 
		covidDataSet[dataSet.location.country].push(dataSet)
		return covidDataSet[dataSet.location.country][covidDataSet[dataSet.location.country].length] == dataSet;

	}
} 
/***************************************************************************************
 *                       API Server Initialization and start listening
 ***************************************************************************************/
const server = http.createServer((req, res) => {

	//Set the response HTTP header with HTTP status and Content type
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json'); 
	res.setHeader("Access-Control-Allow-Origin", "*");
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
/***************************************************************************************?
/ *                       Web Server Initialization and start listening                   */
/****************************************************************************************/

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
	//log("DataSet",continent+ " "+country+ " "+province+ " "+ jurisdiction+ " "+confirmed+ " "+deaths+ " "+ recovered+ " "+active+ " "+tested+ " "+hospitalized+ " "+icu);
	this.caseData={	confirmed:confirmed,deaths:deaths,recovered:recovered,active:active,tested:tested,	hospitalized:hospitalized,	icu:icu	}; 
	this.addData = function(dataId, data){	if(this.data==undefined){this.data={}}	this.data[dataId]=data	}
	var temp ;
	if(country ){try { 
		this.iso2=data_countriesDetails[countriesNametoIS0Map[country.toLowerCase()]]['ISO3166-1alpha-2'];
		this.iso3=data_countriesDetails[countriesNametoIS0Map[country.toLowerCase()]]['ISO3166-1alpha-3'];
	}catch(e){}
	temp={continent:continent,country:country, 	province:province,	jurisdiction:jurisdiction,	population:0,		populationEstimate:0} 
	} 
	if(temp==undefined){
		temp={	continent:continent,country:country, province:province,jurisdiction:jurisdiction,
				population:data_countriesDetails[countriesNametoIS0Map[country.toLowerCase()]]['ISO3166-1alpha-2'].population,
				populationEstimate:calculate_growthRate(data_countriesDetails[countriesNametoIS0Map[country.toLowerCase()]]['ISO3166-1alpha-2'].population)
		}}
	this.location=temp; 
	this.key=country+ ' ' +province+ ' ' +jurisdiction!=undefined?jurisdiction:'';
	this.Add = function(dataSet){
		if(!isNaN(this.caseData.confirmed)){if(!isNaN(dataSet.caseData.confirmed)){
			this.caseData.confirmed =new Number(this.caseData.confirmed)+new Number(dataSet.caseData.confirmed);
		}}
		if(!isNaN(this.caseData.deaths)){this.caseData.deaths =new Number(this.caseData.deaths)+new Number(dataSet.caseData.deaths);	}
		if(!isNaN(this.caseData.recovered)){this.caseData.recovered =new Number(this.caseData.recovered)+new Number(dataSet.caseData.recovered);}
		if(!isNaN(this.caseData.active)){this.caseData.recovered =new Number(this.caseData.active)+new Number(dataSet.caseData.active);	}
		if(!isNaN(this.caseData.tested)){this.caseData.tested =new Number(this.caseData.tested)+new Number(dataSet.caseData.tested);}
		if(!isNaN(this.caseData.hospitalized)){this.caseData.hospitalized =new Number(this.caseData.hospitalized)+new Number(dataSet.caseData.hospitalized);}
		if(!isNaN(this.caseData.icu)){this.caseData.icu =new Number(this.caseData.icu)+new Number(dataSet.caseData.icu);} 
		if(!isNaN(this.location.population)){this.location.population =new Number(this.location.population)+new Number(this.location.population);} 
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
			unknown:unknown
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
function CovidCase( reportDate ,  onsetDate, gender,  ageGroup,   province,   provinceCode,   county,   countyCode,   region,   regionCode,   hospitalized,   deceased, acquisition)
{	this.onsetDate=onsetDate;	this.gender=gender;	this.ageGroup=ageGroup;	this.province=province;	this.provinceCode=provinceCode;	this.county=county;	this.countyCode=countyCode;	this.region=region;	this.regionCode=regionCode;	this.hospitalized=hospitalized;	this.deceased=deceased;	this.acquisition=acquisition;
} 

/**************************************************************************
 * UTILITY FUNCTIONS
 *****************************************************************************/
/**
 * Gets the  number of days past in the year
 * @param date
 * @returns
 */
function GetDaysIntoYear(date){
	if(date==undefined){date =new Date()}	var  s = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;	return new Number(s);
}

function calculate_CFR(deaths, confirmed){  
	try{ deaths=new Number(deaths);confirmed=new Number(confirmed);	if(deaths==0 || confirmed==0){return 0}var cfr = ( deaths /  confirmed )*100;cfr =Math.round(cfr * 100) / 100 ;	return cfr;}catch(e){		console.log(e);	return undefined;	}
}
function calculate_growthRate(growthRate, pop){
	try { 
		gr = isNaN(growthRate)?new Number(growthRate):growthRate;  
		pop = isNaN(pop)?	new Number(pop):pop;
		var grMod= new Number('0.0000000123');
		grMod=grMod*pop
		if(gr>grMod){
			gr=gr-grMod;
		}
		var growthPeople =Math.round((pop*(gr/100))/365); 
		growthPeople =growthPeople *new Number( GetDaysIntoYear(new Date('04/05/2020'))); 
		growthPeople =new Number(growthPeople) +new Number(pop);  
		growthPeople =Math.round(growthPeople*1000000)/1000000;  
		return growthPeople;
	}catch(e){
		console.log(e)

	}
	return pop;
}


function calculate_infectionPercent(confirmed, pop){  
	try { 
		if(confirmed==undefined){
			throw (null)
		}else if( confirmed ==0){
			return;
		}
		if(confirmed==0){return 0}  
		confirmed = isNaN(confirmed)?new Number(confirmed):confirmed;  
		pop = isNaN(pop)?	new Number(pop):pop; 
		var temp;
		if(pop.toString().indexOf('.')>0){
			temp =Math.round(pop*1000000); 
		}else{ 
			temp = pop ; 
		}
		temp = new Number(confirmed/temp); 
		temp = temp *100 
		temp =temp+'';
		if(temp.toLowerCase().indexOf('e-')>0){ 
			var max =temp.split( "e-")[1]  ;  
			max = new Number(max);  
			for(var count =0; count<max;count++){
				temp = temp.replace("e-",'')
				temp = "0"+temp+'';   
			}  
			temp =   temp .split('.')
			temp = "0."+temp.join('') 
			temp = temp[0]+(temp[1].replace('.','')); 
		}
		return temp;
	}catch(e){
		console.log(e)
	}
}
function Sanatize(string ){ 
	string=string.split('%20');	string = string.join(' ');	string = string.split('/');	string = string.join(' ');	return string.trim() ;}


/**
 * Returns the population by first looking for the country then 
 * searching for the jurisdiction.
 * @param country
 * @param juristictionToReturn
 * @returns
 */
function getPopulation(country,jurisdictionToReturn){  
	country = Sanatize(country);
	var result ; 
	try{   
		if(!jurisdictionToReturn){jurisdictionToReturn=country}
		jurisdictionToReturn = Sanatize(jurisdictionToReturn);  
		if(jurisdictionToReturn.indexOf('Repatriated Travellers')>=0){
			result = {
					name : "repatriated",
					population : 0,
					getPopulation : function (data){
						return 0
					}
			} 
			return result;
		} 
		var temp =data_countriesDetails[countriesNametoIS0Map[country.toLowerCase()]]; 

		if(country==jurisdictionToReturn){
			result = temp 
		}else{  
			temp.provinces.forEach(function (population){   
				if( population['name'].toLowerCase().trim()==jurisdictionToReturn.toLowerCase().trim()){
					result =  population; 
				}
			}); 
		}
		if( result){ 
			var temp =new Population(result.name?result.name:result.Name, result.population.toString().replace(/[^\d.-]/g, '')); 
			temp.getPopulation = function() {
				return new Number(this.population);
			}
			return temp;
		} else{
			console.log("getPopulation("+jurisdictionToReturn+" ) - Fail  : " +country );
		}  
		return result;
	}catch(e){
		console.log("ERR: unable to getPopulation");
		console.log("ERR:  getPopulation(country,jurisdictionToReturn)"); 
		console.log("ERR:  getPopulation("+country+" , " +jurisdictionToReturn+')');
		console.log(e)
		console.log(country)
		console.log(jurisdictionToReturn)
		throw(e);
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
	log('populateCanadaData')
	var canada =new DataSet("North America","Canada",'Canada','', 0,0, 0,0,0,0,0);// covidDataSet['Canada']=[];
	for(var count=0;count<jsonArray.length;count++){ 
		var data = jsonArray[count]  
		var x =new DataSet("North America","Canada", data.prname!=undefined?data.prname:'Canada', '', data.numconf	,data.numdeaths, 0,data.numtoday,data.numtested,0,0);   
		if(data.numdeaths>0){
			x.caseData.cfr =calculate_CFR(data.numdeaths,data.numconf);  
		}else{
			x.caseData.cfr =0;
		} 
		var temp=getPopulation('Canada',x.location.province);
		// REPATRIATED TRAVELERS
		if(!temp){   
			x.caseData.percentConfirmed = 0;
		}else{    
			x.caseData.percentConfirmed = calculate_infectionPercent(x.caseData.confirmed,temp.population) 
		}
		x.location.population=temp!=null?temp.population:' - ';  
		x.lastUpdate=  convert_DateDayMonthYeartoMonthDayYear(data.date); 
		var ha=false;  
		for(temp = 0 ; temp <covidDataSet['Canada'].length; temp++){ 
			if(covidDataSet['Canada'][temp].location.province==x.location.province
					&& covidDataSet['Canada'][temp].location.jurisdiction==x.location.jurisdiction){
				ha=true;
			}
		} 
		if(!ha){ 
			covidDataSet.Add (x); 
		}	 
		for(temp = 0 ; temp <covidDataSet['Canada'].length; temp++){  
			if(covidDataSet['Canada'][temp].location.province==x.location.province && new Date(covidDataSet['Canada'][temp].lastUpdate).getTime() < new Date(x.lastUpdate).getTime()){
				covidDataSet['Canada'][temp]=x; 

			}else if( covidDataSet['Canada'][temp].location.province==x.location.province && 
					new Date(covidDataSet['Canada'][temp].lastUpdate).getTime() == new Date(x.lastUpdate).getTime()){
				if(new Number(covidDataSet['Canada'][temp].confirmed)>new Number(x.confirmend)){
					covidDataSet['Canada'][temp]=x; 
				}
			} 
		}  
	}   
//var d='http://download1081.mediafire.com/wf4gmolwo5gg/a8vnfmggmz2cz4l/COVID-19-data+%289%29.csv';
//	var request =new Request('http://download1644.mediafire.com/uhw8i60h4rng/sw6w1dnqdvze6ri/COVID-19-data+%2817%29.csv', load_ca_NovaScotia)  ;
	 var request =new Request('https://api.allorigins.win/get?url=https://novascotia.ca/coronavirus/data/COVID-19-data.csv', load_ca_NovaScotia)  ;
	request.send();
	//	getJsonData('https://raw.githubusercontent.com/AliMedicalOpenSource/CovidDataSets/master/canada/nova%20scotia/covidNovaScotia.json' ,load_ca_NovaScotia ) 

}   

var nsheaders='Date,New,Negative,Recovered,in Hospital,Hospitalized,Deaths,Western,Northern,Eastern,Central,Female,Male,0to19,20to44,45to64,65+\n';
function load_ca_NovaScotia(csvText){
	//covidDataSet.Remove("Canada","Nova Scotia");
	log('load_ca_NovaScotia()'); 
	csvText = csvText.split("\n") ;
	csvText.splice(0,2);
	csvText=csvText.join('\n'); 
	csvText = nsheaders+csvText  
	var totDeath=0; 
	var jsonArray  =convert_csvToJSON(csvText); 
	for(var count=1;count<jsonArray.length;count++){ 
		var data = jsonArray[count]  
		totDeath+=new Number(jsonArray[count].Deaths);
		var confirmed =new Number(data.Western);
		confirmed +=new Number(data.Northern)  ;
		confirmed +=new Number(data.Eastern)  ;
		confirmed +=new Number(data.Central)  ;  
		var tested = new Number  (data.Negative) +new Number(confirmed);
		var act = new Number  (confirmed) - new Number(data.Recovered); 
		var x =new DataSet("North America","Canada", 'Nova Scotia', '', confirmed
				,totDeath, data.Recovered?data.Recovered:0,act,tested,data['in Hospital'] ,'');   
		x.caseData.female = data.Female?data.Female:0;
		x.caseData.male = data.Female?data.Male:0; 
		x.caseData.ageInfo={
				"0to19":data['0to19'],
				"20to44": data['20to44'],
				"45to64": data['45to64'],
				"65+": data['65+']
		}
		if(data.numdeaths>0){
			x.caseData.cfr =calculate_CFR(data.numdeaths,data.numconf); 
		}else{
			x.caseData.cfr =0;
		}  
		var temp=getPopulation('Canada',x.location.province); 
		if(!temp){ 
			x.caseData.percentConfirmed = undefined;
		}else{   
			x.caseData.percentConfirmed = calculate_infectionPercent(x.caseData.confirmed,temp.population) 
		} 
		x.location.population=temp!=null?temp.population:' - ';  
		x.lastUpdated=  convert_DateYearMonthDaytoMonthDayYear(data.Date);   
			covidDataSet.Add (x);  
	}   

	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://cors-anywhere.herokuapp.com/https://data.ontario.ca/dataset/f4f86e54-872d-43f8-8a86-3892fd3cb5e6/resource/ed270bb8-340b-41f9-a7c6-e8ef587e6d11/download/covidtesting.csv', true);


	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	xhr.onload = function(data) {  
		log('load_ca_NovaScotia()-Success ');		var responseText = xhr.responseText;		load_ca_Ontario(responseText);  
	}; 
	xhr.onerror = function(data) {
		log("load_ca_NovaScotia() - Error on request");	log("load_ca_NovaScotia","FAIL ",data);	log(data);
		 
	};
	xhr.send();	log('load_ca_NovaScotia() - END'); 	log('loadWorldData() ');
//	//setTimeout(1000,loadUSACovidData());
}


function load_ca_Ontario(csvText){  
	log('load_ca_Ontario() ');  
	csv( )
	.fromString(csvText)
	.subscribe((data)=> {  
		try{  

			var x =new DataSet("North America","Canada", 'Ontario', '', (data['Total Cases']!='')?data['Total Cases'].toDigit():0,
					data.Deaths==''?0:data.Deaths.toDigit(), data.Resolved.toDigit()==''?0:data.Resolved.toDigit(),'',
							data['Total patients approved for testing as of Reporting Date']!=''?data['Total patients approved for testing as of Reporting Date'].toDigit():0,
									data['Number of patients hospitalized with COVID-19']!=''?data['Number of patients hospitalized with COVID-19'].toDigit():0,
											data['Number of patients in ICU with COVID-19']!=''?data['Number of patients in ICU with COVID-19'].toDigit():0); 

			var temp=getPopulation("Canada",x.location.province);
			if(temp!=null){ 
				x.location.population=temp.population;
			}else{
				x.location.population=undefined;
			}   
			x.caseData.ventilator=data['Number of patients in ICU on a ventilator with COVID-19'];
			x.location.population=temp!=null?temp.population:' - ';  
			x.lastUpdate=  convert_DateYearMonthDaytoMonthDayYear(data['Reported Date']);  
			if(x.caseData.deaths>0){ 
				x.caseData.cfr = calculate_CFR(x.caseData.deaths,x.caseData.confirmed);
			}else{ 
				x.caseData.cfr = 0;
			} 
				covidDataSet.Add (x);  
		}catch( e){
			conole.log(e); 
			log("load_ca_Ontario() - FAIL : failed server request")
		} 
	});   
	log("load_ca_Ontario() - END ") 
	var request =new Request('https://www.quebec.ca/en/health/health-issues/a-z/2019-coronavirus/situation-coronavirus-in-quebec',loadQuebec);
 	request.send()
}

function loadQuebec(data){
	log("loadQuebec()");	var sec1=data.split('c47904')[1];	sec1 =sec1.split('<strong>In Québec</strong>')[1];	sec1 =sec1.split('confirmed cases') [0] ;	var confirmed=sec1.replaceAll('&nbsp;').replace(/\D/g,'') ;
	 
	if(isNaN(confirmed)){
		log("loadQuebec() : Error getting confirmed")
		confirmed=null;
	}
	var deaths =data.split('<p>Total</p></td><td><p class="texteCentre">')[2]
	deaths =deaths.split('</p>')[0]  
	deaths = deaths.replaceAll('&nbsp;').replace(/\D/g,'')  
	if(isNaN(deaths)){
		log("loadQuebec() : Error getting deaths")
		deaths=null;
	}
	var hosp =data.split('Total number of hospitalizations:')[1];
	hosp=hosp.split('</li>')[0]; 
	if(isNaN(hosp)){
		log("loadQuebec() : Error getting hospitalizations");
		hosp=null;
	} 
	var icu=data.split('Number in intensive care<sup>2</sup>:')[1];
	icu=icu.split('</li>')[0]; 
	if(isNaN(hosp)){
		log("loadQuebec() : Error getting icu")
		icu=null;
	} 
	var tested;
	var negative=data.split('Negative cases<sup>2</sup>:')[1].split('</li>')[0].replace(/\D/g,'')  
	if(isNaN(negative)){
		log("loadQuebec() : Error getting icu")
		icu=null; 
	}else{ 
		tested= new Number(negative) +new Number(confirmed);
	} 
	var quebec=new DataSet("North America", "Canada","Quebec",'',new Number(confirmed) ,new Number(deaths), 
			'n/a', 'n/a' , new Number(tested), new Number(hosp),new Number(icu));
	var temp = covidDataSet.Get("Canada","Quebec",""); 
	quebec.location=temp.location;
	quebec.caseData.cfr = calculate_CFR(deaths,confirmed); 
	quebec.addData('ha','https://www.quebec.ca/en/health/health-issues/a-z/2019-coronavirus/situation-coronavirus-in-quebec/');
 	var request= new Request('https://www2.gnb.ca/content/gnb/en/departments/ocmoh/cdc/content/respiratory_diseases/coronavirus.html',loadNewBrunswick)
 	log("loadQuebec() -- End - Sending Request for New Brunswick");
	request.send();
}


function loadNewBrunswick(data){
	log("loadNewBrunswick()");
	var conf=new Number(data.split('Total cases :')[1].split('<br>')[0]); 
	var conf=new Number(data.split('Total cases :')[1].split('<br>')[0]); 
	var rec=new Number(data.split('<b>Recovered :')[1].split('<br>')[0]); 
	var act=new Number(data.split('<b>Active cases:')[1].split('<br>')[0]); 
	var temp = covidDataSet.Get("Canada","New Brunswick");
	temp.caseData.confirmed=conf;
	temp.caseData.recovered=rec;
	temp.caseData.active =act;
	temp.addData('ha','https://www2.gnb.ca/content/gnb/en/departments/ocmoh/cdc/content/respiratory_diseases/coronavirus.html#') 
	covidDataSet.Add(temp);
	log('loadNewBrunswick() - END'); 
	var request= new Request('https://www.princeedwardisland.ca/en/information/health-and-wellness/pei-covid-19-testing-data',loadPEI)
	log("loadNewBrunswick() -- End - Sending Request for New Brunswick");
	request.send();
}

function loadPEI(data){
	log("loadPEI()")
	try {
		data=data.replace(/\s+/g, ''); 
		data=data.replace(/\n+/g, ''); 
		var totalTest = data.split("Totalcases(includingrecoveredcases)")[1];
		totalTest=totalTest.split('<td>')[1].split('</td>')[0] ;
		var recovered = data.split("<td>Recoveredcases</td>")[1];
		recovered=recovered.split('<td>')[1].split('</td>')[0] ;
		var female = data.split('<divclass="table-responsive">Female</div></td><td><divclass="table-responsive">')[1]
		female=female.split('</div>')[0] ;
		var male = data.split('<divclass="table-responsive">Male</div></td><td><divclass="table-responsive">')[1]
		male=male.split('</div>')[0] ;
		var pei = covidDataSet.Get("Canada",'Prince Edward Island');
		var range =data.split('<divclass="table-responsive">&lt;20</div></td><td><divclass="table-responsive">')[1];
		range = range.split('</div>')[0];
		pei.caseData["0-19"]=range;   
		range =data.split('</tr><tr><td>20to39</td><td>')[1];
		range = range.split('</td>')[0];  
		pei.caseData["20-39"]=range;
		range =data.split('</tr><tr><td>40to59</td><td>')[1];
		range = range.split('</td>')[0];  
		pei.caseData["40-59"]=range;
		range =data.split('</tr><tr><td>60to79</td><td>')[1];
		range = range.split('</td>')[0]; 
		pei.caseData["60-79"]=range;
		range =data.split('</tr><tr><td>80andover</td><td>')[1];
		range = range.split('</td>')[0];  
		pei.caseData["80+"]=range; 
		log("loadPEI() - END"); 
		pei.caseData.confirmed = totalTest;
		pei.caseData.recovered = recovered;
		var neg = data.split("<td>Negativeresults</td><td>")[1].split("</td>")[0].replace(/\D/g,'')  ; 
		pei.caseData.tested =new Number(totalTest)+new Number(neg); 
		pei.addData('ha','https://www.princeedwardisland.ca/en/information/health-and-wellness/pei-covid-19-testing-data');
		covidDataSet.Add(pei);
	}catch(e){
		log("loadPEI()","Data Collection Error",e);
	}finally{ 
		log("loadPEI() : END ");
		var request =new Request('https://services8.arcgis.com/aCyQID5qQcyrJMm2/arcgis/rest/services/Prov_Covid_Calc_TimeSeries/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=date_of_update%20asc&resultOffset=0&resultRecordCount=2000&cacheHint=true',loadNFL);
		request.send();
	}
}
var current;
function loadNFL(data){ 
	try{ 
		log('loadNFL()') 
		data=JSON.parse(data) ;	current = data.features[0];	data.features.forEach(function (item){	
			if(item.attributes.date_of_update>current.attributes.date_of_update){current=item}	}  );	
		var nfl = covidDataSet.Get("Canada",  'Newfoundland and Labrador' ); nfl.caseData.hospitalized = current.attributes.total_hospitalized;nfl.caseData.deaths = current.attributes.total_deaths;	nfl.caseData.tested = current.attributes.total_tests_delivered;	nfl.addData('ha','https://www2.gnb.ca/content/gnb/en/departments/ocmoh/cdc/content/respiratory_diseases/coronavirus.html#');nfl.caseData.cfr = (current.attributes.total_deaths/current.attributes.total_cases)*100; 
	}catch(e){
		log('loadNFL()',"Data Collection Error",e);
	}finally{
		var request = new Request('https://services8.arcgis.com/aCyQID5qQcyrJMm2/arcgis/rest/services/Covid_AgeLayerPublic2/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22avg%22%2C%22onStatisticField%22%3A%22under_19%22%2C%22outStatisticFieldName%22%3A%22under_19%22%7D%2C%7B%22statisticType%22%3A%22avg%22%2C%22onStatisticField%22%3A%22_20_39%22%2C%22outStatisticFieldName%22%3A%22_20_39%22%7D%2C%7B%22statisticType%22%3A%22avg%22%2C%22onStatisticField%22%3A%22_40_49%22%2C%22outStatisticFieldName%22%3A%22_40_49%22%7D%2C%7B%22statisticType%22%3A%22avg%22%2C%22onStatisticField%22%3A%22_50_59%22%2C%22outStatisticFieldName%22%3A%22_50_59%22%7D%2C%7B%22statisticType%22%3A%22avg%22%2C%22onStatisticField%22%3A%22_60_69%22%2C%22outStatisticFieldName%22%3A%22_60_69%22%7D%2C%7B%22statisticType%22%3A%22avg%22%2C%22onStatisticField%22%3A%22_70_100%22%2C%22outStatisticFieldName%22%3A%22_70_100%22%7D%5D&cacheHint=true' ,function(data1){
			var nfl = covidDataSet.Get("Canada",  'Newfoundland and Labrador' );
			data1 = data1.replace('-','to','');	data1 = data1.replace('_','to','');
			data1 = data1.replace('under_','0');data1 =JSON.parse(data1 );	 
			nfl.caseData.ageInfo=data1.features[0].attributes; 	
		 	covidDataSet.Add(nfl); log('loadNFL() : END') ;
			var re=new Request('https://www.gov.mb.ca/covid19/updates/index.html',loadManitoba)
			re.send();
		});
		request.send();
	}
	log('loadNFL() : Requesting Age Data ...') 
}
function loadManitoba(data){
	log("loadManitoba())");
	try{ 
		data=data.replace(/\s+/g, ''); 	data=data.replace(/\n+/g, ''); 	var r = data.split("Totals")[1].split('</tbody>')[0] ; 	var confirmed = r.split('<palign="center"><strong>')[1].split('</strong>');	var deaths = r.split('<palign="center"><strong>')[3].split('</strong>')[0];	log("MB Deaths = " + deaths);	data = data.split('<divid="coronavirus-current">');	data=data[1].split('</li>') ;var hosp = data[0].split('<li>')[1].substr(0,4).replace(/\D/g,'') ;	var recov =data[1].replace('COVID-19').replace('</li>').replace(/\D/g,'') ;	var mb=covidDataSet.Get('Canada','Manitoba');	if(isNaN(hosp)){		log("loadManitoba() : Unable to retreive hospital info");	}else{		mb.caseData.hospitalized=hosp;	}
		mb.addData('ha','https://www.gov.mb.ca/covid19/updates/index.html');if(isNaN(recov)){	log("loadManitoba() : Unable to recovery  hospital info");}else{mb.caseData.recovered=recov};	covidDataSet.Add(mb);
	}catch(e){
		log("loadManitoba()","Data Collection Error",e);
	}
	log("loadManitoba() : END");var request=new Request('https://www.saskatchewan.ca/government/health-care-administration-and-provider-resources/treatment-procedures-and-guidelines/emerging-public-health-issues/2019-novel-coronavirus/cases-and-risk-of-covid-19-in-saskatchewan',loadSK);
	request.send();	
}
function loadSK(data){ 
	log("loadSK()");
	try{
		data=data.clean();	var da=data;var da2=data;data=data.split('TotalSaskatchewan')[1].split('</tr>')[0].split("</strong>");var con = data[2].replace(/\D/g,'') ;var act =data[3].replace(/\D/g,'') ;	var hosp =data[4].replace(/\D/g,'') ;var icu =data[5].replace(/\D/g,'') ;var rec =data[6].replace(/\D/g,'') ;	var deaths =data[7].replace(/\D/g,'') ; var sk = covidDataSet.Get("Canada",'Saskatchewan');	if(isNaN(con)){	log("loadSK() : Failed to get confirmed") ;		}else{log("loadSK() : Confirmed " + con);	sk.caseData.confirmed=con; sk.caseData.cfr = calculate_CFR(deaths,con);		} 	if(isNaN(act)){	log("loadSK() : Failed to get active cases") ;	}else{	log("loadSK() : Active " + act);sk.caseData.active=act; } 		if(isNaN(hosp)){log("loadSK() : Failed to get hospitalized") 	}else{		log("loadSK() : hospitalized " + hosp);	sk.caseData.hospitalized=hosp ; 		} 	if(isNaN(icu)){	log("loadSK() : Failed to get icu patients") ;		}else{			log("loadSK() : ICU " + icu);	sk.caseData.icu=icu;	sk.caseData.hospitalized+=icu; 		} 		if(isNaN(rec)){			log("loadSK() : Failed to get recovered") ;		}else{			log("loadSK() : Recovered " + rec);		sk.caseData.recovered=rec;		} 	if(isNaN(deaths)){	log("loadSK() : Failed to get deaths") ;}else{		log("loadSK() : Deaths " + deaths);	sk.caseData.deaths=deaths; 	sk.caseData.cfr = calculate_CFR(deaths,con); 		} 	da=da.split('<em>TotalTestsPerformed:</em>')[1]	;	da=da.split("</strong>")[0].replace(/\D/g,'') ; if(isNaN(da)){	log("loadSK() : Failed to get tests") ;	}else{		log("loadSK() : Confirmed " + da);	sk.caseData.tests=da;  	} 	da2=da2.split('<tableclass="compacttable">')[2].split('<tr>')[2].split('<td>');		sk.caseData.ageInfo={}; if(!isNaN(da2[2].replace(/\D/g,'') )){	sk.caseData.ageInfo["0to19"]=da2[2].replace(/\D/g,'')}if(!isNaN(da2[3].replace(/\D/g,'') )){	sk.caseData.ageInfo["20to44"]=da2[3].replace(/\D/g,'')		} 		if(!isNaN(da2[4].replace(/\D/g,'') )){	sk.caseData.ageInfo["45to64"]=da2[4].replace(/\D/g,'')		} 
		if(!isNaN(da2[5].replace(/\D/g,'') )){	sk.caseData.ageInfo["65+"]=da2[5].split("</td>")[0].replace(/\D/g,'') ;		}		sk.addData('ha','https://www.saskatchewan.ca/government/health-care-administration-and-provider-resources/treatment-procedures-and-guidelines/emerging-public-health-issues/2019-novel-coronavirus');;covidDataSet.Add(sk);
	}catch(e){
		log('loadSK',"Data Collection Error", e);

	}finally{ 
		log("loadSK() :  END");	var  request = new Request('https://covid19stats.alberta.ca', loadAlberta);	request.send();
	}

}

function loadAlberta(data){ 
	try { 
	log("loadAlberta()");
	
	
	var vals=[];
	var da = data.split('type="application/json"'); 
	var x =(da[1].split('">')[1].split('\</script')[0]); ;
	vals.push(JSON.parse(x)); 
	  x = da[2].split('">')[1].split('\</script')[0] ; 
	  vals.push(JSON.parse(x));
		  x =(da[3].split('">')[1].split('\</script')[0]);;
		  vals.push(JSON.parse(x)); 
		  x =(da[4].split('">')[1].split('\</script')[0]);
		  vals.push(JSON.parse(x)); 
		  x =(da[5].split('">')[1].split('\</script')[0]);
		  vals.push(JSON.parse(x)); 
		  x =(da[6].split('">')[1].split('\</script')[0]);
		  
		  vals.push(JSON.parse(x)); 
		  x =(da[7].split('">')[1].split('\</script')[0]);
		  vals.push(JSON.parse(x)); 	 
	//var da=data.split('<script type="application/json" data-for="htmlwidget-e4b2584e06c4d35464cd">'.clean())[1].split('</script>')[0];	
	  
	var values={};	
	vals[0].x.data.forEach(function(d){  
		if(!values[d.name.toLowerCase()]){values[d.name.toLowerCase()]=0}
		 
		values[d.name.toLowerCase()]+=new Number(d.y[d.y.length-1])  ; 
		}); 

	vals[2].x.data.forEach(function(d){  
		values[d.name.toLowerCase()]+= new Number(d.y[d.y.length-1]) ;  
		}); 

	vals[3].x.data.forEach(function(d){  
	//	values[d.name.toLowerCase()]+= new Number(d.y[d.y.length-1]) ; 
		}); 
	vals[4].x.data.forEach(function(d){  
	//	values[d.name.toLowerCase()]= new Number(d.y[d.y.length-1]) ; 
		});  
//	vals[5].x.data.forEach(function(d){  
//		values[d.name.toLowerCase()]= new Number(d.y[d.y.length-1]) ; 
//		}); 
	vals[6].x.data.forEach(function(d){   
 	 
		}); 
//	da=data.split('<scripttype="application/json"data-for="htmlwidget-e4b2584e06c4d35464cd">')[1].split('</script>')[0];
//	da=JSON.parse(da); 
    values.tested=0;   
//	vals[6].x.data[1].y.forEach(function(x ){
		vals[6].x.data[0].y.forEach(function (item){
	 		 
		values.tested += new Number(item) ;});     
    var ab=covidDataSet.Get("Canada", "Alberta");	 
	ab.caseData.tested = values.tested;
	ab.caseData.deaths=values.died;	
	ab.caseData.recovered = values.recovered;
	ab.caseData.active = values.active; 
	ab.caseData.confirmed =   values.died+values.recovered+values.active; 
	ab.caseData.cfr=calculate_CFR(ab.caseData.deaths, ab.caseData.confirmed);
	data1 =data.clean();
	data1=data1.split("Table 2. Total Hospitalizations, ICU admissions and deaths (ever) among COVID-19 cases in Alberta by age group".clean())[1]; 
	data1=data1.split('<tbody>')[1].split("</td>"); 
	values.hospitalized=new Number(data1[3].toDigit());
	values.icu=new Number(data1[5].toDigit()) ;
	ab.caseData.hospitalized=values.hospitalized;	  ab.caseData.icu=values.icu;
	var r=data1[12] .toDigit()+data1[12+11].toDigit()+data1[12+22].toDigit();
	ab.caseData.ageInfo={}
	ab.caseData.ageInfo["0to10"]=r; 
	r=data1[12+33].toDigit(); 
	ab.caseData.ageInfo["10to19"]=r;
	var r=data1[12+44].toDigit();
	ab.caseData.ageInfo["20to29"]=r;
	r=data1[12+55].toDigit();
	ab.caseData.ageInfo["30to39"]=r;
	r=data1[12+66].toDigit();
	ab.caseData.ageInfo["40to49"]=r;
	r=data1[12+77].toDigit();
	ab.caseData.ageInfo["50to59"]=r;
	r=data1[12+88].toDigit();
	ab.caseData.ageInfo["60to69"]=r;
	r=data1[12+99].toDigit();
	ab.caseData.ageInfo["70to79"]=r;  
	r=data1[12+110].toDigit(); 
	ab.caseData.ageInfo["80+"]=r; 
	ab.addData('ha','https://www.alberta.ca/coronavirus-info-for-albertans.aspx');  
	covidDataSet.Add(ab) 
	}catch(e){
		log("loadAlberta()","Failed Dat Retreival",e)
	}finally{
		log("loadAlberta() : End");
	}
 var request =new Request('http://www.bccdc.ca/health-info/diseases-conditions/covid-19/case-counts-press-statements',loadBC);
 request.send();
}

function loadBC(data){
	try{
	log('loadBC()'); 
	var bc =covidDataSet.Get("Canada","British Columbia"); 
	data=data.clean().replaceAll('&#160;',''); 
	var confirmed = data.split('confirmed cases as of'.clean())[0];  
	confirmed=confirmed.split('BritishColumbia<br></h3><div><p><b>')[1].toDigit();  
	if(isNaN(confirmed)) log("loadBC() : Unable to load bc confirmed")
	else bc.caseData.confirmed=confirmed;
	var rec = data.split('recovered in BC<br>'.clean())[0]; 
	rec = rec.split('</b><br></p><ul><li>'.clean())[1].toDigit(); 
	if(isNaN(rec)) log("loadBC() : Unable to load bc recovered")
	else bc.caseData.recovered=rec;
	var de = data.split('deaths in BC<br></li>'.clean())[0]; 
	de = de.split('recovered in BC<br></li><li>'.clean())[1].toDigit();  
	if(isNaN(de)) log("loadBC() : Unable to load bc deaths")
	else bc.caseData.deaths=de;
	var tests = data.split('</li></ul><li>')[1];  
	tests = tests.split('testscompletedasof'.clean())[0].toDigit();  
	if(isNaN(tests)) log("loadBC() : Unable to load bc tested")
	else bc.caseData.tested=tests; 
	covidDataSet.Add(bc);
	log('loadBC() : END');
	}catch(e){
		log("loadBC()","Data Retreival error",e)
	}
	finally{
		var request = new Request('https://yukon.ca/en/health-and-wellness/covid-19/current-covid-19-situation',loadYK);
		request.send();
	} 
} 
 function loadYK(data){ 
	 try{
	 log('loadYK()');
	 data=data.clean();
	 var yk=covidDataSet.Get("Canada","Yukon")
	 data=data.clean();
	 data=data.split('<table class="table" style="width:60%;"><tbody><tr><td>Total people tested</td>'.clean())[1];
	 data=data.split('</tbody>')[0];
	 data=data.split('</td>'); 
	 var tested = data[0].toDigit();
	 var conf = data[2].toDigit() ;
	 var rec = data[4].toDigit() ;
	 if(isNaN(conf)) log('loadYK() : Failed to retreive confirmed')
	 else yk.caseData.confirmed=conf;
	 if(isNaN(tested)) log('loadYK() : Failed to retreive tested')
	 else yk.caseData.tested=tested; 
	 if(isNaN(rec)) log('loadYK() : Failed to retreive recovered')
	 else yk.caseData.tested=rec; 
	 
	 console.log(yk);
	 log('loadYK() : END');
 }catch(e){
		log("loadYK()","Data Retreival error",e)
	}
	finally{
		var request = new Request('https://www.hss.gov.nt.ca/en/services/coronavirus-disease-covid-19',loadNWT);
		request.send();
	} 
 }
 
 var temp_ca=new DataSet('Canada','Canada')
 function loadNWT(data){
	 try{ 
		 log("loadNWT()");
	 data=data.clean().split('<li>Confirmed Cases: <b>'.clean())[1].split("</ul>")[0];
	 data=data.split("</li>");	 var a=data[0].toDigit();var b=data[1].toDigit();	 var c=data[2].toDigit();	 var d=data[3].toDigit();	 var e=data[4].toDigit();	 var nwt =covidDataSet.Get("Canada","Northwest Territories")
	 if(isNaN(a))log("loadNWT() : Failed to get confirmed"); 
	 else nwt.caseData.confirmed=a;	
	 if(isNaN(b))log("loadNWT() : Failed to get tested");
	 else nwt.caseData.tested=b;	
	 if(isNaN(b))log("loadNWT() : Failed to get tested");
	 else nwt.caseData.recovered=e;	
	 nwt.addData('ha','https://www.hss.gov.nt.ca/en/services/coronavirus-disease-covid-19');
	 temp_ca=covidDataSet.Get("Canada","Canada");	 temp_ca.caseData.deaths=0;	 temp_ca.caseData.recovered=0;	 temp_ca.caseData.hospitalized=0;	 temp_ca.caseData.active=0;	 temp_ca.caseData.icu=0;temp_ca.caseData.confirmed=0;	 temp_ca.caseData.tested=0; 
	   covidDataSet["Canada"].forEach(function(item) {
		 if(item.location.province=='Canada'){}
		 else{
			// console.log(item.location.province+" "+item.caseData.confirmed +" " +item.caseData.deaths+" " +item.caseData.icu+" " +item.caseData.tested);
				if(!isNaN(item.caseData.deaths)) temp_ca.caseData.deaths+=new Number(item.caseData.deaths);
				if(!isNaN(item.caseData.confirmed)) temp_ca.caseData.confirmed+=new Number(item.caseData.confirmed);
				if(!isNaN(item.caseData.active)) temp_ca.caseData.active+=new Number(item.caseData.active);
			if(!isNaN(item.caseData.recovered)) temp_ca.caseData.recovered+=new Number(item.caseData.recovered);
			if(!isNaN(item.caseData.hospitalized))temp_ca.caseData.hospitalized+=new Number(item.caseData.hospitalized); 
			if(!isNaN(item.caseData.icu)) temp_ca.caseData.icu+=new Number(item.caseData.icu);
			if(!isNaN(item.caseData.tested)) temp_ca.caseData.tested+=new Number(item.caseData.tested);
			 temp_ca.caseData.cfr = calculate_CFR(temp_ca.caseData.deaths,temp_ca.caseData.confirmed)
			 temp_ca.caseData.percentConfirmed=calculate_infectionPercent(temp_ca.caseData.confirmed, temp_ca.location.population)
		 }
	 }); 
	console.log( covidDataSet.Add(temp_ca));
//	 console.log(covidDataSet.Get("Canada","Canada"));
	// console.log(covidDataSet["Canada"]);
	 
 }catch(e){
		log("loadNWT()","Data Retreival error",e)
	}
	finally{
		var request = new Request('https://www.gov.nu.ca/health/information/covid-19-novel-coronavirus',loadNU);
		request.send();
	}  
	
 }
 function loadNU(data){
	 data =data.clean();
	 data=data.split('<table border="1" cellpadding="0" cellspacing="0"><tr><td align="center">Confirmed cases</td>'.clean())[1];
	 data=data.split('</table>')[0].split("</td>");
	 console.log(data);
	 var nt =covidDataSet.Get('Canada','Nunavut');
	 nt.addData('ha','https://www.gov.nu.ca/health/information/covid-19-novel-coronavirus');
	 var request= new Request("https://covidtracking.com/api/v1/states/daily.json",populateUSCovidData);
	request.send()
 } 
 
covidDataSet['United States of America']=[];
const string_USA = 'United States of America';
function populateUSCovidData(jsonArray){ 
//	jsonArray =JSON.parse(jsonArray);
	//console.log(jsonArray) 
	 
	for(var count=0;count<jsonArray.length;count++){
	//	console.log(jsonArray[count])
		var data = jsonArray[count];
		if(data.Jurisdiction!=null){ 
			var x =new DataSet("North America",string_USA, data.name,'',new Number(data.positive), new Number(data.death), data.recovered
					,0, data.totalTestingResults,0,0);   

			var temp=getPopulation(string_USA,x.location.province);
			if(temp!=null){ 
				x.location.population=temp.population;
			}else{
				x.location.population=undefined;
			}


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
	initDataScrape();
}    
/*********************************************************************/
/*                            LOAD GENERAL DATA                      */
/*********************************************************************/
function populateUSAData(jsonArray){  

	data_countriesDetails.US.provinces=[];
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
		data_countriesDetails.US.AddProvince( 'US',{ name:jsonArray[count].NAME,population:pop})

	}

	loadCovidData();
}
/**
 * 
 * @returns
 */
var iso;
function loadCanadaData(iso2){  
	if(iso2==undefined){iso2='iso';}  
	iso=iso2; 
	getCSVJsonArray(url_caGovPopulation , function( json ) {  
		data_countriesDetails['CA'].AddProvince('CA',{
			name:json.Geography,
			population:json.Persons,
			temp:0
		}); 
	});
	setTimeout(loadCUSAData,1000);

}//log('loadCanadaData  - ' +data_countriesDetails['CA'].provinces.length+' provinces added'); 

 
 
function loadCUSAData(iso2){ 
	log('loadCUSAData() ',iso2)
	if(iso2==undefined){iso2="US"}    
	data_countriesDetails[iso2].provinces=[];
	iso=iso2;
	getJsonData(url_usGovPopulation_json , function( json ) {   
		log('loadCUSAData() - ' +data_countriesDetails[iso2].provinces.length +' provinces added');
		log('loadCUSAData() - END');   
		populateUSAData(json) ;
	}); 
}
var data_countriesDetails = {} ;
data_countriesDetails.CountryNameMap={};
var countriedISO3to2Map={};
var countriesNametoIS0Map={}; 
function populateCountries(data){ 
	log("populateCountries()"); 
	for (var count = 0 ; count <data.length;count++){
		countriedISO3to2Map[[data[count]]['ISO3166-1alpha-3']]=data[count]['ISO3166-1alpha-2']; 
		data[count].Country_Name  =data[count].Country_Name.replace(' of Great Britain & Northern Ireland','')
		.replace(', Arab Republic of','')
		.replace(', The Former Yugoslav Republic of','')
		.replace(', Republic of','')
		.replace(', Tunisian Republic','')
		.replace(', Kingdom of', '')
		.replace(', Togolese Republic','')
		.replace(',, Swiss Confederation','')
		.replace(' (Slovak Republic)','') 
		.replace('Netherlands the','Netherlands')
		.replace(' (the territory South of 60 deg S)', '');
		data[count].Country_Name = data[count].Country_Name.indexOf(',')>0?data[count].Country_Name.split(',')[0]:data[count].Country_Name;
		countriesNametoIS0Map[data[count].Country_Name.toLowerCase().trim()]=data[count]['ISO3166-1alpha-2'];
		/***
		 * data_countriesDetails[countryName]()
		 * returns 
		 */
		data_countriesDetails[data[count].Country_Name.toLowerCase()]=function(){
			return data_countriesDetails[data[count]];
		}    ;
		data[count].provinces=[];
		/**
		 * 
		 */
		data[count].AddProvince=function(iso,data){   
			if(data_countriesDetails[iso]){  
				data_countriesDetails[iso].provinces.push(data);
			}else if  (data_countriesDetails[countriedISO3to2Map[iso]]){ 
				data_countriesDetails[countriedISO3to2Map[iso]].push(data);
			} 
		}   
	} 
	data_countriesDetails=data;  
	log("populateCountries() - End"); 
	getJsonData('https://raw.githubusercontent.com/annexare/Countries/master/data/countries.json',populateCountries2)

} 


function populateCountries2(data){ 
	log("populateCountries2()"); 
	var s=0;var temp={};
	for(var count =0 ; count <data_countriesDetails.length;count++){
//		data_countriesDetails[ count ].Country_Name =
//		data_countriesDetails[ count ].Country_Name.repalace()
		if(data[data_countriesDetails[count ] ["ISO3166-1alpha-2"]]!=undefined){ 
			data_countriesDetails[count].languages =data[data_countriesDetails[count]["ISO3166-1alpha-2"]].languages;
			data_countriesDetails[count].currency =data[data_countriesDetails[count]["ISO3166-1alpha-2"]].currency;
			data_countriesDetails[count].native =data[data_countriesDetails[count]["ISO3166-1alpha-2"]].native;
			data_countriesDetails[count].continent =data[data_countriesDetails[count]["ISO3166-1alpha-2"]].continent;
			data_countriesDetails[count].capital =data[data_countriesDetails[count]["ISO3166-1alpha-2" ]].capital ;
			temp[data_countriesDetails[count]["ISO3166-1alpha-2" ]] ={};
			temp[data_countriesDetails[count]["ISO3166-1alpha-2" ]]=data_countriesDetails[count];

			s=s+1;
		} else{	 
			log("populateCountries2() - Failed to add a country : "+ data_countriesDetails[ count ].Country_Name);

		} 
	}
	data_countriesDetails = temp;  
	log("populateCountries2() - "+data_countriesDetails!=undefined?((s==data.length)?'PASS':"Not all data populates"):'FAIl');
	log("populateCountries2() - End");

	getJsonData('https://raw.githubusercontent.com/AliMedicalOpenSource/GeneralDataSets/master/World/populations/population-2020-04-04.json',populateWorlPopulations);
}

function populateWorlPopulations(data){ 
	data=data.data; 
	var s =0;
	for(var count = 0 ; count <data.length;count++){ 
		if(data_countriesDetails[data[count].cca2]){
			data_countriesDetails[data[count].cca2].population=data[count].pop2020;
			data_countriesDetails[data[count].cca2].growthRate=data[count].GrowthRate;
			data_countriesDetails[data[count].cca2].popDensityPerKm=data[count].Density; 

			var pop = isNaN(data_countriesDetails[data[count].cca2].population)?new Number(data_countriesDetails[data[count].cca2].population):data_countriesDetails[data[count].cca2].population;
			var gr = isNaN(data_countriesDetails[data[count].cca2].growthRate)?	new Number(data_countriesDetails[data[count].cca2].growthRate):data_countriesDetails[data[count].cca2].growthRate;
			var growthPeople =calculate_growthRate( gr,pop)

			data_countriesDetails[data[count].cca2].populationEstimate=growthPeople+''; 
			s++;
		}else{
			log("populateWorlPopulations() : skipping " + data[count].cca2);
		}
	}    
	log("populateWorlPopulations() ", data.length+" records processed : " +s + " records changed"); 
	log("populateWorlPopulations() ", "  END ");

	loadCanadaData(); 
}

function loadCountriesData(){
	getJsonData('https://raw.githubusercontent.com/AliMedicalOpenSource/GeneralDataSets/master/World/countries/countries.json',populateCountries)
}
loadCountriesData();


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
	log('getCSVJsonArray() -  Success');
	$.get(url, function( data ) { 
		log('getCSVJsonArray -  Success - '+ url);
		csv( )
		.fromString(data)
		.subscribe((jsonObj)=> {  
			cb(jsonObj); 	 
		});   
	}) 
} 


/**
 * Convert d/m/y to m/d/y
 * @param string
 * @returns
 */
function convert_DateDayMonthYeartoMonthDayYear(string){ 
	if(string.indexOf('/')>0){
		string = string.split('/')
		return string[1]+'/'+string[0]+"/"+string[2]
	}
	if(string.indexOf('-')>0){
		string = string.split('-')
		return string[1]+'-'+string[0]+"-"+string[2]
	}
} 


function convert_DateYearMonthDaytoMonthDayYear(string){ 
	if(string.indexOf('/')>0){
		string = string.split('/')
		return string[1]+'/'+string[3]+"/"+string[0]
	}
	if(string.indexOf('-')>0){
		string = string.split('-')
		return string[1]+'-'+string[2]+"-"+string[0]
	}
} 




/******************************************  API SERVICE ********************************88
 * API Service 
 * @param req
 * @returns
 ************************************************************************************8*/
function getApiData(req){ 
	log('getApiData',req.url); 
	while(req.url.endsWith('/')){
		req.url = req.url.substr(0,req.url.length-1);
	}
	if(req.url.startsWith("/api")){ 
		req.url=req.url.replace("/api/",''); 
		var swtch = (req.url.split('/')[0]).length>0?(req.url.split('/')[0]): req.url; 
		switch(swtch){

		case "data":
			req.url=req.url.replace(swtch+'/',''); 
			var region =req.url.split('/')[0]; 
			if(region==undefined){region =req.url }
			req.url=req.url.replace(region ,'');
			region =Sanatize(region);   
			var lookingFor;
			if(req.url.length==0){
				lookingFor= region;
			}else{
				lookingFor=req.url.split('/')[1]; 
			}  
			lookingFor=Sanatize(lookingFor);  
			var country=  covidDataSet[region] ;
			log ('getApi','Region : ' +region);
			log ('getApi','lookingFor : ' +lookingFor); 
			for(var count =0 ;count<covidDataSet[region].length;count++){ 
				if(covidDataSet[region][count].location.province.toLowerCase().trim()==
					lookingFor.toLowerCase().trim()){
					log("getApi()", covidDataSet[region][count]  ); 
					return covidDataSet[region][count]
				}

			}	
			if(lookingFor==region){
				if(temp){

				}
			}
			var da = new DataSet();
			da.location = covidDataSet[region][0].location;
			da.caseData = covidDataSet[region][0].caseData;

			if(req.url.length==0){
				for(count =1 ;count<covidDataSet[region].length;count++){ 
					if(covidDataSet[region]!=undefined){
						da.Add( covidDataSet[region][count]);

					}
				}
			} 
			return da; 

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
var url_usAlabamaData2 ='https://services7.arcgis.com/4RQmZZ0yaZkGR1zy/arcgis/rest/services/COV19_Public_Dashboard_ReadOnly/FeatureServer/0/query?where=1%3D1&outFields=CNTYNAME%2CCNTYFIPS%2CCONFIRMED%2CDIED%2Creported_death&returnGeometry=false&f=pjson';
var url_usAlaska='http://dhss.alaska.gov/dph/Epi/id/SiteAssets/Pages/HumanCoV/COVID-19_epi_testingcurve.csv';
var url_usAlabamaData='https://services7.arcgis.com/4RQmZZ0yaZkGR1zy/arcgis/rest/services/COV19_Public_Dashboard_ReadOnly/FeatureServer/0/query?f=json&where=CONFIRMED%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultOffset=0&resultRecordCount=69&cacheHint=true';
var url_usAlaska2='https://cors-anywhere.herokuapp.com/http://dhss.alaska.gov/dph/Epi/id/Pages/COVID-19/monitoring.aspx';
var url_usAlaska3 = 'https://raw.githubusercontent.com/AliMedicalOpenSource/CovidDataSets/master/United%20States%20of%20America/Alaska/2020-04-02-1200.json';
var url_dataEBDC = 'https://opendata.ecdc.europa.eu/covid19/casedistribution/json';


function getHTMLPage(url, cb){ 
	$.get(url, function( data ) { 
		cb( (data));	 
	},"html/text");   
} 
var tempSet;
var tempProvice;
function cd1(data){  

	var obj =JSON.parse(data);
	tempSet = new  DataSet("North America",string_USA, "Alabama", '', 0,0, '-','',0,'','');
	obj =obj['features']; 
	obj.forEach(function(item){  
		item = item.attributes;
		var x =new  DataSet("North America",string_USA, "Alabama", item.CNTYNAME, item.CONFIRMED,item.REPORTED_DEATH, '','',item.LabTestCount,'','');
		x.location.population="-";  
		tempSet.caseData.tested=new Number(tempSet.caseData.tested)+new Number(x.caseData.tested);
		tempSet.caseData.deaths+=new Number(x.caseData.deaths);
		tempSet.caseData.confirmed+=new Number(x.caseData.confirmed); 

	});
	covidDataSet.Add(tempSet);
	getHTMLPage('https://raw.githubusercontent.com/AliMedicalOpenSource/CovidDataSets/master/United%20States%20of%20America/Alaska/covid19.json',cd2);
}

function cd2(data){  
	covid19Cases[string_USA.toLowerCase()]={}
	covid19Cases[string_USA.toLowerCase()]["Alaska".toLowerCase()]=[];
	log('cd2',"cd2("+data!=undefined+")"); 
	var Alaska = new  DataSet("North America",string_USA, "Alaska", '', 0,0,0,0,0,0,0);

	JSON.parse(data).forEach(function(item){   
		var ccase = new CovidCase(item.ReportDate,item.OnsetDate,item.Sex,item.AgeGroup,item.State,item.StateFIPS,item.County,
				item.CountyFIPS,item.Region, item.RegionFIPS,item.Hospitalized,item.Deceased,item.Acquisition);
		covid19Cases[string_USA.toLowerCase()]["Alaska".toLowerCase()].push(ccase);
		Alaska.caseData.confirmed+=1;
		Alaska.caseData.deaths=item.Deceased.toLowerCase()=='y'?
				Alaska.caseData.deaths+1:Alaska.caseData.deaths;
		Alaska.caseData.hospitalized=item.Hospitalized.toLowerCase()=='y'?
				Alaska.caseData.hospitalized+1:Alaska.caseData.hospitalized; 
	});
	Alaska.location.population = getPopulation(tempSet.location.country, tempSet.location.province); 

	//console.log(Alaska);

	//console.log(covid19Cases[string_USA.toLowerCase()]["Alaska".toLowerCase() ].length)

	covidDataSet.Add(tempSet);
	log('cd2',"END");
//	getHTMLPage('https://services1.arcgis.com/WzFsmainVTuD5KML/arcgis/rest/services/COVID_Cases_public/FeatureServer/0/query?f=json&where=Deceased%3D%27Y%27&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22count%22%2C%22onStatisticField%22%3A%22FID%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&cacheHint=true',cb3);
}
function helper1(string){
	var out='';
	for (var i=0; i<string.length; i++) {
		if (string.charCodeAt(i) <= 127) {
			out += string.charAt(i);
		}
	}
	return out;
}
function cb3(data){   
	log('cb3 = Alaska ', 'Setting Death count');	
	tempSet = covidDataSet.Get(string_USA,'Alaska');
	try{
		var deaths = cb345helper(data);
		if(!isNaN(deaths)){
			var r =covidDataSet.Get(string_USA, 'Alaska');
			r.caseData.deaths = new Number(helper1(deaths)); 
			tempSet.caseDataSet.deaths =r.caseData.deaths  
			log('cb3 = Alaska deaths', deaths)
		}else{ 
			log('cb3 = Alaska deaths', 'Failed')
		} 
	}catch(err){
		log('cb3 - Alaska', 'Exception',err);
	}  
	log('cb3 - Alaska', 'End')
	getHTMLPage('https://services1.arcgis.com/WzFsmainVTuD5KML/arcgis/rest/services/COVID_Cases_public/FeatureServer/0/query?f=json&where=Hospitalized%3D%27Y%27&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22count%22%2C%22onStatisticField%22%3A%22FID%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&cacheHint=true', cb4);
}
function cb4(data){   
	log('c4 - Alaska ', 'Setting Hosputal count');
	try{
		var hospitalized = cb345helper(data);
		if(!isNaN(hospitalized)){
			var r =covidDataSet.Get(string_USA, 'Alaska');
			r.caseData.hospitalized = new Number(helper1(hospitalized)); 
			covidDataSet.Add(r);

			log('c4 = Alaska hospitalized', hospitalized)
		}else{ 
			log('c4 = Alaska hospitalized', 'Failed')
		} 
	}catch(err){
		log('cb4 - Alaska', 'Exception',err);
	}

	log('cb4 - Alaska', 'End')
	getHTMLPage('https://services1.arcgis.com/WzFsmainVTuD5KML/arcgis/rest/services/COVID_Cases_public/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22count%22%2C%22onStatisticField%22%3A%22FID%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&cacheHint=true',cb5);
}
function cb5(data){   
	log('c5 - Alaska ', 'Setting Hosputal count');
	try{
		var confirmed = cb345helper(data);
		if(!isNaN(confirmed)){
			var r =covidDataSet.Get(string_USA, 'Alaska');
			r.caseData.confirmed = new Number(helper1(confirmed)); 
			covidDataSet.Add(r); 
			log('c5 = Alaska hospitalized', confirmed)
		}else{ 
			log('c5 = Alaska hospitalized', 'Failed')
		} 
	}catch(err){
		log('cb5 - Alaska', 'Exception',err);
		console.log(covidDataSet.get('United States of America','Alaska'))
	}

	//console.log(covidDataSet.Get('United States of America','Alaska'));
	log('cb4 - Alaska', 'End')
	getHTMLPage('shorturl.at/fiQU3',cb4);
}
function cb345helper(data){ 
	log('cb345helper = Alaska ', 'Getting count');
	var value; 
	value = JSON.parse(data).features[0].attributes.value ; 
	log('cb345helper - Alaska', 'End')
	return value;
}
function loadEuropaEUData(){
	log("loadEuropaEUData()")
	getHTMLPage(url_usAlabamaData,cd1); 

	log("loadEuropaEUData - END")
}
/*********************************8******************************************/
/*********************************8******************************************/
function initDataScrape(){ 
	getHTMLPage(url_usAlabamaData,cd1); 
} 
function loadWorldDataCallBack(data){
	log("loadWorldDataCallBack()");
	data= JSON.parse(data).records;  
	var t =' ';
	var sets=[];
	for(var count = 0 ; count < data.length ; count++){ 
		var countryData = data[count] 
		if(countryData.geoId == 'UK' ){countryData.geoId ='GB'}
		if(countryData.geoId == 'UK' ){countryData.geoId ='GB'}
		if(countryData.geoId == 'BLM' ){countryData.geoId ='BL'}
		if(countryData.geoId == 'EL' ){countryData.geoId ='GR'}

		if(!(t.indexOf(data[count].geoId) >0)){
			t+=data[count].geoId+ ":"; 
		}
		if(countryData.countriesAndTerritories && countryData.geoId != 'JPG11668'){ 
			if(countryData.countriesAndTerritories.indexOf('_')>=0){
				countryData.countriesAndTerritories =countryData.countriesAndTerritories.split('_').join(' ');
			} 
			//console.log(data_countriesDetails[countryData.geoId])
			if(data_countriesDetails[countryData.geoId]){ 
				var set = new	DataSet(data_countriesDetails[countryData.geoId].continent,
						nameFix(data_countriesDetails[countryData.geoId].Country_Name), 
						nameFix(data_countriesDetails[countryData.geoId].Country_Name),
						'', new Number(data[count].cases) , new Number(data[count].deaths) ,
								'', '','', '', '',''); 
				set.location.province=set.location.province.replace(', Kingdom of','').replace(', Republic of','');
				set.lastUpdated=convert_DateDayMonthYeartoMonthDayYear(countryData.dateRep); 
				set.location.population=data_countriesDetails[countryData.geoId].population
				set.location.populationEstimate=calculate_growthRate(data_countriesDetails[countryData.geoId].growthRate,set.location.population); 
				sets.push(set);  
			}else{  
				log("loadWorldDataCallBack() : Country not found : "+countryData.geoId); 
				log("loadWorldDataCallBack() : Country not found : "+countryData.countriesAndTerritories); 
				r++; 		
			}
		}  
	}
	while(sets.length>0){
	var temp =sets.shift();
	if(temp!=undefined){console.log(temp.location.country)
	for(var count = 0 ; count < sets.length ; count++){  
		var country =sets[count] 
		if(country!=undefined){
		if(country.location.country==temp.location.country){
			temp.caseData.confirmed+=country.caseData.confirmed;
			temp.caseData.deaths+=country.caseData.deaths;
		}
		var d1 = new Date(country.lastUpdated)
		var d2 = new Date(temp.lastUpdated);
		if(d1.getTime()>d2.getTime()){
			temp.lastUpdated =country.lastUpdated;
		}
	
		if(count==sets.length-1){
				if(temp.caseData.deaths >0){ 
					temp.caseData.cfr = calculate_CFR(temp.caseData.deaths,temp.caseData.confirmed); 
				} 
				if(temp.caseData.confirmed>0){ 
					temp.caseData.percentConfirmed =  calculate_infectionPercent(temp.caseData.confirmed,temp.location.population);
				} 
				covidDataSet.Add(temp);	 
		}
		}  
	} 
		
	for(var count = 0 ; count < sets.length ; count++){  
		var country =sets[count]
		if(country!=undefined && country.location.country==temp.location.country){
			delete sets[count];
		}
	}
	}
	}
	//loadUSACANADA();
} 
function nameFix(name){ 
	if(name=='Fiji the Fiji Islands') {return 'Fiji'}
	if(name=='Russian Federation'){return 'Russia'}
	if(name=='Syrian Arab Republic'){return 'Syria'}
	if(name=='Lao People\'s Democratic Republic'){return 'Laos'}
	name=name.replace(', Kingdom of','').replace(', Republic of','');
	return name;
}

function loadWorldData(){ 
	log('loadWorldData() ');
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://opendata.ecdc.europa.eu/covid19/casedistribution/json/', true);
	xhr.onload = function() {  
		log('loadWorldData() : Success ');
		var responseText = xhr.responseText; 
		loadWorldDataCallBack(responseText); 
	}; 
	xhr.onerror = function() {
		log("loadWorldData() : Error on request");	log("loadWorldData","FAIL ",this);
		log("loadWorldData","Setting timout to try again");	setTimeout( loadWorldData,10000);	log('loadWorldData() : END');
	};
	log('loadWorldData() : Sending ..');
	xhr.send();
	//getHTMLPage('https://opendata.ecdc.europa.eu/covid19/casedistribution/json/',loadWorldDataCallBack); 
} 


function convert_csvToJSON(csvText){ 
	if(csvText.split(/\r?\n/).length>1 ){
		csvText = csvText.split( /\r?\n/);
	}else if(csvText.split( "\n").length>(csvText.split(/\r?\n/).length)){
		csvText =csvText.split( "\n")
	}else{
		return undefined;
	}
	//console.log(csvText.length)
	var headers=csvText[0].split(',');
	//console.log(headers)

	var headerObj = {} 
	/***
	 * Build an object of headera, buils initialt object to populate form string 
	 */
	var r=0;
	for(var count=0; count< headers.length; count++){
		headerObj[headers[count]]=headers[count];
		r++;
	}
	var jsonArry=[]
	var jsonObj ; 
	for(var count=0; count < csvText.length; count++){
		headerObj={};
		for(var count1=0; count1< r; count1++){
			headerObj[headers[count1]]=headers[count1];
		}
		jsonObj =headerObj;
		var subStrings =[];
		if(csvText[count].trim().length>0){ 
			var temp = csvText[count].split(',');
			for(var count1=0; count1< headers.length; count1++){ 
				if(temp.length!=r){
					console.log(csvText)
					console.log(csvText[count])
					console.log(headerObj)
					console.log(temp)
					console.log(r)

					console.log(csvText[count].length)
					throw (e);
				}  
				jsonObj[headerObj[headers[count1]]]=temp[count1]; 
			} 
			jsonArry.push(jsonObj)
		} 
	} 
	return jsonArry;
}


/**
 * Load Canadian covid19 json
 * @param data
 * @returns
 */
function ca_dataLoad(data){
	ca_data.push(data);
}
var ca_data=[];
var urls={};
var t ='https://health-infobase.canada.ca/src/data/covidLive/covid19.csv'
	urls.url_caGovDataSheet={};
function loadUSACANADA(){  

	csv()
	.fromStream(request.get(t))
	.subscribe((json)=>{ 
		ca_dataLoad(json);
	},function(){
		console.log(this);
	},function(){
		populateCanadaData( ca_data) 
	}); 
}
 
function asdd(){ 
	loadWorldData();

}
function loadCovidData(){
	asdd();
}
 



function Request(url , callback, method){ 
	this.url = url;	this.xhr = new XMLHttpRequest();	this.xhr.open(method?method:'GET', url, true); 
	this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');	this.xhr.onload = function() {  
		if(this.status==404){			log("Request : Failed " +url); 	console.log(this)	}else{		callback(this.responseText); 		log("Request : Success " +url);
		}		RequestHelper(this);	}; 
		this.xhr.onerror = function() {	log("Request : Error on request");log("Request : FAIL ");RequestHelper(this);console.log(this);	};
		this.response=function (){	return this.xhr.response;	};
		this.responseText==function(){		return this.xhr.responseText	}
		this.send=function(){		this.xhr.send();	}
}
function RequestHelper(request){	request.response=request.response;	request.responseText = request.responseText;}