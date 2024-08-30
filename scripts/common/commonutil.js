                                                             

"use strict";

var CommonUtil = ( function ()
{
	                                             
	                                                                              
	                                                                          
	var remap_lang_to_region = {
		af: 'za',
		ar: 'sa',
		be: 'by',
		cs: 'cz',
		da: 'dk',
		el: 'gr',
		en: 'gb',
		et: 'ee',
		ga: 'ie',
		he: 'il',
		hi: 'in',
		ja: 'jp',
		kk: 'kz',
		ko: 'kr',
		nn: 'no',
		sl: 'si',
		sr: 'rs',
		sv: 'se',
		uk: 'ua',
		ur: 'pk',
		vi: 'vn',
		zh: 'cn',
		zu: 'za',
	};

	                                                                                    
	function _SetRegionOnLabel ( isoCode, elPanel, tooltip = true  )
	{
		var tooltipString = "";
		if ( isoCode )
		{
			tooltipString = $.LocalizeSafe( "#SFUI_Country_" + isoCode.toUpperCase() );
		}
		_SetDataOnLabelInternal( isoCode, isoCode, tooltip ? tooltipString : "", elPanel, tooltipString ? false : true );
	}

	function _SetLanguageOnLabel ( isoCode, elPanel, tooltip = true  )
	{
		var tooltipString = "";
		var imgCode = isoCode;
		if ( isoCode )
		{
			var sTranslated = $.LocalizeSafe( "#Language_Name_Translated_" + isoCode );
			var sLocal = $.LocalizeSafe( "#Language_Name_Native_" + isoCode );
			if ( sTranslated && sLocal && sTranslated === sLocal )
			{
				tooltipString = sLocal;
			}
			else
			{
				tooltipString = ( sTranslated && sLocal ) ? sTranslated + " (" + sLocal + ")" : "";
			}

			if ( remap_lang_to_region[isoCode] )
			{	                                                                                                
				imgCode = remap_lang_to_region[isoCode];
			}
		}
		
		_SetDataOnLabelInternal( isoCode, imgCode, tooltip ? tooltipString : "", elPanel, tooltipString ? false : true );
	}

	function _SetDataOnLabelInternal ( isoCode, imgCode, tooltipString, elPanel, bWarningColor )
	{
		if ( !elPanel )
			return;
		
		var elLabel = elPanel.FindChildTraverse( 'JsRegionLabel' );
		elLabel.AddClass( 'visible-if-not-perfectworld' );

		if ( isoCode )
		{
			elLabel.text = isoCode.toUpperCase();

			elLabel.style.backgroundImage = 'url("file://{images}/regions/' + imgCode + '.png")';

			var elTTAnchor = elLabel.FindChildTraverse( 'region-tt-anchor' );
			if ( !elTTAnchor )
			{
				elTTAnchor = $.CreatePanel( "Panel", elLabel, elPanel.id + '-region-tt-anchor' );
			}

			if ( tooltipString )
			{
				elLabel.SetPanelEvent( 'onmouseover', _ => UiToolkitAPI.ShowTextTooltip( elTTAnchor.id, tooltipString ) );
				elLabel.SetPanelEvent( 'onmouseout', _ => UiToolkitAPI.HideTextTooltip() );
			}

			          
			                    
			 
				                                     
				                                   
				                                                                                                                  
			 
			          


			elLabel.RemoveClass( 'hidden' );
			elLabel.SetHasClass( 'world-region-label', true );
			elLabel.SetHasClass( 'world-region-label--image', true );

		}
		else
		{
			elLabel.AddClass( 'hidden' );
			elLabel.SetHasClass( 'world-region-label', false );
			elLabel.SetHasClass( 'world-region-label--image', false );
		}
	}

	return {
		
		SetRegionOnLabel: _SetRegionOnLabel,
		SetLanguageOnLabel: _SetLanguageOnLabel,

	};
})();