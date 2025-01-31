"use strict";

var Collapse = (function() {

    var _LogInternal = function( str )
    {
                     
    }
    var _LogInternalEmpty = function( str ) {}
                              
    var _Log = _LogInternalEmpty;



    var _RegisterTransitionEndEventHandler = function( panel )
    {
        if ( panel.Collapse_OnTransitionEndEvent === undefined )
        {
                                          
            panel.Collapse_OnTransitionEndEvent = function( panelName, propertyName )
            {
                if( panel.id === panelName && propertyName === 'height' && panel.BHasClass( 'Collapsing' ) )
		        {
                    _Log( 'Collpase - End of transition' );

                    panel.RemoveClass( 'Collapsing' );
                                                                     
                    panel.style.height = null;

                    return true;
                }
                return false;
            }

                               
            $.RegisterEventHandler( 'PropertyTransitionEnd', panel, panel.Collapse_OnTransitionEndEvent );
            _Log( 'Collpase transition end event registered' );
        }
    }

    var _Show = function( panel, bIsStyleHeightFitChildren )
    {
        _Log( 'Collapse.Show ' + panel.id );

        _RegisterTransitionEndEventHandler( panel );

                                                                      
        panel.AddClass( 'Collapsing' );

        if ( bIsStyleHeightFitChildren )
        {
                                                                                        
                                                                                                             
                                                                                                                      
                               
            panel.style.height = panel.contentheight + 'px';                                                       
        }

        panel.RemoveClass( 'Collapsed' );
    }

    var _Hide = function( panel, bIsStyleHeightFitChildren )
    {
        _Log( 'Collapse.Hide ' + panel.id );

        _RegisterTransitionEndEventHandler( panel );

        if ( bIsStyleHeightFitChildren )
        {
                                                                                        
                                                                                                              
                                                                                                                      
                               
            panel.style.height = panel.contentheight + 'px';                                                       
        }

                                                                      
        panel.AddClass( 'Collapsing' );
        panel.AddClass( 'Collapsed' );

        if ( bIsStyleHeightFitChildren )
        {
                                                                                       
            panel.style.height = '0px';
        }
    }

    var _Toggle = function( panel, bIsStyleHeightFitChildren )
    {
        _Log( 'Collapse.Toggle ' + panel.id );

        if ( panel.BHasClass( 'Collapsed' ) )
        {
            _Show( panel, bIsStyleHeightFitChildren );
        }
        else
        {
            _Hide( panel, bIsStyleHeightFitChildren );
        }
    }

                          
    return {
        Show    : _Show,                                                       
        Hide    : _Hide,                                                       
        Toggle  : _Toggle                                                      
    };

})()