"use strict";
/// <reference path="csgo.d.ts" />
/// <reference path="common/formattext.ts" />
/// <reference path="common/iteminfo.ts" />
/// <reference path="itemtile_store.ts" />
var RankUpRedemptionStore;
(function (RankUpRedemptionStore) {
    let m_redeemableBalance = 0;
    let m_timeStamp = -1;
    let m_timeoutScheduleHandle;
    let m_profileCustomizationHandler;
    let m_profileUpdateHandler;
    let m_registered = false;
    let m_schTimer;
    function _msg(text) {
    }
    function RegisterForInventoryUpdate() {
        if (m_registered)
            return;
        m_registered = true;
        _UpdateStoreState();
        CheckForPopulateItems();
        m_profileUpdateHandler = $.RegisterForUnhandledEvent('PanoramaComponent_MyPersona_InventoryUpdated', OnInventoryUpdated);
        m_profileCustomizationHandler = $.RegisterForUnhandledEvent('PanoramaComponent_Inventory_ItemCustomizationNotification', OnItemCustomization);
        $.GetContextPanel().RegisterForReadyEvents(true);
        $.RegisterEventHandler('ReadyForDisplay', $.GetContextPanel(), () => {
            _msg("READY FOR DISPLAY");
            _UpdateStoreState();
            CheckForPopulateItems(true);
            if (!m_profileUpdateHandler) {
                m_profileUpdateHandler = $.RegisterForUnhandledEvent('PanoramaComponent_MyPersona_InventoryUpdated', OnInventoryUpdated);
            }
            if (!m_profileCustomizationHandler) {
                m_profileCustomizationHandler = $.RegisterForUnhandledEvent('PanoramaComponent_Inventory_ItemCustomizationNotification', OnItemCustomization);
            }
        });
        $.RegisterEventHandler('UnreadyForDisplay', $.GetContextPanel(), () => {
            _msg("UN-READY FOR DISPLAY");
            if (m_schTimer) {
                $.CancelScheduled(m_schTimer);
                m_schTimer = null;
            }
            if (m_profileUpdateHandler) {
                $.UnregisterForUnhandledEvent('PanoramaComponent_MyPersona_InventoryUpdated', m_profileUpdateHandler);
                m_profileUpdateHandler = null;
            }
            if (m_profileCustomizationHandler) {
                $.UnregisterForUnhandledEvent('PanoramaComponent_Inventory_ItemCustomizationNotification', m_profileCustomizationHandler);
                m_profileCustomizationHandler = null;
            }
        });
    }
    ;
    function CheckForPopulateItems(bFirstTime = false, claimedItemId = '') {
        const objStore = InventoryAPI.GetCacheTypeElementJSOByIndex("PersonalStore", 0);
        const genTime = objStore ? objStore.generation_time : 0;
        if (genTime != m_timeStamp || claimedItemId) {
            if (genTime != m_timeStamp) {
                m_timeStamp = genTime;
                GameInterfaceAPI.SetSettingString('cl_redemption_reset_timestamp', genTime);
            }
            PopulateItems(bFirstTime, claimedItemId);
        }
    }
    function _CreateItemPanel(itemId, index, bFirstTime, claimedItemId = '') {
        let bNoDropsEarned = itemId === '-';
        if (itemId !== '-' && (!InventoryAPI.IsItemInfoValid(itemId) || !InventoryAPI.IsValidItemID(itemId))) {
            _msg('item ' + itemId + ' is invalid');
            return;
        }
        const elItemContainer = $.GetContextPanel().FindChildTraverse('jsRrsItemContainer');
        let elGhostItem = elItemContainer.FindChildInLayoutFile('itemdrop-' + itemId);
        elGhostItem = $.CreatePanel('Panel', elItemContainer, 'itemdrop-' + index + '-' + itemId);
        elGhostItem.BLoadLayout('file://{resources}/layout/itemtile_store.xml', false, false);
        _AddTileToBlurPanel(elGhostItem);
        let oItemData = {
            id: itemId,
            isDropItem: true,
            noDropsEarned: bNoDropsEarned,
        };
        ItemTileStore.Init(elGhostItem, oItemData);
        elGhostItem.Data().itemid = itemId;
        elGhostItem.Data().index = index;
        if (bNoDropsEarned)
            return;
        _OnGhostItemActivate(elGhostItem, itemId);
    }
    function _AddTileToBlurPanel(elGhostItem) {
        let parent = elGhostItem;
        let newParent;
        let count = 0;
        while (newParent = parent.GetParent()) {
            if (newParent.id === 'id-rewards-background') {
                let blurTarget = newParent.FindChildInLayoutFile('id-rewards-background-blur');
                blurTarget.AddBlurPanel(elGhostItem);
                break;
            }
            if (count > 5)
                break;
            parent = newParent;
            count++;
        }
    }
    function _OnGhostItemActivate(elGhostItem, itemId) {
        const bIsFauxItem = InventoryAPI.IsFauxItemID(itemId);
        if (!bIsFauxItem) {
            elGhostItem.SetPanelEvent('onactivate', () => _OnItemSelected(elGhostItem));
            const elInspect = elGhostItem.FindChildTraverse('id-itemtile-store-inspect-btn');
            elInspect.SetPanelEvent('onactivate', () => {
                if (ItemInfo.ItemHasCapability(itemId, 'decodable') && !InventoryAPI.IsTool(itemId)) {
                    UiToolkitAPI.ShowCustomLayoutPopupParameters('popup-inspect-' + itemId, 'file://{resources}/layout/popups/popup_capability_decodable.xml', 'key-and-case=' + '' + ',' + itemId +
                        '&' + 'asyncworkitemwarning=no' +
                        '&' + 'inspectonly=true' +
                        '&' + 'asyncworktype=decodeable' +
                        '&' + 'asyncworkbtnstyle=hidden' +
                        'none');
                }
                else {
                    UiToolkitAPI.ShowCustomLayoutPopupParameters('', 'file://{resources}/layout/popups/popup_inventory_inspect.xml', 'itemid=' + itemId +
                        '&' + 'inspectonly=true' +
                        '&' + 'showequip=false' +
                        '&' + 'allowsave=false' +
                        'none');
                }
            });
        }
    }
    function PopulateItems(bFirstTime = false, claimedItemId = '') {
        _msg('PopulateItems');
        _msg('claimedItemId:' + claimedItemId);
        const objStore = InventoryAPI.GetCacheTypeElementJSOByIndex("PersonalStore", 0);
        $.GetContextPanel().RemoveClass('waiting');
        if (bFirstTime) {
            $.GetContextPanel().TriggerClass('reveal-store');
        }
        const elItemContainer = $.GetContextPanel().FindChildTraverse('jsRrsItemContainer');
        let aSelectedItems = [];
        elItemContainer.Children().forEach(element => {
            if (element.BHasClass('selected')) {
                aSelectedItems.push(element.Data().index);
            }
        });
        elItemContainer.RemoveAndDeleteChildren();
        const arrItemIds = objStore ? Object.values(objStore.items) : ['-', '-', '-', '-'];
        for (let i = 0; i < arrItemIds.length; i++) {
            _CreateItemPanel(arrItemIds[i], i, bFirstTime, claimedItemId);
        }
        elItemContainer.Children().forEach((element, idx) => {
            if (claimedItemId) {
                aSelectedItems.forEach(selectedIndex => {
                    if (idx === selectedIndex) {
                        element.TriggerClass('reveal-anim');
                        $.DispatchEvent('CSGOPlaySoundEffect', 'UIPanorama.gift_claim', '');
                    }
                });
            }
        });
    }
    function _UpdateTime() {
        let secRemaining = StoreAPI.GetSecondsUntilXpRollover();
        $.GetContextPanel().SetDialogVariable('time-to-week-rollover', (secRemaining > 0) ? FormatText.SecondsToSignificantTimeString(secRemaining) : '');
        const xpBonuses = MyPersonaAPI.GetActiveXpBonuses();
        const bEligibleForCarePackage = xpBonuses.split(',').includes('2');
        if (bEligibleForCarePackage) {
            $.GetContextPanel().SetDialogVariable('frame-desc-text', $.Localize('#rankup_redemption_store_refresh', $.GetContextPanel()));
        }
        else {
            $.GetContextPanel().SetDialogVariable('frame-desc-text', $.Localize('#rankup_redemption_store_rollover_wait', $.GetContextPanel()));
        }
        m_schTimer = $.Schedule(30, _UpdateTime);
    }
    function _UpdateStoreState() {
        const objStore = InventoryAPI.GetCacheTypeElementJSOByIndex("PersonalStore", 0);
        m_redeemableBalance = objStore ? objStore.redeemable_balance : 0;
        const elClaimButton = $.GetContextPanel().FindChildTraverse('jsRrsClaimButton');
        elClaimButton.enabled = m_redeemableBalance !== 0;
        elClaimButton.SetHasClass('hide', m_redeemableBalance === 0);
        if (m_redeemableBalance <= 0) {
            _CloseStore(objStore ? true : false);
        }
        else {
            _EnableStore();
        }
        _SetXpProgress();
        _UpdateTime();
    }
    function OnItemCustomization(numericType, type, itemid) {
        _msg('OnItemCustomization ' + numericType + ' ' + type + ' ' + itemid);
        if (type !== 'free_reward_redeemed')
            return;
        if (m_timeoutScheduleHandle) {
            $.CancelScheduled(m_timeoutScheduleHandle);
            m_timeoutScheduleHandle = null;
        }
        CheckForPopulateItems(false, itemid);
    }
    function OnInventoryUpdated() {
        _UpdateStoreState();
        _msg('OnInventoryUpdated ');
        CheckForPopulateItems();
    }
    function _GetSelectedItems() {
        let arrItems = [];
        const elItemContainer = $.GetContextPanel().FindChildTraverse('jsRrsItemContainer');
        for (let panel of elItemContainer.Children()) {
            if (panel.BHasClass('selected')) {
                arrItems.push(panel.Data().itemid);
            }
        }
        return arrItems;
    }
    function _OnItemSelected(elPanel) {
        const elItemContainer = $.GetContextPanel().FindChildTraverse('jsRrsItemContainer');
        let aItemIds = _GetSelectedItems();
        let nSelected = _GetSelectedItems().length;
        if (nSelected < m_redeemableBalance) {
            elPanel.SetHasClass('selected', !elPanel.BHasClass('selected'));
            if (!elPanel.BHasClass('selected')) {
                $.DispatchEvent('CSGOPlaySoundEffect', 'UIPanorama.gift_select', 'MOUSE');
            }
            else {
                $.DispatchEvent('CSGOPlaySoundEffect', 'UIPanorama.gift_deselect', 'MOUSE');
            }
        }
        else {
            if (aItemIds.find(element => element === elPanel.Data().itemid)) {
                elPanel.SetHasClass('selected', !elPanel.BHasClass('selected'));
                if (!elPanel.BHasClass('selected')) {
                    $.DispatchEvent('CSGOPlaySoundEffect', 'UIPanorama.gift_select', 'MOUSE');
                }
                else {
                    $.DispatchEvent('CSGOPlaySoundEffect', 'UIPanorama.gift_deselect', 'MOUSE');
                }
            }
        }
        nSelected = _GetSelectedItems().length;
        for (let element of elItemContainer.Children()) {
            if (!elPanel.BHasClass('selected') && nSelected >= m_redeemableBalance) {
                if (element.BHasClass('selected')) {
                    element.TriggerClass('pulse-me');
                    $.DispatchEvent('CSGOPlaySoundEffect', 'UIPanorama.buymenu_failure', 'MOUSE');
                }
            }
        }
    }
    function _CloseStore(bHasStore) {
        _EnableDisableStorePanels(false);
        $.GetContextPanel().AddClass('store-closed');
        if (bHasStore) {
            $.GetContextPanel().SetDialogVariable('frame-badge-text', $.Localize('#rankup_redemption_store_closed', $.GetContextPanel()));
        }
        else {
            $.GetContextPanel().SetDialogVariable('frame-badge-text', $.Localize('#rankup_redemption_store_earn_xp', $.GetContextPanel()));
        }
    }
    function _EnableStore() {
        _msg('_EnableStore ');
        $.GetContextPanel().RemoveClass('waiting');
        $.GetContextPanel().RemoveClass('store-closed');
        $.GetContextPanel().SetDialogVariableInt('redeemable_balance', m_redeemableBalance);
        $.GetContextPanel().SetDialogVariable('frame-badge-text', $.Localize('#rankup_redemption_store_directive', $.GetContextPanel()));
        _EnableDisableStorePanels(true);
    }
    function _EnableDisableStorePanels(enableStore) {
        _msg('_enableStore ' + enableStore);
        $.GetContextPanel().Children().forEach(elPanel => {
            elPanel.enabled = enableStore;
        });
        const elItemContainer = $.GetContextPanel().FindChildTraverse('jsRrsItemContainer');
        for (let panel of elItemContainer.Children()) {
            panel.hittest = enableStore;
            panel.hittestchildren = enableStore;
        }
    }
    function _PulseItems() {
        const elItemContainer = $.GetContextPanel().FindChildTraverse('jsRrsItemContainer');
        for (let panel of elItemContainer.Children()) {
            if (!panel.BHasClass('item-claimed')) {
                panel.TriggerClass('pulse-me');
                $.DispatchEvent('CSGOPlaySoundEffect', 'UIPanorama.buymenu_failure', 'MOUSE');
            }
        }
    }
    function OnRedeem() {
        if (_GetSelectedItems().length === 0) {
            _PulseItems();
            return;
        }
        let szItemList = _GetSelectedItems().join(',');
        StoreAPI.StoreRedeemFreeRewards(szItemList);
        $.GetContextPanel().AddClass('waiting');
        _EnableDisableStorePanels(true);
        m_timeoutScheduleHandle = $.Schedule(10, _RedemptionTimedOut);
    }
    RankUpRedemptionStore.OnRedeem = OnRedeem;
    function _RedemptionTimedOut() {
        m_timeoutScheduleHandle = null;
        UiToolkitAPI.ShowGenericPopup($.Localize('#rankup_redemption_store_timeout_title'), $.Localize('#rankup_redemption_store_timeout_desc'), '');
        _EnableStore();
    }
    function _SetXpProgress() {
        const currentPoints = FriendsListAPI.GetFriendXp(MyPersonaAPI.GetXuid());
        const pointsPerLevel = MyPersonaAPI.GetXpPerLevel();
        let elXpBarInner = $.GetContextPanel().FindChildInLayoutFile('JsPlayerXpBarInner');
        let percentComplete = (currentPoints / pointsPerLevel) * 100;
        elXpBarInner.style.width = percentComplete + '%';
        elXpBarInner.GetParent().visible = true;
        const xpBonuses = MyPersonaAPI.GetActiveXpBonuses();
        const bEligibleForCarePackage = xpBonuses.split(',').includes('2');
        $.GetContextPanel().SetHasClass('care-package-eligible', bEligibleForCarePackage);
        const currentLvl = FriendsListAPI.GetFriendLevel(MyPersonaAPI.GetXuid());
        let elRankIcon = $.GetContextPanel().FindChildInLayoutFile('JsPlayerXpIcon');
        elRankIcon.SetImage('file://{images}/icons/xp/level' + currentLvl + '.png');
        if (bEligibleForCarePackage) {
            $.GetContextPanel().SetDialogVariable('frame-desc-text', $.Localize('#rankup_redemption_store_refresh', $.GetContextPanel()));
        }
        else {
            $.GetContextPanel().SetDialogVariable('frame-desc-text', $.Localize('#rankup_redemption_store_rollover_wait', $.GetContextPanel()));
        }
    }
    {
        $.GetContextPanel().RegisterForReadyEvents(true);
        RegisterForInventoryUpdate();
    }
})(RankUpRedemptionStore || (RankUpRedemptionStore = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFua3VwX3JlZGVtcHRpb25fc3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9jb250ZW50L2NzZ28vcGFub3JhbWEvc2NyaXB0cy9yYW5rdXBfcmVkZW1wdGlvbl9zdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsa0NBQWtDO0FBQ2xDLDZDQUE2QztBQUM3QywyQ0FBMkM7QUFDM0MsMENBQTBDO0FBRTFDLElBQVUscUJBQXFCLENBeWY5QjtBQXpmRCxXQUFVLHFCQUFxQjtJQUU5QixJQUFJLG1CQUFtQixHQUFXLENBQUMsQ0FBQztJQUNwQyxJQUFJLFdBQVcsR0FBVyxDQUFDLENBQUMsQ0FBQztJQUM3QixJQUFJLHVCQUFzQyxDQUFDO0lBQzNDLElBQUksNkJBQTRDLENBQUM7SUFDakQsSUFBSSxzQkFBcUMsQ0FBQztJQUMxQyxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7SUFDekIsSUFBSSxVQUF5QixDQUFDO0lBRTlCLFNBQVMsSUFBSSxDQUFHLElBQVk7SUFHNUIsQ0FBQztJQUVELFNBQVMsMEJBQTBCO1FBRWxDLElBQUssWUFBWTtZQUNoQixPQUFPO1FBRVIsWUFBWSxHQUFHLElBQUksQ0FBQztRQUNwQixpQkFBaUIsRUFBRSxDQUFDO1FBQ3BCLHFCQUFxQixFQUFFLENBQUM7UUFFeEIsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLHlCQUF5QixDQUFFLDhDQUE4QyxFQUFFLGtCQUFrQixDQUFFLENBQUM7UUFDM0gsNkJBQTZCLEdBQUcsQ0FBQyxDQUFDLHlCQUF5QixDQUFFLDJEQUEyRCxFQUFFLG1CQUFtQixDQUFFLENBQUM7UUFDaEosQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLHNCQUFzQixDQUFFLElBQUksQ0FBRSxDQUFDO1FBRW5ELENBQUMsQ0FBQyxvQkFBb0IsQ0FBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUUsR0FBRyxFQUFFO1lBRXBFLElBQUksQ0FBRSxtQkFB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