"use strict";

var MainMenuStore = ( function()
{
	var m_activeTab = null;
	var m_itemNewReleases = null;
	var m_elStore = $.GetContextPanel();
	var m_pendingItemsToPopulateByTab = {};
	var m_pendingItemsToPopulateScheduled = {};
	
	var _Init = function()
	{
		_CheckLicenseScreen();

		if ( !MyPersonaAPI.IsConnectedToGC() )
			return;

		var bPerfectWorld = ( MyPersonaAPI.GetLauncherType() === "perfectworld" );
		
		var itemsByCategory = {};	
		if ( ( NewsAPI.GetActiveTournamentEventID() !== 0 )
			&& ( '' !== StoreAPI.GetStoreItemSalePrice( InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( g_ActiveTournamentInfo.itemid_sticker, 0 ), 1, '' ) )
			)
		{
			m_elStore.SetDialogVariable( "tournament_name", $.Localize( "#CSGO_Tournament_Event_Location_" + NewsAPI.GetActiveTournamentEventID() ) );
			itemsByCategory.tournament = [
				{
					snippet_name: "TournamentStore",
					load_func: function ( elPanel )
					{
						var itemsCount = g_ActiveTournamentTeams.length;
						var randomItemsIndex = [];
						var count = 0;

						while ( count < 7 ) 
						{
							var random = _GetRandom( 0, itemsCount );
							var filteredIndexes = randomItemsIndex.filter(index => index === random );

							if( filteredIndexes.length === 0  )
							{
								randomItemsIndex.push(random);
								count++;
							}
						}

						var elImagesContainer = elPanel.FindChildInLayoutFile( 'id-store-tournament-items-container' );
						var itemTypes = [
							'itemid_sticker',
							'itemid_pass'
						];
						var offset = 78;

						_ShowSaleTag( g_ActiveTournamentInfo.itemid_sticker );
						
						for( var i = 0; i < randomItemsIndex.length ; i++ )
						{
							var elImage = elImagesContainer.FindChildInLayoutFile( 'id-store-tournament-item' + i );
							var defIndex = 0;

							if( i === 0 )
							{
								var randomItemType = _GetRandom( 0, itemTypes.length );
								defIndex = g_ActiveTournamentInfo[ itemTypes[ randomItemType ]];
							}
							else
							{
								                                     
								var randomItemType = _GetRandom( 0, itemTypes.length - 1 );
								defIndex = g_ActiveTournamentTeams[ randomItemsIndex[i]][ itemTypes[ randomItemType ]];
							}
							
							elImage.itemid = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( defIndex, 0 );
							elImage.style.x = ( offset*i ) + 'px';
							var scaleOffset = 1 - ( 0.08 * i );
							elImage.style.transform = 'scale3d( '+ scaleOffset +','+ scaleOffset +','+ scaleOffset +')';
							elImage.style.zIndex = 10-i;
							if( i > randomItemsIndex.length/2 )
							{
								elImage.style.blur = 'gaussian( 1, 1,' + 1 +')';
							}
						}

						function _ShowSaleTag ( storeDefIndx )
						{
							var elPrecent = elPanel.FindChildInLayoutFile( 'StorePanelTournamentSaleTagLabel' );
							var reduction = ItemInfo.GetStoreSalePercentReduction( storeDefIndx, 1 );

							elPrecent.SetHasClass( 'hidden', ( reduction === '' || reduction === undefined ) ? true : false );
							elPrecent.text = reduction;
						}
						
						elPanel.SetDialogVariable( 'tournament-name', $.Localize('#CSGO_Tournament_Event_NameShort_'+ g_ActiveTournamentInfo.eventid) );
						                                                                                       
						                                                   
					}
				}
				                             
				    
				   	                               
				   	                                 

				   		                                                                               
				   		                                                

				   		                                                    
				   		 
				   			                                    
				   			                                               
				   				       

				   			                                                                                            
				   			                   
				   				       

				   			                                                                                 
				   			                                                                                                   
				   			                                                                         
				   			                                                                  
				   		 

				   		                                                              
				   	 
				     
			];
		}
		
		                                                             
		itemsByCategory = _GetStoreItems( itemsByCategory );

		                                                                             
		if ( itemsByCategory.newstore && itemsByCategory.newstore.length < 1 )
		{
		   	                                          
		   	                                                                                                       
		   	 
		   		                                                          
		   	 
			m_itemNewReleases = itemsByCategory.newstore[0];
			delete itemsByCategory.newstore;

			if ( bPerfectWorld )
			{
				if ( !itemsByCategory.store )
				{
					itemsByCategory.store = [];
				}

				itemsByCategory.store.unshift( m_itemNewReleases );
			}
		}
		else
		{
			m_itemNewReleases = null;
		}

		                      
		itemsByCategory = _GetCoupons( itemsByCategory );

		_MakeCarousel( itemsByCategory );
		_SortTabs();

		_AccountWalletUpdated();
	};

	var _GetRandom = function ( min, max )
	{
		return Math.floor(Math.random() * (max - min)) + min;
	};

	var _CheckLicenseScreen = function()
	{
		var restrictions = LicenseUtil.GetCurrentLicenseRestrictions();
		
		var elBanner = m_elStore.FindChildInLayoutFile( 'StorePanelLicenseBanner' );
		elBanner.SetHasClass( 'hidden', restrictions === false );
		if ( restrictions )
		{
			elBanner.FindChildInLayoutFile( 'StorePanelLicenseBannerText' ).text = restrictions.license_msg;
			elBanner.FindChildInLayoutFile( 'StorePanelLicenseBannerButton' ).Children()[0].text = restrictions.license_act;
		}

		var elMainMenuInput = m_elStore;
		while ( elMainMenuInput ) {
			elMainMenuInput = elMainMenuInput.GetParent();
			if ( elMainMenuInput.id === 'MainMenuInput' )
				break;
		}
		if ( elMainMenuInput )
		{
			elMainMenuInput.SetHasClass( 'steam-license-restricted', restrictions !== false );
		}
	}

	var _GetStoreItems = function( itemsByCategory )
	{
		var count = StoreAPI.GetBannerEntryCount();
		var bPerfectWorld = ( MyPersonaAPI.GetLauncherType() === "perfectworld" );

		if ( !count || count < 1 )
			return itemsByCategory;
		
		if ( !itemsByCategory )
		{
			itemsByCategory = {};
		}
	
		for ( var i = 0; i < count; i++ )
		{
			var ItemId = StoreAPI.GetBannerEntryDefIdx( i );
			var FauxItemId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( ItemId, 0 );

			                                     
			if ( !bPerfectWorld &&
				InventoryAPI.IsTool( FauxItemId ) &&
				( InventoryAPI.GetItemCapabilityByIndex( FauxItemId, 0 ) === 'decodable' )
			)
			{
				if ( !itemsByCategory.keys )
				{
					itemsByCategory.keys = [];
				}
				
				itemsByCategory.keys.push( FauxItemId );
			}
			else if ( StoreAPI.IsBannerEntryMarketLink( i ) === true )
			{
				if ( !itemsByCategory.market )
				{
					itemsByCategory.market = [];
				}
				
				itemsByCategory.market.push( FauxItemId );
			}
			else if ( StoreAPI.GetBannerEntryCustomFormatString( i ) === "new" )
			{
				if ( !itemsByCategory.newstore )
				{
					itemsByCategory.newstore = [];
				}
				
				itemsByCategory.newstore.push( FauxItemId );
			}
			else
			{
				if ( !itemsByCategory.store )
				{
					itemsByCategory.store = [];
				}

				if ( !PartyListAPI.GetFriendPrimeEligible( MyPersonaAPI.GetXuid() ) &&
					!bPerfectWorld &&
					itemsByCategory.store &&
					( itemsByCategory.store.indexOf( 'prime' ) === -1 ))
				{
					itemsByCategory.store.push( 'prime' );

					                                                                           
					                                                                                  
					var nCurrentLvl = FriendsListAPI.GetFriendLevel( MyPersonaAPI.GetXuid() );
					if ( ( nCurrentLvl > 1 ) && ( nCurrentLvl % 2 == 0 ) )
					{
						itemsByCategory.prime = [];
						itemsByCategory.prime.push( 'prime' );
					}
				}

				itemsByCategory.store.push( FauxItemId );
			}
		}

		return itemsByCategory;
	};

	var _GetCoupons = function( itemsByCategory )
	{
		var count = InventoryAPI.GetCacheTypeElementsCount( "Coupons" );
		var bCheckedExpirationTimestamp = false;
		
		if ( count > 0 )
		{
			for ( var i = 0; i < count; i++ )
			{
				var CouponDefIdx = InventoryAPI.GetCacheTypeElementFieldByIndex( "Coupons", i, "defidx" );
				if ( !bCheckedExpirationTimestamp )
				{	                                       
					bCheckedExpirationTimestamp = true;
					var ExpirationUTC = InventoryAPI.GetCacheTypeElementFieldByIndex( "Coupons", i, "expiration_date" );
					
					                                                    
					var numSec = StoreAPI.GetSecondsUntilTimestamp( ExpirationUTC );
					if ( numSec <= 1 )
						break;
				}
				
				var CouponId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( CouponDefIdx, 0 );

				if ( !itemsByCategory.coupons )
				{
					itemsByCategory.coupons = [];

					if ( m_itemNewReleases )
					{
						itemsByCategory.coupons.push( m_itemNewReleases );
					}
				}
				
				itemsByCategory.coupons.push( CouponId );

				                                                
				if ( itemsByCategory.coupons.length >= 1 ) break;
			}
		}

		return itemsByCategory;
	};

	var _MakeCarousel = function( itemsByCategory )
	{
		for ( var prop in itemsByCategory )
		{
			if ( itemsByCategory.hasOwnProperty( prop ) )
			{
				m_pendingItemsToPopulateByTab[prop] = itemsByCategory[ prop ];
				_MakeTabBtn( 'CarouselContainer-', prop );
			}
		}
	};

	var _MakeIndividualCarousel = function ( itemsList, prop )
	{
		if ( m_pendingItemsToPopulateScheduled.hasOwnProperty( prop ) )
		{
			if ( m_pendingItemsToPopulateScheduled[prop].m_hScheduled )
			{
				$.CancelScheduled( m_pendingItemsToPopulateScheduled[prop].m_hScheduled );
				m_pendingItemsToPopulateScheduled[prop].m_hScheduled = null;
			}
			delete m_pendingItemsToPopulateScheduled[prop];
		}
		m_pendingItemsToPopulateScheduled[prop] = {};
		m_pendingItemsToPopulateScheduled[prop].m_itemsList = itemsList;
		m_pendingItemsToPopulateScheduled[prop].m_idx = 0;

		var elParent = m_elStore.FindChildInLayoutFile( 'CarouselContainer-' + prop );
		
		if( !elParent )
		{
			elParent = $.CreatePanel(
				'Panel',
				m_elStore.FindChildInLayoutFile( 'StoreCarouselContiner' ),
				'CarouselContainer-' + prop,
				{
					class: 'store-panel__carousel-container hidden'
				}
			);
		}
		else
		{
			elParent.RemoveAndDeleteChildren();
		}
		
		var elCarousel = $.CreatePanel(
			'Carousel',
			elParent,
			'Carousel-' + prop
		);
		
		elCarousel.BLoadLayoutSnippet( 'StoreCarousel' );

		                                                              
		$.CreatePanel( 
			'Panel',
			elParent,
			'',
			{
				class: 'horizontal-align-left store-panel__hitblocker',
				hittest: 'true',
				onactivate: ''
			} );

		$.CreatePanel( 
			'Panel',
			elParent,
			'',
			{
				class: 'horizontal-align-right store-panel__hitblocker',
				hittest: 'true',
				onactivate: ''
			} );

		$.CreatePanel( 
			'CarouselNav',
			elParent,
			'CarouselNav-' + prop,
			{
				class: 'full-width vertical-center',
				carouselid: 'Carousel-' + prop,
				hittest: 'false'
			} );

		m_pendingItemsToPopulateScheduled[ prop ].m_hScheduled = $.Schedule( .1, _ScheduledPopulateCarousel.bind( undefined, prop ) );
	};

	var _ScheduledPopulateCarousel = function( prop )
	{
		if ( !m_pendingItemsToPopulateScheduled.hasOwnProperty( prop ) ) return;
		m_pendingItemsToPopulateScheduled[ prop ].m_hScheduled = null;

		if ( _PrePopulateCarousel( prop ) )
			m_pendingItemsToPopulateScheduled[ prop ].m_hScheduled = $.Schedule( .1, _ScheduledPopulateCarousel.bind( undefined, prop ) );
		else
			delete m_pendingItemsToPopulateScheduled[ prop ];
	}

	var _PrePopulateCarousel = function( prop )
	{
		if ( !m_pendingItemsToPopulateScheduled[ prop ].m_itemsList )
			return false;

		if ( m_pendingItemsToPopulateScheduled[prop].m_idx >= m_pendingItemsToPopulateScheduled[prop].m_itemsList.length )
			return false;

		var elParent = m_elStore.FindChildInLayoutFile( 'CarouselContainer-' + prop );
		if ( !elParent )
			return false;

		var elCarousel = elParent.FindChildInLayoutFile( 'Carousel-' + prop );
		if ( !elCarousel )
			return false;

		_PopulateCarousel( elCarousel, m_pendingItemsToPopulateScheduled[ prop ].m_itemsList, m_pendingItemsToPopulateScheduled[prop].m_idx, prop );
		++ m_pendingItemsToPopulateScheduled[prop].m_idx;
		return true;
	}

	var _PopulateCarousel = function( elCarousel, itemList, i, type )
	{
		var itemsPerPage = type === "tournament" ? 1 : 1;
		var elPage = null;

		if ( i % itemsPerPage === 0 )
		{
			elPage = $.CreatePanel( 'Panel', elCarousel, 'Page-'+(i/itemsPerPage) );
			elPage.BLoadLayoutSnippet( 'StoreCarouselPage' );
		}
		else
		{
			elPage = elCarousel.FindChildInLayoutFile( 'Page-'+Math.floor(i/itemsPerPage) );
		}

		var elItem = $.CreatePanel( 'Panel', elPage, itemList[ i ] );
		                                                              
		
		
		if ( itemList[ i ] === 'prime' )
		{
			elItem.BLoadLayoutSnippet( 'StoreEntryPrimeStatus' );
			_PrimeStoreItem( elItem, itemList[ i ], type );
		}
		else if ( itemList[ i ] === 'spacer' )
		{
			elItem.BLoadLayoutSnippet( 'StoreEntrySpacer' );
		}
		else if ( typeof itemList[ i ] == "string" && InventoryAPI.IsValidItemID( itemList[ i ] ) )
		{
			elItem.BLoadLayoutSnippet( 'StoreEntry' );
			_FillOutItemData( elItem, itemList[ i ], type );
			_OnActivateStoreItem( elItem, itemList[ i ], type );
		}
		                                                    
		else if ( typeof itemList[ i ] == "object" && elItem.BLoadLayoutSnippet( itemList[ i ].snippet_name ) )
		{
			itemList[ i ].load_func( elItem );
		}

		if ( i % itemsPerPage === 0 )
		{
			if ( i > 0 )
				elPage.AddClass( 'PreviouslyRight' );
			elPage.AddClass( 'store-panel__carousel-page__animations_enabled' );
		}
	};

	var _FillOutItemData = function( elItem, id, type )
	{
		var elImage = elItem.FindChildInLayoutFile( 'StoreItemImage' );
		var LootListItemID = '';

		if( ItemInfo.GetLootListCount( id ) > 0 )
			LootListItemID = InventoryAPI.GetLootListItemIdByIndex( id, 0 );

		elImage.itemid =  ( type !== 'market' && LootListItemID ) ? LootListItemID : id;

		var elName = elItem.FindChildInLayoutFile( 'StoreItemName' );
		elName.text = ItemInfo.GetName( id );
		
		var elStattrak = elImage.FindChildInLayoutFile( 'StoreItemStattrak' );
		elStattrak.SetHasClass( 'hidden', !ItemInfo.IsStatTrak( id ) );

		var elNewHighlight = elImage.FindChildInLayoutFile( 'StoreItemNew' );
		elNewHighlight.SetHasClass( 'hidden', !m_itemNewReleases || id !== m_itemNewReleases );

		var elSale = elItem.FindChildInLayoutFile( 'StoreItemSalePrice' );
		var elPrecent = elItem.FindChildInLayoutFile( 'StoreItemPercent' );
		var reduction = ItemInfo.GetStoreSalePercentReduction( id, 1 );

		if ( reduction )
		{
			elSale.visible = true;
			elSale.text = ItemInfo.GetStoreOriginalPrice( id, 1 );

			elPrecent.visible = true;
			elPrecent.text = reduction;
		}
		else
		{
			elSale.visible = false;
			elPrecent.visible = false;
		}

		var elPrice = elItem.FindChildInLayoutFile( 'StoreItemPrice' );
		elPrice.text = ( type === 'market' ) ? $.Localize( '#SFUI_Store_Market_Link' ) : ItemInfo.GetStoreSalePrice( id, 1 );
	};

	var _PrimeStoreItem = function( elItem, id, type )
	{
		elItem.SetHasClass( 'store-panel__carousel__item__prime__full', ( type === 'prime' ) ? true : false );

		elItem.SetPanelEvent( 'onactivate', function()
		{
			UiToolkitAPI.HideTextTooltip();
			UiToolkitAPI.ShowCustomLayoutPopup( 'prime_status', 'file://{resources}/layout/popups/popup_prime_status.xml' );
		} );
	};

	var _MakeTabBtn = function ( prefix, type )
	{
		var elBtn = $.CreatePanel( 'RadioButton', m_elStore.FindChildInLayoutFile( 'StoreNaveBar' ), type );
		elBtn.BLoadLayoutSnippet( 'StoreNavBtn' );
		elBtn.FindChildInLayoutFile( 'StoreTabLabel' ).SetLocalizationString( '#store_tab_' + type );

		elBtn.SetPanelEvent( 'onactivate', MainMenuStore.OnNavigateTab.bind( undefined, prefix + type, type ) );
	};

	var _OnNavigateTab = function ( carouselId, tab )
	{
		                                                         
		if ( m_pendingItemsToPopulateByTab.hasOwnProperty( tab ) )
		{
			_MakeIndividualCarousel( m_pendingItemsToPopulateByTab[ tab ], tab );
			delete m_pendingItemsToPopulateByTab[tab];
		}

		                                                           
		var elCarousel = m_elStore.FindChildInLayoutFile( carouselId );
		
		if( m_activeTab )
		{
			m_activeTab.AddClass( 'hidden' );
		}

		m_activeTab = elCarousel;

		if( m_activeTab )
		{
			m_activeTab.RemoveClass( 'hidden' );
		}
	};

	var _SortTabs = function ()
	{
		var elParent = $.GetContextPanel().FindChildInLayoutFile( 'StoreNaveBar' );
		var tabList = elParent.Children();

		var NewPostition = function( elToMove )
		{
			if ( elToMove )
			{
				elParent.MoveChildBefore( elToMove, elParent.Children()[ 0 ] );
			}
		};

		NewPostition( tabList.find(function (obj) { return obj.id === 'market'; } ) );
		NewPostition( tabList.find(function (obj) { return obj.id === 'keys'; } ) );
		NewPostition( tabList.find(function (obj) { return obj.id === 'store'; } ) );
		NewPostition( tabList.find(function (obj) { return obj.id === 'coupons'; } ) );
		NewPostition( tabList.find(function (obj) { return obj.id === 'newstore'; } ) );
		NewPostition( tabList.find(function (obj) { return obj.id === 'prime'; } ) );
		NewPostition( tabList.find(function (obj) { return obj.id === 'tournament'; } ) );

		_SetDefaultTabActive( elParent.Children()[0] )
	};

	var _SetDefaultTabActive = function( elTab )
	{
		$.DispatchEvent( "Activated", elTab, "mouse" );
	};

	var _OnActivateStoreItem = function( elItem, id, type )
	{
		if ( type === "market" )
		{
			elItem.SetPanelEvent( 'onactivate', _OpenOverlayToMarket.bind( undefined, id ));
		}
		else if( ItemInfo.ItemHasCapability( id, 'decodable' ) )
		{
			var displayItemId = '';

			if( ItemInfo.GetLootListCount( id ) > 0 )
				displayItemId= InventoryAPI.GetLootListItemIdByIndex( id, 0 );
			
			if( displayItemId )
				elItem.SetPanelEvent( 'onactivate', _ShowDecodePopup.bind( undefined, id, displayItemId ) );
			else
				elItem.SetPanelEvent( 'onactivate', _ShowInpsectPopup.bind( undefined, id ) );	
		}
		else
			elItem.SetPanelEvent( 'onactivate', _ShowInpsectPopup.bind( undefined, id ) );
	};

	var _OpenOverlayToMarket = function( id )
	{
		var m_AppID = SteamOverlayAPI.GetAppID();
		var m_CommunityUrl = SteamOverlayAPI.GetSteamCommunityURL();
		var strSetName = InventoryAPI.GetItemSet( id );
		
		SteamOverlayAPI.OpenURL( m_CommunityUrl + "/market/search?q=&appid=" + m_AppID + "&lock_appid=" + m_AppID + "&category_" + m_AppID + "_ItemSet%5B%5D=tag_" + strSetName );
		StoreAPI.RecordUIEvent( "ViewOnMarket" );
	};

	var _ShowDecodePopup = function( id, displayItemId )
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_capability_decodable.xml',
			'key-and-case=' + '' + ',' + displayItemId
			+ '&' +
			'asyncworkitemwarning=no'
			+ '&' +
			'asyncforcehide=true'
			+ '&' +
			'storeitemid=' + id
		);
	};

	var _ShowInpsectPopup = function( id )
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_inventory_inspect.xml',
			'itemid=' + id
			+ '&' +
			'inspectonly=false'
			+ '&' +
			'asyncworkitemwarning=no'
			+ '&' +
			'storeitemid=' + id,
			'none'
		);
	};

	var _RefreshCoupons = function()
	{
		var itemsByCategory = {};
		var couponsList = _GetCoupons ( itemsByCategory );

		_MakeIndividualCarousel( couponsList.coupons, 'coupons' );
		delete m_pendingItemsToPopulateByTab['coupons'];                                                      
	};

	var _AccountWalletUpdated = function()
	{
		var balance = ( MyPersonaAPI.GetLauncherType() === 'perfectworld' ) ? StoreAPI.GetAccountWalletBalance() : '';
		var elBalance = m_elStore.FindChildInLayoutFile( 'StoreNaveBarWalletBalance' );
		if ( balance === '' || balance === undefined || balance === null )
		{
			elBalance.AddClass( 'hidden' );
		}
		else
		{
			elBalance.SetDialogVariable( 'balance', balance );
			elBalance.RemoveClass( 'hidden' );
		}
	}

	var _OpenTournamentMarketLink = function()
	{
		var appid = SteamOverlayAPI.GetAppID();
		SteamOverlayAPI.OpenURL(
			SteamOverlayAPI.GetSteamCommunityURL() +
			"/market/search?q=&category_"+appid+"_Tournament%5B%5D=tag_Tournament"+g_ActiveTournamentInfo.eventid+"&appid="+appid
		);
	}

	return {
		Init: _Init,
		CheckLicenseScreen : _CheckLicenseScreen,
		AccountWalletUpdated : _AccountWalletUpdated,
		OnNavigateTab: _OnNavigateTab,
		RefreshCoupons : _RefreshCoupons
	};
} )();

( function()
{
	MainMenuStore.Init();
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_GcLogonNotificationReceived', MainMenuStore.CheckLicenseScreen );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_UpdateConnectionToGC', MainMenuStore.CheckLicenseScreen );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Store_AccountWalletUpdated', MainMenuStore.AccountWalletUpdated );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Store_PriceSheetChanged', MainMenuStore.Init );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Store_PurchaseCompleted', MainMenuStore.RefreshCoupons );
} )();