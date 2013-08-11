
	
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
		
		var Game = function()
		{
			this.ROLE_CHANGED = "ROLE_CHANGED";
			this.CHANGED = "CHANGED";
			
			
			this.players = [];
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
				else if(self.countRoles([]) < 2)
				{
					ok = false;
					message = "Not enough bad players";
				}
				return {ok:ok, message:message};
			}
		}