'use strict';

var InspectModelImage = ( function (){

	var m_charAnimIsPlaying = false;
	var m_bCanShowCertificateInfo = true;
	var m_bCanShowEquipControls = true;

	var _Init = function ( elPanel, itemId, funcGetSettingCallback)
	{
		                                                                      
		                                                                             
		var strViewFunc = funcGetSettingCallback ? funcGetSettingCallback( 'viewfunc', '' ) : '';

		if ( ItemInfo.ItemDefinitionNameSubstrMatch( itemId, 'tournament_journal_' ) )
			itemId = ( strViewFunc === 'primary' ) ? itemId : ItemInfo.GetFauxReplacementItemID( itemId, 'graffiti' );

		if ( !InventoryAPI.IsValidItemID( itemId ) )
		{
			return;
		}

		var model = ItemInfo.GetModelPathFromJSONOrAPI( itemId );


		if ( model )
		{
			_SetModelScene( elPanel, model, itemId );
		}
		else
		{
			_SetImage( elPanel, itemId );
		}
	};

	var _SetModelScene = function ( elParent, model, itemId = 0 )
	{
		                                              

		var elPanel = elParent.FindChildInLayoutFile( 'InspectItemModel' );
		elPanel.SetScene( "resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
			model,
			false
		);

		if ( ItemInfo.IsCharacter( itemId) )
		{
			var settings = ItemInfo.GetOrUpdateVanityCharacterSettings( itemId );
			settings.panel = elPanel;

			CharacterAnims.PlayAnimsOnPanel( settings );

			elPanel.SetCameraPreset( 7, false );
	
		}

		elPanel.RemoveClass( 'hidden' );
	};

	var _SetImage = function( elParent, itemId )
	{
		var elPanel = elParent.FindChildInLayoutFile( 'InspectItemImage' );
		elPanel.itemid = itemId;

		elPanel.RemoveClass( 'hidden' );
		_TintSprayImage( itemId, elPanel );
	};

	var _TintSprayImage = function( id, elImage )
	{
		TintSprayIcon.CheckIsSprayAndTint( id, elImage );
	};

	var _SetCharScene = function ( elParent, characterItemId, weaponItemId )
	{
		var elPanel = elParent.FindChildInLayoutFile( 'InspectModelChar' );

		var settings = ItemInfo.GetOrUpdateVanityCharacterSettings( characterItemId );
		settings.panel = elPanel;
		settings.weaponItemId = weaponItemId;
		settings.cameraPreset = 1;
	
		CharacterAnims.PlayAnimsOnPanel( settings );
	};

	var _CancelCharAnim = function( elParent )
	{
		CharacterAnims.CancelScheduledAnim( elParent.FindChildInLayoutFile( 'InspectModelChar' ) );
	};

	var _ShowHideItemPanel = function( elParent, bshow )
	{
		if ( !elParent.IsValid() )
			return;
		
		elParent.FindChildTraverse( 'InspectModelContainer' ).SetHasClass( 'hidden', !bshow );
		
		if ( bshow )
			$.DispatchEvent( "PlaySoundEffect", "weapon_showSolo", "MOUSE" );
	};

	var _ShowHideCharPanel = function( elParent, bshow )
	{
		if ( !elParent.IsValid() )
			return;
		
		elParent.FindChildTraverse( 'InspectModelCharContainer' ).SetHasClass( 'hidden', !bshow );

		if ( bshow )
			$.DispatchEvent( "PlaySoundEffect", "weapon_showOnChar", "MOUSE" );
	};

	var _GetModelPanel = function()
	{
		return m_elPanel.FindChildInLayoutFile( 'InspectItemModel' );
	};

	var _GetImagePanel = function()
	{
		return m_elPanel.FindChildInLayoutFile( 'InspectItemImage' );
	};

	return{
		Init: _Init,
		SetCharScene: _SetCharScene,
		CancelCharAnim: _CancelCharAnim,
		ShowHideItemPanel: _ShowHideItemPanel,
		ShowHideCharPanel: _ShowHideCharPanel,
		GetModelPanel: _GetModelPanel,
		GetImagePanel: _GetImagePanel
	};
} )();

( function()
{
} )();
