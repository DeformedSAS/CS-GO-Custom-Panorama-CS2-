"use strict";
/// <reference path="csgo.d.ts" />
var GameModeFlags;
(function (GameModeFlags) {
    const k_gamemodeflags = {
        competitive: {
            name: 'competitive',
            flags: [
                16
            ],
            icons: [
                'file://{images}/icons/ui/timer_long.svg'
            ],
            user_visible_flags: false
        },
        deathmatch: {
            name: 'deathmatch',
            flags: [
                32
            ],
            icons: [
                'file://{images}/icons/ui/free_for_all.svg'
            ],
            user_visible_flags: true
        }
    };
    function GetIcon(mode, flags) {
        const iconIndex = k_gamemodeflags[mode].flags.indexOf(flags);
        return k_gamemodeflags[mode].icons[iconIndex];
    }
    GameModeFlags.GetIcon = GetIcon;
    function GetOptionsString(mode) {
        let s = '';
        const arr = k_gamemodeflags[mode].flags;
        for (let i = 0; i < arr.length; ++i) {
            s += '&option' + i + '=' + arr[i];
        }
        return s;
    }
    GameModeFlags.GetOptionsString = GetOptionsString;
    function AreFlagsValid(mode, flags) {
        const arrPossibleFlags = k_gamemodeflags[mode].flags;
        return (arrPossibleFlags.indexOf(flags) != -1);
    }
    GameModeFlags.AreFlagsValid = AreFlagsValid;
    function DoesModeUseFlags(mode) {
        return k_gamemodeflags.hasOwnProperty(mode);
    }
    GameModeFlags.DoesModeUseFlags = DoesModeUseFlags;
    function DoesModeShowUserVisibleFlags(mode) {
        return (k_gamemodeflags.hasOwnProperty(mode)) ? k_gamemodeflags[mode].user_visible_flags : false;
    }
    GameModeFlags.DoesModeShowUserVisibleFlags = DoesModeShowUserVisibleFlags;
    function GetFlags() {
        return k_gamemodeflags;
    }
    GameModeFlags.GetFlags = GetFlags;
})(GameModeFlags || (GameModeFlags = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbF9nYW1lbW9kZWZsYWdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vY29udGVudC9jc2dvL3Bhbm9yYW1hL3NjcmlwdHMvdXRpbF9nYW1lbW9kZWZsYWdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxrQ0FBa0M7QUFVbEMsSUFBVSxhQUFhLENBMkV0QjtBQTNFRCxXQUFVLGFBQWE7SUFFdEIsTUFBTSxlQUFlLEdBQW9DO1FBSXhELFdBQVcsRUFBRTtZQUNaLElBQUksRUFBRSxhQUFhO1lBQ25CLEtBQUssRUFBRTtnQkFHTixFQUFFO2FBQ0Y7WUFDRCxLQUFLLEVBQUU7Z0JBR04seUNBQXlDO2FBQ3pDO1lBQ0Qsa0JBQWtCLEVBQUUsS0FBSztTQUN6QjtRQUVELFVBQVUsRUFBRTtZQUNYLElBQUksRUFBRSxZQUFZO1lBQ2xCLEtBQUssRUFBRTtnQkFDTixFQUFFO2FBR0Y7WUFDRCxLQUFLLEVBQUU7Z0JBQ04sMkNBQTJDO2FBRzNDO1lBQ0Qsa0JBQWtCLEVBQUUsSUFBSTtTQUN4QjtLQUNELENBQUE7SUFFRCxTQUFnQixPQUFPLENBQUUsSUFBWSxFQUFFLEtBQWE7UUFFbkQsTUFBTSxTQUFTLEdBQUcsZUFBZSxDQUFFLElBQUksQ0FBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFFLENBQUM7UUFDakUsT0FBTyxlQUFlLENBQUUsSUFBSSxDQUFFLENBQUMsS0FBSyxDQUFFLFNBQVMsQ0FBRSxDQUFDO0lBQ25ELENBQUM7SUFKZSxxQkFBTyxVQUl0QixDQUFBO0lBRUQsU0FBZ0IsZ0JBQWdCLENBQUUsSUFBWTtRQUU3QyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDWCxNQUFNLEdBQUcsR0FBRyxlQUFlLENBQUUsSUFBSSxDQUFFLENBQUMsS0FBSyxDQUFDO1FBQzFDLEtBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUNwQztZQUNDLENBQUMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUUsQ0FBQyxDQUFFLENBQUM7U0FDcEM7UUFDRCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUM7SUFUZSw4QkFBZ0IsbUJBUy9CLENBQUE7SUFFRCxTQUFnQixhQUFhLENBQUUsSUFBWSxFQUFFLEtBQWE7UUFFekQsTUFBTSxnQkFBZ0IsR0FBRyxlQUFlLENBQUUsSUFBSSxDQUFFLENBQUMsS0FBSyxDQUFDO1FBRXZELE9BQU8sQ0FBRSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFFLElBQUksQ0FBQyxDQUFDLENBQUUsQ0FBQztJQUNwRCxDQUFDO0lBTGUsMkJBQWEsZ0JBSzVCLENBQUE7SUFFRCxTQUFnQixnQkFBZ0IsQ0FBRSxJQUFZO1FBRTdDLE9BQU8sZUFBZSxDQUFDLGNBQWMsQ0FBRSxJQUFJLENBQUUsQ0FBQztJQUMvQyxDQUFDO0lBSGUsOEJBQWdCLG1CQUcvQixDQUFBO0lBRUQsU0FBZ0IsNEJBQTRCLENBQUUsSUFBWTtRQUV6RCxPQUFPLENBQUUsZUFBZSxDQUFDLGNBQWMsQ0FBRSxJQUFJLENBQUUsQ0FBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUUsSUFBSSxDQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUN4RyxDQUFDO0lBSGUsMENBQTRCLCtCQUczQyxDQUFBO0lBRUQsU0FBZ0IsUUFBUTtRQUV2QixPQUFPLGVBQWUsQ0FBQztJQUN4QixDQUFDO0lBSGUsc0JBQVEsV0FHdkIsQ0FBQTtBQUNGLENBQUMsRUEzRVMsYUFBYSxLQUFiLGFBQWEsUUEyRXRCIn0=