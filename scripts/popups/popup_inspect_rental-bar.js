"use strict";
/// <reference path="../csgo.d.ts" />
/// <reference path="../common/iteminfo.ts" />
/// <reference path="popup_acknowledge_item.ts" />
/// <reference path="popup_capability_decodable.ts" />
var InspectRentalBar;
(function (InspectRentalBar) {
    let m_itemId = '';
    let m_itemToUseId = '';
    let m_worktype = '';
    let m_elPanel = null;
    let m_popupActionCallbackHandle = null;
    let m_scheduleActionTimoutHandle = null;
    let m_bPanelRegisteredForEvents = false;
    let m_confirmPopUpOpen = false;
    let m_onlyRentalItemIds = [];
    let m_actionType = '';
    let m_keyToSellId = '';
    function Init(elPanel, itemId, ItemToUseId, keyToSellId, funcGetSettingCallback) {
        m_itemId = itemId;
        m_itemToUseId = ItemToUseId;
        m_keyToSellId = keyToSellId;
        m_elPanel = elPanel;
        m_worktype = funcGetSettingCallback('asyncworktype', '');
        let allowRental = (funcGetSettingCallback('allow-rent', 'no') === 'yes');
        let sRestriction = (funcGetSettingCallback('restriction', ''));
        let showXrayMachineUi = (funcGetSettingCallback('showXrayMachineUi', 'no') === 'yes');
        let isXrayRestriction = sRestriction === 'xray';
        if ((funcGetSettingCallback('inspectonly', 'false') === 'true') ||
            m_worktype !== 'decodeable' ||
            !allowRental ||
            (keyToSellId && !sRestriction) ||
            showXrayMachineUi ||
            !InventoryAPI.IsValidItemID(m_itemId)) {
            elPanel.AddClass('hidden');
            return;
        }
        elPanel.RemoveClass('hidden');
        elPanel.SetHasClass('show-xray-buttons', sRestriction !== '');
        _SetNumLootlistItems();
        _SetuUpButtonsBasedOnRestrictions(sRestriction);
        if (!isXrayRestriction && ItemToUseId) {
            m_elPanel.FindChildInLayoutFile('UseItemImage').itemid = ItemToUseId;
            _SetDescString();
        }
        if (!m_bPanelRegisteredForEvents) {
            m_bPanelRegisteredForEvents = true;
            $.RegisterForUnhandledEvent('PanoramaComponent_MyPersona_InventoryUpdated', _OnMyPersonaInventoryUpdated);
        }
    }
    InspectRentalBar.Init = Init;
    function _SetDescString() {
        let elLabel = m_elPanel.FindChildInLayoutFile('UseItemName');
        elLabel.SetDialogVariable('itemname', InventoryAPI.GetItemName(m_itemToUseId));
        elLabel.text = $.Localize('#popup_' + m_worktype + '_async_desc', elLabel);
        elLabel.visible = true;
    }
    function _SetuUpButtonsBasedOnRestrictions(sRestriction) {
        if (sRestriction) {
            let elPurchaseBtn = m_elPanel.FindChildInLayoutFile('PurchaseKeyBtn');
            let elXrayRentBtn = m_elPanel.FindChildInLayoutFile('RentBtnXray');
            if (m_keyToSellId) {
                elPurchaseBtn.SetHasClass('hide', false);
                elXrayRentBtn.SetHasClass('hide', true);
                elPurchaseBtn.FindChildInLayoutFile('SellItemImage').itemid = m_keyToSellId;
                m_elPanel.SetDialogVariable('itemname', InventoryAPI.GetItemName(m_keyToSellId));
                m_elPanel.SetDialogVariable("price", ItemInfo.GetStoreSalePrice(m_keyToSellId, 1));
                elPurchaseBtn.SetPanelEvent('onactivate', () => {
                    StoreAPI.StoreItemPurchase(m_keyToSellId);
                    m_confirmPopUpOpen = true;
                });
                if (sRestriction === 'xray')
                    _HoverEvents(elPurchaseBtn, null);
            }
            else {
                elPurchaseBtn.SetHasClass('hide', true);
                elXrayRentBtn.SetHasClass('hide', false);
                elXrayRentBtn.SetPanelEvent('onactivate', () => {
                    _SetUpRentActionBtn('rent');
                });
                if (sRestriction === 'xray')
                    _HoverEvents(elXrayRentBtn, null);
            }
            let xrayBtn = m_elPanel.FindChildInLayoutFile('OpenXray');
            xrayBtn.SetHasClass('hide', sRestriction === 'restricted');
            if (sRestriction !== 'restricted') {
                xrayBtn.SetPanelEvent('onactivate', () => {
                    $.DispatchEvent("ShowXrayCasePopup", '', m_itemId, false);
                    ClosePopup();
                });
                _HoverEvents(null, xrayBtn);
            }
            if (sRestriction === 'restricted') {
                m_elPanel?.GetParent().GetParent().SetHasClass('rental-mode', true);
            }
        }
        else {
            let RentBtn = m_elPanel.FindChildInLayoutFile('RentBtn');
            let ActionBtn = m_elPanel.FindChildInLayoutFile('OpenBtn');
            _HoverEvents(RentBtn, ActionBtn);
            RentBtn.SetPanelEvent('onactivate', () => {
                _SetUpRentActionBtn('rent');
            });
            ActionBtn.SetPanelEvent('onactivate', () => {
                OpenConfirmPopup('open');
            });
        }
    }
    function _SetNumLootlistItems() {
        let count = InventoryAPI.GetLootListItemsCount(m_itemId);
        count = InventoryAPI.GetLootListItemIdByIndex(m_itemId, (count - 1)) == '0' ? count - 1 : count;
        m_elPanel?.SetDialogVariableInt('numlootlist', count);
    }
    function _SetUpRentActionBtn(type) {
        let sTimeRemainingString = GetAlreadyRentedItemsExpirationTime();
        m_confirmPopUpOpen = true;
        if (sTimeRemainingString) {
            $.GetContextPanel().SetDialogVariable('time-remaining', sTimeRemainingString);
            $.GetContextPanel().SetDialogVariable('name', InventoryAPI.GetItemName(m_itemId));
            $.GetContextPanel().SetDialogVariable('expiration-time', $.Localize(sTimeRemainingString));
            UiToolkitAPI.ShowGenericPopupOk('#popup_container_confirm_title_rent', $.Localize('#popup_container_confirm_already_rented', $.GetContextPanel()), '', function () { () => { $.DispatchEvent('UIPopupButtonClicked', ''); }; });
        }
        else {
            OpenConfirmPopup(type);
        }
    }
    function OpenConfirmPopup(type) {
        m_popupActionCallbackHandle = UiToolkitAPI.RegisterJSCallback(_OnPopupActionPressed);
        UiToolkitAPI.ShowCustomLayoutPopupParameters('', 'file://{resources}/layout/popups/popup_container_open_confirm.xml', 'action-type=' + type
            + '&' + 'case=' + m_itemId
            + '&' + 'callback=' + m_popupActionCallbackHandle);
    }
    function _OnPopupActionPressed(actionType) {
        _OpenActions();
        m_actionType = actionType;
        if (actionType === 'open') {
            InventoryAPI.UseTool(m_itemToUseId, m_itemId);
            $.DispatchEvent('StartDecodeableAnim');
            return;
        }
        InventoryAPI.UseToolWithIntArg(m_itemToUseId, m_itemId, 1);
        $.DispatchEvent('StartRentalAnim');
        $.Schedule(2.75, ShowRentalInspect);
    }
    function _OpenActions() {
        if (m_popupActionCallbackHandle) {
            UiToolkitAPI.UnregisterJSCallback(m_popupActionCallbackHandle);
        }
        m_elPanel.FindChildInLayoutFile('OpenBtn').SetHasClass('is-active-action', true);
        m_elPanel.FindChildInLayoutFile('OpenBtn').enabled = false;
        m_elPanel.FindChildInLayoutFile('RentBtn').enabled = false;
        _ResetTimeoutHandle();
        m_scheduleActionTimoutHandle = $.Schedule(5, _ShowActionTimeOutPopup);
    }
    function _HoverEvents(RentBtn, ActionBtn) {
        if (RentBtn) {
            RentBtn.SetPanelEvent('onmouseover', () => {
                m_confirmPopUpOpen = false;
                m_elPanel?.GetParent().GetParent().SetHasClass('rental-mode', true);
            });
            RentBtn.SetPanelEvent('onmouseout', () => {
                if (!m_confirmPopUpOpen) {
                    m_elPanel?.GetParent().GetParent().SetHasClass('rental-mode', false);
                }
            });
        }
        if (ActionBtn) {
            ActionBtn.SetPanelEvent('onmouseover', () => {
                m_elPanel?.GetParent().GetParent().SetHasClass('rental-mode', false);
            });
        }
    }
    function GetAlreadyRentedItemsExpirationTime() {
        let defIndex = InventoryAPI.GetItemDefinitionIndex(m_itemId);
        const nRentalHistoryCount = InventoryAPI.GetCacheTypeElementsCount('RentalHistory');
        if (nRentalHistoryCount < 1) {
            return '';
        }
        let nExpirationDate = 0;
        for (let i = 0; i < nRentalHistoryCount; ++i) {
            const oRentalHistory = InventoryAPI.GetCacheTypeElementJSOByIndex('RentalHistory', i);
            if (oRentalHistory.crate_def_index === defIndex) {
                nExpirationDate = nExpirationDate < oRentalHistory.expiration_date ? oRentalHistory.expiration_date : nExpirationDate;
            }
        }
        let oLocData = FormatText.FormatRentalTime(nExpirationDate);
        return oLocData.time;
    }
    function _ShowActionTimeOutPopup() {
        m_scheduleActionTimoutHandle = null;
        if (!m_elPanel || !m_elPanel?.IsValid()) {
            return;
        }
        ClosePopup();
        UiToolkitAPI.ShowGenericPopupOk($.Localize('#SFUI_SteamConnectionErrorTitle'), $.Localize('#SFUI_InvError_Item_Not_Given'), '', () => { });
    }
    InspectRentalBar._ShowActionTimeOutPopup = _ShowActionTimeOutPopup;
    function _ResetTimeoutHandle() {
        if (m_scheduleActionTimoutHandle && typeof m_scheduleActionTimoutHandle === "number") {
            $.CancelScheduled(m_scheduleActionTimoutHandle);
            m_scheduleActionTimoutHandle = null;
        }
    }
    function ClosePopup() {
        _ResetTimeoutHandle();
        $.DispatchEvent('HideSelectItemForCapabilityPopup');
        $.DispatchEvent('UIPopupButtonClicked', '');
        $.DispatchEvent('CapabilityPopupIsOpen', false);
    }
    InspectRentalBar.ClosePopup = ClosePopup;
    function _OnMyPersonaInventoryUpdated() {
        if (m_worktype === 'decodeable') {
            const newItems = AcknowledgeItems.GetItems();
            if (newItems.length > 0 && newItems.filter(entry => entry.pickuptype === 'found_in_crate').length > 0) {
                _ResetTimeoutHandle();
            }
            if (m_actionType === 'rent') {
                newItems.filter(entry => InventoryAPI.IsRental(entry.id)).forEach(entry => {
                    m_onlyRentalItemIds.push(entry.id);
                    InventoryAPI.SetItemSessionPropertyValue(entry.id, 'recent', '1');
                    InventoryAPI.AcknowledgeNewItembyItemID(entry.id);
                });
            }
        }
    }
    function ShowRentalInspect() {
        if (m_onlyRentalItemIds.length > 0) {
            UiToolkitAPI.ShowCustomLayoutPopupParameters('', 'file://{resources}/layout/popups/popup_inventory_inspect.xml', 'itemid=' + m_onlyRentalItemIds[0] +
                '&' + 'inspectonly=true' +
                '&' + 'allowsave=false' +
                '&' + 'showequip=false' +
                '&' + 'showitemcert=true' +
                '&' + 'rentalItems=' + m_onlyRentalItemIds.join(',') +
                '&' + 'caseidforlootlist=' + m_itemId);
            ClosePopup();
        }
        else {
            _ShowActionTimeOutPopup();
        }
    }
})(InspectRentalBar || (InspectRentalBar = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXBfaW5zcGVjdF9yZW50YWwtYmFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vY29udGVudC9jc2dvL3Bhbm9yYW1hL3NjcmlwdHMvcG9wdXBzL3BvcHVwX2luc3BlY3RfcmVudGFsLWJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUNBQXFDO0FBQ3JDLDhDQUE4QztBQUM5QyxrREFBa0Q7QUFDbEQsc0RBQXNEO0FBRXRELElBQVUsZ0JBQWdCLENBc1d6QjtBQXRXRCxXQUFVLGdCQUFnQjtJQUV6QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDbEIsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUNwQixJQUFJLFNBQVMsR0FBbUIsSUFBSSxDQUFDO0lBQ3JDLElBQUksMkJBQTJCLEdBQW1CLElBQUksQ0FBQztJQUN2RCxJQUFJLDRCQUE0QixHQUFtQixJQUFJLENBQUM7SUFDeEQsSUFBSSwyQkFBMkIsR0FBWSxLQUFLLENBQUM7SUFDakQsSUFBSSxrQkFBa0IsR0FBWSxLQUFLLENBQUM7SUFDeEMsSUFBSSxtQkFBbUIsR0FBWSxFQUFFLENBQUM7SUFDdEMsSUFBSSxZQUFZLEdBQVUsRUFBRSxDQUFDO0lBQzdCLElBQUksYUFBYSxHQUFVLEVBQUUsQ0FBQztJQUU5QixTQUFnQixJQUFJLENBQUUsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsV0FBa0IsRUFBRSxXQUFrQixFQUFFLHNCQUFrRTtRQUVqSyxRQUFRLEdBQUcsTUFBTSxDQUFDO1FBQ2xCLGFBQWEsR0FBRyxXQUFXLENBQUM7UUFDNUIsYUFBYSxHQUFHLFdBQVcsQ0FBQztRQUM1QixTQUFTLEdBQUcsT0FBTyxDQUFDO1FBRXBCLFVBQVUsR0FBRyxzQkFBc0IsQ0FBRSxlQUFlLEVBQUUsRUFBRSxDQUFFLENBQUM7UUFFM0QsSUFBSSxXQUFXLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBRSxZ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