"use strict";
/// <reference path="../csgo.d.ts" />
/// <reference path="iteminfo.ts" />
/// <reference path="../generated/items_event_current_generated_store.d.ts" />
/// <reference path="../generated/items_event_current_generated_store.ts" />
var StoreItems;
(function (StoreItems) {
    let m_oItemsByCategory = {
        coupon: [],
        tournament: [],
        prime: [],
        market: [],
        key: [],
        store: []
    };
    function MakeStoreItemList() {
        let count = StoreAPI.GetBannerEntryCount();
        if (!count || count < 1) {
            return;
        }
        m_oItemsByCategory = {
            coupon: [],
            tournament: [],
            prime: [],
            market: [],
            key: [],
            store: []
        };
        let isPerfectWorld = (MyPersonaAPI.GetLauncherType() === "perfectworld");
        let strBannerEntryCustomFormatString;
        for (let i = 0; i < count; i++) {
            let ItemId = StoreAPI.GetBannerEntryDefIdx(i);
            let FauxItemId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex(ItemId, 0);
            if (!isPerfectWorld &&
                InventoryAPI.IsTool(FauxItemId) &&
                InventoryAPI.GetItemCapabilityByIndex(FauxItemId, 0) === 'decodable') {
                m_oItemsByCategory.key.push({ id: FauxItemId });
            }
            else if (StoreAPI.IsBannerEntryMarketLink(i)) {
                m_oItemsByCategory.market.push({ id: FauxItemId, isMarketItem: true });
            }
            else if ((strBannerEntryCustomFormatString = StoreAPI.GetBannerEntryCustomFormatString(i)).startsWith("coupon")) {
                if (!AllowDisplayingItemInStore(FauxItemId))
                    continue;
                let obj = { id: FauxItemId };
                let sLinkedCoupon = StoreAPI.GetBannerEntryLinkedCoupon(i);
                if (sLinkedCoupon) {
                    let LinkedItemId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex(parseInt(sLinkedCoupon), 0);
                    obj.linkedid = LinkedItemId;
                }
                if (strBannerEntryCustomFormatString === "coupon_new") {
                    obj.isNewRelease = true;
                    if (!sLinkedCoupon) {
                        obj.activationType = 'newstore';
                    }
                }
                m_oItemsByCategory.coupon.push(obj);
            }
            else {
                if (!AllowDisplayingItemInStore(FauxItemId))
                    continue;
                m_oItemsByCategory.store.push({ id: FauxItemId });
            }
        }
        GetTournamentItems();
    }
    StoreItems.MakeStoreItemList = MakeStoreItemList;
    function AllowDisplayingItemInStore(FauxItemId) {
        let idToCheckForRestrictions = FauxItemId;
        let bIsCouponCrate = InventoryAPI.IsCouponCrate(idToCheckForRestrictions);
        if (bIsCouponCrate && InventoryAPI.GetLootListItemsCount(idToCheckForRestrictions) > 0) {
            idToCheckForRestrictions = InventoryAPI.GetLootListItemIdByIndex(idToCheckForRestrictions, 0);
        }
        let sDefinitionName = InventoryAPI.GetItemDefinitionName(idToCheckForRestrictions);
        if (sDefinitionName === "crate_stattrak_swap_tool")
            return true;
        let bIsDecodable = ItemInfo.ItemHasCapability(idToCheckForRestrictions, 'decodable');
        let sRestriction = bIsDecodable ? InventoryAPI.GetDecodeableRestriction(idToCheckForRestrictions) : null;
        if (sRestriction === "restricted" || sRestriction === "xray") {
            return false;
        }
        return true;
    }
    function GetStoreItems() {
        return m_oItemsByCategory;
    }
    StoreItems.GetStoreItems = GetStoreItems;
    function GetStoreItemData(type, idx) {
        return m_oItemsByCategory[type][idx];
    }
    StoreItems.GetStoreItemData = GetStoreItemData;
    function GetTournamentItems() {
        let sRestriction = InventoryAPI.GetDecodeableRestriction("capsule");
        let bCanSellCapsules = (sRestriction !== "restricted" && sRestriction !== "xray");
        for (let i = 0; i < g_ActiveTournamentStoreLayout.length; i++) {
            if (!bCanSellCapsules && i >= g_ActiveTournamentInfo.num_global_offerings) {
                return;
            }
            let bContainsJustChampions = (typeof g_ActiveTournamentStoreLayout[i][1] === 'string');
            let FauxItemId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex(g_ActiveTournamentStoreLayout[i][0], 0);
            let GroupName = g_ActiveTournamentStoreLayout[i][2] ? g_ActiveTournamentStoreLayout[i][2] : '';
            let warning = warningTextTournamentItems(isPurchaseable(FauxItemId), FauxItemId);
            let itemPrice = ItemInfo.GetStoreSalePrice(FauxItemId, 1);
            if (itemPrice || bContainsJustChampions) {
                let storeItem = {
                    id: FauxItemId,
                    useTinyNames: true
                };
                storeItem.isDisabled = !isPurchaseable(FauxItemId);
                storeItem.isNotReleased = !isPurchaseable(FauxItemId);
                if (!bContainsJustChampions) {
                    storeItem.linkedid = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex(g_ActiveTournamentStoreLayout[i][1], 0);
                }
                if (GroupName) {
                    storeItem.groupName != GroupName;
                }
                if (warning) {
                    storeItem.linkedWarning = warning;
        }
    }
    function warningTextTournamentItems(isPurchaseable, itemid) {
        return !isPurchaseable
            ? '#tournament_items_not_released_1'
            : InventoryAPI.GetItemTypeFromEnum(itemid) === 'type_tool' ? '#tournament_items_notice' : '';
    }
    function isPurchaseable(itemid) {
        let schemaString = InventoryAPI.BuildItemSchemaDefJSON(itemid);
        if (!schemaString)
            return false;
        let itemSchemaDef = JSON.parse(schemaString);
        return itemSchemaDef["cannot_inspect"] === 1 ? false : true;
    }
})(StoreItems || (StoreItems = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmVfaXRlbXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9jb250ZW50L2NzZ28vcGFub3JhbWEvc2NyaXB0cy9jb21tb24vc3RvcmVfaXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFDQUFxQztBQUNyQyxvQ0FBb0M7QUFDcEMsOEVBQThFO0FBQzlFLDRFQUE0RTtBQXNCNUUsSUFBVSxVQUFVLENBME1uQjtBQTFNRCxXQUFVLFVBQVU7SUFJbkIsSUFBSSxrQkFBa0IsR0FBc0I7UUFDM0MsTUFBTSxFQUFFLEVBQUU7UUFDVixVQUFVLEVBQUUsRUFBRTtRQUNkLEtBQUssRUFBRSxFQUFFO1FBQ1QsTUFBTSxFQUFFLEVBQUU7UUFDVixHQUFHLEVBQUUsRUFBRTtRQUNQLEtBQUssRUFBRSxFQUFFO0tBQ1QsQ0FBQztJQUVGLFNBQWdCLGlCQUFpQjtRQUVoQyxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzQyxJQUFLLENBQUMsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQ3hCO1lBQ0MsT0FBTztTQUNQO1FBRUQsa0JBQWtCLEdBQUc7WUFDcEIsTUFBTSxFQUFFLEVBQUU7WUFDVixVQUFVLEVBQUUsRUFBRTtZQUNkLEtBQUssRUFBRSxFQUFFO1lBQ1QsTUFBTSxFQUFFLEVBQUU7WUFDVixHQUFHLEVBQUUsRUFBRTtZQUNQLEtBQUssRUFBRSxFQUFFO1NBQ1QsQ0FBQztRQUVGLElBQUksY0FBYyxHQUFHLENBQUUsWUFBWSxDQUFDLGVBQWUsRUFBRSxLQUFLLGNBQWMsQ0FBRSxDQUFDO1FBQzNFLElBQUksZ0NBQXdDLENBQUM7UUFFN0MsS0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFDL0I7WUFDQyxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUUsQ0FBQyxDQUFFLENBQUM7WUFD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