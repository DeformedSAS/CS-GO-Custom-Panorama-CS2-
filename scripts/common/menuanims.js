'use strict';

function UpdateNavContentSelectionBar( btn, elSelectionBar )
{
    var selectedBtn = $( '#' + btn );
    var elSelectionBar = elSelectionBar.FindChildTraverse( 'JsContentNavBar' );

                                                                     
    if( !selectedBtn )
    {
        elSelectionBar.style.position = '0px 0px 0px';
        return;
    }

    elSelectionBar.style.position = selectedBtn.actualxoffset +'px 0px 0px';
    elSelectionBar.style.width = selectedBtn.contentwidth +'px';
}