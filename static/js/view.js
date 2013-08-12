
	
		var playerSlotTemplate;
		var gameRowTemplate;
		var gameRows;
		
		var dateNowCheckbox;
		var datePicker; 
		
		var gameRowClass = ".gameRow";
		
		
		
		function initView()
		{
			playerSlotTemplate = $("#playerSlotTemplate");
			playerSlotTemplate.remove();
			
			
			gameRows = $("#gameRows");
			gameRowTemplate = gameRows.find(gameRowClass);
			gameRowTemplate.remove();
			
			dateNowCheckbox = $("#dateNow");
			dateNowCheckbox.bind("change", function (e){
				if(dateNowCheckbox.prop("checked")) datePicker.hide();
				else 
				{
					setupDatePicker(datePicker);
					datePicker.show();
				}
			});
			datePicker = $("#datePicker");
			datePicker.hide();
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
					case PlayerRoles.mordred:
						btnclass = "btn-danger";
					break;
				}
				btn.addClass(btnclass);
				roleSpan.text(role);
				roleSpan.show();
			}
			else roleSpan.hide();	
		}
		
		function updateSubmitPlayerList(modal, game, showAll)
		{
			var playersList = modal.find(".playersList");
			playersList.html("");
			for(var X in players)
			{
				if(showAll || !players[X].inactive)
				{
					var slot = createPlayerSlot(players[X], game);
					playersList.append(slot);
					playersList.append(" ");
				}
			}
		}
		
		
		function showSubmitDialog()
		{
			var game = new Game();
			game.editable = true;
			var modal = $("#submitModal");
			updateSubmitPlayerList(modal, game);
			
			var showallbtn = modal.find(".showAllPlayersButton");
			showallbtn.show();
			showallbtn.bind("click", function(){
				showallbtn.hide();
				updateSubmitPlayerList(modal, game, true);
			});
			
			
			var successRow = modal.find(".submitSuccessRow");
			var failRow = modal.find(".submitFailRow");
			
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
			
			
			dateNowCheckbox.prop("checked", true);
			datePicker.hide();
			
			
			var submitButton = modal.find(".submitButton");
			submitButton.show();
			submitButton.bind("click", function(e)
			{
				if(!dateNowCheckbox.prop("checked"))
				{
					game.date = getDatePickerDate(datePicker);
				}
				else
				{
					game.date = new Date();
				}
	
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
			
			var date = game.date;
			var dateele = row.find(".gameDate");
			if(date)
			{
				dateele.html(date.getDate() + ", "+ (date.getMonth()+1) + ", " + date.getFullYear() + "<br/>" + doubleDigit(date.getHours()) + ":" + doubleDigit(date.getMinutes()));
			}
			else dateele.text("");
			
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
		
		
		
		

function setupDatePicker(picker)
{
	var now = new Date();
	var min = picker.find('.date-min');
	var hour = picker.find('.date-hour');
	var day = picker.find('.date-day');
	var month = picker.find('.date-month');
	var year = picker.find('.date-year');
	addDateRange(min, 0, 59, Math.floor(now.getMinutes()/10)*10, 10);
	addDateRange(hour, 0, 23, now.getHours());
	addDateRange(day, 1, 31, now.getDate());
	addDateRange(month, 1, 12, now.getMonth() + 1);
	var yearnow = now.getFullYear();
	addDateRange(year, yearnow - 1, yearnow, yearnow);
}

function addDateRange(obj, min, max, current, increment)
{
	obj.empty();
	if(!increment || increment <= 0) increment = 1;
	for(var i = min; i <= max; i += increment)
	{
		var option = $("<option></option>").attr("value",i).text(i);
		if(i == current) option.attr('selected', 'selected');
		obj.append(option);
	}
}

function getDatePickerDate(picker)
{
	var min = picker.find('.date-min').val();
	var hour = picker.find('.date-hour').val();
	var day = picker.find('.date-day').val();
	var month = Number(picker.find('.date-month').val()) - 1;
	var year = picker.find('.date-year').val();
	return new Date(year, month, day, hour, min);
}

function doubleDigit(number)
{
	if(number < 10)
	{
		return "0"+number;
	}
	return ""+number;
}