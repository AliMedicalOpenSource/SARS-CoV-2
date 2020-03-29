  
 
  var fs = require('fs');
  var static = require('node-static'); 
//Load HTTP module
const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;
const port1 = 8080;

//Create HTTP server and listen on port 3000 for api requests
const server = http.createServer((req, res) => {

  //Set the response HTTP header with HTTP status and Content type
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

//listen for request on port 3000, and as a callback function have the port listened on logged
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// static file server 8080
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
 * 
 */
function jsonRequest(url, cb){
	$.getJSON({
		url: url_distribution,
		success: function(data){
			caseDisribution=data;
			console.log(data);
			cb(data);
 
		},
		error: function (e){
			console.log(e);
		}
	})
}


loadData=function(){


	function getCaseDistribution( ) {
		$.getJSON({
			url: url_distribution,
			success: function(data){
				caseDisribution=data;
				console.log(data);
	 
			},
			error: function (e){
				console.log(e);
			}
		})
	}   
}