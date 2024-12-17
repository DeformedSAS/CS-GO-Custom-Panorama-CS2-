"use strict";
/// <reference path="../csgo.d.ts" />
/// <reference path="../digitpanel.ts" />
var MoneyPanel;
(function (MoneyPanel) {
    $.RegisterEventHandler('UpdateHudMoney', $.GetContextPanel(), _UpdateMoney);
    function _UpdateMoney(amt, bInstant = false) {
        const elContainer = $('#jsRotaryMoney');
        if (elContainer) {
            if (!$('#DigitPanel')) {
                $.GetContextPanel().SetDialogVariableInt("money", 16000);
                const maxLen = $.Localize("#buymenu_money", $.GetContextPanel());
                DigitPanelFactory.MakeDigitPanel(elContainer, maxLen.length, '', 0.6, "#buymenu_money_digitpanel_digits");
            }
            $.GetContextPanel().SetDialogVariableInt("money", amt);
            const digitString = $.Localize("#buymenu_money", $.GetContextPanel());
            DigitPanelFactory.SetDigitPanelString(elContainer, digitString, bInstant);
        }
    }
})(MoneyPanel || (MoneyPanel = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHVkbW9uZXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9jb250ZW50L2NzZ28vcGFub3JhbWEvc2NyaXB0cy9odWQvaHVkbW9uZXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFDQUFxQztBQUNyQyx5Q0FBeUM7QUFFekMsSUFBVSxVQUFVLENBb0JuQjtBQXBCRCxXQUFVLFVBQVU7SUFFbkIsQ0FBQyxDQUFDLG9CQUFvQixDQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRSxZQUFZLENBQUUsQ0FBQztJQUM5RSxTQUFTLFlBQVksQ0FBRyxHQUFXLEVBQUUsV0FBb0IsS0FBSztRQUU3RCxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUUsZ0JBQWdCLENBQUUsQ0FBQztRQUMxQyxJQUFLLFdBQVcsRUFDaEI7WUFDQyxJQUFLLENBQUMsQ0FBQyxDQUFFLGFBQWEsQ0FBRSxFQUN4QjtnQkFDQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsb0JBQW9CLENBQUUsT0FBTyxFQUFFLEtBQUssQ0FBRSxDQUFDO2dCQUMzRCxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBRSxDQUFDO2dCQUNuRSxpQkFBaUIsQ0FBQyxjQUFjLENBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxrQ0FBa0MsQ0FBRSxDQUFDO2FBQzVHO1lBRUQsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLG9CQUFvQixDQUFFLE9BQU8sRUFBRSxHQUFHLENBQUUsQ0FBQztZQUN6RCxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBRSxDQUFBO1lBQ3ZFLGlCQUFpQixDQUFDLG1CQUFtQixDQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFFLENBQUM7U0FDNUU7SUFDRixDQUFDO0FBQ0YsQ0FBQyxFQXBCUyxVQUFVLEtBQVYsVUFBVSxRQW9CbkIifQ==