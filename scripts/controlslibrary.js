"use strict";

                                                                                                    
          
                                                                                                    

var activeTab;

function NavigateToTab( tab, btnPressed )
{
                 
                        
    if ( activeTab )
    {
        activeTab.RemoveClass( 'Active' );
    }

    activeTab = $( '#' + tab );

    if( activeTab )
    {
        activeTab.AddClass( 'Active' );
    }
    
}

function CloseControlsLib()
{
                                                                                                      
    $.GetContextPanel().DeleteAsync(.3);

    var controlsLibPanel = $.GetContextPanel();
    controlsLibPanel.RemoveClass( "Active" ); 
}

function OpenControlsLib()
{
    var controlsLibPanel = $.GetContextPanel();
    controlsLibPanel.AddClass( "Active");  
}

                                                                                                    
         
                                                                                                    
var jsPopupCallbackHandle;
var jsPopupLoadingBarCallbackHandle;
var popupLoadingBarLevel = 0;

function ClearPopupsText()
{
    $( '#ControlsLibPopupsText' ).text = '--';
}

function OnControlsLibPopupEvent( msg )
{
                                                                  
    $( '#ControlsLibPopupsText' ).text = msg;
}

function OnPopupCustomLayoutParamsPressed()
{
    ClearPopupsText();
    UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_custom_layout_test.xml', 'popupvalue=123456&callback=' + jsPopupCallbackHandle );
}

function OnPopupCustomLayoutImagePressed()
{
    ClearPopupsText();
    UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_custom_layout_test_image.xml', 'message=Example of popup with an image&image=file://{images}/control_icons/home_icon.vtf&callback=' + jsPopupCallbackHandle );
}

function OnPopupCustomLayoutImageSpinnerPressed()
{
    ClearPopupsText();
    UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_custom_layout_test_image.xml', 'message=Example of popup with an image and a spinner&image=file://{images}/control_icons/home_icon.vtf&spinner=1&callback=' + jsPopupCallbackHandle );
}

function OnPopupCustomLayoutImageLoadingPressed()
{
    ClearPopupsText();
    popupLoadingBarLevel = 0;
    UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_custom_layout_test_image.xml', 'message=Example of popup with an image and a loading bar&image=file://{images}/control_icons/home_icon.vtf&callback=' + jsPopupCallbackHandle + '&loadingBarCallback=' + jsPopupLoadingBarCallbackHandle );
}

function OnPopupCustomLayoutMatchAccept()
{
    ClearPopupsText();
    popupLoadingBarLevel = 0;
    var popup = UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_accept_match.xml', 'map_and_isreconnect=de_dust2,false');
	$.DispatchEvent( "ShowAcceptPopup", popup );
}

function OnPopupCustomLayoutWeaponUpdate()
{
    ClearPopupsText();
    
    var defIndex = 23;
    UiToolkitAPI.ShowCustomLayoutPopupParameters(
        '',
        'file://{resources}/layout/popups/popup_weapon_update.xml',
        defIndex,
        'none'
    );
}

function OnPopupCustomLayoutOpFull()
{
    ClearPopupsText();
    UiToolkitAPI.ShowCustomLayoutPopupParameters(
        '',
        'file://{resources}/layout/popups/popup_operation_launch.xml',
        'none'
    );
}

function OnPopupCustomLayoutSurvivalEndOfMatch()
{
    var elPanel = UiToolkitAPI.ShowCustomLayoutPopupParameters(
        '',
        'file://{resources}/layout/survival/survival_endofmatch.xml',
        'usefakedata=true',
        'none'
    );

                                        
}

function OnPopupCustomLayoutXpGrant()
{
	UiToolkitAPI.ShowCustomLayoutPopupParameters( 
		'',
		'file://{resources}/layout/popups/popup_acknowledge_xpgrant.xml',
		'none'
	);
}

function OnPopupCustomLayoutOperationHub ( startPage )
{
	var nActiveSeason = GameTypesAPI.GetActiveSeasionIndexValue();
	if ( nActiveSeason < 0 )
		return;

    var elPanel = UiToolkitAPI.ShowCustomLayoutPopupParameters(
        '',
        'file://{resources}/layout/operation/operation_main.xml',
		'none'
	);

	elPanel.SetAttributeInt( "season_access", nActiveSeason );
	if ( startPage )
		elPanel.SetAttributeInt( "start_page", startPage );
}

function OnPopupCustomLayoutLoadingScreen()
{
    ClearPopupsText();
    UiToolkitAPI.ShowCustomLayoutPopup( 'teams', 'file://{resources}/layout/teamselectmenu.xml');
}

function OnControlsLibPopupLoadingBarEvent()
{
    popupLoadingBarLevel += 0.05;
    if ( popupLoadingBarLevel > 1.0 )
    {
        popupLoadingBarLevel = 1.0;
    }
    return popupLoadingBarLevel;
}


                                                                                                    
                
                                                                                                    

var jsContextMenuCallbackHandle;

function ClearContextMenuText()
{
    $( '#ControlsLibContextMenuText' ).text = '--';
}

function OnControlsLibContextMenuEvent( msg )
{
                                                                        
    $( '#ControlsLibContextMenuText' ).text = msg;
}

function OnSimpleContextMenu()
{
    ClearContextMenuText();
    
    var items = [];
    items.push( { label: 'Item 1', jsCallback: function() { OnControlsLibContextMenuEvent( 'Item1' ); } } );
    items.push( { label: 'Item 2', jsCallback: function() { OnControlsLibContextMenuEvent( 'Item2' ); } } );
    items.push( { label: 'Item 3', jsCallback: function() { OnControlsLibContextMenuEvent( 'Item3' ); } } ); 
    
    UiToolkitAPI.ShowSimpleContextMenu( '', 'ControlLibSimpleContextMenu', items );
}

function OnContextMenuCustomLayoutParamsPressed()
{
    ClearContextMenuText();
    UiToolkitAPI.ShowCustomLayoutContextMenuParameters( '', '', 'file://{resources}/layout/context_menus/context_menu_custom_layout_test.xml', 'test=123456&callback=' + jsContextMenuCallbackHandle );
}


                                                                                                    
         
                                                                                                    

var g_VideoNumTrailers = 2;
var g_VideoCurrentTrailer = 0;

function VideoPlayNextTrailer()
{
    g_VideoCurrentTrailer = ( g_VideoCurrentTrailer + 1 ) % g_VideoNumTrailers;
    var videoPlayer = $( '#VideoTrailerPlayer' );
    videoPlayer.SetMovie( "file://{resources}/videos/trailer_" + g_VideoCurrentTrailer + ".webm" );
    videoPlayer.SetTitle( "Trailer " + g_VideoCurrentTrailer );
    videoPlayer.Play();
}

                                                                                                    
        
                                                                                                    

var g_sceneanimsList = [


'cu_ct_pose01',
'cu_ct_pose02',
'cu_ct_pose03',
'cu_ct_pose04',
'cu_t_pose01',
'cu_t_pose02',
'cu_t_pose03',
'cu_t_pose04',

                               
                              
                              
                             
                             
                                  
                               
                                           
                                            
                                     
                                   
                                    
                              
                                
                              
                               
                                
                                
                               
                                
                             
                                
                             
                              
                             
                               
                            
                              
                                   
                            
                              
                              
                                   
                                   
                                          
                                     
                                
                                   
                                
                                 
                                      
                                      
                                  
];
var g_sceneanimindex = 0;

var g_maxsceneitemcontext = 5;
var g_sceneitemcontext = 0;

function InitScenePanel()
{
    g_sceneanimindex = 0;

    var charT = LoadoutAPI.GetItemID( 'ct', 'customplayer' );
                                                             

    var model = ItemInfo.GetModelPlayer( charT );

    var playerPanel = $( "#Player1" );
    playerPanel.ResetAnimation( false );
    playerPanel.SetSceneAngles( 0, 0, 0 );
    playerPanel.SetPlayerModel( model );
    playerPanel.PlaySequence( g_sceneanimsList[g_sceneanimindex], true );
    playerPanel.SetCameraPreset( 6, false );
}

function SceneNextAnimSequence()
{
    g_sceneanimindex++;
    if ( g_sceneanimindex >= g_sceneanimsList.length )
    {
        g_sceneanimindex = 0;
    }

    var playerPanel = $( "#Player1" );
 
    playerPanel.ResetAnimation( false );
    playerPanel.PlaySequence( g_sceneanimsList[g_sceneanimindex], true );
}

function ScenePrevAnimSequence()
{
    g_sceneanimindex--;
    if ( g_sceneanimindex < 0 )
    {
        g_sceneanimindex = g_sceneanimsList.length - 1;
    }

    var playerPanel = $( "#Player1" );
    
    playerPanel.ResetAnimation( false );
    playerPanel.PlaySequence( g_sceneanimsList[g_sceneanimindex], true );
}

function GenerateInventoryImages()
{
    $( "#Player1" ).GenerateInventoryImages();
}

function InitSceneWithContextsPanel()
{
    var charT = LoadoutAPI.GetItemID( 't', 'customplayer' );
    var shortTeam = 't';

    var model = ItemInfo.GetModelPlayer( charT );

    var playerPanel = $( "#MultiPlayer" );
    playerPanel.ResetAnimation( false );
    playerPanel.SetSceneAngles( 0, 11.5, 0 );
    playerPanel.SetSceneOffset( 11.08, -18.14, 0.0 );
    playerPanel.SetPlayerModel( model );
    playerPanel.PlaySequence( g_sceneanimsList[23], true );
    playerPanel.SetCameraPreset( 6, false );
    var id = LoadoutAPI.GetItemID( shortTeam, 'melee' )
    playerPanel.EquipPlayerWithItem( id );

    playerPanel.CreateSceneContexts( g_maxsceneitemcontext );
   
    playerPanel.SetActiveSceneContext( 1 );
    playerPanel.SetSceneAngles( 0, 13, 0 );
    playerPanel.SetSceneOffset( -8.96, 1.41, 0.0 );
    playerPanel.SetPlayerModel( "models/player/custom_player/legacy/tm_balkan_variante.mdl" );
    playerPanel.PlaySequence( g_sceneanimsList[25], true );
    id = LoadoutAPI.GetItemID( shortTeam, 'secondary0' )
    playerPanel.EquipPlayerWithItem( id );

    playerPanel.SetActiveSceneContext( 2 );
    playerPanel.SetSceneAngles( 0, -9.5, 0 );
    playerPanel.SetSceneOffset( 14.32, 7.58, 0.0 );
    playerPanel.SetPlayerModel( "models/player/custom_player/legacy/tm_jumpsuit_variantc.mdl" );
    playerPanel.PlaySequence( g_sceneanimsList[27], true );
    id = LoadoutAPI.GetItemID( shortTeam, 'smg3' )
    playerPanel.EquipPlayerWithItem( id );

    playerPanel.SetActiveSceneContext( 3 );
    playerPanel.SetSceneAngles( 0, 13, 0 );
    playerPanel.SetSceneOffset( 22.9, -43.94, 0.0 );
    playerPanel.SetPlayerModel( "models/player/custom_player/legacy/tm_balkan_varianta.mdl" );
    playerPanel.PlaySequence( g_sceneanimsList[28], true );
    id = LoadoutAPI.GetItemID( shortTeam, 'heavy0' )
    playerPanel.EquipPlayerWithItem( id );

    playerPanel.SetActiveSceneContext( 4 );
    playerPanel.SetSceneAngles( 0, -183.5, 0 );
    playerPanel.SetSceneOffset( 27.59, 19.69, 0.0 );
    playerPanel.SetPlayerModel( "models/player/custom_player/legacy/tm_separatist_variantd.mdl" );
    playerPanel.PlaySequence( g_sceneanimsList[36], true );
    id = LoadoutAPI.GetItemID( shortTeam, 'rifle2' )
    playerPanel.EquipPlayerWithItem( id );

    playerPanel.SetActiveSceneContext( 0 );

                                             
                                          
                                                                           

}

function SceneNextItemContext()
{
    g_sceneitemcontext++;
    if ( g_sceneitemcontext >= g_maxsceneitemcontext )
    {
        g_sceneitemcontext = 0;
    }

    var playerPanel = $( "#MultiPlayer" );
    
    playerPanel.SetActiveSceneContext( g_sceneitemcontext );

                                          
                                                                           
}

function ScenePrevItemContext()
{
    g_sceneitemcontext--;
    if ( g_sceneitemcontext < 0 )
    {
        g_sceneitemcontext = g_maxsceneitemcontext - 1;
    }

    var playerPanel = $( "#MultiPlayer" );
 
    playerPanel.SetActiveSceneContext( g_sceneitemcontext );
    
                                          
                                                                           
}

                                                                                                    
         
                                                                                                    

function SetCanvasDrawColorCT()
{
    var canvas = $( '#Canvas1' );

    canvas.SetDrawColorJS( '#2a6b8f' );
}

function SetCanvasDrawColorT()
{
    var canvas = $( '#Canvas1' );

    canvas.SetDrawColorJS( 'orange' );
}

function ClearCanvas()
{
    var canvas = $( '#Canvas1' );

    canvas.ClearJS( '#00000000' );

                      
                                                                                                            
                                                                                                              
                                                           

    var points = [ 10,15, 300,35, 400,500, 5,340 ];
    var colors = [ 'blue', 'red', 'white', 'black' ];

    canvas.DrawShadedPolyJS( 4, points, colors );

    canvas.DrawLineCircleJS( 720, 130, 187, 'orange' );
    canvas.DrawFilledCircleJS( 610, 330, 127, 'pink' );
    canvas.DrawFilledWedgeJS( 480, 430, 140, 1.3, 2.7, 'red' );
}


                                                                                                    
                   
                                                                                                    

var g_DialogVarCount = 0;

function UpdateParentDialogVariablesFromTextEntry( panelName )
{
    var varStr = $( "#ParentDialogVarTextEntry" ).text;

    $( "#DialogVarParentPanel" ).SetDialogVariable( 'testvar', varStr );
}

function UpdateChildDialogVariablesFromTextEntry( panelName )
{
    var varStr = $( "#ChildDialogVarTextEntry" ).text;

    $( "#DialogVarChildPanel" ).SetDialogVariable( 'testvar', varStr );
}

function InitDialogVariables()
{
    $( "#ControlsLibDiagVars" ).SetDialogVariableInt( "count", g_DialogVarCount );
    $( "#ControlsLibDiagVars" ).SetDialogVariable( "s1", "Test1" );
    $( "#ControlsLibDiagVars" ).SetDialogVariable( "s2", "Test2" );
    $( "#ControlsLibDiagVars" ).SetDialogVariable( "cam_key", "%jump%" );
    $( "#ControlsLibDiagVars" ).SetDialogVariable( "np_key", "%attack%" );
    $( "#ControlsLibDiagVars" ).SetDialogVariable( "sp_key", "%radio%" );
	                                                                        

                                                
    $( "#DiagVarLabel" ).text = $.Localize( "\tDynamic Label Count: {d:r:count}", $( "#ControlsLibDiagVars" ) );

                                     
    $.Schedule( 1.0, UpdateDialogVariables );

    $( "#ParentDialogVarTextEntry" ).RaiseChangeEvents( true );
    $( "#ChildDialogVarTextEntry" ).RaiseChangeEvents( true );
    $.RegisterEventHandler( 'TextEntryChanged', $( "#ParentDialogVarTextEntry" ), UpdateParentDialogVariablesFromTextEntry );
    $.RegisterEventHandler( 'TextEntryChanged', $( "#ChildDialogVarTextEntry" ), UpdateChildDialogVariablesFromTextEntry );
}

function UpdateDialogVariables()
{
    g_DialogVarCount++;
    $( "#ControlsLibDiagVars" ).SetDialogVariableInt( "count", g_DialogVarCount );
                                                                            

    $.Schedule( 1.0, UpdateDialogVariables );
}

function InitCaseTest()
{
	$("#CaseTest").SetDialogVariable("casetest", "iİıI");
}

                                                                                                    
             
                                                                                                    

function OnImageFailLoad( panelName, image )
{
    var varStr = $( "#ChildDialogVarTextEntry" ).text;

                                                                                                              
    $( "#ControlsLibPanelImageFallback" ).SetImage( "file://{images}/icons/knife.vtf" );
}

function InitPanels()
{
    var parent = $.FindChildInContext( "#ControlsLibPanelsDynParent" );

    $.CreatePanel( 'Label', parent, '', { text: 'Label, with text property, created dynamically from js.' } );
    $.CreatePanel( 'Label', parent, '', { class: 'fontSize-l fontWeight-Bold', style:'color:#558927;', text: 'Label, with text and class properties, created dynamically from js.' } );
    $.CreatePanel( 'TextButton', parent, '', { class: 'PopupButton', text:"Output to console", onactivate:"$.Msg('Panel tab - Button pressed !!!')" } );

    $.CreatePanel( 'ControlLibTestPanel', $.FindChildInContext( '#ControlsLibPanelsJS' ), '', { MyCustomProp:'Created dynamically from javascript', CreatedFromJS:1 } );

                     
    $.RegisterEventHandler( 'ImageFailedLoad', $( "#ControlsLibPanelImageFallback" ), OnImageFailLoad );
    $( "#ControlsLibPanelImageFallback" ).SetImage( "file://{images}/unknown2.vtf" );
}

                                                                                                    
                
                                                                                                    

function TransitionBlurPanel()
{
    $("#MyBlendBlurFitParent").RemoveClass("TheBlurAnimOut");
    $("#MyBlendBlurFitParent").RemoveClass("TheBlurAnimIn");
    $("#MyBlendBlurFitParent").AddClass("TheBlurAnimIn");
}

function TransitionBlurPanel2() {
    $("#MyBlendBlurFitParent").RemoveClass("TheBlurAnimIn");
    $("#MyBlendBlurFitParent").RemoveClass("TheBlurAnimOut");
    $("#MyBlendBlurFitParent").AddClass("TheBlurAnimOut");
}


function CreateSvgFromJs()
{
    $.CreatePanel('Image', $('#svgButton'), '', {
        src: "file://{images}/icons/ui/smile.svg",
        texturewidth: 100,
        textureheight: 100
    });
}



function GetRssFeed()
{
    BlogAPI.RequestRSSFeed();
}

function OnRssFeedReceived( feed )
{
                                                             


    var RSSFeedPanel = $( "#RSSFeed" );
    if ( RSSFeedPanel === undefined || RSSFeedPanel === null )
    {
        return;
    }

    RSSFeedPanel.RemoveAndDeleteChildren();

                             
    feed[ 'items' ].forEach( function( item ) {
		var itemPanel = $.CreatePanel( 'Panel', RSSFeedPanel, '', { acceptsinput: true } );
        itemPanel.AddClass( 'RSSFeed__Item' );

        $.CreatePanel( 'Label', itemPanel, '', { text: item.title, html: true, class: 'RSSFeed__ItemTitle' } );
        if ( item.imageUrl.length !== 0 )
        {
            $.CreatePanel( 'Image', itemPanel, '', { src: item.imageUrl, class: 'RSSFeed__ItemImage', scaling: 'stretch-to-fit-preserve-aspect' } );
        }
        $.CreatePanel( 'Label', itemPanel, '', { text: item.description, html: true, class: 'RSSFeed__ItemDesc' } );
		$.CreatePanel( 'Label', itemPanel, '', { text: item.date, html: true, class: 'RSSFeed__ItemDate' } );
		
		itemPanel.SetPanelEvent( "onactivate", SteamOverlayAPI.OpenURL.bind( SteamOverlayAPI, item.link ) );
    });
}


                                                                                                    
           
                                                                                                    

function JSReadyReset()
{
                                        

    var elParent = $('#ControlsLibBugsReadyParent');
    var elBtnAddChild = $('#ControlsLibBugsReadyButtonAddChild');
    var elBtnAddBgImg = $('#ControlsLibBugsReadyButtonAddBgImg');

    elParent.RemoveAndDeleteChildren();
    elParent.SetReadyForDisplay( false );

    elBtnAddChild.enabled = true;
    elBtnAddBgImg.enabled = false;

                                                    
                                                                 
                                              
}

function JSReadyAddChild()
{
    var elParent = $('#ControlsLibBugsReadyParent');
    var elBtnAddChild = $('#ControlsLibBugsReadyButtonAddChild');
    var elBtnAddBgImg = $('#ControlsLibBugsReadyButtonAddBgImg');

    $.CreatePanel( 'Panel', elParent, 'ControlsLibBugsReadyChild', { class: 'ControlLibBugs__ReadyChild' } );

    elBtnAddChild.enabled = false;
    elBtnAddBgImg.enabled = true;
}

function JSReadyAddBgImg()
{
    var elBtnAddChild = $('#ControlsLibBugsReadyButtonAddChild');
    var elBtnAddBgImg = $('#ControlsLibBugsReadyButtonAddBgImg');
    var elParent = $('#ControlsLibBugsReadyParent');
    var elChild = $('#ControlsLibBugsReadyChild');


    elBtnAddChild.enabled = false;
    elBtnAddBgImg.enabled = false;

    elChild.AddClass( 'ControlLibBugs__ReadyChild--Ready' );
    elParent.SetReadyForDisplay( true );
}

                                                                                                    
                                           
                                                                                                    
(function()
{
  
    OpenControlsLib();
    NavigateToTab('ControlLibStyleGuide');

	var elTime = $("#TimeZoo");
	if (elTime) {
		elTime.SetDialogVariableTime("time", 1605560584);
	}
   
    jsPopupCallbackHandle = UiToolkitAPI.RegisterJSCallback( OnControlsLibPopupEvent );
    jsContextMenuCallbackHandle = UiToolkitAPI.RegisterJSCallback( OnControlsLibContextMenuEvent );
    jsPopupLoadingBarCallbackHandle = UiToolkitAPI.RegisterJSCallback( OnControlsLibPopupLoadingBarEvent );

    $.RegisterForUnhandledEvent( "PanoramaComponent_Blog_RSSFeedReceived", OnRssFeedReceived );
})();