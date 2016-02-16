var chalk = require('chalk');
var colors = require("colors");
var _ = require('lodash');

exports.output = function (links) {
	var count = links.length;
	var placeHolder =[];
	console.log(("-------------------RESULT-------------------\t").inverse);
    var hasClient = _.filter(links, {clientRedirect: true});
    var noClient = _.filter(links, {clientRedirect: false});
    
    if(hasClient.length > 0) {
        console.log("---------------------------------------");
        console.log(chalk.red("\tClient-side redirect(s) found for the following page(s):"));
        hasClient.forEach(function(item) {
            console.log("\t" + item.source);
            console.log(chalk.red("\tRedirects to: ") + item.redirectValue);
        })
    }
    if(noClient.length > 0) {
       console.log("---------------------------------------");
        console.log(chalk.blue("\tNo Client-side redirect(s) found for the following page(s):"));
        noClient.forEach(function(item) {
            console.log("\t" + item.source);
        });
    }
}
 