'use strict';

var friendLobby = ( function (){

	var _m_xuid = '';

	var _Init = function ( elTile )
	{
		var _m_isPerfectWorld = MyPersonaAPI.GetLauncherType() === "perfectworld" ? true : false;

		_m_xuid = elTile.GetAttributeString( 'xuid', '(not found)' );
		var lobbyType = PartyBrowserAPI.GetPartyType( _m_xuid );
		var gameMode = PartyBrowserAPI.GetPartySessionSetting( _m_xuid,'game/mode' );

		                               
		elTile.SetHasClass( 'playerforhire', ( lobbyType === 'nearby' ) );

		_SetLobbyLeaderNameAvatar( elTile, lobbyType );
		_SetGroupNameLink( elTile, lobbyType );
		_SetPrime( elTile );

		if ( !_m_isPerfectWorld )
		_SetRegion( elTile );
		
		_SetSkillGroup( elTile, gameMode );
		_SetLobbySettings( elTile, gameMode );
		_SetLobbyPlayerSlots( elTile, gameMode, lobbyType );
		_SetDismissButton( elTile, lobbyType );
	}

	var _SetLobbyLeaderNameAvatar = function ( elTile, lobbyType )
	{
		var xuidLobbyLeader = PartyBrowserAPI.GetPartyMemberXuid( _m_xuid, 0 );

		elTile.SetDialogVariable( 'friendname', FriendsListAPI.GetFriendName( xuidLobbyLeader ) );

		var nameString = ( lobbyType === 'invited' ) ? '#tooltip_friend_invited_you' : "#tooltip_lobby_leader_name";
		elTile.FindChildTraverse( 'JsFriendLobbyLeaderName' ).text = nameString;

		elTile.FindChildTraverse( 'JsFriendLobbyLeaderAvatar' ).steamid = xuidLobbyLeader;

		elTile.FindChildTraverse( 'JsFriendLobbyLeaderBtn' ).SetPanelEvent( 'onactivate', _OpenContextMenu.bind( undefined, xuidLobbyLeader ));
	};

	var _SetPrime = function ( elTile )
	{
		var primeValue = PartyBrowserAPI.GetPartySessionSetting( _m_xuid, 'game/apr' );
		elTile.FindChildTraverse( 'JsFriendLobbyPrime' ).visible = ( primeValue && primeValue != '0' ) ? true : false;
	};

	var _SetRegion = function ( elTile )
	{
		var countryCode = PartyBrowserAPI.GetPartySessionSetting( _m_xuid, 'game/loc' );
		CommonUtil.SetRegionOnLabel( countryCode, elTile );
	};

	var _SetSkillGroup = function ( elTile, gameMode )
	{
		var skillGroup = PartyBrowserAPI.GetPartySessionSetting( _m_xuid, 'game/ark' );
		skillGroup = Math.floor( skillGroup/10 );
		
		var elSkillGroupImg = elTile.FindChildTraverse( 'JsFriendLobbySkillGroup' );

		var szSkillGroupType = "skillgroup";
		if ( gameMode === 'scrimcomp2v2' )
		{
			szSkillGroupType = 'wingman';
		}
		else if ( gameMode === 'survival' )
		{
			szSkillGroupType = 'dangerzone';
		}
		
		if( !skillGroup )
			elSkillGroupImg.AddClass( 'hidden' );
		else
		{
			elSkillGroupImg.RemoveClass( 'hidden' );
			elTile.FindChildTraverse( 'JsFriendLobbySkillGroup' ).SetImage( 'file://{images}/icons/skillgroups/' + szSkillGroupType + skillGroup +'.svg' );
		}
	};

	var _SetLobbySettings = function ( elTile, gameMode )
	{
		var gameModeType = GameTypesAPI.GetGameModeType( gameMode );
		var gameModeDisplay = GameTypesAPI.GetGameModeAttribute( gameModeType, gameMode, 'nameID' );
		
		var elSettingsLabel = elTile.FindChildTraverse( 'JsFriendLobbySettings' );

		elSettingsLabel.SetDialogVariable( 'mode', $.Localize( gameModeDisplay ));
		elSettingsLabel.SetDialogVariable( 'maps', _GetMapNames( gameMode ) );
		elSettingsLabel.text = $.Localize( '#FriendsLobby_Settings', elSettingsLabel );
	};

	var _GetMapNames = function ( gameMode )
	{
		var mapGroups = PartyBrowserAPI.GetPartySessionSetting( _m_xuid, 'game/mapgroupname' );

		if ( mapGroups == 'workshop' )
			return $.Localize( '#SFUI_Groups_workshop' );

		if ( gameMode === 'cooperative' )
		{
			var questId = PartyBrowserAPI.GetPartySessionSetting( _m_xuid, 'game/questid' );
			if ( questId && questId != '0' )
				return $.Localize( MissionsAPI.GetQuestDefinitionField( parseInt( questId ), "loc_name" ) );
		}

		if( !mapGroups)
			mapGroups = '';
		
		var mapsList = mapGroups.split(',');
		                                                                                   
		                                                 
		    
		   	                                  
		    
		
		var mapsNiceNamesList = [];

		for ( var i = 0; i < mapsList.length; i++ )
		{
			if( i < 4)
			{
				var mapNiceName = GameTypesAPI.GetMapGroupAttribute( mapsList[i], 'nameID' );
				mapsNiceNamesList.push( $.Localize( mapNiceName ));
			}
		}

		return mapsNiceNamesList.join(', ');
	};

	var _SetLobbyPlayerSlots = function ( elTile, gameMode, lobbyType )
	{
		if ( lobbyType === 'nearby' ) return;                                 

		var count = PartyBrowserAPI.GetPartyMembersCount( _m_xuid );
		var numSlotsToShow = SessionUtil.GetMaxLobbySlotsForGameMode( gameMode ) - 1;

		var clientXuid = MyPersonaAPI.GetXuid();
		var clientInLobby = false; 
		var elAvatarRow = elTile.FindChildTraverse( 'JsFriendLobbyAvatars' );

		                                                      
		for ( var i = 1; i <= numSlotsToShow; i++ )
		{
			var xuid = PartyBrowserAPI.GetPartyMemberXuid( _m_xuid, i );
			var slotId = _m_xuid + ':' + i;
			var playerSlot = elAvatarRow.FindChild( slotId );

			if( !playerSlot )
			{
				playerSlot = $.CreatePanel( 'Panel', elAvatarRow, slotId );
				playerSlot.BLoadLayoutSnippet( 'FriendLobbyAvatarSlot' );
			}

			if( i === 1)
				playerSlot.AddClass( 'friendlobby__slot--first' );

			var elAvatar = playerSlot.FindChildTraverse( 'JsFriendAvatar' ),
			elJoinBtn = playerSlot.FindChildTraverse( 'JsFriendAvatarJoin' );

			if( clientInLobby === xuid )
				clientInLobby = true;

			if( !xuid )
			{
				var tooltipText = '';

				if( lobbyType === 'suggested' || clientInLobby )
				{
					elJoinBtn.enabled = false;
					tooltipText = $.Localize( 'tooltip_suggested_lobby' );
				}
				else
				{
					elJoinBtn.enabled = true;
					tooltipText = $.Localize( ( lobbyType === 'invited' ) ? 'tooltip_Join' : 'tooltip_join_public_lobby' );
					
					var onActivate = function ( lobbyLeaderXuid )
					{
						$.DispatchEvent( 'PlaySoundEffect', 'PanoramaUI.Lobby.Joined', 'MOUSE' );
						PartyBrowserAPI.ActionJoinParty( lobbyLeaderXuid );
					}

					elJoinBtn.SetPanelEvent( 'onactivate', onActivate.bind( undefined, _m_xuid ));
				}

				var onMouseOver = function ( id, tooltipText )
				{
					UiToolkitAPI.ShowTextTooltip( id, tooltipText );
				}

				elJoinBtn.SetPanelEvent( 'onmouseover', onMouseOver.bind( undefined, slotId, tooltipText ));
				elJoinBtn.SetPanelEvent( 'onmouseout', function () {
					UiToolkitAPI.HideTextTooltip();
				});

				elJoinBtn.visible = true;

				elAvatar.visible = false;
			}
			else
			{
				elAvatar.visible = true;
				elAvatar.steamid = xuid;

				elJoinBtn.visible = false;

				playerSlot.FindChild( 'JsFriendAvatarBtn' ).SetPanelEvent( 'onactivate', _OpenContextMenu.bind( undefined, xuid ));
			}
		}
	};

	var _SetGroupNameLink = function ( elTile, lobbyType )
	{
		var elGroupLBtn = elTile.FindChildTraverse( 'JsFriendLobbyGroupBtn' );
		var elGroupLabel = elTile.FindChildTraverse( 'JsFriendLobbyGroupTxt' );

		if ( lobbyType === 'invited' )
		{
			elGroupLabel.visible = false;
			elGroupLBtn.visible = false;
		}

		if( lobbyType === 'nearby' )
		{
			elGroupLabel.text = $.Localize( '#SFUI_Lobby_GroupsNearby' );
			elGroupLBtn.enabled = false;
		}
		else
		{
			var clanId = PartyBrowserAPI.GetPartySessionSetting( _m_xuid,"game/clanid" );
			var clanName = PartyBrowserAPI.GetPartySessionSetting( _m_xuid,"game/clantag" );

			if( lobbyType === 'suggested' )
			{
				
				elGroupLabel.SetDialogVariable( 'group', clanName );
				elGroupLabel.text = $.Localize( '#FriendsLobby_GroupsSuggested', elGroupLabel );
			}
			else
			{
				elGroupLabel.SetDialogVariable( 'group', clanName );
				elGroupLabel.text =  $.Localize( 'FriendsLobby_GroupName', elGroupLabel );
			}
			
			var onActivate = _GetClanLink( clanId );
			
			elGroupLBtn.SetPanelEvent( 'onactivate', onActivate );
			elGroupLBtn.enabled = true;
		}
	};

	var _SetDismissButton = function( elTile, lobbyType )
	{
		if ( lobbyType === 'invited' )
		{
			var elCloseButton = elTile.FindChildInLayoutFile( 'FriendLobbyCloseButton' );
			elCloseButton.RemoveClass( 'hidden' );
			elCloseButton.SetPanelEvent( "onactivate", function() {
				$.DispatchEvent( 'PlaySoundEffect', 'PanoramaUI.Lobby.Left', 'MOUSE' );
				PartyBrowserAPI.ClearInvite( _m_xuid );
			} );

			elCloseButton.SetPanelEvent( 'onmouseover', function() {
				UiToolkitAPI.ShowTextTooltip( 'FriendLobbyCloseButton', $.Localize( '#tooltip_discard_invite' ) );
			} );
			elCloseButton.SetPanelEvent( 'onmouseout', function () {
				UiToolkitAPI.HideTextTooltip();
			} );
		}
	}

	var _GetClanLink = function ( clanId )
	{
		return function () {
			var link = '';
			
			if( SteamOverlayAPI.GetAppID() == "710" )
				link = "http://beta.steamcommunity.com/gid/" + clanId;
			else
				link = "http://steamcommunity.com/gid/" + clanId;

			SteamOverlayAPI.OpenURL( link );
		};
	};

	var _OpenContextMenu = function ( xuid )
	{
		                                                                                             
		$.DispatchEvent( 'SidebarContextMenuActive', true );
		
		var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
			'',
			'',
			'file://{resources}/layout/context_menus/context_menu_playercard.xml', 
			'xuid='+xuid,
			function () {
				$.DispatchEvent('SidebarContextMenuActive', false )
			}
		);
		contextMenuPanel.AddClass( "ContextMenu_NoArrow" ); 
	};

	return {
		Init	: _Init,                       
	};

})();
