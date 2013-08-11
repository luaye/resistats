
	
		var playerSlotTemplate;
		var gameRowTemplate;
		var gameRows;
		
		var gameRowClass = ".gameRow";
		
		function initView()
		{
			playerSlotTemplate = $("#playerSlotTemplate");
			playerSlotTemplate.remove();
			
			
			gameRows = $("#gameRows");
			gameRowTemplate = gameRows.find(gameRowClass);
			gameRowTemplate.remove();
		}
		
		function createPlayerSlot(player, game)
		{
			var copy = playerSlotTemplate.clone();
			if(player) setupPlayerSlot(copy, player, game, true);4
			return copy;
		}
		
		function setupPlayerSlot(slot, player, game, autoupdate)
		{
			slot.find(".playerName").text(player.name);
			
			var role = game ? game.getPlayerRole(player) : PlayerRoles.none;
			updatePlayerSlotRole(slot, role);
			
			var dropdown = slot.find(".playerDropDown");
			if(game && game.editable)
			{
				dropdown.html("");
				for(var prop in PlayerRoles)
				{
					var role = PlayerRoles[prop];
					var li = $( '<li><a href="#">'+role+'</a></li>' );
					li.bind("click", { player: player, role: role }, function(e)
					{
						game.setPlayerRole(player, e.data.role);
					});
					dropdown.append(li);
				}
				
			}
			else
			{
				slot.find(".playerDropDown").remove();
			}
			
			if(autoupdate && game)
			{
				game.events.on(game.ROLE_CHANGED, function(e, p, r)
				{
					if(player == p)
					{
						updatePlayerSlotRole(slot, r);
					}
				});
			}
		}
		
		function updatePlayerSlotRole(slot, role)
		{
			var btn = slot.find(".playerButton");
			
			btn.removeClass("btn-primary");
			btn.removeClass("btn-warning");
			btn.removeClass("btn-success");
			btn.removeClass("btn-info");
			btn.removeClass("btn-danger");
			
			var btnclass = "btn-default";
			var roleSpan = slot.find(".playerRole");
			if(role && role != PlayerRoles.none)
			{
				switch(role)
				{
					case PlayerRoles.good:
						btnclass = "btn-primary";
					break;
					case PlayerRoles.evil:
						btnclass = "btn-warning";
					break;
					case PlayerRoles.merlin:
						btnclass = "btn-success";
					break;
					case PlayerRoles.percival:
						btnclass = "btn-info";
					break;
					case PlayerRoles.assassin:
					case PlayerRoles.oberon:
					case PlayerRoles.morgana:
						btnclass = "btn-warning";
					break;
					case PlayerRoles.mordrid:
						btnclass = "btn-danger";
					break;
				}
				btn.addClass(btnclass);
				roleSpan.text(role);
				roleSpan.show();
			}
			else roleSpan.hide();	
		}
		
		
		
		function showSubmitDialog()
		{
			var game = new Game();
			game.editable = true;
			var modal = $("#submitModal");
			var successRow = modal.find(".submitSuccessRow");
			var failRow = modal.find(".submitFailRow");
			var playersList = modal.find(".playersList");
			playersList.html("");
			for(var X in players)
			{
				var slot = createPlayerSlot(players[X], game);
				//var li = $("<li></li>");
				//li.append(slot);
				playersList.append(slot);
				playersList.append(" ");
			}
			
			successRow.bind("click", function()
			{
				game.addToNextEmptyMission(true);
			});
			
			failRow.bind("click", function()
			{
				game.addToNextEmptyMission(false);
			});
			
			var goodwonCheck = modal.find(".submitGoodWon");
			goodwonCheck.bind("change", function()
			{
				game.setGoodWon(goodwonCheck.prop("checked"));
			});
			
			var updateStatus = function()
			{
				var status = game.getStatus();
				var box = modal.find(".submitStatusText");
				box.removeClass("alert-danger");
				box.removeClass("alert-info");
				if(status.ok == true) box.addClass("alert-info");
				else box.addClass("alert-danger");
				box.text(status.message);
			}
			var updateMissions = function()
			{
				for(var i = 0; i < MaxNumberOfMissions; i++)
				{
					var mission = game.getMission(i);
					var elem = successRow.find(".submitSuccess" + i);
					elem.prop('checked', mission != null && mission.success);
					elem = failRow.find(".submitFail" + i);
					elem.prop('checked', mission != null && !mission.success);
				}
			}
			for(var i = 0; i < MaxNumberOfMissions; i++)
			{
				successRow.find(".submitSuccess" + i).bind("click", {index:i}, function(e)
				{
					e.stopPropagation();
					game.toggleMission(e.data.index, true);
				});
				failRow.find(".submitFail" + i).bind("click", {index:i}, function(e)
				{
					e.stopPropagation();
					game.toggleMission(e.data.index, false);
				});
			}
			
			game.events.bind(game.CHANGED, function (e)
			{
				updateStatus();
				updateMissions();
			});
			updateStatus();
			updateMissions();
			
			var submitButton = modal.find(".submitButton");
			submitButton.show();
			submitButton.bind("click", function(e)
			{
				submitButton.hide();
				submitGame(game, function(data)
				{
					if(data.status == "OK")
					{
						alert("submitted");
						reloadGames();
						modal.modal('hide');
					}
					else alert("failed");
					submitButton.show();
				});
			});
			
			modal.modal('show');
		}
		
		
		
		
		
		function setupGamesView(games)
		{
			var rows = gameRows.find(gameRowClass);
			rows.remove();
			for(var X in games)
			{
				createGameRow(games[X]);
			}
		}
		
		function createGameRow(game)
		{
			var row = gameRowTemplate.clone();
			
			var playersHolder = row.find(".gamePlayers");
			
			for(var X in game.players)
			{
				var slot = createPlayerSlot(game.players[X].player, game);
				playersHolder.append(slot);
			}
			
			var missionsTxt = "";
			game.missions.sort(function(a,b){return a.index-b.index});
			for(var X in game.missions)
			{
				var mission = game.missions[X];
				missionsTxt += mission.success ? "O" : "X";
			}
			row.find(".gameMissions").text(missionsTxt);
			
			row.find(".gameWinner").text(game.goodWon ? "good" : "evil");
			
			
			row.attr("data-original-title", game.getStatus().message);
			row.tooltip();
			
			gameRows.append(row);
			return row;
		}