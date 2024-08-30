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

    function RegisterForInventoryUpdate() {
        if (m_registered) return;
        m_registered = true;
        try {
            _UpdateStoreState();
            CheckForPopulateItems();
            m_profileUpdateHandler = $.RegisterForUnhandledEvent('PanoramaComponent_MyPersona_InventoryUpdated', OnInventoryUpdated);
            m_profileCustomizationHandler = $.RegisterForUnhandledEvent('PanoramaComponent_Inventory_ItemCustomizationNotification', OnItemCustomization);
            $.GetContextPanel().RegisterForReadyEvents(true);
            $.RegisterEventHandler('ReadyForDisplay', $.GetContextPanel(), () => {
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
        } catch (error) {
            // Handle error if necessary
        }
    }

    function CheckForPopulateItems(bFirstTime = false, claimedItemId = '') {
        try {
            const objStore = InventoryAPI.GetCacheTypeElementJSOByIndex ? InventoryAPI.GetCacheTypeElementJSOByIndex(0) : null;
            if (!objStore) return;
            const genTime = objStore.generation_time || 0;
            if (genTime !== m_timeStamp || claimedItemId) {
                if (genTime !== m_timeStamp) {
                    m_timeStamp = genTime;
                    GameInterfaceAPI.SetSettingString('cl_redemption_reset_timestamp', genTime);
                }
                PopulateItems(bFirstTime, claimedItemId);
            }
        } catch (error) {
            // Handle error if necessary
        }
    }

    function _CreateItemPanel(itemId, index, bFirstTime, claimedItemId = '') {
        try {
            let bNoDropsEarned = itemId === '-';
            if (itemId !== '-' && (!InventoryAPI.IsItemInfoValid(itemId) || !InventoryAPI.IsValidItemID(itemId))) {
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
            if (bNoDropsEarned) return;
            _OnGhostItemActivate(elGhostItem, itemId);
        } catch (error) {
            // Handle error if necessary
        }
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
            if (count > 5) break;
            parent = newParent;
            count++;
        }
    }

    function _OnGhostItemActivate(elGhostItem, itemId) {
        try {
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
                    } else {
                        UiToolkitAPI.ShowCustomLayoutPopupParameters('', 'file://{resources}/layout/popups/popup_inventory_inspect.xml', 'itemid=' + itemId +
                            '&' + 'inspectonly=true' +
                            '&' + 'showequip=false' +
                            '&' + 'allowsave=false' +
                            'none');
                    }
                });
            }
        } catch (error) {
            // Handle error if necessary
        }
    }

    function PopulateItems(bFirstTime = false, claimedItemId = '') {
        try {
            const objStore = InventoryAPI.GetCacheTypeElementJSOByIndex ? InventoryAPI.GetCacheTypeElementJSOByIndex(0) : null;
            if (!objStore) return;
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
        } catch (error) {
            // Handle error if necessary
        }
    }

    function _UpdateTime() {
        try {
            let secRemaining = StoreAPI.GetSecondsUntilXpRollover();
            $.GetContextPanel().SetDialogVariable('time-to-week-rollover', (secRemaining > 0) ? FormatText.SecondsToSignificantTimeString(secRemaining) : '');
            const xpBonuses = MyPersonaAPI.GetActiveXpBonuses();
            const bEligibleForCarePackage = xpBonuses.split(',').includes('2');
            if (bEligibleForCarePackage) {
                $.GetContextPanel().SetDialogVariable('frame-desc-text', $.Localize('#rankup_redemption_store_refresh', $.GetContextPanel()));
            } else {
                $.GetContextPanel().SetDialogVariable('frame-desc-text', $.Localize('#rankup_redemption_store_wait', $.GetContextPanel()));
            }
        } catch (error) {
            // Handle error if necessary
        }
    }

    function _UpdateStoreState() {
        try {
            const objStore = InventoryAPI.GetCacheTypeElementJSOByIndex ? InventoryAPI.GetCacheTypeElementJSOByIndex(0) : null;
            if (!objStore) {
                _CloseStore(false);
                return;
            }
            const storeBalance = objStore.redeemable_balance || 0;
            m_redeemableBalance = storeBalance;
            if (storeBalance <= 0) {
                _CloseStore(true);
            } else {
                _EnableStore();
            }
        } catch (error) {
            // Handle error if necessary
        }
    }

    function _EnableStore() {
        $.GetContextPanel().AddClass('store-open');
        $.GetContextPanel().RemoveClass('store-closed');
        _UpdateTime();
        $.Schedule(30.0, _UpdateStoreState);
    }

    function _CloseStore(bNoDropsEarned) {
        $.GetContextPanel().RemoveClass('store-open');
        $.GetContextPanel().AddClass('store-closed');
        if (bNoDropsEarned) {
            $.GetContextPanel().AddClass('no-drops-earned');
        }
        const elItemContainer = $.GetContextPanel().FindChildTraverse('jsRrsItemContainer');
        elItemContainer.RemoveAndDeleteChildren();
        if (m_schTimer) {
            $.CancelScheduled(m_schTimer);
            m_schTimer = null;
        }
    }

RankUpRedemptionStore.OnRedeem = function () {
    // Handle redeem logic here

    // Play a sound to confirm the button press
    $.DispatchEvent('PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE');

    // Optionally, update the UI to indicate the button was pressed
    let elButton = $.GetContextPanel().FindChildTraverse('jsRrsClaimButton');
    if (elButton) {
        elButton.AddClass('pressed');
        $.Schedule(0.5, () => elButton.RemoveClass('pressed')); // Remove the class after 0.5 seconds
    }

    // Add your redeem logic here
};

    RankUpRedemptionStore.UpdateLevelProgress = function (level, progress) {
        let elXpBarInner = $.GetContextPanel().FindChildTraverse('JsPlayerXpBarInner');
        if (elXpBarInner) {
            elXpBarInner.style.width = progress + '%';
            $.GetContextPanel().SetDialogVariableInt('level', level);
        }
    };

    RegisterForInventoryUpdate();
})(RankUpRedemptionStore || (RankUpRedemptionStore = {}));
