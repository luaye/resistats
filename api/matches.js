var users = require("./users.js");
var utils = require("./../utils.js");

exports.getMatches = function(body, callback)
{
    matches = GLOBAL.matchesDB.view('matches', 'by_date', body,
	function (error, body, headers)
	{
		if(error || !body)
		{
			console.log("matches.getMatches error: "+error);
			callback([]);
		}
		else
		{
			//console.log("matches.getMatches OK: " + JSON.stringify(body.rows));
			var result = [];
			for (var X in body.rows)
			{
				var match = body.rows[X].value;
				result.push(match);
			}
			//console.log("matches.getMatches OK: " + JSON.stringify(result));
			callback(result);
		}
	});
}

exports.addMatch = function(body, callback)
{
	console.log("matches.addMatch: "+JSON.stringify(body));
	
	users.isAsscessTokenValidForAdding(body.fbAccessToken, function(ok)
	{
		if(ok)
		{
			addMatchToDb(body, callback);
		}
		else
		{
			console.log("addMatch: NOT AUTHORIZED");
			callback({status:"error", message:"Not authorized."});
		}
	})
}

function addMatchToDb(body, callback)
{
	var matchData = JSON.parse(body.body);
	
	if(!isNaN(matchData.date))
	{
		var dateMs = Number(matchData.date);
		var nowMs = new Date().getTime();
		var hour = 1000 * 60 * 60;
		var allowedPast = hour * 24 * 365;
		var allowedFuture = hour * 2;
		if(dateMs > nowMs - allowedPast && dateMs < nowMs + allowedFuture)
		{
			matchData.date = new Date(dateMs).getTime();
		}
		else
		{
			callback({status:"error", message:"Invalid date."});
			return;
		}
	}
	else
	{
		matchData.date = new Date().getTime();
	}
	
	GLOBAL.matchesDB.insert(matchData, null, function (error, body, headers)
					{
						if(error || !body)
						{
							console.log("matches.addMatch error: "+error);
							callback({status:"error"});
						}
						else
						{
							//console.log("matches.addMatch OK: " + JSON.stringify(body));
							callback({status:"OK"});	
						}
					});	
}