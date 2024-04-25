                                                               

"use strict";

var FlipPanelAnimation = ( function ()
{
	function FlipPanelAnimation( oData )
	{
		this.oData = oData;
		
		                      
		Object.defineProperty( this, 'ActiveIndex', {
			get: function() {
				return oData.activeIndex;
			},
			set: function( value ) {
				oData.activeIndex = value;
			}
		} );
		
		Object.defineProperty( this, 'CallbackData', {
			set: function( value ) {
				oData.oCallbackData = value;
			},
		} );
	}
	
	FlipPanelAnimation.prototype.AddParamToCallbackData = function( param, value ) {
		this.oData.oCallbackData[ param ] = value;
	};

	FlipPanelAnimation.prototype.ControlBtnActions = function() {
		if ( this.oData.controlBtnPrev )
		{
			this.oData.controlBtnPrev.SetPanelEvent( 'onactivate', this.oData.funcCallback.bind( this, this.oData, true ) );
			this.oData.controlBtnNext.SetPanelEvent( 'onactivate', this.oData.funcCallback.bind( this, this.oData, false ) );

			this.oData.controlBtnPrev.enabled = false;
			this.oData.controlBtnNext.enabled = false;
		}
	};

	FlipPanelAnimation.prototype.UpdateTextLabel = function( elPanel, aTextData ) {
		aTextData.forEach( element =>
		{
			if ( typeof element.value == 'number' && element.value > 0 )
			{
				elPanel.SetDialogVariableInt( element.name, element.value );
			}
			else if( element.value )
			{
				elPanel.SetDialogVariable( element.name, element.value );
			}
		});
	};

	FlipPanelAnimation.prototype.UseCallback = function( ) {
		this.oData.funcCallback( this.oData, false );
	};

	FlipPanelAnimation.prototype.DetermineVisiblePanel = function( animPanelA, animPanelB ) {
		return animPanelA.BHasClass( 'flip-panel-anim-down-show' ) || animPanelA.BHasClass( 'flip-panel-anim-up-show' ) ? animPanelA : animPanelB;
	};

	                                                                       
	FlipPanelAnimation.prototype.BtnPressNextAnim = function( panelA, panelB ) {
		var visiblePanel = this.DetermineVisiblePanel( panelA, panelB );
		var hiddenPanel = visiblePanel === panelA ? panelB : panelA;

		visiblePanel.RemoveClass( 'flip-panel-anim-transition' );
		visiblePanel.RemoveClass( 'flip-panel-anim-up-hidden' );
		visiblePanel.RemoveClass( 'flip-panel-anim-down-show' );
		visiblePanel.RemoveClass( 'flip-panel-anim-up-show' );
		visiblePanel.RemoveClass( 'flip-panel-anim-down-hidden' );

		visiblePanel.AddClass( 'flip-panel-anim-transition' );
		visiblePanel.AddClass( 'flip-panel-anim-down-hidden' );

		hiddenPanel.RemoveClass( 'flip-panel-anim-transition' );
		hiddenPanel.RemoveClass( 'flip-panel-anim-down-hidden' );

		hiddenPanel.AddClass( 'flip-panel-anim-up-hidden' );
		hiddenPanel.AddClass( 'flip-panel-anim-transition' );
		hiddenPanel.AddClass( 'flip-panel-anim-down-show' );
	};

	                                                                       
	FlipPanelAnimation.prototype.BtnPressPrevAnim = function( panelA, panelB ) {
		var visiblePanel = this.DetermineVisiblePanel( panelA, panelB );
		var hiddenPanel = visiblePanel === panelA ? panelB : panelA;

		visiblePanel.RemoveClass( 'flip-panel-anim-transition' );
		visiblePanel.RemoveClass( 'flip-panel-anim-up-hidden' );
		visiblePanel.RemoveClass( 'flip-panel-anim-down-show' );
		visiblePanel.RemoveClass( 'flip-panel-anim-up-show' );
		visiblePanel.RemoveClass( 'flip-panel-anim-down-hidden' );

		visiblePanel.AddClass( 'flip-panel-anim-transition' );
		visiblePanel.AddClass( 'flip-panel-anim-up-hidden' );

		hiddenPanel.RemoveClass( 'flip-panel-anim-transition' );
		hiddenPanel.RemoveClass( 'flip-panel-anim-up-hidden' );

		hiddenPanel.AddClass( 'flip-panel-anim-down-hidden' );
		hiddenPanel.AddClass( 'flip-panel-anim-transition' );
		hiddenPanel.AddClass( 'flip-panel-anim-up-show' );
	};

	FlipPanelAnimation.prototype.DetermineHiddenPanel = function( animPanelA, animPanelB ) {
		return ( !animPanelA.BHasClass( 'flip-panel-anim-down-show' ) &&
			!animPanelA.BHasClass( 'flip-panel-anim-up-show' ) ) ?
			animPanelA : animPanelB;
	};

	return {
		Constructor: FlipPanelAnimation
	};
})();
