"use strict";
/// <reference path="csgo.d.ts" />
/// <reference path="common/formattext.ts" />
/// <reference path="common/iteminfo.ts" />
/// <reference path="common/store_items.ts" />
/// <reference path="common/prime_button_action.ts" />
/// <reference path="itemtile_store.ts" />
/// <reference path="generated/items_event_current_generated_store.d.ts" />
var MainMenuStore;
(function (MainMenuStore) {
    const _m_cp = $.GetContextPanel();
    let _m_activePanelId = '';
    let _m_pagePrefix = 'id-store-page-';
    let _m_inventoryUpdatedHandler;
    function ReadyForDisplay() {
        if (!ConnectedToGcCheck()) {
            return;
        }
        _m_inventoryUpdatedHandler = $.RegisterForUnhandledEvent('PanoramaComponent_MyPersona_InventoryUpdated', ShowPrimePanelOnHomePage);
        if (_m_activePanelId === '' ||
            !_m_activePanelId ||
            (StoreItems.GetStoreItems().coupon && StoreItems.GetStoreItems().coupon.length < 1)) {
            StoreItems.MakeStoreItemList();
        }
        ShowPrimePanelOnHomePage();
        MakeTabsBtnsFromStoreData();
        let openToSection = _m_cp.GetAttributeString('set-active-section', '');
        if (_m_activePanelId === '' || !_m_activePanelId || openToSection !== '') {
            SetDefaultTab(openToSection);
        }
        else {
            NavigateToTab(_m_activePanelId);
        }
        AccountWalletUpdated();
    }
    function UnreadyForDisplay() {
        if (_m_inventoryUpdatedHandler) {
            $.UnregisterForUnhandledEvent('PanoramaComponent_MyPersona_InventoryUpdated', _m_inventoryUpdatedHandler);
            _m_inventoryUpdatedHandler = null;
        }
    }
    function ConnectedToGcCheck() {
        if (!MyPersonaAPI.IsInventoryValid() || !MyPersonaAPI.IsConnectedToGC()) {
            UiToolkitAPI.ShowGenericPopupOk($.Localize('#SFUI_SteamConnectionErrorTitle'), $.Localize('#SFUI_Steam_Error_LinkUnexpected'), '', () => $.DispatchEvent('HideContentPanel'));
            return false;
        }
        return true;
    }
    function ShowPrimePanelOnHomePage() {
        let bHasPrime = FriendsListAPI.GetFriendPrimeEligible(MyPersonaAPI.GetXuid());
        let elUpsellPanel = $.GetContextPanel().FindChildInLayoutFile('id-prime-background');
        elUpsellPanel.SetHasClass('hidden', bHasPrime);
        if (!bHasPrime) {
            PrimeButtonAction.SetUpPurchaseBtn(_m_cp.FindChildInLayoutFile('id-store-buy-prime'));
        }
        $.GetContextPanel().FindChildInLayoutFile('id-rewards-background').SetHasClass('hidden', !bHasPrime);
    }
    function SetDefaultTab(openToSection) {
        let navBtn = null;
        if (openToSection !== '') {
            navBtn = _m_cp.FindChildInLayoutFile(openToSection);
            _m_cp.SetAttributeString('set-active-section', '');
        }
        else if (_m_activePanelId === '' || !_m_activePanelId) {
            navBtn = _m_cp.FindChildInLayoutFile('id-store-nav-home');
        }
        if (navBtn) {
            $.DispatchEvent("Activated", navBtn, "mouse");
            navBtn.checked = true;
        }
    }
    function NavigateToTab(panelId, keyType = '') {
        if (keyType) {
            panelId = _m_pagePrefix + keyType;
        }
        if (_m_activePanelId !== panelId) {
            if (panelId === 'id-store-page-home') {
                UpdateItemsInHomeSection('coupon', 'id-store-popular-items', 6);
                UpdateItemsInHomeSection('tournament', 'id-store-tournament-items', 4);
            }
            else {
                MakePageFromStoreData(keyType);
            }
            if (_m_activePanelId) {
                _m_cp.FindChildInLayoutFile(_m_activePanelId).SetHasClass('Active', false);
            }
            _m_activePanelId = panelId;
            let activePanel = _m_cp.FindChildInLayoutFile(panelId);
            activePanel.SetHasClass('Active', true);
        }
    }
    MainMenuStore.NavigateToTab = NavigateToTab;
    function UpdateItemsInHomeSection(catagory, parentId, numItemsToShow) {
        let elPanel = _m_cp.FindChildInLayoutFile(parentId);
        let elParent = _m_cp.FindChildInLayoutFile('id-store-home-section-' + catagory);
        elParent.style.backgroundImage = 'url("file://{images}/backgrounds/store_home_' + catagory + '.psd")';
        elParent.style.backgroundPosition = '50% 50%';
        elParent.style.backgroundSize = 'cover';
        let oItemsByCategory = StoreItems.GetStoreItems();
        let aItemsList = oItemsByCategory[catagory];
        if (aItemsList.length < 1) {
            elParent.visible = false;
            return;
        }
        elParent.visible = true;
        for (let i = 0; i < numItemsToShow; i++) {
            let elTile = elPanel.FindChildInLayoutFile('home-' + catagory + '-' + i);
            if (!elTile) {
                elTile = $.CreatePanel("Button", elPanel, 'home-' + catagory + '-' + i);
                elTile.BLoadLayout('file://{resources}/layout/itemtile_store.xml', false, false);
            }
            UpdateItem(elTile, catagory, i);
        }
    }
    function MakeTabsBtnsFromStoreData() {
        let elParent = _m_cp.FindChildInLayoutFile('id-store-lister-tabs');
        let oItemsByCategory = StoreItems.GetStoreItems();
        for (let [key, value] of Object.entries(oItemsByCategory)) {
            let panelIdString = 'id-store-nav-' + key;
            let elButton = elParent.FindChildInLayoutFile(panelIdString);
            if (value.length > 0 && !elButton) {
                elButton = $.CreatePanel('RadioButton', elParent, panelIdString, {
                    group: 'store-top-nav',
                    class: 'content-navbar__tabs__btn'
                });
                let btnString = key === 'tournament' ?
                    `#store_nav_${key}_${g_ActiveTournamentInfo.eventid}` :
                    `#store_nav_${key}`;
                $.CreatePanel('Label', elButton, '', {
                    text: btnString
                });
                elButton.SetPanelEvent('onactivate', () => {
                    NavigateToTab(_m_pagePrefix + key, key);
                });
            }
        }
    }
    function MakePageFromStoreData(typeKey) {
        let panelIdString = _m_pagePrefix + typeKey;
        let elParent = _m_cp.FindChildInLayoutFile('id-store-pages');
        let elPanel = elParent.FindChildInLayoutFile(panelIdString);
        if (!elPanel) {
            elPanel = $.CreatePanel('JSDelayLoadList', elParent, panelIdString, {
                class: 'store-dynamic-lister',
                itemwidth: "178px",
                itemheight: "280px",
                spacersize: "4px",
                spacerperiod: "4px"
            });
            UpdateDynamicLister(elPanel, typeKey);
        }
    }
    function UpdateDynamicLister(elList, typeKey) {
        let oItemsByCategory = StoreItems.GetStoreItems();
        let aItemsList = oItemsByCategory[typeKey];
        elList.SetLoadListItemFunction((parent, nPanelIdx, reusePanel) => {
            if (!reusePanel || !reusePanel.IsValid()) {
                reusePanel = $.CreatePanel("Button", elList, aItemsList[nPanelIdx].id);
                reusePanel.BLoadLayout('file://{resources}/layout/itemtile_store.xml', false, false);
            }
            UpdateItem(reusePanel, typeKey, nPanelIdx);
            return reusePanel;
        });
        elList.UpdateListItems(aItemsList.length);
    }
    function UpdateItem(elPanel, typeKey, idx) {
        let oItemData = StoreItems.GetStoreItemData(typeKey, idx);
        ItemTileStore.Init(elPanel, oItemData);
    }
    function GotoStorePage(location) {
        let navBtn = _m_cp.FindChildInLayoutFile(location);
        $.DispatchEvent("Activated", navBtn, "mouse");
        navBtn.checked = true;
    }
    MainMenuStore.GotoStorePage = GotoStorePage;
    function AccountWalletUpdated() {
        var elBalance = _m_cp.FindChildInLayoutFile('id-store-nav-wallet');
        if ((MyPersonaAPI.GetLauncherType() === 'perfectworld') && (MyPersonaAPI.GetSteamType() !== 'china')) {
            elBalance.RemoveClass('hidden');
            elBalance.text = '#Store_SteamChina_Wallet';
            return;
        }
        var balance = (MyPersonaAPI.GetLauncherType() === 'perfectworld') ? StoreAPI.GetAccountWalletBalance() : '';
        if (balance === '' || balance === undefined || balance === null) {
            elBalance.AddClass('hidden');
        }
        else {
            elBalance.SetDialogVariable('balance', balance);
            elBalance.RemoveClass('hidden');
        }
    }
    {
        ReadyForDisplay();
        let elJsStore = $('#JsMainMenuStore');
        $.RegisterEventHandler('ReadyForDisplay', elJsStore, ReadyForDisplay);
        $.RegisterEventHandler('UnreadyForDisplay', elJsStore, UnreadyForDisplay);
        $.RegisterForUnhandledEvent('PanoramaComponent_Store_AccountWalletUpdated', AccountWalletUpdated);
        $.RegisterForUnhandledEvent('PanoramaComponent_Store_PriceSheetChanged', ReadyForDisplay);
    }
})(MainMenuStore || (MainMenuStore = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbm1lbnVfc3RvcmVfZnVsbHNjcmVlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2NvbnRlbnQvY3Nnby9wYW5vcmFtYS9zY3JpcHRzL21haW5tZW51X3N0b3JlX2Z1bGxzY3JlZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGtDQUFrQztBQUNsQyw2Q0FBNkM7QUFDN0MsMkNBQTJDO0FBQzNDLDhDQUE4QztBQUM5QyxzREFBc0Q7QUFDdEQsMENBQTBDO0FBQzFDLDJFQUEyRTtBQUUzRSxJQUFVLGFBQWEsQ0FxU3RCO0FBclNELFdBQVUsYUFBYTtJQUV0QixNQUFNLEtBQUssR0FBWSxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0MsSUFBSSxnQkFBZ0IsR0FBVyxFQUFFLENBQUM7SUFDbEMsSUFBSSxhQUFhLEdBQUcsZ0JBQWdCLENBQUM7SUFDckMsSUFBSSwwQkFBeUMsQ0FBQztJQUU5QyxTQUFTLGVBQWU7UUFHdkIsSUFBSyxDQUFDLGtCQUFrQixFQUFFLEVBQzFCO1lBQ0MsT0FBTztTQUNQO1FBRUQsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDLHlCQUF5QixDQUFFLDhDQUE4QyxFQUFFLHdCQUF3QixDQUFFLENBQUM7UUFFckksSUFBSyxnQkFBZ0IsS0FBSyxFQUFFO1lBQzNCLENBQUMsZ0JBQWdCO1lBQ2pCLENBQUUsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsTUFBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUUsRUFDdkY7WUFDQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUMvQjtRQUdELHdCQUF3QixFQUFFLENBQUM7UUFDM0IseUJBQXlCLEVBQUUsQ0FBQztRQUc1QixJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUUsb0JBQW9CLEVBQUUsRUFBRSxDQUFFLENBQUM7UUFDekUsSUFBSyxnQkFBZ0IsS0FB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