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
const port = 3000;
const port1 = 8080;

var url_casesComfirmed='https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
var url_casesRecovered='https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';
var url_casesDeaths="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";


//Create HTTP server and listen on port 3000 for api requests
const server = http.createServer((req, res) => {

	//Set the response HTTP header with HTTP status and Content type
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json'); 
	res.setHeader("Access-Control-Allow-Origin", " http://127.0.0.1:8080");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	var data  =getApiData(req); 
	var response={};
	response["status"]=200;
	response.data=data;
	console.log(data)
	res.end( JSON.stringify(response));
});

//listen for request on port 3000, and as a callback function have the port listened on logged
server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});

//static file server 8080
var file = new(static.Server)();
const staticServer = http.createServer(function (req, res) {
	var url = req.url;
	console.log( url);
	req.url = "dist/"+ url.toString();
	file.serve(req, res);
	console.log( req.url);
}) ;

staticServer.listen(port1, hostname, () => {
	console.log(`Server running at http://${hostname}:${port1}/`);
});
/**
 * Sends a request to the url for a json object
 * @param url
 * @param cb
 * @returns
 */
function jsonRequest(url, cb, cbf){
	$.getJSON({
		url: url,
		success: function(data){ 
			console.log(JSON.parse(data.responseText));
			cb(data);

		},
		error: function (e){
			console.log(e);
			if(cbf!=undefined){
				cbf(e) 
			}
		}
	})
}



var res =[];
function getCSVJsonArray(url, cb, cbf){ 
	$.get(url, function( data ) {
		$( ".result" ).html( data ); 
		csv( )
		.fromString(data)
		.subscribe((jsonObj)=>
		{ 
			cb(jsonObj);
		});  
	})
	 
}
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
	console.log(s);
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
		console.log(data);
		date.setTime(date.getTime()-(86400000  )); 
		loadcsseCovid19DailyReports(date);
	  });
} 
var temp=new Date();
loadcsseCovid19DailyReports(temp);  
getCSVJsonArray(url_casesComfirmed, loadCasesComfirmed, console.log);
getCSVJsonArray(url_casesRecovered, loadCasesRecovered, console.log);
getCSVJsonArray(url_casesDeaths, loadCasesDeaths, console.log);

/**** API CALLS *****/
function getApiData(req){ 
	if(req.url.startsWith("/api")){
		req.url=req.url.replace("/api/",''); 

		switch(req.url.split('/')[0]){
		case "time_series_covid19_confirmed_global":
			var resp = time_series_covid19_confirmed_global(req.url.replace("time_series_covid19_confirmed_global/",''));
			return resp; 
		case "time_series_covid19_deaths_global":
			var resp = time_series_covid19_deaths_global(req.url.replace("time_series_covid19_deaths_global/",''));
			return resp; 

		case "time_series_covid19_recovered_global":
			var resp = time_series_covid19_recovered_global(req.url.replace("time_series_covid19_recovered_global/",''));
			return resp; 
		case "getUSAStatsFromCDC":
			if(req.url.split("/").length>1){
				return getUSAStatsFromCDC(req.url.replace("getUSAStatsFromCDC/",'')) 
			}
			return usCDCData; ;
		case "csse_covid_19_daily_reports": 
			if(req.url.split("/").length===1){ 
				return csse_covid_19_daily_reports; 
			}else{
				return getcsse_covid_19_daily_reports(req);
			}
		} 


		 
	}else{
		return null;

	} 
}

function getcsse_covid_19_daily_reports(req){
	var region=req.url.split("/")[1];
	var caseType=req.url.split("/")[2];
	var res =[]; 
	console.log(region);
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
			console.log(caseType);
			 
			  
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
	casesComfirmed.forEach(function (item){
		data = undefined; 
		var d= new Date();
		var s= d.toLocaleString().split(',')[0].replace('2020','20'); 

		if(item['Country/Region'].toLowerCase().trim()===country.toLowerCase().trim()){
			data =  item[s]; 
			if(data === undefined){
				for(var f=0; f<10; f++){
					d.setTime(d.getTime()-(86400000*f));
					console.log(" - " +d.toLocaleString().split(',')[0].replace('2020','20'));
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
	casesDeaths.forEach(function (item){
		data = undefined; 
		var d= new Date();
		var s= d.toLocaleString().split(',')[0].replace('2020','20');  
		if(item['Country/Region'].toLowerCase().trim()===country.toLowerCase().trim()){

			data =  item[s]; 
			if(data === undefined){
				for(var f=0; f<10; f++){
					d.setTime(d.getTime()-(86400000*f));
					console.log(" - " +d.toLocaleString().split(',')[0].replace('2020','20'));
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
	casesRecovered.forEach(function (item){
		data = undefined; 
		var d= new Date();
		var s= d.toLocaleString().split(',')[0].replace('2020','20'); 

		if(item['Country/Region'].toLowerCase().trim()===country.toLowerCase().trim()){

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
	})
	console.log(x);
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
//    yu = yu.split(' ');
// for(var rt=0;rt<yu.length;rt++){
//	 if(!isNaN(yu[rt])){
//		 nassaucountyny+=new Number(yu[rt]);
//		 console.log('rt='+nassaucountyny);
//	 }
// }


/**
 * Load CDC Us Data
 * @param data
 * @returns
 */
function loadCDCData(){ 
$.get('https://www.cdc.gov/coronavirus/2019-ncov/map-cases-us.json', function( data ) {
	$( ".result" ).html( data ); 
 
	  data['data'].forEach(function (item){
		 if(item.Jurisdiction!=undefined){ 
		  usCDCData[item.Jurisdiction]=item;
		 }else{
			 
		 }
	  });
	  
	}); 
lastUpdatedCDC= new Date();
}

function getUSAStatsFromCDC(state){
	state =  state.split('%20').join(' ').repplace(' Of ',' of ');
	console.log(state); 
	if(usCDCData[state]!=undefined){
		return usCDCData[state.replace('%20',' ')]; 
	}else{
		return null;
	}
}












// init and updateDate variables
var  lastUpdatedCDC=new Date();
loadCDCData();