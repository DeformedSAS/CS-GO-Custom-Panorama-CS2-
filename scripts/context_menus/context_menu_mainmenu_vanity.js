'use strict';

var MainMenuVanityContextMenu = ( function()
{

	var team;

	function _Init ()
	{
		team = $.GetContextPanel().GetAttributeString( "team", "" );		

		var elContextMenuBodyNoScroll = $.GetContextPanel().FindChildTraverse( 'ContextMenuBodyNoScroll' );
		var elContextMenuBodyWeapons = $.GetContextPanel().FindChildTraverse( 'ContextMenuBodyWeapons' );

		elContextMenuBodyNoScroll.RemoveAndDeleteChildren();
		elContextMenuBodyWeapons.RemoveAndDeleteChildren();

		  
		                                                      
		  
		var fnAddVanityPopupMenuItem = function( idString, strItemNameString, fnOnActivate )
		{
			var elItem = $.CreatePanel( 'Button', elContextMenuBodyNoScroll, idString );
			elItem.BLoadLayoutSnippet( 'snippet-vanity-item' );
			var elLabel = elItem.FindChildTraverse( 'id-vanity-item__label' );
			elLabel.text = $.Localize( strItemNameString );
			elItem.SetPanelEvent( 'onactivate', fnOnActivate );
			return elItem;
		};

		  
		                                  
		  
		fnAddVanityPopupMenuItem( 'GoToMainMenuScenerySettings', '#GameUI_MainMenuMovieScene_Vanity',
			function( paramTeam )
			{
				$.DispatchEvent( 'MainMenuGoToSettings' );
				$.DispatchEvent( "SettingsMenu_NavigateToSetting", 'VideoSettings', 'MainMenuMovieSceneSelector' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}.bind( undefined, team )
		).AddClass( 'BottomSeparator' );

		  
		                                         
		  
		                                                                                                
		var strOtherTeamToPrecache = ( ( team == 2 ) ? 'ct' : 't' );
		fnAddVanityPopupMenuItem( 'switchTo_' + strOtherTeamToPrecache, '#mainmenu_switch_vanity_to_' + strOtherTeamToPrecache,
			function( paramTeam )
			{
				$.DispatchEvent( "MainMenuSwitchVanity", paramTeam );
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}.bind( undefined, strOtherTeamToPrecache )
		).SetFocus();

		  
		                           
		  
		fnAddVanityPopupMenuItem( 'GoToLoadout', '#mainmenu_go_to_character_loadout',
			function( paramTeam )
			{
				$.DispatchEvent( "MainMenuGoToCharacterLoadout", paramTeam );
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}.bind( undefined, team )
		).AddClass( 'BottomSeparator' );


		  
		                                   
		  
		var list = ItemInfo.GetLoadoutWeapons( team );

		if ( list && list.length > 0 )
		{

			list.forEach( function( entry )
			{
				var elItem = $.CreatePanel( 'Button', elContextMenuBodyWeapons, entry );
				elItem.BLoadLayoutSnippet( 'snippet-vanity-item' );
				elItem.AddClass( 'vanity-item--weapon' );
				var elLabel = elItem.FindChildTraverse( 'id-vanity-item__label' );
				elLabel.text = ItemInfo.GetName( entry );
				var elRarity = elItem.FindChildTraverse( 'id-vanity-item__rarity');
				var rarityColor = ItemInfo.GetRarityColor( entry );
		  		                                   
		  		                      
				elRarity.style.backgroundColor = "gradient( linear, 0% 0%, 100% 0%, from(" + rarityColor + " ),  color-stop( 0.0125, #00000000 ), to( #00000000 ) );" ;




				elItem.SetPanelEvent( 'onactivate', function( team )
				{
					var shortTeam = CharacterAnims.NormalizeTeamName( team, true );
					var loadoutSubSlot = ItemInfo.GetSlotSubPosition( entry );
					GameInterfaceAPI.SetSettingString( 'ui_vanitysetting_loadoutslot_' + shortTeam, loadoutSubSlot );

					$.DispatchEvent( 'ForceRestartVanity' );
					$.DispatchEvent( 'ContextMenuEvent', '' );

				}.bind( undefined, team ) );
			} )
		}

		  
		                                                 
		  
		var otherTeamCharacterItemID = LoadoutAPI.GetItemID( strOtherTeamToPrecache, 'customplayer' );
		var settingsForOtherTeam = ItemInfo.GetOrUpdateVanityCharacterSettings( otherTeamCharacterItemID );
		ItemInfo.PrecacheVanityCharacterSettings( settingsForOtherTeam );
	}

	return {
		Init: _Init,
	}


})();

(function()
{

})();