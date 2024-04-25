"use strict";

var HudEdgePositions  = ( function() {

	                                                
	var _OnSliderValueChanged = function()
    {
        var width = $('#HudEdgeX').ActualValue() * 100;
        width = width.toString() + '%';

        var height = $('#HudEdgeY').ActualValue() * 100;
        height = height.toString() + '%';

        var elHudEdge = $( '#HudEdge' );
        elHudEdge.style.width = width;
        elHudEdge.style.height = height;
    }

	                      
	return {
		OnSliderValueChanged		: _OnSliderValueChanged
	};


} )();

( function()
{
                                                                                             
                                                                                                         
                                             
    $('#HudEdgeX').OnShow();
    $('#HudEdgeY').OnShow();
    
    HudEdgePositions.OnSliderValueChanged();
} )();