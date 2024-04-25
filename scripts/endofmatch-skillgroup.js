'use strict';


var EOM_Skillgroup = (function () {


	var _m_pauseBeforeEnd = 1.5;
	var _m_cP = $.GetContextPanel();


                                                     

	_m_cP.Data().m_retries = 0;

	var _DisplayMe = function()
	{
		                                     
		    
		   	             
		    

		if ( !_m_cP.bSkillgroupDataReady && !MockAdapter.GetMockData() )
		{
			return false;
		}

		if( MyPersonaAPI.GetElevatedState() !== 'elevated' )
		{
			return false;
		}

		var oSkillgroupData = MockAdapter.SkillgroupDataJSO( _m_cP );

		var compWins = oSkillgroupData[ "num_wins" ];
		var oldRank = oSkillgroupData[ "old_rank" ];
		var newRank = oSkillgroupData[ "new_rank" ];
		var currentRank = oldRank < newRank ? newRank : oldRank;

		var oData = {
			currentRank: currentRank,
			compWins: compWins,
			rankInfo: '',
			rankDesc: '',
			mode: MockAdapter.GetGameModeInternalName( true ),
			model: '',
			image: ''
		};

		var winsNeededForRank = SessionUtil.GetNumWinsNeededForRank( oData.mode );

		_m_cP.SetDialogVariable( 'eom_mode', MockAdapter.GetGameModeName( true ) );

		if ( oData.mode === 'survival' && currentRank < 1 )
		{	                                                
			_LoadAndShowRank();

			oData.rankInfo = $.Localize( '#eom-skillgroup-needed-dzgames', _m_cP );
			oData.image = 'file://{images}/icons/skillgroups/dangerzone0.svg';
		}
		else if ( currentRank < 1 && compWins >= winsNeededForRank )
		{	
			                                              
			_LoadAndShowRank();

			var modePrefix = ( oData.mode === 'scrimcomp2v2' ) ? 'wingman' : ( ( oData.mode === 'survival' ) ? 'dangerzone' : 'skillgroup' );
			
			let strSkillGroupExpired = '#eom-skillgroup-expired';
			                                
			                                                          
			                                
			oData.rankInfo = $.Localize(strSkillGroupExpired, _m_cP);
			oData.image = 'file://{images}/icons/skillgroups/'+modePrefix+'_expired.svg';
		}
		else if ( currentRank < 1 )
		{
			                                   
			var matchesNeeded = winsNeededForRank - compWins;
			_LoadAndShowRank();
			_m_cP.SetDialogVariableInt( 'num_matches', matchesNeeded );
			var winNeededString = ( matchesNeeded === 1 ) ? '#eom-skillgroup-needed-win' : '#eom-skillgroup-needed-wins';

			var modePrefix = ( oData.mode === 'scrimcomp2v2' ) ? 'wingman' : ( ( oData.mode === 'survival' ) ? 'dangerzone' : 'skillgroup' );

			oData.rankInfo = $.Localize( winNeededString, _m_cP );
			oData.image = 'file://{images}/icons/skillgroups/'+modePrefix+'0.svg';
		}
		else if ( currentRank >= 1 )
		{
			                         
			var modePrefix = ( oData.mode === 'scrimcomp2v2' ) ? 'skillgroup_wingman' : ( ( oData.mode === 'survival' ) ? 'skillgroup_dangerzone' : 'skillgroup' );
			var modelPath = 'models/inventory_items/skillgroups/' + modePrefix + currentRank + '.mdl';
			oData.model = modelPath;
			oData.rankInfo = $.Localize( ( oData.mode === 'survival' ) ? '#skillgroup_'+currentRank+'dangerzone' : 'RankName_' + currentRank );
			oData.rankDesc = $.Localize( '#eom-skillgroup-name', _m_cP );

			if ( oldRank < newRank )                             
			{
				_m_pauseBeforeEnd = 3.0;
				_LoadAndShowNewRankReveal();
			}
			else                            
			{
				_LoadAndShowRank();
			}
		}

		_FilloutRankData( oData );
	
		return true;
	};

	function _LoadAndShowRank ()
	{
		_m_cP.FindChildInLayoutFile( "id-eom-skillgroup" ).BLoadLayoutSnippet( "eom-skillgroup-display" );
	}

	function _LoadAndShowNewRankReveal ()
	{
		_m_cP.FindChildInLayoutFile( "id-eom-skillgroup" ).BLoadLayoutSnippet( "eom-skillgroup-reveal" );
		
		$.Schedule(
			0.75,
			_ShowIcon
		);

		$.Schedule( 0.75, _PlayParticles );

		var elBg = _m_cP.FindChildTraverse( 'id-eom-skillgroup-bg' );
		elBg.AddClass( 'eom-skillgroup-bg-anim' );

		var elNew = _m_cP.FindChildTraverse( 'id-eom-skillgroup__newrank' );
		elNew.AddClass( 'eom-skillgroup-bg-anim' );

		var elFlare = _m_cP.FindChildTraverse( 'id-eom-skillgroup__flare' );
		elFlare.AddClass( 'eom-skillgroup-new-anim' );

		var elInfo = _m_cP.FindChildTraverse( 'id-eom-skillgroup__info' );
		elInfo.AddClass( 'eom-skillgroup-bg-anim' );
	}

	function _ShowIcon ()
	{
		if ( !_m_cP || !_m_cP.IsValid() )
			return;
		
		var elModel = _m_cP.FindChildTraverse( 'id-eom-skillgroup-model' );
		if ( !elModel || !elModel.IsValid() )
			return;
		
		elModel.AddClass( 'eom-skillgroup__model-reveal' );
		$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.XP.NewSkillGroup', 'MOUSE' );
		
	}

	function _PlayParticles ()
	{
		var elModel = _m_cP.FindChildTraverse( 'SkillGroupParticles' );
		if ( !elModel || !elModel.IsValid() )
			return;

		elModel.RemoveClass( 'hidden' );
		elModel.SetCameraPosition( -15.10, 0.00, 0.00 );
		elModel.SetCameraAngles( 0.00,  0.00,  0.00 );
		elModel.AddParticleSystem( 'nuke_sparks1_glow', '', false );
		elModel.AddParticleSystem( 'nuke_sparks1_core', '', false );

		function hide ( panel )
		{
			if ( !panel || !panel.IsValid() )
				return;
			
			panel.AddClass( 'hidden' );		
		}
		
		$.Schedule( 1, hide.bind( undefined, elModel ));
	}

	function _FilloutRankData ( oData )
	{
		var winString = ( oData.compWins === 1 ) ? '#eom-skillgroup-win' : '#eom-skillgroup-wins';
		var elDesc = _m_cP.FindChildInLayoutFile( "id-eom-skillgroup__wins-desc" );
		elDesc.text = $.Localize( winString, _m_cP );

		_m_cP.FindChildInLayoutFile( "id-eom-skillgroup__rankname-label" ).text = oData.rankInfo;
		_m_cP.FindChildInLayoutFile( "id-eom-skillgroup__wins-label" ).text = oData.compWins;

		var elRankDesc = _m_cP.FindChildInLayoutFile( "id-eom-skillgroup__rankname-desc" );
		
		if ( oData.rankDesc )
		{
			elRankDesc.RemoveClass( 'hidden' );
			elRankDesc.text = oData.rankDesc;
		}

		if ( oData.model )
		{
			var elModel = _m_cP.FindChildInLayoutFile( "id-eom-skillgroup-model" );
			elModel.RemoveClass( 'hidden' );
			elModel.SetScene(
				"resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
				oData.model,
				false
			);
		}
		else
		{
			var elImage = _m_cP.FindChildInLayoutFile( "id-eom-skillgroup-image" );
			elImage.RemoveClass( 'hidden' );
			elImage.SetImage( oData.image );
		}
	}

	                                                         
	                                                                      
	  
	  

	function _Start() 
	{

		if ( MockAdapter.GetMockData() && !MockAdapter.GetMockData().includes( 'SKILLGROUP' ) )
		{
			_End();
			return;
		}
		
		if ( _DisplayMe() )
		{
			EndOfMatch.SwitchToPanel( 'eom-skillgroup' );
			EndOfMatch.StartDisplayTimer( _m_pauseBeforeEnd );

			$.Schedule( _m_pauseBeforeEnd, _End );
		}
		else
		{
			_End();
			return;
		}
	}

	function _End() 
	{
		EndOfMatch.ShowNextPanel();
	}

	function _Shutdown()
	{
	}

	                      
	return {
		name: 'eom-skillgroup',
		Start: _Start,
		Shutdown: _Shutdown,
	};
})();


                                                                                                    
                                           
                                                                                                    
(function () {

	EndOfMatch.RegisterPanelObject( EOM_Skillgroup );

})();
