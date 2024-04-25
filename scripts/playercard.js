'use strict';

var playerCard = ( function (){

	var _m_xuid = '';
	var _m_currentLvl = null;
	var _m_isSelf = false;
	var _m_bShownInFriendsList = false;
	var _m_tooltipDelayHandle = false;
	var _m_arrAdditionalSkillGroups = [ 'wingman', 'dangerzone' ];
	var _m_InventoryUpdatedHandler = null;
	var _m_ShowLockedRankSkillGroupState = false;
	var _m_cp = $.GetContextPanel();

	var _Init = function()
	{
		_m_xuid = $.GetContextPanel().GetAttributeString( 'xuid', 'no XUID found' );
		_m_isSelf = _m_xuid === MyPersonaAPI.GetXuid() ? true : false;
		_m_bShownInFriendsList = $.GetContextPanel().GetAttributeString( 'data-slot', '' );

		_RegisterForInventoryUpdate();

		                                                                                              

		                                                                          
		                                                                                                             

		if ( !_m_isSelf )
			FriendsListAPI.RequestFriendProfileUpdateFromScript( _m_xuid );

		_FillOutFriendCard();
	};

	var _RegisterForInventoryUpdate = function()
	{
		_m_InventoryUpdatedHandler = $.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', _UpdateAvatar );
		_m_cp.RegisterForReadyEvents( true );

		$.RegisterEventHandler( 'ReadyForDisplay', _m_cp, function()
		{
			if ( !_m_InventoryUpdatedHandler )
			{
				_m_InventoryUpdatedHandler = $.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', _UpdateAvatar );
			}
		} );

		$.RegisterEventHandler( 'UnreadyForDisplay', _m_cp, function()
		{
			if ( _m_InventoryUpdatedHandler )
			{
				$.UnregisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', _m_InventoryUpdatedHandler );
				_m_InventoryUpdatedHandler = null;
			}
		} );
	};
	
	var _FillOutFriendCard = function ()
	{
		if ( _m_xuid )
		{
			_m_currentLvl = FriendsListAPI.GetFriendLevel( _m_xuid );
			_m_ShowLockedRankSkillGroupState = !_IsPlayerPrime() && _HasXpProgressToFreeze();

			                                           
			_SetName();
			_SetAvatar();
			_SetFlairItems();
			_SetPlayerBackground();
			_SetRank();
			_SetPrimeUpsell();

			                                                                     
			if ( _m_isSelf )
			{
				if ( MyPersonaAPI.GetPipRankWins( "Competitive" ) >= 0 )
				{
					if ( _m_bShownInFriendsList )
						_SetSkillGroup( 'competitive' );
					else
						_SetAllSkillGroups();
				}
				else
				{
					var elToggleBtn = $.GetContextPanel().FindChildInLayoutFile( 'SkillGroupExpand' );
					elToggleBtn.visible = false;
				}
			}
			else
			{
				_SetAllSkillGroups();
			}

			                          
			if( _m_bShownInFriendsList )
			{
				$.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCommendations' ).AddClass('hidden');
				$.GetContextPanel().FindChildInLayoutFile( 'JsPlayerPrime' ).AddClass('hidden');
				_SetTeam();
			}
			else
			{
				_SetCommendations();
				_SetPrime();
			}
		}
	};

	var _ProfileUpdated = function( xuid )
	{
		                                                                                                           
		                                  
		if ( _m_xuid === xuid )
			_FillOutFriendCard();
	};

	var _SetName = function()
	{
		var elNameLabel = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerName' );
		elNameLabel.text = FriendsListAPI.GetFriendName( _m_xuid );
	};

	var _SetAvatar = function()
	{
		var elAvatarExisting = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardAvatar' );

		if ( !elAvatarExisting )
		{
			var elParent = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardTop' );
			var elAvatar = $.CreatePanel( "Panel", elParent, 'JsPlayerCardAvatar' );
			elAvatar.SetAttributeString( 'xuid', _m_xuid );
			elAvatar.BLoadLayout( 'file://{resources}/layout/avatar.xml', false, false );
			elAvatar.BLoadLayoutSnippet( "AvatarPlayerCard" );
			                                                                   
			Avatar.Init( elAvatar, _m_xuid, 'playercard' );

			elParent.MoveChildBefore( elAvatar, $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardName' ) );
		}
		else
		{
			                                                                           
			Avatar.Init( elAvatarExisting, _m_xuid, 'playercard' );
		}
	};

	var _SetPlayerBackground = function()
	{
		var flairDefIdx = FriendsListAPI.GetFriendDisplayItemDefFeatured( _m_xuid );
		var flairItemId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( flairDefIdx, 0 );
		var imagePath = InventoryAPI.GetItemInventoryImage( flairItemId );
		var elBgImage = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardBg' );
		
		elBgImage.style.backgroundImage =  ( imagePath ) ? 'url("file://{images_econ}' + imagePath + '_large.png")' : 'none';
		elBgImage.style.backgroundPosition = '50% 50%';
		elBgImage.style.backgroundSize = '115% auto';
		elBgImage.style.backgroundRepeat = 'no-repeat';
		elBgImage.style.backgroundImgOpacity = '0.2';

		elBgImage.AddClass( 'player-card-bg-anim' );
	};

	var _SetRank = function()
	{
		                                                      
		                                                                               
		                                                               
		                                                                                 

		var elRank = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerXp' );
		
		if ( !MyPersonaAPI.IsInventoryValid() || !_m_currentLvl || ( !_HasXpProgressToFreeze() && !_IsPlayerPrime() ))
		{
			elRank.AddClass( 'hidden' );
			return;
		}

		if( !_IsPlayerPrime() && !_m_isSelf )
		{
			elRank.AddClass( 'hidden' );
			return;
		}

		var bHasRankToFreezeButNoPrestige = ( _m_ShowLockedRankSkillGroupState ) ? true : false;

		var currentPoints = FriendsListAPI.GetFriendXp( _m_xuid ),
		pointsPerLevel = MyPersonaAPI.GetXpPerLevel();

		                       
		var elXpBar = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerXpBarInner' );
		var elXpBarInner = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerXpBarInner' );

		if ( bHasRankToFreezeButNoPrestige )
		{
			elXpBarInner.GetParent().visible = false;
		}
		else
		{
			var percentComplete = ( currentPoints / pointsPerLevel ) * 100;
			elXpBarInner.style.width = percentComplete + '%';
			elXpBarInner.GetParent().visible = true;
		}

		                    
		var elRankText = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerRankName' );

		                                                                           
		elRankText.SetHasClass( 'player-card-prime-text', bHasRankToFreezeButNoPrestige );


		elRank.SetHasClass( 'player-card-nonprime-locked-xp-row', bHasRankToFreezeButNoPrestige );
		if ( bHasRankToFreezeButNoPrestige )
		{
			elRankText.text = $.Localize( '#Xp_RankName_Locked' )
		}
		else
		{
			elRankText.SetDialogVariable( 'name', $.Localize( '#SFUI_XP_RankName_' + _m_currentLvl ) );
			elRankText.SetDialogVariableInt( 'level', _m_currentLvl );
		}

		                              
		var elRankIcon = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerXpIcon' );
		elRankIcon.SetImage( 'file://{images}/icons/xp/level' + _m_currentLvl + '.png' );
		
		elRank.RemoveClass( 'hidden' );

		var bPrestigeAvailable = _m_isSelf && ( _m_currentLvl >= InventoryAPI.GetMaxLevel() );
		$.GetContextPanel().FindChildInLayoutFile( 'GetPrestigeButton' ).SetHasClass( 'hidden', !bPrestigeAvailable );
		if ( bPrestigeAvailable )
		{
			$.GetContextPanel().FindChildInLayoutFile( 'GetPrestigeButtonClickable' ).SetPanelEvent(
				'onactivate',
				_OnActivateGetPrestigeButtonClickable
			);
		}
	};

	var _OnActivateGetPrestigeButtonClickable = function()
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_inventory_inspect.xml',
			'itemid=' + '0' +                                                                                          
			'&' + 'asyncworkitemwarning=no' +
			'&' + 'asyncworktype=prestigecheck'
		);
	};

	var _SetAllSkillGroups = function()
	{
		var elSkillGroupContainer = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardSkillGroupContainer' );
		
		if ( !_HasXpProgressToFreeze() && !_IsPlayerPrime() )
		{
			elSkillGroupContainer.AddClass( 'hidden' );
			return;
		}

		_SetSkillGroup( 'competitive' );
		_m_arrAdditionalSkillGroups.forEach( type => {
			_SetSkillGroup( type );
		} );

		elSkillGroupContainer.RemoveClass( 'hidden' );
	};

	var _SetSkillForLobbyTeammates= function()
	{
		var skillgroupType = "competitive";
		var skillGroup = 0;
		var wins = 0;
		                                                                             
		    
		   	                                                                      
		   	                                                                              
		   	                                                                        
		   	                                       
		   	 
		   		                                                                                     
		   	 
		   	    
		   	 
		   		                                                                                                 
		   	 
		    
	};

	var _SetSkillGroup = function( type )
	{
		var skillGroup = FriendsListAPI.GetFriendCompetitiveRank( _m_xuid, type );
		var wins = FriendsListAPI.GetFriendCompetitiveWins( _m_xuid, type );

		_UpdateSkillGroup( _LoadSkillGroupSnippet( type ), skillGroup, wins, type );
	};

	var _LoadSkillGroupSnippet = function( type )
	{
		var id = 'JsPlayerCardSkillGroup-' + type;
		var elParent = $.GetContextPanel().FindChildInLayoutFile( 'SkillGroupContainer' );
		var elSkillGroup = elParent.FindChildInLayoutFile( id );
		if ( !elSkillGroup )
		{
			elSkillGroup = $.CreatePanel( "Panel", elParent, id );
			elSkillGroup.BLoadLayoutSnippet( 'PlayerCardSkillGroup' );
			_ShowOtherRanksByDefault( elSkillGroup, type );
		}

		return elSkillGroup;
	};

	var _ShowOtherRanksByDefault = function( elSkillGroup, type )
	{
		                                                                    
		                                     
		                                                                                          
		                                 

		var elToggleBtn = $.GetContextPanel().FindChildInLayoutFile( 'SkillGroupExpand' );

		if ( type !== 'competitive' && _m_bShownInFriendsList )
		{
			elSkillGroup.AddClass( 'collapsed' );
			return;
		}

		elToggleBtn.visible = _m_bShownInFriendsList ? true : false;

		                                                                                           
		                    
		if ( !_m_bShownInFriendsList && _m_isSelf )
		{
			_AskForLocalPlayersAdditionalSkillGroups();
		}
	};

	var _AskForLocalPlayersAdditionalSkillGroups = function()
	{
		var hintLoadSkillGroups = '';

		                                                                               
		_m_arrAdditionalSkillGroups.forEach( type => {
			if ( FriendsListAPI.GetFriendCompetitiveRank( _m_xuid, type ) === -1 )
			{
				hintLoadSkillGroups += ( hintLoadSkillGroups ? ',' : '' ) + type;
			}
		} );

		                             
		if ( hintLoadSkillGroups )
		{
			MyPersonaAPI.HintLoadPipRanks( hintLoadSkillGroups );
		}

		                    
		_m_arrAdditionalSkillGroups.forEach( type => {
			_SetSkillGroup( type );
		} );
	};

	var _UpdateSkillGroup = function( elSkillGroup, skillGroup, wins, type )
	{
		var winsNeededForRank = SessionUtil.GetNumWinsNeededForRank( type );
		var tooltipText = '';
		var isloading = ( skillGroup === -1 ) ? true : false;
		var typeModifier = ( _m_arrAdditionalSkillGroups.indexOf( type ) >= 0 ) ? type : '';

		var imageName = ( typeModifier !== '' ) ? typeModifier : 'skillgroup';
		var bNonPrimeButHasXpProgress = ( _m_ShowLockedRankSkillGroupState ) ? true : false;

		                                                                                  
		if ( bNonPrimeButHasXpProgress )
		{
			elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).SetHasClass( 'player-card-prime-text', bNonPrimeButHasXpProgress );
			if ( !_m_bShownInFriendsList )
			{
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).SetHasClass( 'player-card-prime-text--popup', bNonPrimeButHasXpProgress );
			}
		}

		if ( wins < winsNeededForRank || isloading )
		{
			                                   
			if ( !_m_isSelf )
				return;

			if ( isloading )
			{
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillIcon' ).SetImage( 'file://{images}/icons/skillgroups/'+imageName+'_none.svg' );
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).text = $.Localize( '#SFUI_LOADING' );
			}
			else if ( bNonPrimeButHasXpProgress )
			{
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).text = $.Localize( '#skillgroup_locked' );
				tooltipText = $.Localize( '#tooltip_skill_group_locked' );
			}
			else
			{
				var winsneeded = ( winsNeededForRank - wins );
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillIcon' ).SetImage( 'file://{images}/icons/skillgroups/'+imageName+'_none.svg' );
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).text = $.Localize( '#skillgroup_0' + typeModifier );
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).SetDialogVariableInt( "winsneeded", winsneeded );
				tooltipText = $.Localize( '#tooltip_skill_group_none'+ typeModifier, elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ) );
			}
		}
		else if ( wins >= winsNeededForRank && skillGroup < 1 )
		{
			                       

			if ( !_m_isSelf )
				return;
				
			elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillIcon' ).SetImage( 'file://{images}/icons/skillgroups/' + imageName + '_expired.svg' );

			let strSkillGroupString = 'expired';
			if (bNonPrimeButHasXpProgress)
			{
				strSkillGroupString = 'locked';
			}
			else
			{
				                                
				                                         
				                                
				strSkillGroupString += typeModifier;
			}

			elSkillGroup.FindChildInLayoutFile('JsPlayerSkillLabel').text = $.Localize('#skillgroup_' + strSkillGroupString);
			tooltipText = $.Localize( '#tooltip_skill_group_' + strSkillGroupString );
		}
		else
		{
			                   
			elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillIcon' ).SetImage( 'file://{images}/icons/skillgroups/' + imageName + skillGroup + '.svg' );
			
			if ( bNonPrimeButHasXpProgress )
			{
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).text = $.Localize( '#skillgroup_locked' );
			}
			else
			{
				var skillGroupNamingSuffix = ( typeModifier && typeModifier !== 'wingman' ) ? typeModifier : '';
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).text = $.Localize( '#skillgroup_' + skillGroup + skillGroupNamingSuffix );
			}

			if ( _m_isSelf )
				tooltipText = bNonPrimeButHasXpProgress ?  $.Localize('#tooltip_skill_group_locked') : $.Localize( '#tooltip_skill_group_generic' + typeModifier );
		}
		
		var tooltipLoc = elSkillGroup.id;

		if( bNonPrimeButHasXpProgress )
		{
			tooltipText = ( tooltipText !== '' ) ? tooltipText : '';
		}
		else
		{
			tooltipText = ( tooltipText !== '' ) ? tooltipText + '<br><br>' + GetMatchWinsText( elSkillGroup, wins ) : GetMatchWinsText( elSkillGroup, wins );
		}

		
		elSkillGroup.RemoveClass( 'hidden' );
		if ( !isloading )
		{
			elSkillGroup.SetPanelEvent( 'onmouseover', _ShowSkillGroupTooltip.bind( undefined, tooltipLoc, tooltipText ) );
			elSkillGroup.SetPanelEvent( 'onmouseout', _HideSkillGroupTooltip );
		}

		elSkillGroup.SetHasClass( 'player-card-nonprime-locked-xp-row', _m_ShowLockedRankSkillGroupState );
	};

	var GetMatchWinsText = function( elSkillGroup, wins )
	{
		elSkillGroup.SetDialogVariableInt( 'wins', wins );
		return $.Localize( '#tooltip_skill_group_wins', elSkillGroup );
	};

	var _SetPrimeUpsell = function()
	{
		var elUpsellPanel = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardPrimeUpsell' );
		elUpsellPanel.SetHasClass( 
			'hidden', 
			!MyPersonaAPI.IsInventoryValid() || _IsPlayerPrime() || !_m_isSelf
		);

		                                                                                                                                       
		                                                                     
		                                                                              
		                                                                                           
		                                                       
		          
		elUpsellPanel.FindChildInLayoutFile( "id-player-card-prime-upsell-xp" ).visible = !_HasXpProgressToFreeze() && !_IsPlayerPrime();
		elUpsellPanel.FindChildInLayoutFile( "id-player-card-prime-upsell-skillgroup" ).visible = !_HasXpProgressToFreeze() && !_IsPlayerPrime();
	};

	var _SetCommendations = function()
	{
		var catagories = [
			{ key: 'friendly', value: 0 },
			{ key: 'teaching', value: 0 },
			{ key: 'leader', value: 0 }
		];

		var catagoriesCount = catagories.length;
		var hasAnyCommendations = false;
		var countHiddenCommends = 0;
		var elCommendsBlock = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCommendations' );
		
		for ( var i = 0; i < catagoriesCount; i++ )
		{
			catagories[ i ].value = FriendsListAPI.GetFriendCommendations( _m_xuid, catagories[ i ].key );
			                                                                                   

			var elCommend = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayer' + catagories[ i ].key );
			
			                                            
			if ( !catagories[ i ].value || catagories[ i ].value === 0 )
			{
				elCommend.AddClass( 'hidden' );
				countHiddenCommends++;
			}
			else
			{
				if ( elCommendsBlock.BHasClass( 'hidden' ) )
					elCommendsBlock.RemoveClass( 'hidden' );
				
				elCommend.RemoveClass( 'hidden' );
				elCommend.FindChild( 'JsCommendLabel' ).text = catagories[ i ].value;
			}
		}

		                                                        
		                                                                                
		                                         

		                             
		    
		   	                                                                                 
		   	                      
		    
		       
		    
		   	                                                                                    
		   	                                                                                                      
	    

		                                                                   
		elCommendsBlock.SetHasClass( 'hidden', countHiddenCommends === catagoriesCount && !_IsPlayerPrime());
	};

	var _SetPrime = function()
	{
		var elPrime = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerPrime' );

		                                      
		if ( !MyPersonaAPI.IsInventoryValid() )
			elPrime.AddClass( 'hidden' );

		if ( _IsPlayerPrime() )
		{
			elPrime.RemoveClass( 'hidden' );
			return;
		}
		else
			elPrime.AddClass( 'hidden' );
	};

	var _IsPlayerPrime = function()
	{
		return FriendsListAPI.GetFriendPrimeEligible( _m_xuid );
	}

	var _HasXpProgressToFreeze = function()
	{
		return ( MyPersonaAPI.HasPrestige() || ( MyPersonaAPI.GetCurrentLevel() > 2 )) ? true : false;
	}

	var _SetTeam = function()
	{
		if ( !_m_isSelf )
			return;

		var teamName = MyPersonaAPI.GetMyOfficialTeamName(),
			tournamentName = MyPersonaAPI.GetMyOfficialTournamentName();
		
		var showTeam = !teamName ? false : true;
		
		                            
		if ( !teamName || !tournamentName )
		{
			$.GetContextPanel().FindChildInLayoutFile( 'JsPlayerTeam' ).AddClass( 'hidden' );
			return;
		}

		                                                        
		$.GetContextPanel().FindChildInLayoutFile( 'JsPlayerXp' ).AddClass( 'hidden' );
		$.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardSkillGroupContainer' ).AddClass( 'hidden' );
		$.GetContextPanel().FindChildInLayoutFile( 'JsPlayerTeam' ).RemoveClass( 'hidden' );
		
		var teamTag = MyPersonaAPI.GetMyOfficialTeamTag();

		$.GetContextPanel().FindChildInLayoutFile( 'JsTeamIcon' ).SetImage( 'file://{images}/tournaments/teams/' + teamTag + '.svg' );
		$.GetContextPanel().FindChildInLayoutFile( 'JsTeamLabel' ).text = teamName;
		$.GetContextPanel().FindChildInLayoutFile( 'JsTournamentLabel' ).text = tournamentName;
	};

	var _SetFlairItems = function()
	{
		                                                        
		var flairItems = FriendsListAPI.GetFriendDisplayItemDefCount( _m_xuid );
		var flairItemIdList = [];
		var elFlairPanal = $.GetContextPanel().FindChildInLayoutFile( 'FlairCarouselAndControls' );

		if ( !flairItems )
		{
			elFlairPanal.AddClass( 'hidden' );
			return;
		}

		for ( var i = 0; i < flairItems; i++ )
		{
			var flairDefIdx = FriendsListAPI.GetFriendDisplayItemDefByIndex( _m_xuid, i );
			var flairItemId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( flairDefIdx, 0 );
			flairItemIdList.push( flairItemId );
		}

		                                                                       
		$.GetContextPanel().FindChildInLayoutFile( 'FlairCarousel' ).RemoveAndDeleteChildren();
		_MakeFlairCarouselPages( elFlairPanal, flairItemIdList );

		elFlairPanal.RemoveClass( 'hidden' );
	};

	var _MakeFlairCarouselPages = function( elFlairPanal, flairItemIdList )
	{
		var flairsPerPage = 5;
		var countFlairItems = flairItemIdList.length;
		var elFlairCarousel = $.GetContextPanel().FindChildInLayoutFile( 'FlairCarousel' );
		var elCarouselPage = null;

		for ( var i = 0; i < countFlairItems; i++ )
		{
			if ( i % 5 === 0 )
			{
				elCarouselPage = $.CreatePanel( 'Panel', elFlairCarousel, '', { class: 'playercard-flair-carousel__page' } );
			}

			var imagePath = InventoryAPI.GetItemInventoryImage( flairItemIdList[ i ] );
			var panelName = _m_xuid + flairItemIdList[ i ];
			var elFlair = $.CreatePanel( 'Image', elCarouselPage, panelName, {
				class: 'playercard-flair__icon',
				src: 'file://{images_econ}' + imagePath + '_small.png',
				scaling: 'stretch-to-fit-preserve-aspect'
			} );

			var onMouseOver = function( flairItemId, idForTooltipLocaation )
			{
				var tooltipText = InventoryAPI.GetItemName( flairItemId );
				UiToolkitAPI.ShowTextTooltip( idForTooltipLocaation, tooltipText );
			};

			elFlair.SetPanelEvent( 'onmouseover', onMouseOver.bind( undefined, flairItemIdList[ i ], panelName ) );
			elFlair.SetPanelEvent( 'onmouseout', function()
			{
				UiToolkitAPI.HideTextTooltip();
			} );
		}
	};

	var _SetMedals = function()
	{
		var medalTypesCount = MedalsAPI.GetAchievementMedalTypesCount();

		for ( var i = 0; i < medalTypesCount; i++ )
		{
			var medalType = MedalsAPI.GetMedalTypeByIndex( i );
			var rank = FriendsListAPI.GetFriendMedalRankByType( _m_xuid, medalType );
			                                           
			if ( !rank )
				return;
		}
	};

	  
	                                                                                                          
	 

		                                                               
		                                                      
		
		                                                                                                   
		
		                                                                                   
		
		                                
		                                 
		                                                                     
		                  
		
		                                                                                                                  
		                                                                                                                                               
		                                                                      
		 
			                                                                                                              
			                              
			 
				                                                                   
				                       
				                                    
			 
		 
		                                                                                

		                                                                                          
		                                                                                           
	 
	  

	var _ShowXpTooltip = function()
	{
		if ( _m_ShowLockedRankSkillGroupState )
		{
			_ShowSkillGroupTooltip( 'JsPlayerXpIcon', '#tooltip_xp_locked' );
			return;
		}

		
		var ShowTooltip = function()
		{
			_m_tooltipDelayHandle = false;

			if ( !_m_isSelf )
				return;

			if ( _m_currentLvl && _m_currentLvl > 0 )
				UiToolkitAPI.ShowCustomLayoutParametersTooltip( 'JsPlayerXpIcon',
					'XpToolTip',
					'file://{resources}/layout/tooltips/tooltip_player_xp.xml',
					'xuid=' + _m_xuid
				);
		};

		_m_tooltipDelayHandle = $.Schedule( 0.3, ShowTooltip );
	};

	var _HideXpTooltip = function()
	{
		if ( _m_ShowLockedRankSkillGroupState )
		{
			_HideSkillGroupTooltip();
			return;
		}

		if ( _m_tooltipDelayHandle != false )
		{
			$.CancelScheduled( _m_tooltipDelayHandle );
			_m_tooltipDelayHandle = false;
		}

		UiToolkitAPI.HideCustomLayoutTooltip( 'XpToolTip' );
	};

	var _ShowSkillGroupTooltip = function( id, tooltipText )
	{
		var ShowTooltipSkill = function()
		{
			_m_tooltipDelayHandle = false;
			
			UiToolkitAPI.ShowTextTooltip( id,  tooltipText );
		};

		_m_tooltipDelayHandle = $.Schedule( 0.3, ShowTooltipSkill );
	};

	var _HideSkillGroupTooltip = function()
	{
		if ( _m_tooltipDelayHandle != false )
		{
			$.CancelScheduled( _m_tooltipDelayHandle );
			_m_tooltipDelayHandle = false;
		}
	
		UiToolkitAPI.HideTextTooltip();
	};


	var _UpdateAvatar = function()
	{
		_SetAvatar();
		_SetPlayerBackground();
		_SetFlairItems();
		_SetPrimeUpsell();
		_SetRank()
	};

	var _ShowHideAdditionalRanks = function()
	{
		var elToggleBtn = $.GetContextPanel().FindChildInLayoutFile( 'SkillGroupExpand' );

		if ( elToggleBtn.checked )
		{
			_AskForLocalPlayersAdditionalSkillGroups();
		}

		_m_arrAdditionalSkillGroups.forEach( type => {
			$.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardSkillGroup-' + type ).SetHasClass( 'collapsed', !elToggleBtn.checked );
		} );
	};

	var _FriendsListUpdateName = function( xuid )
	{
		if ( xuid === _m_xuid )
		{
			_SetName();
		}
	};
	

	return {
		Init					: _Init,
		ProfileUpdated			: _ProfileUpdated,                 
		FillOutFriendCard		: _FillOutFriendCard, 
		UpdateName				: _SetName,
		UpdateAvatar			: _UpdateAvatar,
		ShowSkillGroupTooltip	: _ShowSkillGroupTooltip,
		HideSkillGroupTooltip	: _HideSkillGroupTooltip,
		ShowXpTooltip			: _ShowXpTooltip,
		HideXpTooltip: _HideXpTooltip,
		SetAllSkillGroups: _SetAllSkillGroups,
		ShowHideAdditionalRanks: _ShowHideAdditionalRanks,
		FriendsListUpdateName: _FriendsListUpdateName
		
	};

})();

                                                                                                    
                                            
                                                                                                    
(function()
{
	
    if ( $.DbgIsReloadingScript() )
    {
                                         
    }

	playerCard.Init();
	$.RegisterForUnhandledEvent( 'PanoramaComponent_GC_Hello', playerCard.FillOutFriendCard );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_NameChanged', playerCard.UpdateName );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_MedalsChanged', playerCard.UpdateAvatar );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_FriendsList_ProfileUpdated', playerCard.ProfileUpdated );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_PipRankUpdate', playerCard.SetAllSkillGroups );
	$.RegisterForUnhandledEvent( "PanoramaComponent_Lobby_PlayerUpdated", playerCard.UpdateAvatar );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_FriendsList_NameChanged', playerCard.FriendsListUpdateName );
	                                                                                          
})();