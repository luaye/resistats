

function loadPlayers(callback)
{
	callAPI({request:"getPlayers"}, function(data)
	{
		callback(convertToDomainPlayers(data));
	});
}


function loadGames(callback)
{
	callAPI({request:"getMatches"}, function (data)
	{
		var games = [];
		for(var X in data)
		{
			games.push(transferObjToGame(data[X]));
		}
		games.reverse();
		callback(games);
	});
}

function submitGame(game, callback)
{
	var status = game.getStatus();
	if(status.ok == false)
	{
		alert(status.message);
		//return;
	}
	var data = gameToTransferObj(game);
	callAPI({request:"addMatch", body:JSON.stringify(data)}, callback);
}


function gameToTransferObj(game)
{
	var data = {};
	
	data.players = [];
	for(var X in game.players)
	{
		var p = game.players[X];
		data.players.push({player:p.player.id, role:p.role});
	}
	
	data.missions = [];
	for(var X in game.missions)
	{
		var m = game.missions[X];
		data.missions.push({index:m.index, success:m.success});
	}
	data.goodWon = game.goodWon;
	return data;
}

function transferObjToGame(data)
{
	var game = new Game();
	for(var X in data.players)
	{
		var p = data.players[X];
		var player = getPlayerById(p.player);
		if(player)
		{
			game.players.push(new GamePlayer(player, p.role));
		}
	}
	
	for(var X in data.missions)
	{
		var m = data.missions[X];
		game.missions.push(new GameMission(m.index, m.success));
	}
	game.goodWon = data.goodWon;
	return game;
}

function getPlayerById(id)
{
	for(var X in players)
	{
		if(players[X].id == id)
		{
			return players[X];
		}
	}
	return null;
}


function callAPI(postdata, callback)
{
	if(!postdata.request) return;
	$.post(getAPIPath(postdata.request),
		postdata,
		function(data)
		{
			callback(data);
		},
		"json");
}

function convertToDomainPlayers(data)
{
	var result = [];
	for(var X in data)
	{
		var p = data[X];
		result.push(new Player(p.id, p.name));
	}
	return result;
}

function getAPIPath(apistring)
{
	return getServerRoot() + "api?"+(new Date().getTime());	
}

function getServerRoot()
{
	return location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') +'/';
}