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

        try {
            let storeItems = StoreItems.GetStoreItems();
            if (_m_activePanelId === '' || !_m_activePanelId || (storeItems.coupon && storeItems.coupon.length < 1)) {
                StoreItems.MakeStoreItemList();
                storeItems = StoreItems.GetStoreItems(); // Re-fetch after making the list
            }

            if (!storeItems || typeof storeItems !== 'object') {
                $.Msg('StoreItems.GetStoreItems() returned an invalid object:', storeItems);
                return;
            }
        } catch (e) {
            $.Msg('Error accessing StoreItems:', e);
            return;
        }

        ShowPrimePanelOnHomePage();
        MakeTabsBtnsFromStoreData();

        let openToSection = _m_cp.GetAttributeString('set-active-section', '');
        if (_m_activePanelId === '' || !_m_activePanelId || openToSection !== '') {
            SetDefaultTab(openToSection);
        } else {
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
            UiToolkitAPI.ShowGenericPopupOk(
                $.Localize('#SFUI_SteamConnectionErrorTitle'),
                $.Localize('#SFUI_Steam_Error_LinkUnexpected'),
                '',
                () => $.DispatchEvent('HideContentPanel')
            );
            return false;
        }
        return true;
    }

    function ShowPrimePanelOnHomePage() {
        let bHasPrime = FriendsListAPI.GetFriendPrimeEligible(MyPersonaAPI.GetXuid());
        let elUpsellPanel = $.GetContextPanel().FindChildInLayoutFile('id-prime-background');

        if (elUpsellPanel) {
            elUpsellPanel.SetHasClass('hidden', bHasPrime);

            if (!bHasPrime) {
                PrimeButtonAction.SetUpPurchaseBtn(_m_cp.FindChildInLayoutFile('id-store-buy-prime'));
            }
        }

        let elRewardsPanel = $.GetContextPanel().FindChildInLayoutFile('id-rewards-background');

        if (elRewardsPanel) {
            elRewardsPanel.SetHasClass('hidden', !bHasPrime);
        }
    }

    function SetDefaultTab(openToSection) {
        let navBtn = null;

        if (openToSection !== '') {
            navBtn = _m_cp.FindChildInLayoutFile(openToSection);
            _m_cp.SetAttributeString('set-active-section', '');
        } else if (_m_activePanelId === '' || !_m_activePanelId) {
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
            } else {
                MakePageFromStoreData(keyType);
            }

            if (_m_activePanelId) {
                let prevPanel = _m_cp.FindChildInLayoutFile(_m_activePanelId);
                if (prevPanel) {
                    prevPanel.SetHasClass('Active', false);
                }
            }

            _m_activePanelId = panelId;
            let activePanel = _m_cp.FindChildInLayoutFile(panelId);

            if (activePanel) {
                activePanel.SetHasClass('Active', true);
            }
        }
    }
    MainMenuStore.NavigateToTab = NavigateToTab;

    function UpdateItemsInHomeSection(category, parentId, numItemsToShow) {
        let elPanel = _m_cp.FindChildInLayoutFile(parentId);
        let elParent = _m_cp.FindChildInLayoutFile('id-store-home-section-' + category);

        if (elParent && elPanel) {
            elParent.style.backgroundImage = 'url("file://{images}/backgrounds/store_home_' + category + '.psd")';
            elParent.style.backgroundPosition = '50% 50%';
            elParent.style.backgroundSize = 'cover';

            try {
                let oItemsByCategory = StoreItems.GetStoreItems();
                let aItemsList = oItemsByCategory[category];

                if (!aItemsList || aItemsList.length < 1) {
                    elParent.visible = false;
                    return;
                }

                elParent.visible = true;

                for (let i = 0; i < numItemsToShow; i++) {
                    let elTile = elPanel.FindChildInLayoutFile('home-' + category + '-' + i);

                    if (!elTile) {
                        elTile = $.CreatePanel("Button", elPanel, 'home-' + category + '-' + i);
                        elTile.BLoadLayout('file://{resources}/layout/itemtile_store.xml', false, false);
                    }

                    UpdateItem(elTile, category, i);
                }
            } catch (e) {
                $.Msg('Error accessing StoreItems in UpdateItemsInHomeSection:', e);
            }
        }
    }

    function MakeTabsBtnsFromStoreData() {
        let elParent = _m_cp.FindChildInLayoutFile('id-store-lister-tabs');
        try {
            let oItemsByCategory = StoreItems.GetStoreItems();

            if (elParent) {
                for (let [key, value] of Object.entries(oItemsByCategory)) {
                    let panelIdString = 'id-store-nav-' + key;
                    let elButton = elParent.FindChildInLayoutFile(panelIdString);

                    if (value.length > 0 && !elButton) {
                        elButton = $.CreatePanel('RadioButton', elParent, panelIdString, {
                            group: 'store-top-nav',
                            class: 'content-navbar__tabs__btn'
                        });

                        let btnString = key === 'tournament' ? `#store_nav_${key}_${g_ActiveTournamentInfo.eventid}` : `#store_nav_${key}`;
                        $.CreatePanel('Label', elButton, '', { text: btnString });

                        elButton.SetPanelEvent('onactivate', () => {
                            NavigateToTab(_m_pagePrefix + key, key);
                        });
                    }
                }
            }
        } catch (e) {
            $.Msg('Error in MakeTabsBtnsFromStoreData:', e);
        }
    }

function MakePageFromStoreData(typeKey) {
    let panelIdString = _m_pagePrefix + typeKey;
    let elParent = _m_cp.FindChildInLayoutFile('id-store-pages');
    let elPanel = elParent ? elParent.FindChildInLayoutFile(panelIdString) : null;

    if (elParent && !elPanel) {
        elPanel = $.CreatePanel('Panel', elParent, panelIdString, {
            class: 'store-dynamic-lister',
            itemwidth: "178px",
            itemheight: "280px",
            spacersize: "4px",
            spacerperiod: "4px"
        });

        // UpdateDynamicLister should be defined elsewhere
        UpdateDynamicLister(elPanel, typeKey);
    }
}

function UpdateDynamicLister(elList, typeKey) {
    // Check if elList is valid
    if (!elList || !elList.IsValid()) {
        console.error('Invalid panel:', elList);
        return;
    }

    // Fetch the items list based on typeKey
    let oItemsByCategory = StoreItems.GetStoreItems();
    let aItemsList = oItemsByCategory[typeKey];

    if (!Array.isArray(aItemsList)) {
        console.error('Items list is not an array for typeKey:', typeKey);
        return;
    }

    // Clear existing items in the list
    elList.RemoveAndDeleteChildren();

    // Create and add items manually
    aItemsList.forEach((item, index) => {
        let itemPanel = $.CreatePanel("Button", elList, item.id);
        itemPanel.BLoadLayout('file://{resources}/layout/itemtile_store.xml', false, false);
        UpdateItem(itemPanel, typeKey, index);
    });
}

    function UpdateItem(elPanel, typeKey, idx) {
        try {
            let oItemData = StoreItems.GetStoreItemData(typeKey, idx);
            ItemTileStore.Init(elPanel, oItemData);
        } catch (e) {
            $.Msg('Error in UpdateItem:', e);
        }
    }

    function GotoStorePage(location) {
        let navBtn = _m_cp.FindChildInLayoutFile(location);
        if (navBtn) {
            $.DispatchEvent("Activated", navBtn, "mouse");
            navBtn.checked = true;
        }
    }
    MainMenuStore.GotoStorePage = GotoStorePage;

    function AccountWalletUpdated() {
        let elBalance = _m_cp.FindChildInLayoutFile('id-store-nav-wallet');

        if (!elBalance) {
            $.Msg('elBalance element not found!');
            return;
        }

        if ((MyPersonaAPI.GetLauncherType() === 'perfectworld') && (MyPersonaAPI.GetSteamType() !== 'china')) {
            elBalance.RemoveClass('hidden');
            elBalance.text = '#Store_SteamChina_Wallet';
            return;
        }

        let balance = (MyPersonaAPI.GetLauncherType() === 'perfectworld') ? StoreAPI.GetAccountWalletBalance() : '';

        if (balance === '' || balance === undefined || balance === null) {
            elBalance.AddClass('hidden');
        } else {
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
