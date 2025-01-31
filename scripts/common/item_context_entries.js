"use-strict";

var ItemContextEntires = ( function (){

	var _FilterEntries = function( populateFilterText )
	{
		var bHasFilter = populateFilterText !== "(not found)";
		
		return _Entries.filter( function( entry )
		{
			                 
			if ( entry.exclusiveFilter )
			{
				return entry.exclusiveFilter.includes( populateFilterText );
			}
			                      
			else if ( bHasFilter && entry.populateFilter )
			{
				return entry.populateFilter.includes( populateFilterText );
			}	
			
			                                                                        
			return !bHasFilter;
		} );
	};

	                                                                                                    
                                             
                                                           
                                                                  
	                                                                                                    
	var _Entries = [
	  
		 
			                                                                            
			                                                                     
			                                                                                    
			                                   
				                                                                 
				            	
			  
			                              
				                                    
			 
		  
	  	
			          
			 
				                         
				                            
				                     
					                         
				  
				                                   
					                                                                                       
				  
				                              
					                                          
					                              
				 
			  
			          
			{
			name: 'preview',
			populateFilter: ['lootlist', 'loadout', 'tradeup_items', 'tradeup_ingredients'],
			style: function (id){
				var slotsub = ItemInfo.GetSlotSubPosition(id);
				return ( ( slotsub ) && ( slotsub.startsWith( "equipment" ) || slotsub.startsWith( "grenade" ) ) ) ? '' : 'BottomSeparator';
			},
			AvailableForItem: function ( id ) {
				                              
				                                                         
				                             
					                                                                                      

				                                                                 
				return ItemInfo.IsPreviewable( id );
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				
				var defName = InventoryAPI.GetItemDefinitionName( id );
				if ( defName === 'casket' ) {	                              
					if ( InventoryAPI.GetItemAttributeValue( id, 'items count' ) ) {
						               
						UiToolkitAPI.ShowCustomLayoutPopupParameters(
							'', 
							'file://{resources}/layout/popups/popup_casket_operation.xml',
							'op=loadcontents' +
							'&nextcapability=casketcontents' +
							'&spinner=1' +
							'&casket_item_id=' + id +
							'&subject_item_id=' + id
						);
					} else {
						UiToolkitAPI.ShowGenericPopupOk(
							$.Localize( '#popup_casket_title_error_casket_empty' ),
							$.Localize( '#popup_casket_message_error_casket_empty' ),
							'',
							function()
							{
							},
							function()
							{
							}
						);
					}
					return;
				}

				$.DispatchEvent( "InventoryItemPreview", id );
			}
		},
		{
			name: 'bulkretrieve',
			populateFilter: ['loadout'],
			AvailableForItem: function ( id ) {
				                                           
				var defName = InventoryAPI.GetItemDefinitionName( id );
				return ( defName === 'casket' ) && InventoryAPI.GetItemAttributeValue( id, 'modification date' );
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				
				var defName = InventoryAPI.GetItemDefinitionName( id );
				if ( defName === 'casket' ) {	                              
					if ( InventoryAPI.GetItemAttributeValue( id, 'items count' ) ) {
						               
						UiToolkitAPI.ShowCustomLayoutPopupParameters(
							'', 
							'file://{resources}/layout/popups/popup_casket_operation.xml',
							'op=loadcontents' +
							'&nextcapability=casketretrieve' +
							'&spinner=1' +
							'&casket_item_id=' + id +
							'&subject_item_id=' + id
						);
					} else {
						UiToolkitAPI.ShowGenericPopupOk(
							$.Localize( '#popup_casket_title_error_casket_empty' ),
							$.Localize( '#popup_casket_message_error_casket_empty' ),
							'',
							function()
							{
							},
							function()
							{
							}
						);
					}
					return;
				}
			}
		},
		{
			name: 'bulkstore',
			populateFilter: ['loadout'],
			style: function (id){
				return 'BottomSeparator';
			},
			AvailableForItem: function ( id ) {
				                                           
				var defName = InventoryAPI.GetItemDefinitionName( id );
				return ( defName === 'casket' ) && InventoryAPI.GetItemAttributeValue( id, 'modification date' );
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				
				var defName = InventoryAPI.GetItemDefinitionName( id );
				if ( defName === 'casket' ) {	                              
					$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'casketstore', id, '' );
				}
			}
		},
		{
			name: 'view_tournament_journal',
			populateFilter: ['inspect', 'loadout'],
			style: function (id){
				return false;
			},
			AvailableForItem: function ( id ) {
				return ( ItemInfo.ItemDefinitionNameSubstrMatch(id, 'tournament_journal_') &&
					                                                                          
					g_ActiveTournamentInfo.eventid == InventoryAPI.GetItemAttributeValue( id, "tournament event id" ) );
			},
			OnSelected:  function ( id ) {
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_tournament_journal.xml',
					'journalid=' + id
				);

				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			name: 'openloadout',
			AvailableForItem: function ( id ) {
				var slotsub = ItemInfo.GetSlotSubPosition(id);
				return ( slotsub ) &&
					( slotsub !== 'c4' ) &&
					!slotsub.startsWith( "equipment" ) &&
					ItemInfo.IsEquippalbleButNotAWeapon( id ) &&
					!slotsub.startsWith( "grenade" );
			},
			OnSelected:  function ( id ) {
				                                         
				var teamNum = ( ItemInfo.GetTeam( id ).search( 'Team_T' ) === -1 ) ? 3 : 2;
				$.DispatchEvent( 'ContextMenuEvent', '' );
				$.DispatchEvent( "ShowLoadoutForItem", ItemInfo.GetSlot( id ) , ItemInfo.GetSlotSubPosition( id ), teamNum );
			}
		},
		{
			name: 'equip_both_teams',
			populateFilter: ['inspect', 'loadout'],
			AvailableForItem: function ( id ) {
				if ( ItemInfo.IsItemAnyTeam( id ) &&
					( !ItemInfo.IsEquippedForCT( id ) && !ItemInfo.IsEquippedForT( id ) &&
						!ItemInfo.IsShuffleEnabled( id, 't' ) && !ItemInfo.IsShuffleEnabled( id, 'ct' ) ) )
				{
					return _CanEquipItem( id );
				}
			},
			OnSelected: function( id )
			{				
				$.DispatchEvent( 'ContextMenuEvent', '' );
				EquipItem( id, [ 'ct', 't' ] );
			}
		},
		{
			                         
			name: 'equip_ct',
			CustomName: function (id) {
				return _GetItemToReplaceName(id, 'ct');
			},
			populateFilter: ['inspect', 'loadout'],
			style: function (id){
				return false;
			},
			AvailableForItem: function ( id ) {
				if ( _DoesItemTeamMatchTeamRequired( 'ct', id ) &&
					_ItemIsNotEquippedAndNotInShuffle( 'ct', id ) ||
					_IsInShuffleButNotEquippedWeaponTypeForSlot( 'ct', id ) &&
					_DoesItemTeamMatchTeamRequired( 'ct', id ) )
				{
					return _CanEquipItem( id );
				}
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				EquipItem( id, [ 'ct' ] );
			}
		},
		{	
			                        
			name: 'equip_t',
			CustomName: function (id) {
				return _GetItemToReplaceName(id, 't');
			},
			populateFilter: ['inspect', 'loadout'],
			ToolTip: function (id) {
				return _GetItemToReplaceName(id, 'ct');
			},
			style: function (id){
				return false;
			},
			AvailableForItem: function ( id ) {
				if ( _DoesItemTeamMatchTeamRequired( 't', id ) &&
					_ItemIsNotEquippedAndNotInShuffle( 't', id ) ||
					_IsInShuffleButNotEquippedWeaponTypeForSlot( 't', id ) &&
					_DoesItemTeamMatchTeamRequired( 't', id ) )
				{
					return _CanEquipItem( id );
				}
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				EquipItem( id, [ 't' ] );
			}
		},
		{	
			                            
			name: 'add_to_shuffle_t',
			populateFilter: ['inspect', 'loadout'],
			style: function (id){
				return false;
			},
			AvailableForItem: function ( id ) {
				
				if (( ItemInfo.IsItemT( id ) || ItemInfo.IsItemAnyTeam( id ) ) &&
					ItemInfo.IsShuffleEnabled( id, 't' ) && !ItemInfo.IsItemInShuffleForTeam( id, 't' ) && !InventoryAPI.IsItemDefault( id ) )
				{
					return _CanEquipItem( id );
				}
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				ItemInfo.AddItemToShuffle( id, 't' );
			}
		},
		{	
			                               
			name: 'remove_from_shuffle_t',
			populateFilter: ['inspect', 'loadout'],
			style: function (id){
				return false;
			},
			AvailableForItem: function ( id ) {
				
				if ( ( ItemInfo.IsItemT( id ) || ItemInfo.IsItemAnyTeam( id ) ) &&
					ItemInfo.IsShuffleEnabled( id, 't' ) && ItemInfo.IsItemInShuffleForTeam( id, 't' ) )
				{
					return _CanEquipItem( id );
				}
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				ItemInfo.RemoveItemFromShuffle( id, 't' );
				ItemInfo.EnsureShuffleItemEquipped( id, 't' );
			}
		},
		{	
			                             
			name: 'add_to_shuffle_ct',
			populateFilter: ['inspect', 'loadout'],
			style: function (id){
				return false;
			},
			AvailableForItem: function ( id ) {
				if ( ( ItemInfo.IsItemCt( id ) || ItemInfo.IsItemAnyTeam( id ) ) &&
					ItemInfo.IsShuffleEnabled( id, 'ct' ) && !ItemInfo.IsItemInShuffleForTeam( id, 'ct' ) && !InventoryAPI.IsItemDefault( id ) )
				{
					return _CanEquipItem( id );
				}
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				ItemInfo.AddItemToShuffle( id, 'ct' );
			}
		},
		{	
			                                
			name: 'remove_from_shuffle_ct',
			populateFilter: ['inspect', 'loadout'],
			style: function (id){
				return false;
			},
			AvailableForItem: function ( id ) {
				
				if ( ( ItemInfo.IsItemCt( id ) || ItemInfo.IsItemAnyTeam( id ) ) &&
					ItemInfo.IsShuffleEnabled( id, 'ct' ) && ItemInfo.IsItemInShuffleForTeam( id, 'ct' ) )
				{
					return _CanEquipItem( id );
				}
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				ItemInfo.RemoveItemFromShuffle( id, 'ct' );
				ItemInfo.EnsureShuffleItemEquipped( id, 'ct' );
			}
		},
		{
			name: 'flair',
			populateFilter: ['inspect', 'loadout'],
			AvailableForItem: function ( id ) {
				return ItemInfo.GetSlotSubPosition(id) === 'flair0' && (
					!ItemInfo.IsEquippedForNoTeam(id) || ( InventoryAPI.GetRawDefinitionKey(id, 'item_sub_position2') !== '' )
				);
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				EquipItem( id, [ 'noteam' ] );
			}
		},
		                                                           
		    
		   	                        
		   	                              
		   	                                       
		   	                                   
		   		                                                                         
		   	  
		   	                          
		   	 
		   		                                          
				
		   		                                
		   			                                                   
		   			                                                   
		   			   
		   			              
		   			             
		   		  
		   	 
		     
		{
			                            
			name: 'equip_spray',
			populateFilter: ['inspect', 'loadout'],
			AvailableForItem: function ( id ) {
				return ( ItemInfo.ItemMatchDefName( id, 'spraypaint' ) && !ItemInfo.IsEquippedForNoTeam( id ) );
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				EquipItem( id, [ 'noteam' ], 'spray0' );
			}
		},
		{
			                            
			name: 'equip_tournament_spray',
			populateFilter: ['inspect', 'loadout'],
			AvailableForItem: function ( id ) {
				return ( ItemInfo.ItemDefinitionNameSubstrMatch(id, 'tournament_journal_') && ( InventoryAPI.GetRawDefinitionKey(id, 'item_sub_position2') === 'spray0' ) );
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
	
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_tournament_select_spray.xml',
					'journalid=' + id
				);
			}
		},
		{
			          
			name: 'equip_musickit',
			CustomName: function (id) {
				return _GetItemToReplaceName(id, 'noteam');
			},
			populateFilter: ['inspect', 'loadout'],
			style: function (id){
				                                                                                       
				return false;
			},
			AvailableForItem: function ( id ) {
				return ItemInfo.GetSlotSubPosition(id) === 'musickit' && !ItemInfo.IsEquippedForNoTeam(id) && !ItemInfo.IsShuffleEnabled( id, 'noteam' );
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				var isMusicvolumeOn = InventoryAPI.TestMusicVolume();
				if ( !isMusicvolumeOn )
				{
					$.DispatchEvent( 'ShowResetMusicVolumePopup', '' );
				}
				else
				{
					$.DispatchEvent( 'PlaySoundEffect', 'equip_musickit', 'MOUSE' );
					EquipItem( id, [ 'noteam' ] );
				}
			}
		},
		{
			                     
			name: 'add_musickit_to_shuffle',
			populateFilter: ['inspect', 'loadout'],
			style: function (id){
				return '';
			},
			AvailableForItem: function ( id ) {
				return ItemInfo.GetSlotSubPosition(id) === 'musickit' && ItemInfo.IsShuffleEnabled( id, 'noteam' ) && !ItemInfo.IsItemInShuffleForTeam( id, 'noteam' ) && !InventoryAPI.IsItemDefault( id );
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				ItemInfo.AddItemToShuffle( id, 'noteam' );
			}
		},
		{
			                       
			name: 'remove_musickit_from_shuffle',
			populateFilter: ['inspect', 'loadout'],
			style: function (id){
				return '';
			},
			AvailableForItem: function ( id ) {
				return ItemInfo.GetSlotSubPosition(id) === 'musickit' && ItemInfo.IsShuffleEnabled( id, 'noteam' ) && ItemInfo.IsItemInShuffleForTeam( id, 'noteam' );
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				ItemInfo.RemoveItemFromShuffle( id, 'noteam' );
			}
		},
		{
			name: 'open_watch_panel_pickem',
			AvailableForItem: function ( id ) {
				if ( GameStateAPI.GetMapBSPName() )	                                           
					return false;
				return ( ItemInfo.ItemDefinitionNameSubstrMatch(id, 'tournament_journal_') && ( InventoryAPI.GetRawDefinitionKey(id, 'item_sub_position2') === 'spray0' ) );
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'OpenWatchMenu' );
                $.DispatchEvent( 'ShowActiveTournamentPage', '' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			name: 'getprestige',
			AvailableForItem: function ( id ) {
				return ( ItemInfo.ItemDefinitionNameSubstrMatch(id, 'xpgrant') &&
					( FriendsListAPI.GetFriendLevel( MyPersonaAPI.GetXuid() ) >= InventoryAPI.GetMaxLevel() ) );
			},
			OnSelected: function( id )
			{
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_inventory_inspect.xml',
					'itemid=' + '0' +                                                                                          
					'&' + 'asyncworkitemwarning=no' +
					'&' + 'asyncworktype=prestigecheck'
				);
				
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			name: 'useitem',
			AvailableForItem: function ( id ) {
				if ( ItemInfo.ItemDefinitionNameSubstrMatch(id, 'tournament_pass_') ) return true;
				if ( ItemInfo.ItemDefinitionNameSubstrMatch(id, 'xpgrant') )
				{	                                                                
					return ( FriendsListAPI.GetFriendLevel( MyPersonaAPI.GetXuid() ) < InventoryAPI.GetMaxLevel() );
				}

				if ( !InventoryAPI.IsTool( id ) ) return false;
				var season = InventoryAPI.GetItemAttributeValue( id, 'season access' );
				if ( season != undefined ) return true;                                    
				return false;
			},
			OnSelected: function( id )
			{
				if ( ItemInfo.ItemDefinitionNameSubstrMatch(id, 'tournament_pass_') ) {
					UiToolkitAPI.ShowCustomLayoutPopupParameters(
						'',
						'file://{resources}/layout/popups/popup_capability_decodable.xml',
						'key-and-case=,' + id +
						'&' + 'asyncworktype=decodeable'
					);
				} else {
					UiToolkitAPI.ShowCustomLayoutPopupParameters(
						'',
						'file://{resources}/layout/popups/popup_inventory_inspect.xml',
						'itemid=' + id +
						'&' + 'asyncworktype=useitem'
					);
				}
				
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			name: 'edit_shuffle_settings',
			AvailableForItem: function ( id ) {
				return ItemInfo.IsShuffleAllowed( id ) && !InventoryAPI.IsItemDefault( id );
			},
			style: function( id )
			{
				return 'BottomSeparator';
			},
			OnSelected:  function ( id ) {
				                                         
				var teamNum = ( ItemInfo.GetTeam( id ).search( 'Team_T' ) === -1 ) ? 3 : 2;
				$.DispatchEvent( 'ContextMenuEvent', '' );
				$.DispatchEvent( "ShowLoadoutForItem", ItemInfo.GetSlot( id ) , ItemInfo.GetSlotSubPosition( id ), teamNum );
			}
		},

		{
			name: 'usespray',
			populateFilter: ['inspect'],
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemMatchDefName(id, 'spray');
			},
			OnSelected: function( id )
			{
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_capability_decodable.xml',
					'key-and-case=,' + id +
					'&' + 'asyncworktype=decodeable'
				);

				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			name: function( id )
			{
				return InventoryAPI.GetDecodeableRestriction( id ) === 'xray' && !ItemInfo.IsTool( id ) ? 'look_inside' : _IsKeyForXrayItem( id ) !== '' ? 'goto_xray' : 'open_package';
			},
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemHasCapability( id, 'decodable' );
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );

				if ( ItemInfo.GetChosenActionItemsCount( id, 'decodable' ) === 0 )
				{
					if ( ItemInfo.IsTool( id ) )
					{
						                                                             
						$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'decodable', id, '' );
		
					}
					else
					{
						UiToolkitAPI.ShowCustomLayoutPopupParameters(
							'popup-inspect-' + id,
							'file://{resources}/layout/popups/popup_capability_decodable.xml',
							'key-and-case=,' + id +
							'&' + 'asyncworktype=decodeable'
						);
					}

					$.DispatchEvent( 'ContextMenuEvent', '' );
					return;
				}
				
				if ( ItemInfo.GetChosenActionItemsCount( id, 'decodable' ) > 0 && ItemInfo.IsTool( id ) && InventoryAPI.GetDecodeableRestriction( id ) === 'xray' )
				{
						                                
						var caseId = _IsKeyForXrayItem( id );
						if ( caseId )
						{
							$.DispatchEvent( "ShowXrayCasePopup", id, caseId, false );
							$.DispatchEvent( 'ContextMenuEvent', '' );
							return;
						}
				}

				if ( !ItemInfo.IsTool( id ) && InventoryAPI.GetDecodeableRestriction( id ) === 'xray' )
				{
					UiToolkitAPI.ShowCustomLayoutPopupParameters(
						'popup-inspect-'+ id,
						'file://{resources}/layout/popups/popup_capability_decodable.xml',
						'key-and-case=,' + id +
						'&' + 'asyncworktype=decodeable'
					);
					return;
				}
				
				$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'decodable', id, '' );
			}
		},
		    
		   	             
		   	                                   
		   		                                                       
		   			                         
		   			                                                       
		   	  
		   	                       
		   		                      
		   	  
		   	                          
		   	 
		   		                                          
		   		                                           
		   	 
		     
		{
			name: function( id )
			{
				var strActionName = 'nameable';
				var defName = InventoryAPI.GetItemDefinitionName( id );
				if ( defName === 'casket' ) {
					                                                                                                    
					return InventoryAPI.GetItemAttributeValue( id, 'modification date' ) ? 'yourcasket' : 'newcasket';
				}
				return strActionName;
			},
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemHasCapability( id, 'nameable' );
			},
			OnSelected:  function ( id ) {

				var defName = InventoryAPI.GetItemDefinitionName( id );
				if ( defName === 'casket' ) {
					                                                                                                    
					var fauxNameTag = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( 1200, 0 );              
					var noteText = InventoryAPI.GetItemAttributeValue( id, 'modification date' ) ? 'yourcasket' : 'newcasket';
					$.DispatchEvent( 'ContextMenuEvent', '' );
					UiToolkitAPI.ShowCustomLayoutPopupParameters(
						'', 
						'file://{resources}/layout/popups/popup_capability_nameable.xml',
						'nametag-and-itemtoname=' + fauxNameTag + ',' + id +
						'&' + 'asyncworktype=nameable' +
						'&' + 'asyncworkitemwarningtext=#popup_'+noteText+'_warning'
					);
				}
				else if( _DoesNotHaveChosenActionItems( id, 'nameable' ) )
				{
					var nameTagId = '',
					itemToNameId = id;
					
					UiToolkitAPI.ShowCustomLayoutPopupParameters(
						'', 
						'file://{resources}/layout/popups/popup_capability_nameable.xml',
						'nametag-and-itemtoname=' + nameTagId + ',' + itemToNameId +
						'&' + 'asyncworktype=nameable'
					);
				}
				else
				{
					$.DispatchEvent( 'ContextMenuEvent', '' );
					$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'nameable', id, '' );
				}
			}
		},
		{
			                                                              
			name: 'can_sticker',
			populateFilter: ['inspect', 'loadout'],
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemMatchDefName(id, 'sticker') && ItemInfo.ItemHasCapability(id, 'can_sticker');
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'PlaySoundEffect', 'sticker_applySticker', 'MOUSE' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
				$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'can_sticker', id, '' );
			}
		},
		{
			name: 'can_sticker',
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemHasCapability(id, 'can_sticker') &&
					ItemInfo.GetStickerSlotCount(id) > ItemInfo.GetStickerCount(id);
					
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'PlaySoundEffect', 'sticker_applySticker', 'MOUSE' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
				$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'can_sticker', id, '' );
			}
		},
		{
			name: 'remove_sticker',
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemHasCapability( id, 'can_sticker' ) && ItemInfo.GetStickerCount(id) > 0;
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );

				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_capability_can_sticker.xml',
					'sticker-and-itemtosticker=remove' + ',' + id + 
					'&' + 'asyncworktype=remove_sticker'
				);
			}
		},
		{
			                                                         
			name: 'can_patch',
			populateFilter: ['inspect', 'loadout'],
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemMatchDefName(id, 'patch') && ItemInfo.ItemHasCapability(id, 'can_patch');
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'PlaySoundEffect', 'sticker_applySticker', 'MOUSE' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
				$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'can_patch', id, '' );
			}
		},
		{
			name: 'can_patch',
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemHasCapability( id, 'can_patch' ) &&
					ItemInfo.GetStickerSlotCount(id) > ItemInfo.GetStickerCount(id);
					
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'PlaySoundEffect', 'sticker_applySticker', 'MOUSE' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
				$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'can_patch', id, '' );
			}
		},
		{
			name: 'remove_patch',
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemHasCapability( id, 'can_patch' ) && ItemInfo.GetStickerCount(id) > 0;
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );

				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_capability_can_sticker.xml',
					'sticker-and-itemtosticker=remove' + ',' + id + 
					'&' + 'asyncworktype=remove_sticker'
				);
			}
		},
		{
			name: 'recipe',
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemMatchDefName( id, 'recipe' );
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			name: 'can_stattrack_swap',
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemHasCapability( id,'can_stattrack_swap' ) && InventoryAPI.IsTool( id );
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'can_stattrack_swap', id, '' );
			}
		},
		{
			name: 'journal',
			AvailableForItem: function ( id ) {
				return false;                                
				var campaignSeason = InventoryAPI.GetItemAttributeValue( id, 'season access' );
				var deployDate = InventoryAPI.GetItemAttributeValue( id, 'deployment date' );
				return ItemInfo.GetSlotSubPosition(id) === 'flair0' && campaignSeason >= 3 && deployDate != undefined;
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			              
			name: 'tradeup_add',
			populateFilter: ['tradeup_items'],
			AvailableForItem: function ( id ) {
				var slot = ItemInfo.GetSlotSubPosition(id);
				return slot && slot !=="melee" && slot !=="c4" && slot !=="clothing_hands" && !ItemInfo.IsEquippalbleButNotAWeapon(id) &&
					( InventoryAPI.CanTradeUp( id ) || InventoryAPI.GetNumItemsNeededToTradeUp( id ) > 0 );
			},
			OnSelected: function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				InventoryAPI.AddCraftIngredient( id );
			}
		},
		{
			                 
			name: 'tradeup_remove',
			exclusiveFilter: ['tradeup_ingredients'],
			AvailableForItem: function ( id ) {
				var slot = ItemInfo.GetSlotSubPosition(id);
				return slot && slot !=="melee" && slot !=="c4" && slot !=="clothing_hands" && !ItemInfo.IsEquippalbleButNotAWeapon(id);
			},
			OnSelected: function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				InventoryAPI.RemoveCraftIngredient( id );
			}
		},
		{
			                        
			name: 'open_contract',
			AvailableForItem: function ( id ) {
				return ItemInfo.IsTradeUpContract( id );
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ShowTradeUpPanel' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			name: 'usegift',
			AvailableForItem: function ( id ) {
				return ItemInfo.GetToolType( id ) === 'gift';
			},
			OnSelected: function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );

				var CapDisabledMessage = InventoryAPI.GetItemCapabilityDisabledMessageByIndex( id, 0 );

				if ( CapDisabledMessage === "" )
				{
					                                          
					UiToolkitAPI.ShowCustomLayoutPopupParameters(
						'',
						'file://{resources}/layout/popups/popup_inventory_inspect.xml',
						'itemid=' + id +                                                                                          
						'&' + 'asyncworkitemwarning=no' +
						'&' + 'asyncworktype=usegift'
					);
				}
				else
				{
					var capDisabledMessage  = InventoryAPI.GetItemCapabilityDisabledMessageByIndex( id, 0 );
					UiToolkitAPI.ShowGenericPopupOk(
						$.Localize( '#inv_context_usegift' ),
						$.Localize( capDisabledMessage ),
						'',
						function()
						{
						},
						function()
						{
						}
					);
				}
			}
		},
		{
			name: 'intocasket',
			style: function (id){
				return 'TopSeparator';
			},
			AvailableForItem: function ( id ) {
				return InventoryAPI.IsPotentiallyMarketable( id );
			},
			OnSelected: function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				if ( ItemInfo.GetChosenActionItemsCount( id, 'can_collect' ) > 0 ) {                 
					$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'can_collect', id, '' );
				} else {                
					var fauxCasket = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( 1201, 0 );            
					UiToolkitAPI.ShowCustomLayoutPopupParameters(
						'',
						'file://{resources}/layout/popups/popup_inventory_inspect.xml',
						'itemid=' + fauxCasket
						+ '&' +
						'inspectonly=false'
						+ '&' +
						'asyncworkitemwarning=no'
						+ '&' +
						'storeitemid=' + fauxCasket,
						'none'
					);
				}
		}
		},
		{
			name: 'sell',
			                       
			  	                      
			    
			AvailableForItem: function ( id ) {
				return InventoryAPI.IsMarketable( id );
			},
			OnSelected: function ( id ) {
				$.DispatchEvent( 'PlaySoundEffect', 'inventory_inspect_sellOnMarket', 'MOUSE' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
				InventoryAPI.SellItem( id );
			}
		},
		{
			name: 'delete',
			style: function (id){
				return !InventoryAPI.IsMarketable( id ) ? 'TopSeparator' : '';
			},
			AvailableForItem: function ( id ) {
				return InventoryAPI.IsDeletable( id );
			},
			OnSelected: function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_inventory_inspect.xml',
					'itemid=' + id +
					'&' + 'asyncworktype=delete' +
					'&' + 'asyncworkbtnstyle=Negative'
				);
			}
		}
		
	];

	                                                                                                    
	                                
	                                                                                                    
	                                                                                                                                                  
	
	var _GetItemToReplaceName = function( id, team )
	{
		var currentEquippedItem = ItemInfo.GetItemIdForItemEquippedInLoadoutSlot( id, team );
		if ( currentEquippedItem && currentEquippedItem !== '0' )
		{
			$.GetContextPanel().SetDialogVariable( "item_name", _GetNameWithRarity( currentEquippedItem ) );
			return $.Localize( 'inv_context_equip', $.GetContextPanel() );
		}
		return 'WRONG CONTEXT -_GetItemToReplaceName()' + id;
	};

	var _GetNameWithRarity = function( id )
	{
		var rarityColor = ItemInfo.GetRarityColor( id );
		return '<font color="' + rarityColor + '">' + ItemInfo.GetName( id ) + '</font>';
	};

	var EquipItem = function( id, team, slot )
	{
		if ( slot === null || slot === undefined || slot === '' )
			slot = ItemInfo.GetSlotSubPosition( id );                                                   
		
		var teamShownOnMainMenu = GameInterfaceAPI.GetSettingString( 'ui_vanitysetting_team' );
		team.forEach( element => LoadoutAPI.EquipItemInSlot( element, id, slot ) );

		                                               
		var bNeedToRestartMainMenuVanity = false;
		if ( ItemInfo.IsCharacter( id ) )
		{
			var teamOfCharacter = ( ItemInfo.GetTeam( id ).search( 'Team_T' ) === -1 ) ? 'ct' : 't';
			if ( teamOfCharacter !== teamShownOnMainMenu ) {                                                      
				GameInterfaceAPI.SetSettingString( 'ui_vanitysetting_team', teamOfCharacter );
			}
			                                                
			bNeedToRestartMainMenuVanity = true;
		}
		else
		{
			                                                       
			                                                            
			                                                    
			team.filter( function( e ) { return e === teamShownOnMainMenu } );
			if ( team.length > 0 ) {
				if ( ( slot === 'clothing_hands' ) ||
					( slot === GameInterfaceAPI.GetSettingString( 'ui_vanitysetting_loadoutslot_' + teamShownOnMainMenu ) )
					) {
					bNeedToRestartMainMenuVanity = true;
				}
			}
		}

		                                         
		if ( bNeedToRestartMainMenuVanity )
		{
			$.DispatchEvent( 'ForceRestartVanity' );
		}
	};

	var _DoesNotHaveChosenActionItems = function( id, capability )
	{
		return ( ItemInfo.GetChosenActionItemsCount( id, capability ) === 0 && !ItemInfo.IsTool( id ) );
	};

	var _DoesItemTeamMatchTeamRequired = function ( team, id )
	{
		if ( team === 't' )
		{
			return ItemInfo.IsItemT( id ) || ItemInfo.IsItemAnyTeam( id );
		}

		if ( team === 'ct' )
		{
			return ItemInfo.IsItemCt( id ) || ItemInfo.IsItemAnyTeam( id );
		}
	};
	
	var _ItemIsNotEquippedAndNotInShuffle = function( team, id )
	{
		return !InventoryAPI.IsEquipped( id, team ) && !ItemInfo.IsShuffleEnabled( id, team );
	};

	var _IsInShuffleButNotEquippedWeaponTypeForSlot = function( team, id )
	{
		var currentlyEquippedId = LoadoutAPI.GetItemID( team, ItemInfo.GetSlotSubPosition( id ) );
		var isSharedSlot = InventoryAPI.GetRawDefinitionKey( id , "item_shares_equip_slot" );
		var IsNotEquippedInSLot = InventoryAPI.GetItemDefinitionName( currentlyEquippedId ) === InventoryAPI.GetItemDefinitionName( id );
		
		return ItemInfo.IsShuffleEnabled( id, team ) && !IsNotEquippedInSLot && isSharedSlot === '1';
	};

	var _CanEquipItem = function( itemID )
	{
		return ItemInfo.GetSlotSubPosition( itemID ) && !ItemInfo.IsEquippableThroughContextMenu( itemID ) && LoadoutAPI.IsLoadoutAllowed();
	};

	var _IsKeyForXrayItem = function( id )
	{
		var oData = ItemInfo.GetItemsInXray();
		if ( oData.case && oData.reward )
		{
			var numActionItems = ItemInfo.GetChosenActionItemsCount( oData.case, 'decodable' );
			if ( numActionItems > 0 )
			{
				for ( var i = 0; i < numActionItems; i++ )
				{
					if ( id === ItemInfo.GetChosenActionItemIDByIndex( oData.case, 'decodable', i ) )
					{
						return oData.case;
					}
				}
			}
		}

		return '';
	};

	return {
		FilterEntries: _FilterEntries                                                   
	};
})();
