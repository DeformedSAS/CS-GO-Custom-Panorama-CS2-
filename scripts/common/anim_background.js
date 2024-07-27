/// <reference path="../csgo.d.ts" />
var HudSpecatorBg = (function () {
    const m_aPlayerTable = [];
    const m_elBg = $.GetContextPanel().FindChildTraverse('AnimBackground');
    function _pickBg(xuid) {
        const playerXuid = xuid;
        if (!m_elBg || !m_elBg.IsValid()) {
            return;
        }
        m_elBg.PopulateFromSteamID(playerXuid);
        return;
    }
    function _setBackground(bgIdx) {
        if (m_elBg) {
            m_elBg.SetHasClass('hidden', false);
            m_elBg.style.backgroundImage = 'url("file://{resources}/videos/card_' + bgIdx + '.webm");';
            m_elBg.style.backgroundPosition = '0% 50%;';
            m_elBg.style.backgroundSize = '100% auto;';
        }
    }
    function _addPlayerToTable(playerXuid) {
        const nPlayers = m_aPlayerTable.length;
        const newIdx = (nPlayers + 1) % 10;
        m_aPlayerTable.push({ xuid: playerXuid, bgIdx: newIdx });
        _setBackground(newIdx);
    }
    return {
        PickBg: _pickBg
    };
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbV9iYWNrZ3JvdW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5pbV9iYWNrZ3JvdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHFDQUFxQztBQUVyQyxJQUFJLGFBQWEsR0FBRyxDQUFFO0lBRXJCLE1BQU0sY0FBYyxHQUE0QyxFQUFFLENBQUM7SUFDbkUsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLGlCQUFpQixDQUFFLGdCQUFnQixDQUFrQyxDQUFDO0lBRXpHLFNBQVMsT0FBTyxDQUFHLElBQVk7UUFFOUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBRXhCLElBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQ2pDO1lBQ0MsT0FBTztTQUNQO1FBR0QsTUFBTSxDQUFDLG1CQUFtQixDQUFFLFVBQVUsQ0FBRSxDQUFDO1FBQ3pDLE9BQU87SUFzQlIsQ0FBQztJQUVELFNBQVMsY0FBYyxDQUFHLEtBQWE7UUFFdEMsSUFBSyxNQUFNLEVBQ1g7WUFDQyxNQUFNLENBQUMsV0FBVyxDQUFFLFFBQVEsRUFBRSxLQUFLLENBQUUsQ0FBQztZQUN0QyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxzQ0FBc0MsR0FBRyxLQUFLLEdBQUcsVUFBVSxDQUFDO1lBQzNGLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLFlBQVksQ0FBQztTQUMzQztJQUNGLENBQUM7SUFFRCxTQUFTLGlCQUFpQixDQUFHLFVBQWtCO1FBTTlDLE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUM7UUFDdkMsTUFBTSxNQUFNLEdBQUcsQ0FBRSxRQUFRLEdBQUcsQ0FBQyxDQUFFLEdBQUcsRUFBRSxDQUFDO1FBRXJDLGNBQWMsQ0FBQyxJQUFJLENBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBRSxDQUFDO1FBQzNELGNBQWMsQ0FBRSxNQUFNLENBQUUsQ0FBQztJQUMxQixDQUFDO0lBR0QsT0FBTztRQUNOLE1BQU0sRUFBRSxPQUFPO0tBQ2YsQ0FBQztBQUVILENBQUMsQ0FBRSxFQUFFLENBQUMifQ==