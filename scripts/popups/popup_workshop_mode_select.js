'use strict';

var PopupWorkshopModeSelect = ( function () {

    var m_elPopup = null;
    var m_elButtonContainer = null;
    var m_elButtons = null;

    var _Init = function () {
                                            
        m_elButtons = [];
        m_elPopup = $.GetContextPanel();
        m_elButtonContainer = m_elPopup.FindChildTraverse( 'popup-workshop-mode-items' );

                         
        m_elPopup.FindChildTraverse( 'GoButton' ).SetPanelEvent( 'onactivate', _Apply );
        m_elPopup.FindChildTraverse( 'CancelButton' ).SetPanelEvent( 'onactivate', _Cancel );

        var strModes = m_elPopup.GetAttributeString( 'workshop-modes', '' );
        if ( !strModes )
            strModes = 'casual';

        var modes = strModes.split( ',' );

        _InitModes( modes );
    };

    var _InitAllModes = function () {
        _InitModes( ['casual', 'competitive', 'scrimcomp2v2', 'deathmatch', 'coopmission', 'armsrace', 'demolition', 'flyingscoutsman', 'retakes', 'custom' ] );
    }

    var _InitModes = function(modes)
    {
                             
        m_elButtons.forEach( function ( elButton ) { elButton.DeleteAsync( 0.0 ); } );
        m_elButtons = [];

        for ( var i = 0; i < modes.length; ++i )
        {
            var strMode = modes[i];
            if ( !strMode )
            {
                continue;
            }

            var elButton = $.CreatePanel( 'RadioButton', m_elButtonContainer, undefined );
            elButton.BLoadLayoutSnippet( 'workshop-mode-item' );
            elButton.SetAttributeString( 'data-mode', strMode );
            elButton.SetDialogVariable( 'workshop-mode-item-name', $.Localize( '#CSGO_Workshop_Mode_' + strMode ) );

            if ( i === 0 )
                elButton.checked = true;

            m_elButtons.push( elButton );
        }
    }

    var _Apply = function () {
        var strGameMode = 'casual';
        var nSkirmishId = 0;

                                           
        var elSelectedButton = m_elButtons.find( function ( elButton ) { return elButton.checked; } );
        if ( elSelectedButton )
            strGameMode = elSelectedButton.GetAttributeString( 'data-mode', strGameMode );

                                      
        var strGameType = GameTypesAPI.GetGameModeType( strGameMode );
        if ( !strGameType )
        {
                                           
            nSkirmishId = GameTypesAPI.GetSkirmishIdFromInternalName( strGameMode );

            if ( nSkirmishId !== 0 )
            {
                strGameMode = 'skrimish';
                strGameType = 'skirmish';
            }
        }

        if ( !strGameType )
        {
                                                                    

                                                             
            strGameType = 'classic';
            strGameMode = 'casual';
        }

	    var settings = {
	        update: {
	            Game: {
	                type: strGameType,
	                mode: strGameMode,
	            }
	        }
	    };


	    if ( nSkirmishId !== 0 )
	    {
	        settings.update.Game.skirmishmode = nSkirmishId;
	    }
	    else
	    {
	        settings.delete = {
	            Game: {
	                skirmishmode: '#empty#'
	            }
	        }
	    }

	    $.DispatchEvent( 'UIPopupButtonClicked', '' );
	    LobbyAPI.UpdateSessionSettings( settings );
	    LobbyAPI.StartMatchmaking( "", "", "", "" );
	};

	var _Cancel = function () {
	    $.DispatchEvent( 'UIPopupButtonClicked', '' );
	                                      
	};

	return {
		Init	    : _Init,
	};

})();

  

					
	         
	               
	                 
	                    
	                             
	 
	      
	              
	             
	               
	                   
	                    
	                    
	      
	                       
	                      
	                  
	                                                    
	 
	        
	               
	              
	 
	         
	                            
	                           
	                         
	            
		                                                
		                    
		                         
		                      
		              
		                   
		         
		                                                    
		             
		        
			                     
			                      
			                      
			                    
			                                   
			                     
			                                                                                                                                  
			                        
			                    
			    
		   
		 
	   
	 
 
  