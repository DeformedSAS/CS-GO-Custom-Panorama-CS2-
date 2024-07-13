"use strict";
/// <reference path="../csgo.d.ts" />
var PrimeButtonAction;
(function (PrimeButtonAction) {
    function SetUpPurchaseBtn(btnPurchase) {
        let sPrice = StoreAPI.GetStoreItemSalePrice(InventoryAPI.GetFauxItemIDFromDefAndPaintIndex(1353, 0), 1, '');
        btnPurchase.SetDialogVariable("price", sPrice ? sPrice : '$0');
        btnPurchase.SetPanelEvent('onactivate', () => {
            SteamOverlayAPI.OpenURL(GetStoreUrl() + '/sub/54029');
            $.DispatchEvent('UIPopupButtonClicked', '');
        });
    }
    PrimeButtonAction.SetUpPurchaseBtn = SetUpPurchaseBtn;
    function GetStoreUrl() {
        return 'https://store.' +
            ((SteamOverlayAPI.GetAppID() == 710) ? 'beta.' : '') +
            ((MyPersonaAPI.GetSteamType() === 'china' || MyPersonaAPI.GetLauncherType() === "perfectworld") ? 'steamchina' : 'steampowered') + '.com';
    }
})(PrimeButtonAction || (PrimeButtonAction = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWVfYnV0dG9uX2FjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2NvbnRlbnQvY3Nnby9wYW5vcmFtYS9zY3JpcHRzL2NvbW1vbi9wcmltZV9idXR0b25fYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQ0FBcUM7QUFFckMsSUFBVSxpQkFBaUIsQ0FzQjFCO0FBdEJELFdBQVUsaUJBQWlCO0lBRTFCLFNBQWdCLGdCQUFnQixDQUFHLFdBQXdCO1FBSzFELElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBRSxZQUFZLENBQUMsaUNBQWlDLENBQUUsSUFBSSxFQUFFLENBQUMsQ0FBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUUsQ0FBQztRQUNoSCxXQUFZLENBQUMsaUJBQWlCLENBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUUsQ0FBQztRQUVsRSxXQUFZLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7WUFDN0MsZUFBZSxDQUFDLE9BQU8sQ0FBRSxXQUFXLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQztZQUN2RCxDQUFDLENBQUMsYUFBYSxDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQVplLGtDQUFnQixtQkFZL0IsQ0FBQTtJQUVELFNBQVMsV0FBVztRQUVuQixPQUFPLGdCQUFnQjtZQUN0QixDQUFDLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNwRCxDQUFDLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxLQUFLLE9BQU8sSUFBSSxZQUFZLENBQUMsZUFBZSxFQUFFLEtBQUssY0FBYyxDQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEdBQUcsTUFBTSxDQUFDO0lBQzdJLENBQUM7QUFDRixDQUFDLEVBdEJTLGlCQUFpQixLQUFqQixpQkFBaUIsUUFzQjFCIn0=