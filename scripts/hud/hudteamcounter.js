/// <reference path="../csgo.d.ts" />
var HudTeamCounter = (function () {
    function _ShowDamageReport(elTeamCounter, elAvatarPanel) {
        const bannerDelay = 0;
        const delayDelta = 0.1;
        const bFriendlyFire = 1 == elAvatarPanel.GetAttributeInt("friendlyfire", 0);
        const bDead = 1 == elAvatarPanel.GetAttributeInt("dead", 0);
        const healthRemoved = elAvatarPanel.GetAttributeInt("health_removed", 0);
        const numHits = elAvatarPanel.GetAttributeInt("num_hits", 0);
        const returnHealthRemoved = elAvatarPanel.GetAttributeInt("return_health_removed", 0);
        const returnNumHits = elAvatarPanel.GetAttributeInt("return_num_hits", 0);
        const orderIndex = elAvatarPanel.GetAttributeInt("order_index", 0);
        const elDamageReport = elAvatarPanel.FindChildTraverse('PostRoundDamageReport');
        elDamageReport.SetHasClass('given', healthRemoved > 0);
        elDamageReport.SetHasClass('taken', returnHealthRemoved > 0);
        elDamageReport.SetHasClass('friendlyfire', bFriendlyFire);
        elDamageReport.SetDialogVariableInt("health_removed", healthRemoved);
        elDamageReport.SetDialogVariableInt("num_hits", numHits);
        elDamageReport.SetDialogVariableInt("return_health_removed", returnHealthRemoved);
        elDamageReport.SetDialogVariableInt("return_num_hits", returnNumHits);
        elDamageReport.SwitchClass('advantage', healthRemoved > returnHealthRemoved ? 'won' : 'lost');
        function _reveal(elPanel) {
            if (!elPanel || !elPanel.IsValid())
                return;
            elPanel.AddClass('show-prdr');
        }
        if (healthRemoved > 0 || returnHealthRemoved > 0) {
            $.Schedule(bannerDelay + orderIndex * delayDelta, () => _reveal(elAvatarPanel));
        }
    }
    function _HideDamageReport() {
        $.GetContextPanel().FindChildrenWithClassTraverse("show-prdr").forEach(el => el.RemoveClass('show-prdr'));
    }
    return {
        ShowDamageReport: _ShowDamageReport,
        HideDamageReport: _HideDamageReport
    };
})();
(function () {
    $.RegisterForUnhandledEvent('RevealPostRoundDamageReportPanel', HudTeamCounter.ShowDamageReport);
    $.RegisterForUnhandledEvent('ClearAllPostRoundDamageReportPanels', HudTeamCounter.HideDamageReport);
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHVkdGVhbWNvdW50ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodWR0ZWFtY291bnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxQ0FBcUM7QUFFckMsSUFBSSxjQUFjLEdBQUcsQ0FBRTtJQUd0QixTQUFTLGlCQUFpQixDQUFHLGFBQXNCLEVBQUUsYUFBc0I7UUFHMUUsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQztRQUV2QixNQUFNLGFBQWEsR0FBRyxDQUFDLElBQUksYUFBYSxDQUFDLGVBQWUsQ0FBRSxjQUFjLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFDOUUsTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxlQUFlLENBQUUsTUFBTSxFQUFFLENBQUMsQ0FBRSxDQUFDO1FBRTlELE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFDM0UsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBRSxVQUFVLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFDL0QsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBRSxDQUFDO1FBQ3hGLE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFFNUUsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBRSxhQUFhLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFJckUsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLGlCQUFpQixDQUFFLHVCQUF1QixDQUFFLENBQUM7UUFFbEYsY0FBYyxDQUFDLFdBQVcsQ0FBRSxPQUFPLEVBQUUsYUFBYSxHQUFHLENBQUMsQ0FBRSxDQUFDO1FBQ3pELGNBQWMsQ0FBQyxXQUFXLENBQUUsT0FBTyxFQUFFLG1CQUFtQixHQUFHLENBQUMsQ0FBRSxDQUFDO1FBQy9ELGNBQWMsQ0FBQyxXQUFXLENBQUUsY0FBYyxFQUFFLGFBQWEsQ0FBRSxDQUFDO1FBRTVELGNBQWMsQ0FBQyxvQkFBb0IsQ0FBRSxnQkFBZ0IsRUFBRSxhQUFhLENBQUUsQ0FBQztRQUN2RSxjQUFjLENBQUMsb0JBQW9CLENBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBRSxDQUFDO1FBQzNELGNBQWMsQ0FBQyxvQkFBb0IsQ0FBRSx1QkFBdUIsRUFBRSxtQkFBbUIsQ0FBRSxDQUFDO1FBQ3BGLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBRSxpQkFBaUIsRUFBRSxhQUFhLENBQUUsQ0FBQztRQUV4RSxjQUFjLENBQUMsV0FBVyxDQUFFLFdBQVcsRUFBRSxhQUFhLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFFLENBQUM7UUFFaEcsU0FBUyxPQUFPLENBQUcsT0FBZ0I7WUFFbEMsSUFBSyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xDLE9BQU87WUFFUixPQUFPLENBQUMsUUFBUSxDQUFFLFdBQVcsQ0FBRSxDQUFDO1FBRWpDLENBQUM7UUFFRCxJQUFLLGFBQWEsR0FBRyxDQUFDLElBQUksbUJBQW1CLEdBQUcsQ0FBQyxFQUNqRDtZQUNDLENBQUMsQ0FBQyxRQUFRLENBQUUsV0FBVyxHQUFHLFVBQVUsR0FBRyxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFFLGFBQWEsQ0FBRSxDQUFFLENBQUM7U0FDcEY7SUFDRixDQUFDO0lBRUQsU0FBUyxpQkFBaUI7UUFFekIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLDZCQUE2QixDQUFFLFdBQVcsQ0FBRSxDQUFDLE9BQU8sQ0FBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUUsV0FBVyxDQUFFLENBQUUsQ0FBQztJQUNqSCxDQUFDO0lBRUQsT0FBTztRQUVOLGdCQUFnQixFQUFFLGlCQUFpQjtRQUNuQyxnQkFBZ0IsRUFBRSxpQkFBaUI7S0FDbkMsQ0FBQztBQUVILENBQUMsQ0FBRSxFQUFFLENBQUM7QUFLTixDQUFFO0lBSUQsQ0FBQyxDQUFDLHlCQUF5QixDQUFFLGtDQUFrQyxFQUFFLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBRSxDQUFDO0lBQ25HLENBQUMsQ0FBQyx5QkFBeUIsQ0FBRSxxQ0FBcUMsRUFBRSxjQUFjLENBQUMsZ0JBQWdCLENBQUUsQ0FBQztBQUd2RyxDQUFDLENBQUUsRUFBRSxDQUFDIn0=