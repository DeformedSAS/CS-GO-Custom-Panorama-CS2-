'use strict';

var DigitPanelFactory = ( function()
{
	                                                                                                        
	                                                              
	function _MakeDigitPanel ( elParent, nDigits, suffix = undefined )
	{
		elParent.RemoveAndDeleteChildren();
		var elContainer = $.CreatePanel( 'Panel', elParent, 'DigitPanel' );
		elContainer.SetAttributeInt( 'nDigits', nDigits );
		elContainer.style.flowChildren = 'right';
		elContainer.style.overflow = 'clip';
		elContainer.m_nDigits = nDigits;

		_MakeDigitPanelContents( elContainer, nDigits, suffix );

		return elContainer;
	}

	function _UpdateSuffix ( elContainer, suffix )
	{
		                                                                       
		if ( suffix != undefined )
		{
			var elSuffixLabel = elContainer.FindChildTraverse( 'DigitPanel-Suffix' );
			if ( !elSuffixLabel )
			{
				elSuffixLabel = $.CreatePanel( 'Label', elContainer, 'DigitPanel-Suffix' );
				elSuffixLabel.style.marginLeft = '2px';
				elSuffixLabel.style.height = "100%";
				elSuffixLabel.style.textAlign = "right";
			}

			elSuffixLabel.text = suffix;
		}

		_SetWidth( elContainer );
	}

	function _MakeDigitPanelContents( elContainer, nDigits, suffix )
	{
		if ( !elContainer.IsValid() )
			return;
		
		var elParent = elContainer.GetParent();

		if ( !elParent.IsSizeValid() )
		{
			$.Schedule( 0.5, _MakeDigitPanelContents.bind( undefined, elContainer, nDigits, suffix ) );
		}
		else
		{
			var ParentHeight = Math.floor( elParent.actuallayoutheight / elParent.actualuiscale_y );

			elContainer.style.height = ParentHeight + 'px';
	  		                                       


			for ( var i = 0; i < nDigits; i++ )
			{
				var elDigit = $.CreatePanel( 'Panel', elContainer, 'DigitPanel-Digit-' + i );
				elDigit.style.flowChildren = 'down';
				elDigit.AddClass( "digitpanel__digit" );
				elDigit.style.transitionProperty = 'transform, position';
				elDigit.style.transitionDuration = '0.5s';

				var arrSymbols = $.Localize( "#digitpanel_digits" ).split( "" );

				arrSymbols.forEach( function ( number )
				{
					var elNumeralLabel = $.CreatePanel( 'Label', elDigit, 'DigitPanel-Numeral-' + number );
					elNumeralLabel.style.textAlign = 'center';
					elNumeralLabel.style.letterSpacing = '0px';
					elNumeralLabel.text = number;
					elNumeralLabel.style.height = ParentHeight + "px";
					elNumeralLabel.style.horizontalAlign = 'center';
					elNumeralLabel.style.width = '100%';

				} );
			}

			_UpdateSuffix( elContainer, suffix );	
		}
	}

	function _SetWidth ( elContainer )
	{
		if ( !elContainer.IsSizeValid() )
			$.Schedule( 0.1, _SetWidth.bind( this, elContainer ) );
		else
		{

			                
			var dig0 = elContainer.FindChildTraverse( 'DigitPanel-Digit-0' );
			var nDigitWidth = Math.ceil( dig0.actuallayoutwidth / dig0.actualuiscale_x );

			var width = elContainer.m_nDigits * nDigitWidth;

			var elSuffixLabel = elContainer.FindChildTraverse( 'DigitPanel-Suffix' );
			if ( elSuffixLabel )
			{
				width += elSuffixLabel.actuallayoutwidth / elSuffixLabel.actualuiscale_x;
			}

			elContainer.style.width = width + 'px';
		}
	}

	function _SetDigitPanelString ( elParent, string, suffix = undefined )
	{
		if ( !elParent )
			return;
		
		var elContainer = elParent.FindChildTraverse( 'DigitPanel' );

		if ( !elContainer )
			return;

		if ( elContainer.GetChildCount() === 0 )
		{
	  		                                                                                                 
			$.Schedule( 0.1, _SetDigitPanelString.bind( undefined, elParent, string ) );
			return;
		}

		var nDigits = elContainer.GetAttributeInt( 'nDigits', 0 );

		var arrDigits = String( string ).split( "" );
		arrDigits = arrDigits.slice( 0, nDigits );

		var arrSymbols = $.Localize( "#digitpanel_digits" ).split( "" );

		for ( var d = 0; d < nDigits; d++ )
		{
			var symbol = arrDigits[ d ];
			var elDigit = elContainer.FindChildTraverse( 'DigitPanel-Digit-' + d );	

			if ( elDigit )
			{
				var index = arrSymbols.indexOf( symbol );

				elDigit.visible = d < arrDigits.length ;

				if ( index >= 0 )
				{
					  	                                                                        
					elDigit.style.transform = "translate3D( " + d + "%," + -Number( index ) * 100 + "%, 0px);";
				}
			}	

		}

		_UpdateSuffix( elContainer, suffix );
			
	}

	return {

		MakeDigitPanel:		_MakeDigitPanel,
		SetDigitPanelString: _SetDigitPanelString,
	};

} )();