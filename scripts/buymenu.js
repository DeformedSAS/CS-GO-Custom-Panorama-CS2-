'use strict';

var BuyMenu = ( function() {


    var m_oldWeaponItemId;

    var _UpdateCharacter = function( team, weaponItemId, charItemId, bForceRefresh, bResetAgentAngles = false )
    {
        if ( ( weaponItemId == m_oldWeaponItemId ) && !bForceRefresh )
        {
            return;
        }

        var elPreviewPanel = $.GetContextPanel().FindChildTraverse( "id-buymenu-agent" );
        if ( !elPreviewPanel )
            return;

        if ( !weaponItemId )
        {
            weaponItemId = MockAdapter.GetPlayerActiveWeaponItemId( MockAdapter.GetLocalPlayerXuid() );
        }

        if ( !team )
        {
            team = MockAdapter.GetPlayerTeamName( MockAdapter.GetLocalPlayerXuid() );
        }
        
		                                                      
		var teamstring = CharacterAnims.NormalizeTeamName( team, true );
		var settings = ItemInfo.GetOrUpdateVanityCharacterSettings( LoadoutAPI.GetItemID( teamstring, 'customplayer' ) );
  
        settings.panel = elPreviewPanel; 
        settings.team = teamstring;
        settings.cameraPreset = 18;
        settings.weaponItemId = weaponItemId;
        settings.activity = 'ACT_CSGO_UIPLAYER_BUYMENU';
        settings.charItemId = charItemId;
		if ( settings.charItemId == 0 || settings.charItemId === LoadoutAPI.GetDefaultItem( teamstring, 'customplayer' ) )
		{
			settings.modelOverride = MockAdapter.GetPlayerModel( MockAdapter.GetLocalPlayerXuid()  )
		}

        CharacterAnims.PlayAnimsOnPanel( settings );

        elPreviewPanel.SetFlashlightAngle( 21.01, 161.45, 0.00 );
        elPreviewPanel.SetFlashlightPosition( 51.49, -13.39, 75.93 );
		elPreviewPanel.SetFlashlightAmount( 1 );
		
		                                                                                           
        if ( bResetAgentAngles )
            elPreviewPanel.SetSceneAngles( 0.0, 0.0, 0.0, true );


                                           
                                                                                                                                
                                                                                                                                
                                                           
                                                           
                                              
                                                          
                                                          
                                                               
                                           
                                           
                                            
                                            
                                                  
                                                          
        
                                                                                                                         
        

                                                                     
        m_oldWeaponItemId = weaponItemId;

    }
    
                          
    return {

        UpdateCharacter: _UpdateCharacter
    };

} )();

                                                                                                    
                                           
                                                                                                    
(function ()
{   
    $.RegisterForUnhandledEvent( "BuyMenu_UpdateCharacter", BuyMenu.UpdateCharacter );
})();
