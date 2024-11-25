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
            }

            if (!storeItems || typeof storeItems !== 'object') {
                return;
            }
        } catch (e) {
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
            elParent.style.backgroundImage = 'url("file://{images}/backgrounds/store_home_' + category + '.png")';
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
    let oItemsByCategory = StoreItems.GetStoreItems();
    let aItemsList = oItemsByCategory[typeKey];

    // Ensure the number of panels matches the number of items
    let numItems = aItemsList.length;

    // Make sure the panel is visible
    elList.visible = true;

    // Loop through the items and either create or update panels
    for (let i = 0; i < numItems; i++) {
        let item = aItemsList[i];
        let itemPanel = elList.FindChildInLayoutFile(item.id);

        // If the panel doesn't exist, create a new one
        if (!itemPanel) {
            itemPanel = $.CreatePanel("Button", elList, item.id);
            itemPanel.BLoadLayout('file://{resources}/layout/itemtile_store.xml', false, false);
        }

        // Update the item in the panel
        UpdateItem(itemPanel, typeKey, i);
    }

    // Remove extra panels if there are more than necessary
    for (let i = numItems; i < elList.Children().length; i++) {
        let extraPanel = elList.Children()[i];
        if (extraPanel) {
            extraPanel.DeleteAsync(0);
        }
    }

    // Refresh the list to immediately show the updated items
    elList.SetHasClass('Active', true);
}
function activateHomeButton() {
    // Directly navigate to the home tab and reload the content
    MainMenuStore.NavigateToTab('id-store-page-home');
    
    // Get the parent container of the store pages
    const storePanel = $.GetContextPanel().FindChildInLayoutFile('id-store-pages');
    
    // Temporarily hide the entire store panel to reset it
    storePanel.SetHasClass('hidden', true);
    
    // Use $.Schedule to delay re-showing the panel to ensure content is cleared and reloaded
    $.Schedule(0.1, function() {
        storePanel.SetHasClass('hidden', false);  // Show again to trigger reload
        MainMenuStore.NavigateToTab('id-store-page-home');  // Navigate to home again to ensure fresh load
    });
}

// Trigger the home button press and reload action
$.Schedule(0.1, function() {
    activateHomeButton();
});

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
