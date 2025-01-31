function AddBlur_To_Class_Or_ID() {
    // Corrected the function call to use FindChild instead of FindChildTraverse
    var CSGOHudDeathNotice = $.GetContextPanel().FindChild('CSGOHudDeathNotice');
    if (CSGOHudDeathNotice) {
        CSGOHudDeathNotice.AddClass('HudBlur');
    }

    var HudDeathNotice = $.GetContextPanel().FindChild('HudDeathNotice');
    if (HudDeathNotice) {
        HudDeathNotice.AddClass('HudBlur');
    }

    // Add other blur targets if needed
    // var ID_NAME_Two = $.GetContextPanel().FindChild('ID_NAME');
    // if (ID_NAME_Two) {
    //     ID_NAME_Two.AddClass('HudBlur');
    // }
    // var Class_NAME_Two = $.GetContextPanel().FindChild('Class_NAME');
    // if (Class_NAME_Two) {
    //     Class_NAME_Two.AddClass('HudBlur');
    // }
}

function Auto_Update_Per_Thirty_Frames() {
    AddBlur_To_Class_Or_ID();
    $.Schedule(1 / 30, Auto_Update_Per_Thirty_Frames);  // This runs the update every 1/30 seconds (about 33ms)
}

$.Schedule(1 / 30, Auto_Update_Per_Thirty_Frames);  // Start the update loop