#!/usr/bin/env node

var request = require("request");
var chalk = require("chalk");
var fs = require("fs");
var program = require("commander");
var terminal = require("../lib/terminal.js");
var checkForRedirect = require('../lib/checkForRedirect.js');
var pkg = require('../package.json');

program
    .version(pkg.version)
	.usage('\<[options] file\>')
	.option('-F, --file <item>', 'Path to a file, containing a newline separated list of URLs')
	.parse(process.argv);


var AUTH_PROMPT = {
	properties : {
		user : { description: "Username:".blue, required: true },
		pass : { description : "Password:".blue, required:true, hidden:true }
	}
};


if (process.argv.length <= 2) {
	print(chalk.red("Come on really? You have to enter atleast one option"));
	program.help();
	program.exit();
} else {
	if(program.file) {
		getFileContent(program.file).then(function(lines) {
			return checkForAuth(lines);
		}, function(err) {
			if(err.message.indexOf("ENOENT") > -1) {
				error("File not found, get it together :) !");
			} else {
				error(err.message);
			}
		}).then(function(links) {
			terminal.output(links);
		});
		
	} //end of program.file
} //close main else


function getFileContent(file) {
	return new Promise(function(resolve, reject) {
		fs.readFile(file, function(err, listOfLines) {
			if (err){
				reject(err);
			} else {
				var lines = listOfLines.toString().split('\n').map(function(item) {
					return item.trim();
				}).filter(function(item) {
					return item.length;
				});
				resolve(lines);
			}
		})
	}); //end of Promise
}// end of getFileContent

function checkForAuth(urls) {
	return new Promise(function(resolve, reject) {
		request(urls[0], function(err, res) {
			if(err) return reject(err);
			if(res.statusCode === 401) {
				promptForAuth(urls[0]).then(function(creds) {
					return checkForRedirect(urls, creds);
				}, function(err) {
					return reject(err);
				}).then(function(links) {
					resolve(links);
				});  
			} else {
				checkForRedirect(urls, null).then(function(links) {
					resolve(links);
				}, function(err) {
					reject(err);
				});
			}
		});
	});
	
}//end of checkForAuth


function promptForAuth(url) {
	return new Promise(function(resolve, reject) {
		prompt.start();
		prompt.message = null;
		prompt.delimiter = "";
		prompt.get(AUTH_PROMPT, function(err, creds) {
			if (err) return reject(err);
			request(url, { auth: creds }, function (err, res) {
				if(err) return reject(err);
				if(res.statusCode !== 401) {
					resolve(creds);
				} else {
					counter ++;
					if(counter < 3) {
						error("Invalid credential, please try again");
						promptForAuth(url);
					} else {
						counter = 0;
						error(chalk.red("Please check if you have access to this server, exiting app! "));
						process.exit(0);
					}
				}
			});
		});
	});
} //end of promptForAuth

function print(msg) {
	console.log(msg);
}

function error(msg) {
	console.log(chalk.red(msg));
}

