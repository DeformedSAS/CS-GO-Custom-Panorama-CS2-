"use strict";
/// <reference path="csgo.d.ts" />
/// <reference path="common/iteminfo.ts" />
/// <reference path="notification/notification_equip.ts" />
/// <reference path="popups/popup_acknowledge_item.ts" />
/// <reference path="mainmenu_inventory_search.ts" />
var InventoryPanel;
(function (InventoryPanel) {
    let _m_activeCategory;
    let _m_elInventoryMain = $.GetContextPanel().FindChildInLayoutFile('InventoryMain');
    let _m_elSelectItemForCapabilityPopup = $.GetContextPanel().FindChildInLayoutFile('SelectItemForCapabilityPopup');
    let _m_elInventorySearch = $.GetContextPanel().FindChildInLayoutFile('InvSearchPanel');
    let _m_elInventoryNavBar = $.GetContextPanel().FindChildInLayoutFile('id-navbar-tabs');
    let _m_isCapabliltyPopupOpen = false;
    let _m_InventoryUpdatedHandler = null;
    let _m_HiddenContentClassname = 'mainmenu-content--hidden';
    function _Init() {
        if (!_m_InventoryUpdatedHandler) {
            _m_InventoryUpdatedHandler = $.RegisterForUnhandledEvent('PanoramaComponent_MyPersona_InventoryUpdated', _InventoryUpdated);
        }
        _RunEveryTimeInventoryIsShown();
        _CreateCategoriesNavBar();
        _InitMarketLink();
        _InitXrayBtn();
        _LoadEquipNotification();
    }
    function _RunEveryTimeInventoryIsShown() {
        _OnShowAcknowledgePanel();
        if (!MyPersonaAPI.IsInventoryValid() || !MyPersonaAPI.IsConnectedToGC()) {
            UiToolkitAPI.ShowGenericPopupOk($.Localize('#SFUI_SteamConnectionErrorTitle'), $.Localize('#SFUI_Steam_Error_LinkUnexpected'), '', () => $.DispatchEvent('HideContentPanel'));
        }
    }
    function _CreateCategoriesNavBar() {
        let aCategories = StripEmptyStringsFromArray(InventoryAPI.GetCategories().split(','));
        let elCategoryBtns = _CreateCatagoryBtns(aCategories);
        _CreateSubmenusAndListerPanelsForEachCategory(aCategories, _CreateInventoryContentPanel());
        $.DispatchEvent("Activated", elCategoryBtns.FindChildInLayoutFile(aCategories[0]), "mouse");
        elCategoryBtns.Children()[0].checked = true;
    }
    function _CreateCatagoryBtns(aCategories) {
        let elPanel = $.GetContextPanel().FindChildInLayoutFile('id-navbar-tabs-catagory-btns-container');
        for (let category of aCategories) {
            let elBtn = elPanel.FindChildInLayoutFile(category);
            if (!elBtn) {
                elBtn = $.CreatePanel('RadioButton', elPanel, category, {
                    class: 'content-navbar__tabs__btn', group: 'inv-top-nav'
                });
                let tag = category;
                let metaData = _GetMetadata(tag, '', '');
                let nameToken = _GetValueForKeyFromMetadata('nametoken', metaData);
                $.CreatePanel('Label', elBtn, '', {
                    text: $.Localize('#' + nameToken)
                });
                elBtn.SetAttributeString('tag', tag);
                elBtn.Data().tag = tag;
                elBtn.SetPanelEvent('onactivate', () => NavigateToTab(tag));
            }
        }
        return elPanel;
    }
    function _CreateInventoryContentPanel() {
        return $.CreatePanel('Panel', _m_elInventoryMain, 'InventoryMenuContent', {
            class: 'inv-category__list-container'
        });
    }
    function _CreateSubmenusAndListerPanelsForEachCategory(aCategories, elParent) {
        for (let tag of aCategories) {
            if (tag) {
                let subCategories = StripEmptyStringsFromArray(InventoryAPI.GetSubCategories(tag).split(','));
                let elCategory = $.CreatePanel('Panel', elParent, tag, {
                    class: 'inv-category'
                });
                _AddTransitionEventToPanel(elCategory);
                let elNavBar = _CreateNavBar(tag, elCategory);
                if (subCategories.length > 1) {
                    _MakeNavBarButtons(elNavBar, subCategories, (subCategory) => {
                        _UpdateActiveInventoryList();
                    });
                }
                _AddSortDropdownToNavBar(elNavBar.GetParent(), false);
                $.CreatePanel('InventoryItemList', elCategory, tag + '-List');
            }
        }
    }
    function _AddTransitionEventToPanel(newPanel) {
        // @ts-ignore
        newPanel.OnPropertyTransitionEndEvent = (panelName, propertyName) => {
            if (newPanel.id === panelName && propertyName === 'opacity') {
                if (newPanel.visible === true && newPanel.BIsTransparent()) {
                    newPanel.visible = false;
                    return true;
                }
            }
            return false;
        };
        // @ts-ignore
        $.RegisterEventHandler('PropertyTransitionEnd', newPanel, newPanel.OnPropertyTransitionEndEvent);
    }
    function _CreateNavBar(idForNavBar, elParent) {
        let elNavBar = $.CreatePanel('Panel', elParent, idForNavBar + '-NavBarParent', {
            class: 'content-navbar__tabs content-navbar__tabs--dark content-navbar__tabs--noflow'
        });
        let elNavBarButtonsContainer = $.CreatePanel('Panel', elNavBar, idForNavBar + '-NavBar', {
            class: 'content-navbar__tabs__center-container'
        });
        elNavBarButtonsContainer.SetAttributeString('data-type', idForNavBar);
        return elNavBarButtonsContainer;
    }
    function _MakeNavBarButtons(elNavBar, listOfTags, onActivate) {
        let groupName = elNavBar.id;
        for (let tag of listOfTags) {
            let elButton = $.CreatePanel('RadioButton', elNavBar, tag + 'Btn', {
                group: groupName,
                class: 'content-navbar__tabs__btn'
            });
            let metaData = {};
            let catagory = elNavBar.GetAttributeString('data-type', '');
            if (catagory === "InvCategories")
                metaData = _GetMetadata(tag, '', '');
            else
                metaData = _GetMetadata(catagory, tag, '');
            let nameToken = _GetValueForKeyFromMetadata('nametoken', metaData);
            if (!nameToken) {
                nameToken = _GetValueForKeyFromMetadata('nameprefix', metaData);
                if (nameToken !== '')
                    nameToken = nameToken + tag;
            }
            if (nameToken) {
                $.CreatePanel('Label', elButton, '', {
                    text: '#' + nameToken
                });
            }
            else {
                let icon = _GetValueForKeyFromMetadata('usetournamenticons', metaData);
                if (icon) {
                    let imageIndex = tag.replace(/^\D+/g, '');
                    $.CreatePanel('Image', elButton, '', {
                        src: 'file://{images}/tournaments/events/tournament_logo_' + imageIndex + '.svg',
                        textureheight: '48',
                        scaling: 'stretch-to-fit-preserve-aspect'
                    });
                    nameToken = 'CSGO_Tournament_Event_NameShort_' + imageIndex;
                    elButton.SetPanelEvent('onmouseover', () => UiToolkitAPI.ShowTextTooltip(elButton.id, nameToken));
                    elButton.SetPanelEvent('onmouseout', () => UiToolkitAPI.HideTextTooltip());
                }
            }
            if (onActivate)
                elButton.SetPanelEvent('onactivate', () => onActivate(tag));
            elButton.SetAttributeString('data-type', tag);
            elButton.SetAttributeString('nice-name', nameToken);
        }
        elNavBar.GetChild(0).checked = true;
    }
    function _UpdateActiveInventoryList() {
        if (_m_activeCategory === "tradeup") {
            return;
        }
        let activePanel = _m_elInventoryMain.FindChildInLayoutFile(_m_activeCategory);
        _UpdateActiveItemList(_GetActiveCategoryLister(activePanel), _m_activeCategory, _GetSelectedSubCategory(activePanel), _GetSelectedSort(activePanel), '');
    }
    function NavigateToTab(category) {
        if (_m_activeCategory !== category) {
            if (_m_activeCategory) {
                if (_m_activeCategory === 'tradeup') {
                    _UpdateCraftingPanelVisibility(false);
                }
                else if (_m_activeCategory === 'search') {
                    _UpdateSearchPanelVisibility(false);
                }
                else {
                    let panelToHide = _m_elInventoryMain.FindChildInLayoutFile(_m_activeCategory);
                    panelToHide.RemoveClass('Active');
                }
            }
            _m_activeCategory = category;
            if (category === "tradeup") {
                _UpdateCraftingPanelVisibility(true);
                $.GetContextPanel().FindChildInLayoutFile('InvCraftingBtn').checked = true;
            }
            else if (_m_activeCategory === 'search') {
                _UpdateSearchPanelVisibility(true);
                $.GetContextPanel().FindChildInLayoutFile('InvSearchPanel').checked = true;
            }
            else {
                let activePanel = _m_elInventoryMain.FindChildInLayoutFile(category);
                activePanel.AddClass('Active');
                activePanel.visible = true;
                activePanel.SetReadyForDisplay(true);
                _m_activeCategory = category;
                _UpdateActiveItemList(_GetActiveCategoryLister(activePanel), category, _GetSelectedSubCategory(activePanel), _GetSelectedSort(activePanel), '');
            }
        }
    }
    InventoryPanel.NavigateToTab = NavigateToTab;
    function _AddSortDropdownToNavBar(elNavBar, bIsCapabliltyPopup) {
        let elDropdown = elNavBar.FindChildInLayoutFile('InvSortDropdown');
        if (!elDropdown) {
            let elDropdownParent = $.CreatePanel('Panel', elNavBar, 'InvExtraNavOptions', { class: 'overflow-noclip' });
            elDropdownParent.BLoadLayoutSnippet('InvSortDropdownSnippet');
            elDropdown = elDropdownParent.FindChildInLayoutFile('InvSortDropdown');
            let count = InventoryAPI.GetSortMethodsCount();
            for (let i = 0; i < count; i++) {
                let sort = InventoryAPI.GetSortMethodByIndex(i);
                let newEntry = $.CreatePanel('Label', elDropdownParent, sort, {
                    class: 'DropDownMenu'
                });
                newEntry.text = $.Localize('#' + sort);
                elDropdown.AddOption(newEntry);
            }
            if (!bIsCapabliltyPopup) {
                elDropdown.SetPanelEvent('oninputsubmit', () => _UpdateSort(elDropdown));
            }
            elDropdown.SetSelected(GameInterfaceAPI.GetSettingString("cl_inventory_saved_sort2"));
        }
    }
    function _UpdateSort(elDropdown) {
        let activePanel = _m_elInventoryMain.FindChildInLayoutFile(_m_activeCategory);
        if (activePanel) {
            _UpdateActiveItemList(_GetActiveCategoryLister(activePanel), _m_activeCategory, _GetSelectedSubCategory(activePanel), elDropdown.GetSelected().id, '');
            if (typeof elDropdown.GetSelected().id === "string" && elDropdown.GetSelected().id !== GameInterfaceAPI.GetSettingString("cl_inventory_saved_sort2")) {
                GameInterfaceAPI.SetSettingString("cl_inventory_saved_sort2", elDropdown.GetSelected().id);
                GameInterfaceAPI.ConsoleCommand("host_writeconfig");
            }
        }
    }
    function _ShowHideXrayBtn() {
        let elXrayBtnContainer = $.GetContextPanel().FindChildInLayoutFile("InvXrayBtnContainer");
        let xrayRewardId = ItemInfo.GetItemsInXray().reward;
        let sRestriction = InventoryAPI.GetDecodeableRestriction('capsule');
        elXrayBtnContainer.visible = xrayRewardId !== '' &&
            xrayRewardId !== undefined &&
            xrayRewardId !== null &&
            (sRestriction === 'xray' || !InventoryAPI.IsFauxItemID(xrayRewardId));
    }
    function _InitMarketLink() {
        let elMarketLink = $.GetContextPanel().FindChildInLayoutFile("InvMarketBtn");
        if (MyPersonaAPI.GetLauncherType() === "perfectworld") {
            elMarketLink.SetHasClass('hide', true);
            return;
        }
        elMarketLink.SetHasClass('hide', false);
        elMarketLink.SetPanelEvent('onactivate', onActivate);
        let appId = SteamOverlayAPI.GetAppID();
        let communityUrl = SteamOverlayAPI.GetSteamCommunityURL();
        function onActivate() {
            SteamOverlayAPI.OpenURL(communityUrl + "/market/search?q=&appid=" + appId + "&lock_appid=" + appId);
        }
    }
    function _InitXrayBtn() {
        _ShowHideXrayBtn();
        let elXrayBtn = $.GetContextPanel().FindChildInLayoutFile("InvXrayBtnContainer");
        elXrayBtn.SetPanelEvent('onactivate', () => {
            let oData = ItemInfo.GetItemsInXray();
            let keyId = ItemInfo.GetKeyForCaseInXray(oData.case);
            $.DispatchEvent("ShowXrayCasePopup", keyId, oData.case, false);
        });
    }
    function _GotoTradeUpPanel() {
        NavigateToTab('tradeup');
    }
    function _HideInventoryMainListers() {
        if (_m_activeCategory === "search") {
            $('#InvSearchPanel').AddClass(_m_HiddenContentClassname);
        }
        else {
            _m_elInventoryMain.AddClass(_m_HiddenContentClassname);
        }
    }
    function _ShowInventoryMainListers() {
        if (_m_activeCategory === "search") {
            $('#InvSearchPanel').RemoveClass(_m_HiddenContentClassname);
        }
        else {
            _m_elInventoryMain.RemoveClass(_m_HiddenContentClassname);
        }
    }
    function _UpdateCraftingPanelVisibility(bShow) {
        let elCrafting = $('#InvCraftingPanel');
        if (bShow) {
            if (elCrafting.BHasClass(_m_HiddenContentClassname)) {
                elCrafting.RemoveClass(_m_HiddenContentClassname);
                elCrafting.SetFocus();
                CloseSelectItemForCapabilityPopup();
                $.GetContextPanel().FindChildTraverse('Crafting-Items').SetReadyForDisplay(true);
                $.GetContextPanel().FindChildTraverse('Crafting-Ingredients').SetReadyForDisplay(true);
                let RecipeId = InventoryAPI.GetTradeUpContractItemID();
                let strCraftingFilter = InventoryAPI.GetItemAttributeValue(RecipeId, "recipe filter");
                InventoryAPI.ClearCraftIngredients();
                InventoryAPI.SetCraftTarget(Number(strCraftingFilter));
                $.DispatchEvent('UpdateTradeUpPanel');
            }
        }
        else {
            elCrafting.AddClass(_m_HiddenContentClassname);
            _m_elInventoryMain.SetFocus();
            $.GetContextPanel().FindChildTraverse('Crafting-Items').SetReadyForDisplay(false);
            $.GetContextPanel().FindChildTraverse('Crafting-Ingredients').SetReadyForDisplay(false);
            InventoryAPI.ClearCraftIngredients();
            return true;
        }
    }
    function _UpdateSearchPanelVisibility(bShow) {
        let elSearch = $('#InvSearchPanel');
        if (bShow) {
            if (elSearch.BHasClass(_m_HiddenContentClassname)) {
                elSearch.RemoveClass(_m_HiddenContentClassname);
                elSearch.SetFocus();
                CloseSelectItemForCapabilityPopup();
            }
        }
        else {
            elSearch.AddClass(_m_HiddenContentClassname);
            _m_elInventoryMain.SetFocus();
            return true;
        }
    }
    function _ClosePopups() {
        // @ts-ignore
        if (_m_elInventoryMain.updatePlayerEquipSlotChangedHandler) {
            // @ts-ignore
            $.UnregisterForUnhandledEvent('PanoramaComponent_Loadout_EquipSlotChanged', _m_elInventoryMain.updatePlayerEquipSlotChangedHandler);
            // @ts-ignore
            _m_elInventoryMain.updatePlayerEquipSlotChangedHandler = null;
        }
        if (_m_InventoryUpdatedHandler) {
            $.UnregisterForUnhandledEvent('PanoramaComponent_MyPersona_InventoryUpdated', _m_InventoryUpdatedHandler);
            _m_InventoryUpdatedHandler = null;
        }
        if (!_m_elSelectItemForCapabilityPopup.BHasClass(_m_HiddenContentClassname)) {
            CloseSelectItemForCapabilityPopup();
            return true;
        }
        return false;
    }
    function _GetActiveCategoryLister(activePanel) {
        if (activePanel) {
            let elList = activePanel.FindChildInLayoutFile(_m_activeCategory + '-List');
            return (elList) ? elList : null;
        }
        return null;
    }
    function _GetSelectedSort(activePanel) {
        let elDropdown = null;
        if (activePanel) {
            elDropdown = activePanel.FindChildInLayoutFile('InvSortDropdown');
        }
        return (elDropdown) ? elDropdown.GetSelected().id : '';
    }
    function _GetSelectedSubCategoryPanel(activePanel) {
        if (!activePanel || !activePanel.IsValid()) {
            return null;
        }
        let elSubCategoryNavBar = activePanel.FindChildInLayoutFile(_m_activeCategory + '-NavBar');
        if (!elSubCategoryNavBar) {
            return null;
        }
        let tabs = elSubCategoryNavBar.Children();
        tabs = tabs.filter(e => e.checked);
        return tabs;
    }
    function _GetSelectedSubCategory(activePanel) {
        let tabs = _GetSelectedSubCategoryPanel(activePanel);
        return (tabs && tabs.length > 0) ? tabs[0].GetAttributeString('data-type', 'any') : 'any';
    }
    function StripEmptyStringsFromArray(dataRaw) {
        return dataRaw.filter(v => v !== '');
    }
    function _GetValueForKeyFromMetadata(key, metaData) {
        if (metaData.hasOwnProperty(key))
            return metaData[key];
        return '';
    }
    function _GetMetadata(category, subCategory, group) {
        return JSON.parse(InventoryAPI.GetInventoryStructureJSON(category, subCategory, group));
    }
    function _IsSearchActivePanel(category) {
        return category === 'InvSearchPanel';
    }
    function _UpdateActiveItemList(elListerToUpdate, category, subCategory, sortString, capabilityFilter) {
        if (!elListerToUpdate || !subCategory || !category) {
            return;
        }
        if (_IsSearchActivePanel(category)) {
            InventorySearch.UpdateItemList();
            return;
        }
        $.DispatchEvent('SetInventoryFilter', elListerToUpdate, category, subCategory, 'any', sortString, capabilityFilter, '');
        _ShowHideNoItemsMessage(elListerToUpdate, capabilityFilter);
    }
    function _ShowHideNoItemsMessage(elLister, capabilityFilter) {
        let count = elLister.count;
        let elParent = elLister.GetParent();
        let elEmpty = elParent.FindChildInLayoutFile('JsInvEmptyLister');
        if (count > 0) {
            if (elEmpty) {
                elEmpty.DeleteAsync(0.0);
            }
            return;
        }
        let elNewEmpty = elParent.FindChildInLayoutFile('JsInvEmptyLister');
        if (!elNewEmpty) {
            elNewEmpty = $.CreatePanel('Panel', elParent, 'JsInvEmptyLister');
            elNewEmpty.BLoadLayoutSnippet('InvEmptyLister');
            elParent.MoveChildBefore(elNewEmpty, elLister);
        }
        let activePanel = _m_elInventoryMain.FindChildInLayoutFile(_m_activeCategory);
        let elSubCat = _GetSelectedSubCategoryPanel(activePanel);
        let elLabel = elNewEmpty.FindChildInLayoutFile('JsInvEmptyListerLabel');
        if ((capabilityFilter != '') && (_SelectedCapabilityInfo.initialItemId != '')) {
            elLabel.SetDialogVariable('type', InventoryAPI.GetItemName(_SelectedCapabilityInfo.initialItemId));
            if ((_SelectedCapabilityInfo.capability === 'can_stattrack_swap') && !InventoryAPI.IsTool(_SelectedCapabilityInfo.initialItemId))
                elLabel.text = $.Localize('#inv_empty_lister_for_stattrackswap', elLabel);
            else if (_SelectedCapabilityInfo.capability === 'can_collect')
                elLabel.text = $.Localize('#inv_empty_lister_nocaskets', elLabel);
            else
                elLabel.text = $.Localize('#inv_empty_lister_for_use', elLabel);
        }
        else {
            const str = $.Localize("#" + elSubCat[0].GetAttributeString('nice-name', ''));
            elLabel.SetDialogVariable('type', str);
            elLabel.text = $.Localize('#inv_empty_lister', elLabel);
        }
    }
    function _OnReadyForDisplay() {
        _RunEveryTimeInventoryIsShown();
        _UpdateActiveInventoryList();
        // @ts-ignore
        if (!_m_elInventoryMain.updatePlayerEquipSlotChangedHandler) {
            // @ts-ignore
            _m_elInventoryMain.updatePlayerEquipSlotChangedHandler = $.RegisterForUnhandledEvent('PanoramaComponent_Loadout_EquipSlotChanged', _ShowNotification);
        }
        if (!_m_InventoryUpdatedHandler) {
            _m_InventoryUpdatedHandler = $.RegisterForUnhandledEvent('PanoramaComponent_MyPersona_InventoryUpdated', _InventoryUpdated);
        }
    }
    function _InventoryUpdated() {
        _ShowHideXrayBtn();
        if ($.GetContextPanel().BHasClass(_m_HiddenContentClassname) || _m_isCapabliltyPopupOpen)
            return;
        _OnShowAcknowledgePanel();
        if (!_m_elInventorySearch.BHasClass(_m_HiddenContentClassname)) {
            InventorySearch.UpdateItemList();
        }
        else if (_m_activeCategory) {
            _UpdateActiveInventoryList();
        }
    }
    function _OnShowAcknowledgePanel() {
        let itemsToAcknowledge = AcknowledgeItems.GetItems();
        if (itemsToAcknowledge.length > 0) {
            $.DispatchEvent('ShowAcknowledgePopup', '', '');
        }
    }
    let _SelectedCapabilityInfo = {
        capability: '',
        initialItemId: '',
        secondaryItemId: '',
        multiselectItemIds: {},
        multiselectItemIdsArray: [],
        popupVisible: false,
    };
    function GetCapabilityInfo() {
        return _SelectedCapabilityInfo;
    }
    InventoryPanel.GetCapabilityInfo = GetCapabilityInfo;
    function _PromptShowSelectItemForCapabilityPopup(titletxt, messagetxt, capability, itemid, itemid2) {
        UiToolkitAPI.ShowGenericPopupOkCancel($.Localize(titletxt), $.Localize(messagetxt), '', () => $.DispatchEvent("ShowSelectItemForCapabilityPopup", capability, itemid, itemid2), () => { });
    }
    function _ShowSelectItemForCapabilityPopup(capability, itemid, itemid2) {
        $.DispatchEvent('CSGOPlaySoundEffect', 'tab_mainmenu_inventory', 'MOUSE');
        _m_elSelectItemForCapabilityPopup.RemoveClass(_m_HiddenContentClassname);
        _m_elSelectItemForCapabilityPopup.SetFocus();
        _HideInventoryMainListers();
        _m_elInventoryNavBar.SetHasClass('collapse', true);
        _SelectedCapabilityInfo.capability = capability;
        _SelectedCapabilityInfo.initialItemId = itemid;
        _SelectedCapabilityInfo.secondaryItemId = itemid2;
        _SelectedCapabilityInfo.multiselectItemIds = {};
        _SelectedCapabilityInfo.multiselectItemIdsArray = [];
        _SelectedCapabilityInfo.popupVisible = true;
        let elDropDownParent = _m_elSelectItemForCapabilityPopup.FindChildInLayoutFile('CapabilityPopupSortContainer');
        _AddSortDropdownToNavBar(elDropDownParent, true);
        let elDropdown = elDropDownParent.FindChildInLayoutFile('InvSortDropdown');
        elDropdown.SetPanelEvent('oninputsubmit', () => _UpdatePopup(itemid, capability));
        _UpdatePopup(itemid, capability);
    }
    function CloseSelectItemForCapabilityPopup() {
        $.DispatchEvent('CSGOPlaySoundEffect', 'inventory_inspect_close', 'MOUSE');
        _m_elInventoryNavBar.SetHasClass('collapse', false);
        if (_m_elSelectItemForCapabilityPopup.BHasClass(_m_HiddenContentClassname)) {
            return;
        }
        _m_elSelectItemForCapabilityPopup.AddClass(_m_HiddenContentClassname);
        _m_elInventoryMain.SetFocus();
        _SelectedCapabilityInfo.popupVisible = false;
        _ShowInventoryMainListers();
        return true;
    }
    InventoryPanel.CloseSelectItemForCapabilityPopup = CloseSelectItemForCapabilityPopup;
    function _UpdatePopup(id, capability) {
        let elList = _m_elSelectItemForCapabilityPopup.FindChildInLayoutFile('ItemListForCapability');
        if (!elList)
            elList = $.CreatePanel('InventoryItemList', _m_elSelectItemForCapabilityPopup, 'ItemListForCapability');
        elList.SetHasClass('inv-multi-select-allow', capability === "casketstore" || capability === "casketretrieve");
        let capabilityFilter = capability + ':' + id;
        _UpdateActiveItemList(elList, 'any', 'any', _GetSelectedSort(_m_elSelectItemForCapabilityPopup.FindChildInLayoutFile('CapabilityPopupSortContainer')), capabilityFilter);
        _SetUpCasketPopup(capability, elList);
        _SetCapabilityPopupTitle(id, capability);
    }
    function _SetUpCasketPopup(capability, elList) {
        let elActionBar = _m_elSelectItemForCapabilityPopup.FindChildInLayoutFile('CapabilityPopupActionBar');
        if (capability === "casketstore" || capability === "casketretrieve") {
            elList.SetAttributeInt("capability_multistatus_selected", 1);
            if (!elActionBar) {
                elActionBar = $.CreatePanel('Panel', _m_elSelectItemForCapabilityPopup, 'CapabilityPopupActionBar', { class: "content-controls-actions-bar" });
                elActionBar.BLoadLayoutSnippet('CapabilityActionBar');
            }
            elList.SetHasClass('inv-item-list-fill-height-flow', true);
            _UpdateMultiSelectDisplay(elActionBar.FindChildInLayoutFile('CapabilityPopupMultiStatus'));
        }
        else {
            elList.SetAttributeInt("capability_multistatus_selected", 0);
            if (elActionBar) {
                elActionBar.DeleteAsync(0.0);
            }
            elList.SetHasClass('inv-item-list-fill-height-flow', false);
        }
    }
    function _SetCapabilityPopupTitle(id, capability) {
        let elPrefixString = _m_elSelectItemForCapabilityPopup.FindChildInLayoutFile('CapPrefixItemLabel');
        let szPrefixString = '#inv_select_item_use';
        if (capability === 'can_stattrack_swap') {
            szPrefixString = InventoryAPI.IsTool(id) ?
                '#inv_select_item_use' :
                '#inv_select_item_stattrack_swap';
        }
        else if (capability === 'can_collect') {
            let defName = InventoryAPI.GetItemDefinitionName(id);
            szPrefixString = (defName === 'casket') ?
                '#inv_select_item_tostoreincasket' :
                '#inv_select_casketitem_tostorethis';
        }
        else if (capability === 'casketcontents') {
            szPrefixString = '#inv_select_casketcontents';
        }
        else if (capability === 'casketretrieve') {
            szPrefixString = '#inv_select_casketretrieve';
        }
        else if (capability === 'casketstore') {
            szPrefixString = '#inv_select_casketstore';
        }
        elPrefixString.text = szPrefixString;
        let elImage = _m_elSelectItemForCapabilityPopup.FindChildInLayoutFile('CapItemImage');
        elImage.itemid = id;
        let elLabel = _m_elSelectItemForCapabilityPopup.FindChildInLayoutFile('CapItemName');
        elLabel.text = InventoryAPI.GetItemName(id);
    }
    function _UpdateSelectItemForCapabilityPopup(capability, itemid, bSelected) {
        if (!_m_elSelectItemForCapabilityPopup || !_m_elSelectItemForCapabilityPopup.IsValid())
            return false;
        let elMultiItemPortion = _m_elSelectItemForCapabilityPopup.FindChildInLayoutFile('CapabilityPopupMultiStatus');
        if (!elMultiItemPortion || !elMultiItemPortion.IsValid())
            return false;
        if (_SelectedCapabilityInfo.capability !== capability)
            return false;
        if (!itemid)
            return false;
        if (bSelected) {
            if (!_SelectedCapabilityInfo.multiselectItemIds.hasOwnProperty(itemid)) {
                _SelectedCapabilityInfo.multiselectItemIds[itemid] = bSelected;
                _SelectedCapabilityInfo.multiselectItemIdsArray.push(itemid);
            }
        }
        else {
            if (_SelectedCapabilityInfo.multiselectItemIds.hasOwnProperty(itemid)) {
                delete _SelectedCapabilityInfo.multiselectItemIds[itemid];
                _SelectedCapabilityInfo.multiselectItemIdsArray.splice(_SelectedCapabilityInfo.multiselectItemIdsArray.indexOf(itemid), 1);
            }
        }
        _UpdateMultiSelectDisplay(elMultiItemPortion);
        return true;
    }
    function _UpdateMultiSelectDisplay(elMultiItemPortion) {
        elMultiItemPortion.SetDialogVariableInt('count', _SelectedCapabilityInfo.multiselectItemIdsArray.length);
        elMultiItemPortion.FindChildInLayoutFile('CapabilityPopupMultiStatusBtn').enabled = (_SelectedCapabilityInfo.multiselectItemIdsArray.length > 0);
    }
    function ProceedForMultiStatusCapabilityPopup() {
        let capability = _SelectedCapabilityInfo.capability;
        let arrItemIDs = _SelectedCapabilityInfo.multiselectItemIdsArray;
        CloseSelectItemForCapabilityPopup();
        $.DispatchEvent('ContextMenuEvent', '');
        $.DispatchEvent('HideSelectItemForCapabilityPopup');
        $.DispatchEvent('UIPopupButtonClicked', '');
        $.DispatchEvent('CapabilityPopupIsOpen', false);
        if (arrItemIDs.length <= 0)
            return;
        switch (capability) {
            case 'casketretrieve':
                {
                    let strItemIDs = arrItemIDs.join(",");
                    UiToolkitAPI.ShowCustomLayoutPopupParameters('', 'file://{resources}/layout/popups/popup_casket_operation.xml', 'op=remove' +
                        '&nextcapability=batch' +
                        '&spinner=1' +
                        '&casket_item_id=' + _SelectedCapabilityInfo.initialItemId +
                        '&subject_item_id=' + strItemIDs);
                    break;
                }
            case 'casketstore':
                {
                    let strItemIDs = arrItemIDs.join(",");
                    UiToolkitAPI.ShowCustomLayoutPopupParameters('', 'file://{resources}/layout/popups/popup_casket_operation.xml', 'op=add' +
                        '&nextcapability=batch' +
                        '&spinner=1' +
                        '&casket_item_id=' + _SelectedCapabilityInfo.initialItemId +
                        '&subject_item_id=' + strItemIDs);
                    break;
                }
        }
    }
    InventoryPanel.ProceedForMultiStatusCapabilityPopup = ProceedForMultiStatusCapabilityPopup;
    function _SetIsCapabilityPopUpOpen(isOpen) {
        _m_isCapabliltyPopupOpen = isOpen;
        if (isOpen === false) {
            _InventoryUpdated();
        }
    }
    function _ShowDeleteItemConfirmation(id) {
        UiToolkitAPI.ShowGenericPopupYesNo('#inv_context_delete', '#inv_confirm_delete_desc', "", () => _DeleteItemAnim(id), () => { });
    }
    function _DeleteItemAnim(id) {
        let activePanel = _m_elInventoryMain.FindChildInLayoutFile(_m_activeCategory);
        let elList = _GetActiveCategoryLister(activePanel);
        let childrenList = elList.Children();
        for (let element of childrenList) {
            if (id === element.GetAttributeString('itemid', '0')) {
                element.AddClass('delete');
            }
        }
        $.Schedule(.3, () => InventoryAPI.DeleteItem(id));
    }
    function _ShowUseItemOnceConfirmationPopup(id) {
        let pPopup = UiToolkitAPI.ShowGenericPopupYesNo('#inv_context_useitem', '#inv_confirm_useitem_desc', "", () => InventoryAPI.UseTool(id, ''), () => { });
        if (pPopup != null) {
            pPopup.SetDialogVariable('type', InventoryAPI.GetItemName(id));
        }
    }
    function _LoadEquipNotification() {
        let elParent = $.GetContextPanel().FindChildInLayoutFile('InventoryMainContainer');
        let elNotification = $.CreatePanel('Panel', elParent, 'InvNotificationEquip');
        elNotification.BLoadLayout('file://{resources}/layout/notification/notification_equip.xml', false, false);
    }
    function _ShowNotification(team, slot, oldItemId, newItemId, bNew) {
        if (!bNew || _m_isCapabliltyPopupOpen || $.GetContextPanel().BHasClass(_m_HiddenContentClassname)) {
            return;
        }
        let elNotification = $.GetContextPanel().FindChildInLayoutFile('InvNotificationEquip');
        EquipNotification.ShowEquipNotification(elNotification, slot, newItemId);
    }
    function UpdateItemListCallback() {
        if (_SelectedCapabilityInfo.popupVisible === true && _SelectedCapabilityInfo.capability) {
            _UpdatePopup(_SelectedCapabilityInfo.initialItemId, _SelectedCapabilityInfo.capability);
        }
    }
    InventoryPanel.UpdateItemListCallback = UpdateItemListCallback;
    {
        _Init();
        let elJsInventory = $('#JsInventory');
        $.RegisterEventHandler('ReadyForDisplay', elJsInventory, _OnReadyForDisplay);
        $.RegisterEventHandler('UnreadyForDisplay', elJsInventory, _ClosePopups);
        $.RegisterEventHandler('Cancelled', elJsInventory, _ClosePopups);
        $.RegisterForUnhandledEvent('PromptShowSelectItemForCapabilityPopup', _PromptShowSelectItemForCapabilityPopup);
        $.RegisterForUnhandledEvent('ShowSelectItemForCapabilityPopup', _ShowSelectItemForCapabilityPopup);
        $.RegisterForUnhandledEvent('UpdateSelectItemForCapabilityPopup', _UpdateSelectItemForCapabilityPopup);
        $.RegisterForUnhandledEvent('HideSelectItemForCapabilityPopup', CloseSelectItemForCapabilityPopup);
        $.RegisterForUnhandledEvent('CapabilityPopupIsOpen', _SetIsCapabilityPopUpOpen);
        $.RegisterForUnhandledEvent('RefreshActiveInventoryList', _InventoryUpdated);
        $.RegisterForUnhandledEvent('ShowDeleteItemConfirmationPopup', _ShowDeleteItemConfirmation);
        $.RegisterForUnhandledEvent('ShowUseItemOnceConfirmationPopup', _ShowUseItemOnceConfirmationPopup);
        $.RegisterForUnhandledEvent('PanoramaComponent_Inventory_CraftIngredientAdded', () => NavigateToTab('tradeup'));
        $.RegisterForUnhandledEvent('ShowTradeUpPanel', _GotoTradeUpPanel);
    }
})(InventoryPanel || (InventoryPanel = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbm1lbnVfaW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vY29udGVudC9jc2dvL3Bhbm9yYW1hL3NjcmlwdHMvbWFpbm1lbnVfaW52ZW50b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxrQ0FBa0M7QUFDbEMsMkNBQTJDO0FBQzNDLDJEQUEyRDtBQUMzRCx5REFBeUQ7QUFDekQscURBQXFEO0FBRXJELElBQVUsY0FBYyxDQTBsQ3ZCO0FBMWxDRCxXQUFVLGNBQWM7SUFFdkIsSUFBSSxpQkFBcUMsQ0FBQztJQUUxQyxJQUFJLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBRSxlQUFlLENBQUUsQ0FBQztJQUN0RixJQUFJLGlDQUFpQyxHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBRSw4QkFBOEIsQ0FBRSxDQUFDO0lBQ3BILElBQUksb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLHFCQUFxQixDQUFFLGdCQUFnQixDQUFFLENBQUM7SUFDekYsSUFBSSxvQkFBb0IsR0FBRSxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMscUJBQXFCLENBQUUsZ0JBQWdCLENBQUUsQ0FBQztJQUN4RixJQUFJLHdCQUF3QixHQUFHLEtBQUssQ0FBQztJQUNyQyxJQUFJLDBCQUEwQixHQUFrQixJQUFJLENBQUM7SUFFckQsSUFBSSx5QkFBeUIsR0FBRywwQkFBMEIsQ0FBQztJQUUzRCxTQUFTLEtBQUs7UUFFYixJQUFLLENBQUMsMEJBQTBCLEVBQ2hDO1lBQ0MsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDLHlCQUF5QixDQUFFLDhDQUE4QyxFQUFFLGlCQUFpQixDQUFFLENBQUM7U0FDOUg7UUFFRCw2QkFBNkIsRUFBRSxDQUFDO1FBQ2hDLHVCQUF1QixFQUFFLENBQUM7UUFDMUIsZUFBZSxFQUFFLENBQUM7UUFDbEIsWUFBWSxFQUFFLENB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