
	
		var PlayerRoles = {
			none:"none",
			good:"good",
			bad:"bad",
			merlin:"merlin",
			assassin:"assassin",
			percival:"percival",
			mordrid:"mordrid"
		}
		
		var GoodSideRoles = [PlayerRoles.good, PlayerRoles.merlin, PlayerRoles.percival];
		var BadSideRoles = [PlayerRoles.bad, PlayerRoles.assassin, PlayerRoles.mordrid];
		var SpecialCharacterRoles = [PlayerRoles.merlin, PlayerRoles.percival, PlayerRoles.assassin, PlayerRoles.mordrid];
		
		var MaxNumberOfMissions = 5;
		
		var Player = function(id_, name_)
		{
			this.id = id_;
			this.name = name_;
		}
		
		var GamePlayer = function(player_, role_)
		{
			this.player = player_;
			this.role = role_;
		}
		
		var GameMission = function(missioni, wasSuccess, players_)
		{
			this.index = missioni;
			this.success = wasSuccess;
			this.players = players_;
		}
		
		var Game = function()
		{
			this.ROLE_CHANGED = "ROLE_CHANGED";
			this.MISSION_CHANGED = "MISSION_CHANGED";
			this.CHANGED = "CHANGED";
			
			
			this.players = [];
			this.missions = [];
			this.editable = true;
			
			this.events = $({});
			
			var self = this;
			
			
			this.getPlayerRole = function(player)
			{
				for(var X in self.players)
				{
					if(self.players[X].player == player)
					{
						return self.players[X].role;
					}
				}
				return PlayerRoles.none;
			}
			
			this.setPlayerRole = function(player, role)
			{
				var found = false;
				// todo: if new role is special character, also change previous player of same ability to normal.
				for(var i = self.players.length - 1; i >= 0; i--)
				{
					if(self.players[i].player == player)
					{
						self.players[i].role = role;
						if(role == PlayerRoles.none)
						{
							self.players.splice(i , 1);
						}
						found = true;
						break;
					}
				}
				if(!found && role != PlayerRoles.none) self.players.push(new GamePlayer(player, role));
				
				this.events.trigger(self.ROLE_CHANGED, [player, role]);
				this.events.trigger(self.CHANGED, self.ROLE_CHANGED);
			}
			
			this.countRoles = function (roles)
			{
				if(roles == null) return 0;
				var count = 0;
				for(var X in self.players)
				{
					if(roles.indexOf(self.players[X].role) >= 0)
					{
						count++;
					}
				}
				return count;
			}
			
			this.getMission = function(index)
			{
				for(var X in self.missions)
				{
					if(self.missions[X].index == index)
					{
						return self.missions[X];
					}
				}
				return null;
			}
			
			this.setMission = function(index, wasSuccess, players)
			{
				var mission = self.getMission(index);
				if(mission)
				{
					mission.success = wasSuccess;
					mission.players = players;
				}
				else
				{
					self.missions.push(new GameMission(index, wasSuccess, players));
				}
				this.events.trigger(self.MISSION_CHANGED, [index, mission]);
				this.events.trigger(self.CHANGED, self.MISSION_CHANGED);
			}
			
			this.removeMission = function(index)
			{
				var mission = self.getMission(index);
				if(mission) 
				{
					var index = self.missions.indexOf(mission);
					self.missions.splice(index, 1);
				}
				this.events.trigger(self.MISSION_CHANGED, [index, null]);
				this.events.trigger(self.CHANGED, self.MISSION_CHANGED);
			}
			
			this.toggleMission = function (index, success)
			{
				var mission = self.getMission(index);
				if(mission && mission.success == success)
				{
					self.removeMission(index);
				}
				else
				{
					self.setMission(index, success);
				}
			}
			
			var addedAll;
			this.addToNextEmptyMission = function(wasSuccess)
			{
				if(addedAll) return;
				for(var i = 0; i < MaxNumberOfMissions; i++)
				{
					var mission = self.getMission(i);
					if(mission == null)
					{
						self.setMission(i, wasSuccess);
						if(self.missions.length >= MaxNumberOfMissions)
						{
							addedAll = true;
						}
						break;
					}
				}
			}
			
			this.getStatus = function()
			{
				var ok = true;
				var message = "Ready to submit";
				if(self.players.length < 5)
				{
					ok = false;
					message = "Not enough Players";
				}
				else if(self.countRoles(GoodSideRoles) <= 2)
				{
					ok = false;
					message = "Not enough good players";
				}
				else if(self.countRoles(BadSideRoles) < 2)
				{
					ok = false;
					message = "Not enough bad players";
				}
				
				if(ok)
				{
					for(var X in SpecialCharacterRoles)
					{
						if(self.countRoles(SpecialCharacterRoles[X]) > 1)
						{
							ok = false;
							message = "Have duplicate special character roles.";
							break;
						}
					}
				}
				
				
				return {ok:ok, message:message};
			}
		}