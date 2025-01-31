"use strict";
/// <reference path="csgo.d.ts" />
var Crafting;
(function (Crafting) {
    function _Init() {
        _AddSort();
    }
    function _AddSort() {
        let elDropdown = $.GetContextPanel().FindChildInLayoutFile('CraftingSortDropdown');
        let count = InventoryAPI.GetSortMethodsCount();
        for (let i = 0; i < count; i++) {
            let sort = InventoryAPI.GetSortMethodByIndex(i);
            let newEntry = $.CreatePanel('Label', elDropdown, sort, {
                class: 'DropDownMenu'
            });
            newEntry.text = $.Localize('#' + sort);
            elDropdown.AddOption(newEntry);
        }
        elDropdown.SetSelected(InventoryAPI.GetSortMethodByIndex(1));
    }
    function UpdateButtons() {
        let elTradeUpConfirmBtn = $.GetContextPanel().FindChildTraverse('TradeUpConfirmBtn');
        elTradeUpConfirmBtn.enabled = InventoryAPI.IsCraftReady();
        if (!elTradeUpConfirmBtn.enabled) {
            elTradeUpConfirmBtn.checked = false;
        }
        let elClearIngredientsBtn = $.GetContextPanel().FindChildTraverse('ClearIngredientsBtn');
        elClearIngredientsBtn.enabled = InventoryAPI.GetCraftIngredientCount() > 0;
        let elCraftItemBtn = $.GetContextPanel().FindChildTraverse('CraftItemBtn');
        elCraftItemBtn.enabled = elTradeUpConfirmBtn.checked;
    }
    Crafting.UpdateButtons = UpdateButtons;
    function UpdateItemList() {
        let elDropdown = $.GetContextPanel().FindChildInLayoutFile('CraftingSortDropdown');
        let sortType = elDropdown.GetSelected().id;
        $.DispatchEvent('SetInventoryFilter', $('#Crafting-Items'), 'inv_group_equipment', 'any', 'any', sortType, 'recipe,is_rental:false', '');
    }
    Crafting.UpdateItemList = UpdateItemList;
    function _UpdateCraftingPanelDisplay() {
        UpdateButtons();
        {
            UpdateItemList();
            $.DispatchEvent('SetInventoryFilter', $('#Crafting-Ingredients'), 'inv_group_equipment', 'any', 'any', '', 'ingredient', '');
        }
        {
            function _UpdateItemCount(ItemListName, LabelName) {
                let elItemList = $.GetContextPanel().FindChildTraverse(ItemListName);
                let elLabel = $.GetContextPanel().FindChildTraverse(LabelName);
                elLabel.SetDialogVariableInt('count', elItemList.count);
            }
            _UpdateItemCount('Crafting-Items', 'CraftingItemsText');
            _UpdateItemCount('Crafting-Ingredients', 'CraftingIngredientsText');
        }
    }
    {
        _Init();
        $.RegisterForUnhandledEvent('UpdateTradeUpPanel', _UpdateCraftingPanelDisplay);
        $.RegisterForUnhandledEvent('PanoramaComponent_Inventory_CraftIngredientAdded', _UpdateCraftingPanelDisplay);
        $.RegisterForUnhandledEvent('PanoramaComponent_Inventory_CraftIngredientRemoved', _UpdateCraftingPanelDisplay);
    }
})(Crafting || (Crafting = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JhZnRpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9jb250ZW50L2NzZ28vcGFub3JhbWEvc2NyaXB0cy9jcmFmdGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsa0NBQWtDO0FBRWxDLElBQVUsUUFBUSxDQXFHakI7QUFyR0QsV0FBVSxRQUFRO0lBRWpCLFNBQVMsS0FBSztRQUViLFFBQVEsRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVELFNBQVMsUUFBUTtRQUVoQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMscUJBQXFCLENBQUUsc0JBQXNCLENBQWdCLENBQUM7UUFDbkcsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFFL0MsS0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFDL0I7WUFDQyxJQUFJLElBQUksR0FBRyxZQUFZLENBQUMsb0JBQW9CLENBQUUsQ0FBQyxDQUFFLENBQUM7WUFDbEQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtnQkFDeEQsS0FBSyxFQUFFLGNBQWM7YUFDckIsQ0FBRSxDQUFDO1lBRUosUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFFLEdBQUcsR0FBRyxJQUFJLENBQUUsQ0FBQztZQUN6QyxVQUFVLENBQUMsU0FBUyxDQUFFLFFBQVEsQ0FBRSxDQUFDO1NBQ2pDO1FBR0QsVUFBVSxDQUFDLFdBQVcsQ0FBRSxZQUFZLENBQUMsb0JBQW9CLENBQUUsQ0FBQyxDQUFFLENBQUUsQ0FBQztJQUNsRSxDQUFDO0lBRUQsU0FBZ0IsYUFBYTtRQUU1QixJQUFJLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBRSxtQkFBbUIsQ0FBRSxD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