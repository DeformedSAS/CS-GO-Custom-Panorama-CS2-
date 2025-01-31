"use strict";
/// <reference path="csgo.d.ts" />
var Chat;
(function (Chat) {
    let m_isContentPanelOpen = false;
    let m_lastChatEntry = null;
    let m_isChatType = $.GetContextPanel().GetParent().id === "id-team-vote-middle" ? true : false;
    function _Init() {
        let elInput = $('#ChatInput');
        elInput.SetPanelEvent('oninputsubmit', _ChatTextSubmitted);
        if (m_isChatType) {
            _OpenChat();
            return;
        }
        let elOpenChat = $.GetContextPanel().FindChildInLayoutFile('ChatContainer');
        elOpenChat.SetPanelEvent("onactivate", _OpenChat);
        let elCloseChat = $.GetContextPanel().FindChildInLayoutFile('ChatCloseButton');
        elCloseChat.SetPanelEvent("onactivate", () => { _Close(); });
    }
    function _OpenChat() {
        let elChatContainer = $('#ChatContainer');
        if (!elChatContainer.BHasClass("chat-open")) {
            elChatContainer.RemoveClass('closed-minimized');
            elChatContainer.AddClass("chat-open");
            $("#ChatInput").SetFocus();
            // @ts-ignore
            $("#ChatInput").activationenabled = true;
            $.Schedule(.1, _ScrollToBottom);
        }
    }
    function _Close() {
        if (m_isChatType)
            return true;
        let elChatContainer = $('#ChatContainer');
        if (elChatContainer.BHasClass("chat-open")) {
            elChatContainer.RemoveClass("chat-open");
            elChatContainer.SetFocus();
            // @ts-ignore
            $("#ChatInput").activationenabled = false;
            $.Schedule(.1, _ScrollToBottom);
            _SetClosedHeight();
            return true;
        }
        return false;
    }
    function _SetClosedHeight() {
        let elChatContainer = $('#ChatContainer');
        if (!elChatContainer.BHasClass("chat-open")) {
            elChatContainer.SetHasClass('closed-minimized', m_isContentPanelOpen);
            $.Schedule(.1, _ScrollToBottom);
        }
    }
    function _ChatTextSubmitted() {
        if (m_lastChatEntry && (Date.now() - m_lastChatEntry < 0))
            return;
        else
            m_lastChatEntry = Date.now();
        if (m_isChatType) {
            MatchDraftAPI.ActionPregameChat($('#ChatInput').text, false);
        }
        else {
            $.GetContextPanel().SubmitChatText();
        }
        $('#ChatInput').text = "";
    }
    function _OnNewChatEntry() {
        $.Schedule(.1, _ScrollToBottom);
    }
    function _ScrollToBottom() {
        $('#ChatLinesContainer').ScrollToBottom();
    }
    function _SessionUpdate(status) {
        let elChat = $.GetContextPanel().FindChildInLayoutFile('ChatPanelContainer');
        if (status === 'closed')
            _ClearChatMessages();
        if (!LobbyAPI.IsSessionActive()) {
            elChat.AddClass('hidden');
        }
        else {
            let numPlayersActuallyInParty = PartyListAPI.GetCount();
            let networkSetting = PartyListAPI.GetPartySessionSetting("system/network");
            elChat.SetHasClass('hidden', (networkSetting !== 'LIVE' && !m_isChatType));
            if (networkSetting !== 'LIVE' && !m_isChatType) {
                _Close();
            }
            let elPlaceholder = $.GetContextPanel().FindChildInLayoutFile('PlaceholderText');
            if (m_isChatType) {
                elPlaceholder.text = $.Localize('#party_chat_placeholder_pickban');
            }
            else if (numPlayersActuallyInParty > 1) {
                elPlaceholder.text = $.Localize('#party_chat_placeholder');
            }
            else {
                elPlaceholder.text = $.Localize('#party_chat_placeholder_empty_lobby');
            }
        }
    }
    function _ClearChatMessages() {
        let elMessagesContainer = $('#ChatLinesContainer');
        elMessagesContainer.RemoveAndDeleteChildren();
    }
    function _ClipPanelToNotOverlapSideBar(noClip) {
        let panelToClip = $.GetContextPanel();
        if (!panelToClip || panelToClip.BHasClass('hidden'))
            return;
        if ($.GetContextPanel().GetParent().id !== 'MainMenuFriendsAndParty')
            return;
        let panelToClipWidth = panelToClip.actuallayoutwidth;
        let friendsListWidthWhenExpanded = panelToClip.GetParent().FindChildInLayoutFile('mainmenu-sidebar__blur-target').contentwidth;
        let sideBarWidth = noClip ? 0 : friendsListWidthWhenExpanded;
        let widthDiff = panelToClipWidth - sideBarWidth;
        let clipPercent = (panelToClipWidth <= 0 || widthDiff <= 0 ? 1 : (widthDiff / panelToClipWidth)) * 100;
        if (clipPercent)
            panelToClip.style.clip = 'rect( 0%, ' + clipPercent + '%, 100%, 0% );';
    }
    ;
    function _OnHideContentPanel() {
        m_isContentPanelOpen = false;
        _SetClosedHeight();
    }
    ;
    function _OnShowContentPanel() {
        m_isContentPanelOpen = true;
        _SetClosedHeight();
    }
    ;
    {
        _Init();
        $.RegisterForUnhandledEvent("PanoramaComponent_Lobby_MatchmakingSessionUpdate", _SessionUpdate);
        $.RegisterForUnhandledEvent("OnNewChatEntry", _OnNewChatEntry);
        $.RegisterEventHandler("Cancelled", $.GetContextPanel(), _Close);
        $.RegisterForUnhandledEvent('SidebarIsCollapsed', _ClipPanelToNotOverlapSideBar);
        $.RegisterForUnhandledEvent('HideContentPanel', _OnHideContentPanel);
        $.RegisterForUnhandledEvent('ShowContentPanel', _OnShowContentPanel);
    }
})(Chat || (Chat = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2NvbnRlbnQvY3Nnby9wYW5vcmFtYS9zY3JpcHRzL2NoYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGtDQUFrQztBQUVsQyxJQUFVLElBQUksQ0F1TWI7QUF2TUQsV0FBVSxJQUFJO0lBRWIsSUFBSSxvQkFBb0IsR0FBRyxLQUFLLENBQUM7SUFDakMsSUFBSSxlQUFlLEdBQWtCLElBQUksQ0FBQztJQUcxQyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUUvRixTQUFTLEtBQUs7UUFFYixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUUsWUFBWSxDQUFHLENBQUM7UUFDakMsT0FBTyxDQUFDLGFBQWEsQ0FBRSxlQUFlLEVBQUUsa0JBQWtCLENBQUUsQ0FBQztRQUk3RCxJQUFLLFlBQVksRUFDakI7WUFDQyxTQUFTLEVBQUUsQ0FBQztZQUNaLE9BQU87U0FDUDtRQUVELElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBRSxlQUFlLENBQUUsQ0FBQztRQUM5RSxVQUFVLENBQUMsYUFBYSxDQUFFLFlBQVksRUFBRSxTQUFTLENBQUUsQ0FBQztRQUVwRCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMscUJBQXFCLENBQUUsaUJBQWlCLENBQUUsQ0FBQztRQUNqRixXQUFXLENBQUMsYUFBYSxDQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDO0lBQ2hFLENBQUM7SUFFRCxTQUFTLFNBQVM7UUFFakIsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFFLGdCQUFnQixDQUFHLENBQUM7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