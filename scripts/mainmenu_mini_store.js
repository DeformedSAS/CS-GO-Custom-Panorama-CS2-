"use strict";
/// <reference path="csgo.d.ts" />
/// <reference path="common/licenseutil.ts" />
/// <reference path="common/store_items.ts" />
/// <reference path="itemtile_store.ts" />
var MainMenuMiniStore;
(function (MainMenuMiniStore) {
    const _m_StorePanel = $.GetContextPanel();
    function _Init() {
        if (!MyPersonaAPI.IsConnectedToGC()) {
            _m_StorePanel.SetHasClass('hidden', true);
            return;
        }
        let restrictions = LicenseUtil.GetCurrentLicenseRestrictions();
        if (restrictions) {
            _m_StorePanel.SetHasClass('hidden', true);
            return;
        }
        $.GetContextPanel().FindChildInLayoutFile('id-open-fullscreen-store-btn').SetPanelEvent('onactivate', () => {
            $.DispatchEvent('MainMenuGoToStore', '');
        });
        _GetStoreItems();
    }
    function _GetStoreItems() {
        if (StoreItems.GetStoreItems().coupon && StoreItems.GetStoreItems().coupon.length < 1) {
            StoreItems.MakeStoreItemList();
        }
        let aItemsList = StoreItems.GetStoreItems().coupon;
        if (aItemsList.length < 1) {
            _m_StorePanel.SetHasClass('hidden', true);
            return;
        }
        _MakeStoreItemTiles(aItemsList);
        _m_StorePanel.SetHasClass('hidden', false);
    }
    function _MakeStoreItemTiles(aItemsList) {
        let elParent = $.GetContextPanel().FindChildInLayoutFile('id-mini-store-carousel');
        const numItemsToShow = 5;
        for (let i = 0; i < numItemsToShow; i++) {
            let oItemData = aItemsList[i];
            oItemData.isDisplayedInMainMenu = true;
            let elTile = elParent.FindChildInLayoutFile('id-mini-store-tile' + aItemsList[i].id);
            if (!elTile) {
                elTile = $.CreatePanel('Button', elParent, 'id-mini-store-tile' + aItemsList[i].id);
                elTile.BLoadLayout('file://{resources}/layout/itemtile_store.xml', false, false);
            }
            ItemTileStore.Init(elTile, aItemsList[i]);
        }
    }
    {
        _Init();
        $.RegisterForUnhandledEvent('PanoramaComponent_MyPersona_GcLogonNotificationReceived', _Init);
        $.RegisterForUnhandledEvent('PanoramaComponent_MyPersona_UpdateConnectionToGC', _Init);
        $.RegisterForUnhandledEvent('PanoramaComponent_Store_PriceSheetChanged', _Init);
    }
})(MainMenuMiniStore || (MainMenuMiniStore = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbm1lbnVfbWluaV9zdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2NvbnRlbnQvY3Nnby9wYW5vcmFtYS9zY3JpcHRzL21haW5tZW51X21pbmlfc3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGtDQUFrQztBQUNsQyw4Q0FBOEM7QUFDOUMsOENBQThDO0FBQzlDLDBDQUEwQztBQUUxQyxJQUFVLGlCQUFpQixDQW1GMUI7QUFuRkQsV0FBVSxpQkFBaUI7SUFFMUIsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBRTFDLFNBQVMsS0FBSztRQUliLElBQUssQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLEVBQ3BDO1lBQ0MsYUFBYSxDQUFDLFdBQVcsQ0FBRSxRQUFRLEVBQUUsSUFBSSxDQUFFLENBQUM7WUFDNUMsT0FBTztTQUNQO1FBRUQsSUFBSSxZQUFZLEdBQUcsV0FBVyxDQUFDLDZCQUE2QixFQUFFLENBQUM7UUFDL0QsSUFBSSxZQUFZLEVBQ2hCO1lBRUMsYUFBYSxDQUFDLFdBQVcsQ0FBRSxRQUFRLEVBQUUsSUFBSSxDQUFFLENBQUM7WUFDNUMsT0FBTztTQUNQO1FBRUQsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLHFCQUFxQixDQUFFLDhCQUE4QixDQUFFLENBQUMsYUFBYSxDQUFFLFlBQVksRUFBRSxHQUFFLEVBQUU7WUFDNUcsQ0FBQyxDQUFDLGFBQWEsQ0FBRSxtQkFBbUIsRUFBRSxFQUFFLENBQUUsQ0FBQztRQUM1QyxDQUFDLENBQUMsQ0FBQztRQUVILGNBQWMsRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxTQUFTLGNBQWM7UUFLdEIsSUFBSyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxNQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDdkY7WUFDQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUMvQjtRQUVELElBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxNQUF1QixDQUFDO1FBRXBFLElBQUssVUFBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQzNCO1lBQ0MsYUFBYSxDQUFDLFdBQVcsQ0FBRSxRQUFRLEVBQUUsSUFBSSxDQUFFLENBQUM7WUFDNUMsT0FBTztTQUNQO1FBRUQsbUJBQW1CLENBQUUsVUFBVSxDQUFFLENBQUM7UUFDbEMsYUFBYSxDQUFDLFdBQVcsQ0FBRSxRQUFRLEVBQUUsS0FBSyxDQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVELFNBQVMsbUJBQW1CLENBQUUsVUFBd0I7UUFHckQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLHFCQUFxQixDQUFFLHdCQUF3QixDQUFFLENBQUM7UUFDckYsTUFBTSxjQUFjLEdBQVcsQ0FBQyxDQUFDO1FBQ2pDLEtBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLEVBQUUsQ0FBQyxFQUFFLEVBQ3hDO1lBQ0MsSUFBSSxTQUFTLEdBQWdCLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQyxTQUFTLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1lBR3ZDLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBRSxvQkFBb0IsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEYsSUFBSyxDQUFDLE1BQU0sRUFDWjtnQkFDQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQWMsQ0FBQztnQkFDbEcsTUFBTSxDQUFDLFdBQVcsQ0FBRSw4Q0FBOEMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUM7YUFDbkY7WUFFRCxhQUFhLENBQUMsSUFBSSxDQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQztTQUM1QztJQUNGLENBQUM7SUFLRDtRQUNDLEtBQUssRUFBRSxDQUFDO1FBQ1IsQ0FBQyxDQUFDLHlCQUF5QixDQUFFLHlEQUF5RCxFQUFFLEtBQUssQ0FBRSxDQUFDO1FBQ2hHLENBQUMsQ0FBQyx5QkFBeUIsQ0FBRSxrREFBa0QsRUFBRSxLQUFLLENBQUUsQ0FBQztRQUV6RixDQUFDLENBQUMseUJBQXlCLENBQUUsMkNBQTJDLEVBQUUsS0FBSyxDQUFFLENBQUM7S0FDbEY7QUFDRixDQUFDLEVBbkZTLGlCQUFpQixLQUFqQixpQkFBaUIsUUFtRjFCIn0=