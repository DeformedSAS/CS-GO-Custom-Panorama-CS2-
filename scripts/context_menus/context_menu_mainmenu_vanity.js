'use strict';

var MainMenuVanityContextMenu = (function() {

	var team;
	var isPopupOpen = false;

	function _Init() {
		team = $.GetContextPanel().GetAttributeString("team", "");

		var elContextMenuBodyNoScroll = $.GetContextPanel().FindChildTraverse('ContextMenuBodyNoScroll');
		var elContextMenuBodyWeapons = $.GetContextPanel().FindChildTraverse('ContextMenuBodyWeapons');

		elContextMenuBodyNoScroll.RemoveAndDeleteChildren();
		elContextMenuBodyWeapons.RemoveAndDeleteChildren();

		var fnAddVanityPopupMenuItem = function(idString, strItemNameString, fnOnActivate) {
			var elItem = $.CreatePanel('Button', elContextMenuBodyNoScroll, idString);
			elItem.BLoadLayoutSnippet('snippet-vanity-item');
			var elLabel = elItem.FindChildTraverse('id-vanity-item__label');
			elLabel.text = $.Localize(strItemNameString);
			elItem.SetPanelEvent('onactivate', fnOnActivate);
			return elItem;
		};

		// Add the new "Show Build Warning" button
		fnAddVanityPopupMenuItem('ShowBuildWarning', 'Build Info', function() {
			showBuildWarning();
			$.DispatchEvent('ContextMenuEvent', ''); // Close the context menu after activating
		});

		// Existing switch team option
		var strOtherTeamToPrecache = ((team == 2) ? 'ct' : 't');
		fnAddVanityPopupMenuItem('switchTo_' + strOtherTeamToPrecache, '#mainmenu_switch_vanity_to_' + strOtherTeamToPrecache,
			function(paramTeam) {
				$.DispatchEvent("MainMenuSwitchVanity", paramTeam);
				$.DispatchEvent('ContextMenuEvent', '');
			}.bind(undefined, strOtherTeamToPrecache)
		).SetFocus();

		// Go to loadout option
		fnAddVanityPopupMenuItem('GoToLoadout', '#mainmenu_go_to_character_loadout',
			function(paramTeam) {
				$.DispatchEvent("MainMenuGoToCharacterLoadout", paramTeam);
				$.DispatchEvent('ContextMenuEvent', '');
			}.bind(undefined, team)
		).AddClass('BottomSeparator');

		// Load weapons list
		var list = ItemInfo.GetLoadoutWeapons(team);
		if (list && list.length > 0) {
			list.forEach(function(entry) {
				var elItem = $.CreatePanel('Button', elContextMenuBodyWeapons, entry);
				elItem.BLoadLayoutSnippet('snippet-vanity-item');
				elItem.AddClass('vanity-item--weapon');
				var elLabel = elItem.FindChildTraverse('id-vanity-item__label');
				elLabel.text = ItemInfo.GetName(entry);
				var elRarity = elItem.FindChildTraverse('id-vanity-item__rarity');
				var rarityColor = ItemInfo.GetRarityColor(entry);
				elRarity.style.backgroundColor = "gradient(linear, 0% 0%, 100% 0%, from(" + rarityColor + "), color-stop(0.0125, #00000000), to(#00000000));";

				elItem.SetPanelEvent('onactivate', function(team) {
					var shortTeam = CharacterAnims.NormalizeTeamName(team, true);
					var loadoutSubSlot = ItemInfo.GetSlotSubPosition(entry);
					GameInterfaceAPI.SetSettingString('ui_vanitysetting_loadoutslot_' + shortTeam, loadoutSubSlot);
					$.DispatchEvent('ForceRestartVanity');
					$.DispatchEvent('ContextMenuEvent', '');
				}.bind(undefined, team));
			});
		}

		// Precache other team character
		var otherTeamCharacterItemID = LoadoutAPI.GetItemID(strOtherTeamToPrecache, 'customplayer');
		var settingsForOtherTeam = ItemInfo.GetOrUpdateVanityCharacterSettings(otherTeamCharacterItemID);
		ItemInfo.PrecacheVanityCharacterSettings(settingsForOtherTeam);
	}

	// Define the showBuildWarning function
	function showBuildWarning() {
		if (isPopupOpen) {
			return;
		}

		isPopupOpen = true;

		UiToolkitAPI.ShowGenericPopupThreeOptionsBgStyle(
			$.Localize("#legacy_support_text_title"),  
			$.Localize("#legacy_support_text_desc"),   
			'',                                         
			$.Localize("#link_to_steam_support"),      
			function() { 
				OnshowBuildWarning('link'); 
				isPopupOpen = false;     
			},
			$.Localize("#OK"),                       
			function() { 
				OnshowBuildWarning('');       
				isPopupOpen = false;          
			},
			'CS SUPREMACY PROJECT',                   
			function() {
				OnshowCSProjectLink();        
				isPopupOpen = false;         
			},
			'dim',  
			function() {
				isPopupOpen = false;  
			},
		);
	}

	// Helper function for the popup buttons
	function OnshowBuildWarning(msg) {
		if (msg === 'link') {
			SteamOverlayAPI.OpenUrlInOverlayOrExternalBrowser("https://github.com/DeformedSAS/CS-GO-Custom-Panorama-CS2-");
		}
	}

	function OnshowCSProjectLink() {
		SteamOverlayAPI.OpenUrlInOverlayOrExternalBrowser("https://discord.com/invite/aeAEzZXxHu");
	}

	return {
		Init: _Init,
	}

})();
