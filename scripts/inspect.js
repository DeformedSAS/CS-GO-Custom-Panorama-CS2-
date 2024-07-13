"use strict";
/// <reference path="common/characteranims.ts" />
/// <reference path="common/iteminfo.ts" />
/// <reference path="common/tint_spray_icon.ts" />
var InspectModelImage;
(function (InspectModelImage) {
    let m_elPanel = null;
    let m_elContainer = null;
    let m_useAcknowledge = false;
    let m_itemAttributes = '';
    let m_rarityColor = '';
    let m_isStickerApplyRemove = false;
    let m_isItemInLootlist = false;
    let m_strWorkType = '';
    let m_isWorkshopPreview = false;
    InspectModelImage.m_CameraSettingsPerWeapon = [
        { type: 'weapon_awp', camera: '7', zoom_camera: 'weapon_awp_zoom,weapon_awp_front_zoom' },
        { type: 'weapon_aug', camera: '3', zoom_camera: 'weapon_aug_zoom' },
        { type: 'weapon_sg556', camera: '4', zoom_camera: 'weapon_ak47_zoom,weapon_ak47_front_zoom' },
        { type: 'weapon_ssg08', camera: '6', zoom_camera: 'weapon_ssg08_zoom,weapon_ssg08_front_zoom' },
        { type: 'weapon_ak47', camera: '4', zoom_camera: 'weapon_ak47_zoom,weapon_ak47_front_zoom' },
        { type: 'weapon_m4a1_silencer', camera: '6', zoom_camera: 'weapon_m4a1_silencer_zoom,weapon_m4a1_silencer_front_zoom' },
        { type: 'weapon_famas', camera: '4' },
        { type: 'weapon_g3sg1', camera: '5', zoom_camera: 'weapon_g3sg1_zoom,weapon_g3sg1_front_zoom' },
        { type: 'weapon_galilar', camera: '3', zoom_camera: 'weapon_galilar_zoom' },
        { type: 'weapon_m4a1', camera: '4', zoom_camera: 'weapon_ak47_zoom,weapon_ak47_front_zoom' },
        { type: 'weapon_scar20', camera: '5', zoom_camera: 'weapon_g3sg1_zoom,weapon_g3sg1_front_zoom' },
        { type: 'weapon_mp5sd', camera: '3' },
        { type: 'weapon_xm1014', camera: '4', zoom_camera: 'weapon_xm1014_zoom' },
        { type: 'weapon_m249', camera: '6', zoom_camera: 'weapon_m249_zoom' },
        { type: 'weapon_ump45', camera: '3' },
        { type: 'weapon_bizon', camera: '3' },
        { type: 'weapon_mag7', camera: '3' },
        { type: 'weapon_nova', camera: '5', zoom_camera: 'weapon_g3sg1_zoom,weapon_g3sg1_front_zoom' },
        { type: 'weapon_sawedoff', camera: '3' },
        { type: 'weapon_negev', camera: '5', zoom_camera: 'weapon_negev_zoom' },
        { type: 'weapon_usp_silencer', camera: '2', zoom_camera: '0' },
        { type: 'weapon_elite', camera: '2' },
        { type: 'weapon_tec9', camera: '2' },
        { type: 'weapon_revolver', camera: '1' },
        { type: 'weapon_c4', camera: '3' },
        { type: 'weapon_taser', camera: '0' },
    ];
    function Init(elContainer, itemId, funcGetSettingCallback, itemAttributes) {
        const strViewFunc = funcGetSettingCallback ? funcGetSettingCallback('viewfunc', '') : '';
        m_itemAttributes = itemAttributes ? itemAttributes : '';
        m_isWorkshopPreview = funcGetSettingCallback ? funcGetSettingCallback('workshopPreview', 'false') === 'true' : false;
        m_isStickerApplyRemove = funcGetSettingCallback ? funcGetSettingCallback('stickerApplyRemove', 'false') === 'true' : false;
        m_isItemInLootlist = funcGetSettingCallback ? funcGetSettingCallback('isItemInLootlist', 'false') === 'true' : false;
        if (!InventoryAPI.IsValidItemID(itemId)) {
            return '';
        }
        m_strWorkType = funcGetSettingCallback ? funcGetSettingCallback('asyncworktype', '') : '';
        m_elContainer = elContainer;
        m_useAcknowledge = m_elContainer.Data().useAcknowledge ? m_elContainer.Data().useAcknowledge : false;
        m_rarityColor = InventoryAPI.GetItemRarityColor(itemId);
        if (ItemInfo.ItemDefinitionNameSubstrMatch(itemId, 'tournament_journal_') && strViewFunc === 'graffiti')
            itemId = ItemInfo.GetFauxReplacementItemID(itemId, 'graffiti');
        const model = ItemInfo.GetModelPathFromJSONOrAPI(itemId);
        _InitSceneBasedOnItemType(model, itemId);
        return model;
    }
    InspectModelImage.Init = Init;
    function _InitSceneBasedOnItemType(model, itemId) {
        if (ItemInfo.IsCharacter(itemId)) {
            m_elPanel = _InitCharScene(itemId);
        }
        else if (InventoryAPI.GetLoadoutCategory(itemId) == "melee") {
            m_elPanel = _InitMeleeScene(itemId);
        }
        else if (ItemInfo.IsWeapon(itemId)) {
            DeleteExistingItemPanel(itemId, 'ItemPreviewPanel');
            m_elPanel = _InitWeaponScene(itemId);
        }
        else if (ItemInfo.IsDisplayItem(itemId)) {
            DeleteExistingItemPanel(itemId, 'ItemPreviewPanel');
            m_elPanel = _InitDisplayScene(itemId);
        }
        else if (InventoryAPI.GetLoadoutCategory(itemId) == "musickit") {
            m_elPanel = _InitMusicKitScene(itemId);
        }
        else if (ItemInfo.IsSprayPaint(itemId) || ItemInfo.IsSpraySealed(itemId)) {
            DeleteExistingItemPanel(itemId, 'ItemPreviewPanel');
            m_elPanel = _InitSprayScene(itemId);
        }
        else if (ItemInfo.IsCase(itemId)) {
            m_elPanel = _InitCaseScene(itemId);
        }
        else if (ItemInfo.IsNameTag(itemId)) {
            m_elPanel = _InitNametagScene(itemId);
        }
        else if (ItemInfo.IsSticker(itemId) || ItemInfo.IsPatch(itemId)) {
            DeleteExistingItemPanel(itemId, 'ItemPreviewPanel');
            m_elPanel = _InitStickerScene(itemId);
        }
        else if (model) {
            if (InventoryAPI.GetLoadoutCategory(itemId) === 'clothing') {
                m_elPanel = _InitGlovesScene(itemId);
            }
            else if (model.includes('models/props/crates/')) {
                m_elPanel = _InitCaseScene(itemId);
            }
        }
        else if (!model) {
            m_elPanel = _SetImage(itemId);
        }
        return m_elPanel;
    }
    function _InitCharScene(itemId, bHide = false, weaponItemId = '') {
        let elPanel = GetExistingItemPanel('CharPreviewPanel');
        let active_item_idx = 5;
        let mapName = _GetBackGroundMap();
        if (!elPanel) {
            elPanel = $.CreatePanel('MapPlayerPreviewPanel', m_elContainer, 'CharPreviewPanel', {
                "require-composition-layer": "true",
                "pin-fov": "vertical",
                class: 'full-width full-height hidden',
                camera: 'cam_char_inspect_wide_intro',
                player: "true",
                map: mapName,
                initial_entity: 'item',
                mouse_rotate: false,
                playername: "vanity_character",
                animgraphcharactermode: "inventory-inspect",
                animgraphturns: "false",
                workshop_preview: m_isWorkshopPreview
            });
            elPanel.Data().loadedMap = mapName;
        }
        elPanel.Data().itemId = itemId;
        const settings = ItemInfo.GetOrUpdateVanityCharacterSettings(itemId);
        elPanel.SetActiveCharacter(active_item_idx);
        settings.panel = elPanel;
        settings.weaponItemId = weaponItemId ? weaponItemId : settings.weaponItemId ? settings.weaponItemId : '';
        CharacterAnims.PlayAnimsOnPanel(settings);
        if (m_strWorkType !== 'can_patch' && m_strWorkType !== 'remove_patch') {
            _TransitionCamera(elPanel, 'char_inspect_wide');
        }
        if (!bHide) {
            elPanel.RemoveClass('hidden');
        }
        _AdditionalMapLoadSettings(elPanel, active_item_idx, mapName);
        let elInspectPanel = GetExistingItemPanel('ItemPreviewPanel');
        if (elInspectPanel) {
            settings.panel = elInspectPanel;
            CharacterAnims.PlayAnimsOnPanel(settings);
        }
        return elPanel;
    }
    function StartWeaponLookat() {
        let elInspectPanel = GetExistingItemPanel('ItemPreviewPanel');
        if (elInspectPanel) {
            elInspectPanel.StartWeaponLookat();
        }
    }
    InspectModelImage.StartWeaponLookat = StartWeaponLookat;
    function EndWeaponLookat() {
        let elInspectPanel = GetExistingItemPanel('ItemPreviewPanel');
        if (elInspectPanel) {
            elInspectPanel.EndWeaponLookat();
        }
    }
    InspectModelImage.EndWeaponLookat = EndWeaponLookat;
    function _SetCSMSplitPlane0DistanceOverride(elPanel, backgroundMap) {
        let flSplitPlane0Distance = 0.0;
        if (backgroundMap === 'de_ancient_vanity') {
            flSplitPlane0Distance = 180.0;
        }
        else if (backgroundMap === 'de_anubis_vanity') {
            flSplitPlane0Distance = 180.0;
        }
        else if (backgroundMap === 'ar_baggage_vanity') {
            flSplitPlane0Distance = 200.0;
        }
        else if (backgroundMap === 'de_dust2_vanity') {
            flSplitPlane0Distance = 160.0;
        }
        else if (backgroundMap === 'de_inferno_vanity') {
            flSplitPlane0Distance = 140.0;
        }
        else if (backgroundMap === 'cs_italy_vanity') {
            flSplitPlane0Distance = 200.0;
        }
        else if (backgroundMap === 'de_mirage_vanity') {
            flSplitPlane0Distance = 180.0;
        }
        else if (backgroundMap === 'de_overpass_vanity') {
            flSplitPlane0Distance = 150.0;
        }
        else if (backgroundMap === 'de_vertigo_vanity') {
            flSplitPlane0Distance = 190.0;
        }
        else if (backgroundMap === 'ui/acknowledge_item') {
            flSplitPlane0Distance = 200.0;
        }
        if (flSplitPlane0Distance > 0.0) {
            elPanel.SetCSMSplitPlane0DistanceOverride(flSplitPlane0Distance);
        }
    }
    function _InitWeaponScene(itemId) {
        let oSettings = {
            panel_type: "MapItemPreviewPanel",
            active_item_idx: 0,
            camera: 'cam_default',
            initial_entity: 'item',
            mouse_rotate: "true",
            rotation_limit_x: "360",
            rotation_limit_y: "90",
            auto_rotate_x: m_isStickerApplyRemove ? "2" : "35",
            auto_rotate_y: m_isStickerApplyRemove ? "3" : "10",
            auto_rotate_period_x: m_isStickerApplyRemove ? "10" : "15",
            auto_rotate_period_y: m_isStickerApplyRemove ? "10" : "25",
            auto_recenter: false,
            player: "false",
        };
        const panel = _LoadInspectMap(itemId, oSettings);
        _SetParticlesBg(panel);
        SetItemCameraByWeaponType(itemId, panel, false);
        const settings = ItemInfo.GetOrUpdateVanityCharacterSettings();
        settings.panel = panel;
        settings.weaponItemId = '';
        return panel;
    }
    function _InitMeleeScene(itemId) {
        let oSettings = {
            panel_type: "MapItemPreviewPanel",
            active_item_idx: 8,
            camera: 'cam_melee_intro',
            initial_entity: 'item',
            mouse_rotate: "true",
            rotation_limit_x: "360",
            rotation_limit_y: "90",
            auto_rotate_x: "35",
            auto_rotate_y: "10",
            auto_rotate_period_x: "15",
            auto_rotate_period_y: "25",
            auto_recenter: false,
            player: "false",
        };
        const panel = _LoadInspectMap(itemId, oSettings);
        _SetParticlesBg(panel);
        _TransitionCamera(panel, 'melee');
        return panel;
    }
    function _InitStickerScene(itemId) {
        let oSettings = {
            panel_type: "MapItemPreviewPanel",
            active_item_idx: 1,
            camera: 'cam_sticker_close_intro',
            initial_entity: 'item',
            mouse_rotate: "true",
            rotation_limit_x: "70",
            rotation_limit_y: "60",
            auto_rotate_x: "20",
            auto_rotate_y: "0",
            auto_rotate_period_x: "10",
            auto_rotate_period_y: "10",
            auto_recenter: false,
            player: "false",
        };
        const panel = _LoadInspectMap(itemId, oSettings);
        _SetParticlesBg(panel);
        _TransitionCamera(panel, 'sticker_close');
        return panel;
    }
    function _InitSprayScene(itemId) {
        let oSettings = {
            panel_type: "MapItemPreviewPanel",
            active_item_idx: 2,
            camera: 'camera_path_spray',
            initial_entity: 'item',
            mouse_rotate: "false",
            rotation_limit_x: "",
            rotation_limit_y: "",
            auto_rotate_x: "",
            auto_rotate_y: "",
            auto_rotate_period_x: "",
            auto_rotate_period_y: "",
            auto_recenter: false,
            player: "false",
        };
        const panel = _LoadInspectMap(itemId, oSettings);
        _TransitionCamera(panel, 'path_spray', true, 0);
        return panel;
    }
    function _InitDisplayScene(itemId) {
        let bOverrideItem = InventoryAPI.GetItemDefinitionIndex(itemId) === 996;
        let rotationOverrideX = bOverrideItem ? "360" : "70";
        let autoRotateOverrideX = bOverrideItem ? "180" : "45";
        let autoRotateTimeOverrideX = bOverrideItem ? "100" : "20";
        let oSettings = {
            panel_type: "MapItemPreviewPanel",
            active_item_idx: 3,
            camera: 'cam_display_close_intro',
            initial_entity: 'item',
            mouse_rotate: "true",
            rotation_limit_x: rotationOverrideX,
            rotation_limit_y: "60",
            auto_rotate_x: autoRotateOverrideX,
            auto_rotate_y: "12",
            auto_rotate_period_x: autoRotateTimeOverrideX,
            auto_rotate_period_y: "20",
            auto_recenter: false,
            player: "false",
        };
        const panel = _LoadInspectMap(itemId, oSettings);
        _SetParticlesBg(panel);
        _TransitionCamera(panel, 'display_close');
        return panel;
    }
    function _InitMusicKitScene(itemId) {
        let oSettings = {
            panel_type: "MapItemPreviewPanel",
            active_item_idx: 4,
            camera: 'cam_musickit_intro',
            initial_entity: 'item',
            mouse_rotate: "true",
            rotation_limit_x: "55",
            rotation_limit_y: "55",
            auto_rotate_x: "10",
            auto_rotate_y: "0",
            auto_rotate_period_x: "20",
            auto_rotate_period_y: "20",
            auto_recenter: false,
            player: "false",
        };
        const panel = _LoadInspectMap(itemId, oSettings);
        _SetParticlesBg(panel);
        _TransitionCamera(panel, 'musickit_close');
        return panel;
    }
    function _InitCaseScene(itemId) {
        let oSettings = {
            panel_type: "MapItemPreviewPanel",
            active_item_idx: 6,
            camera: 'cam_case_intro',
            initial_entity: 'item',
            mouse_rotate: "false",
            rotation_limit_x: "",
            rotation_limit_y: "",
            auto_rotate_x: "",
            auto_rotate_y: "",
            auto_rotate_period_x: "",
            auto_rotate_period_y: "",
            auto_recenter: false,
            player: "false",
        };
        const panel = _LoadInspectMap(itemId, oSettings);
        _SetParticlesBg(panel);
        _TransitionCamera(panel, m_useAcknowledge ? 'case_new_item' : 'case', m_useAcknowledge ? true : false);
        return panel;
    }
    function _InitGlovesScene(itemId) {
        let oSettings = {
            panel_type: "MapItemPreviewPanel",
            active_item_idx: 7,
            camera: 'cam_gloves',
            initial_entity: 'item',
            mouse_rotate: "false",
            rotation_limit_x: "",
            rotation_limit_y: "",
            auto_rotate_x: "",
            auto_rotate_y: "",
            auto_rotate_period_x: "",
            auto_rotate_period_y: "",
            auto_recenter: false,
            player: "false",
        };
        const panel = _LoadInspectMap(itemId, oSettings);
        _SetParticlesBg(panel);
        _TransitionCamera(panel, 'gloves', true);
        return panel;
    }
    function _InitNametagScene(itemId) {
        let oSettings = {
            panel_type: "MapItemPreviewPanel",
            active_item_idx: 1,
            camera: 'cam_nametag_close_intro',
            initial_entity: 'item',
            mouse_rotate: "true",
            rotation_limit_x: "70",
            rotation_limit_y: "60",
            auto_rotate_x: "20",
            auto_rotate_y: "0",
            auto_rotate_period_x: "10",
            auto_rotate_period_y: "10",
            auto_recenter: false,
            player: "false",
        };
        const panel = _LoadInspectMap(itemId, oSettings);
        _SetParticlesBg(panel);
        _TransitionCamera(panel, 'nametag_close');
        return panel;
    }
    function _GetBackGroundMap() {
        if (m_useAcknowledge) {
            return 'ui/acknowledge_item';
        }
        let backgroundMap = GameInterfaceAPI.GetSettingString('ui_inspect_bkgnd_map');
        if (backgroundMap == 'mainmenu') {
            backgroundMap = GameInterfaceAPI.GetSettingString('ui_mainmenu_bkgnd_movie');
        }
        backgroundMap = !backgroundMap ? backgroundMap : backgroundMap + '_vanity';
        return backgroundMap;
    }
    function _LoadInspectMap(itemId, oSettings) {
        let mapName = _GetBackGroundMap();
        let elPanel = GetExistingItemPanel('ItemPreviewPanel');
        if (!elPanel) {
            elPanel = $.CreatePanel(oSettings.panel_type, m_elContainer, 'ItemPreviewPanel', {
                "require-composition-layer": "true",
                'transparent-background': 'false',
                'disable-depth-of-field': m_useAcknowledge ? 'true' : 'false',
                "pin-fov": "vertical",
                class: 'inspect-model-image-panel inspect-model-image-panel--hidden',
                camera: oSettings.camera,
                player: "true",
                map: mapName,
                initial_entity: 'item',
                mouse_rotate: oSettings.mouse_rotate,
                rotation_limit_x: oSettings.rotation_limit_x,
                rotation_limit_y: oSettings.rotation_limit_y,
                auto_rotate_x: oSettings.auto_rotate_x,
                auto_rotate_y: oSettings.auto_rotate_y,
                auto_rotate_period_x: oSettings.auto_rotate_period_x,
                auto_rotate_period_y: oSettings.auto_rotate_period_y,
                auto_recenter: oSettings.auto_recenter,
                workshop_preview: m_isWorkshopPreview,
                sticker_application_mode: $.GetContextPanel().GetAttributeString("asyncworktype", "") === "can_sticker",
                sticker_scrape_mode: $.GetContextPanel().GetAttributeString("asyncworktype", "") === "remove_sticker",
            });
        }
        elPanel.Data().itemId = itemId;
        elPanel.Data().active_item_idx = oSettings.active_item_idx;
        elPanel.Data().loadedMap = mapName;
        elPanel.SetActiveItem(oSettings.active_item_idx);
        elPanel.SetItemItemId(itemId, m_itemAttributes);
        elPanel.RemoveClass('inspect-model-image-panel--hidden');
        _AdditionalMapLoadSettings(elPanel, oSettings.active_item_idx, mapName);
        _SetParticlesBg(elPanel);
        return elPanel;
    }
    function GetExistingItemPanel(panelId) {
        for (let elChild of m_elContainer.Children()) {
            if (elChild && elChild.IsValid() && elChild.id === panelId && !elChild.Data().bPreviousLootlistItemPanel) {
                return elChild;
            }
        }
        return null;
    }
    function DeleteExistingItemPanel(itemId, panelType) {
        let elExistingItemPanel = GetExistingItemPanel(panelType);
        if (!elExistingItemPanel)
            return;
        if (elExistingItemPanel.Data().itemId !== itemId) {
            elExistingItemPanel.Data().bPreviousLootlistItemPanel = true;
            elExistingItemPanel.AddClass('inspect-model-image-panel--hidden');
            elExistingItemPanel.DeleteAsync(.5);
        }
    }
    function _AdditionalMapLoadSettings(elPanel, active_item_idx, mapName) {
        if (elPanel.id === 'CharPreviewPanel') {
            HidePanelItemEntities(elPanel);
            _HidePanelCharEntities(elPanel, true);
            _SetCSMSplitPlane0DistanceOverride(elPanel, mapName);
        }
        else if (elPanel.id === 'id-inspect-image-bg-map') {
            HidePanelItemEntities(elPanel);
            _HidePanelCharEntities(elPanel, false);
        }
        else {
            _HidePanelCharEntities(elPanel, false);
            _HideItemEntities(active_item_idx, elPanel);
            if (mapName === 'de_nuke_vanity') {
                _SetSpotlightBrightness(elPanel);
            }
            else {
                _SetSunBrightness(elPanel);
            }
        }
        _SetWorkshopPreviewPanelProperties(elPanel);
    }
    function _SetWorkshopPreviewPanelProperties(elItemPanel) {
        if (m_isWorkshopPreview) {
            let sTransparentBackground = InventoryAPI.GetPreviewSceneStateAttribute("transparent_background");
            let sBackgroundColor = InventoryAPI.GetPreviewSceneStateAttribute("background_color");
            let sPreviewIdleAnimation = InventoryAPI.GetPreviewSceneStateAttribute("idle_animation");
            if (sTransparentBackground === "1") {
                elItemPanel.SetHideStaticGeometry(true);
                elItemPanel.SetHideParticles(true);
                elItemPanel.SetTransparentBackground(true);
                m_elContainer.SetHasClass('popup-inspect-background', false);
            }
            else if (sBackgroundColor) {
                const oColor = _HexColorToRgb(sBackgroundColor);
                elItemPanel.SetHideStaticGeometry(true);
                elItemPanel.SetHideParticles(true);
                elItemPanel.SetBackgroundColor(oColor.r, oColor.g, oColor.b, 0);
                elItemPanel.SetTransparentBackground(false);
            }
            else {
                elItemPanel.SetHideStaticGeometry(false);
                elItemPanel.SetHideParticles(false);
                elItemPanel.SetBackgroundColor(0, 0, 0, 255);
                elItemPanel.SetTransparentBackground(false);
            }
            if (sPreviewIdleAnimation === "1") {
                elItemPanel.SetWorkshopPreviewIdleAnimation(true);
            }
            else {
                elItemPanel.SetWorkshopPreviewIdleAnimation(false);
            }
        }
    }
    function SetItemCameraByWeaponType(itemId, elItemPanel, bSkipIntro) {
        const category = InventoryAPI.GetLoadoutCategory(itemId);
        const defName = InventoryAPI.GetItemDefinitionName(itemId);
        let strCamera = '3';
        let result = InspectModelImage.m_CameraSettingsPerWeapon.find(({ type }) => type === defName);
        if (result) {
            strCamera = result.camera;
        }
        else {
            switch (category) {
                case 'secondary':
                    strCamera = '0';
                    break;
                case 'smg':
                    strCamera = '2';
                    break;
            }
        }
        _TransitionCamera(elItemPanel, strCamera, bSkipIntro);
    }
    InspectModelImage.SetItemCameraByWeaponType = SetItemCameraByWeaponType;
    let m_scheduleHandle = 0;
    function _TransitionCamera(elPanel, strCamera, bSkipIntro = false, nDuration = 0) {
        elPanel.Data().camera = strCamera;
        if (m_isWorkshopPreview) {
            elPanel.TransitionToCamera('cam_' + strCamera, 0);
            return;
        }
        if (bSkipIntro || m_isItemInLootlist) {
            elPanel.TransitionToCamera('cam_' + strCamera, nDuration);
            return;
        }
        elPanel.TransitionToCamera('cam_' + strCamera + '_intro', 0);
        if (m_scheduleHandle === 0) {
            m_scheduleHandle = $.Schedule(.25, () => {
                if (elPanel.IsValid() && elPanel) {
                    elPanel.TransitionToCamera('cam_' + strCamera, 1);
                }
            });
        }
    }
    function ZoomCamera(bZoom) {
        let elPanel = m_elPanel;
        const defName = InventoryAPI.GetItemDefinitionName(m_elPanel.Data().itemId);
        let result = InspectModelImage.m_CameraSettingsPerWeapon.find(({ type }) => type === defName);
        let strCamera = bZoom ? result?.zoom_camera : result?.camera;
        if (!strCamera || strCamera === '')
            return;
        let aCameras = strCamera.split(',');
        elPanel.SetRotation(0, 0, 1);
        _TransitionCamera(elPanel, aCameras[0], true, .75);
    }
    InspectModelImage.ZoomCamera = ZoomCamera;
    function PanCamera(bPanLeft) {
        let elPanel = m_elPanel;
        const defName = InventoryAPI.GetItemDefinitionName(elPanel.Data().itemId);
        let result = InspectModelImage.m_CameraSettingsPerWeapon.find(({ type }) => type === defName);
        let strCamera = result?.zoom_camera;
        if (!strCamera || strCamera === '')
            return;
        let aCameras = strCamera.split(',');
        let strCameraToUse = bPanLeft ? aCameras[1] : aCameras[0];
        elPanel.SetRotation(0, 0, 1);
        _TransitionCamera(elPanel, strCameraToUse, true, .75);
    }
    InspectModelImage.PanCamera = PanCamera;
    function _SetImage(itemId) {
        let elPanel = GetExistingItemPanel('InspectItemImage');
        if (!elPanel) {
            _SetImageBackgroundMap();
            elPanel = $.CreatePanel('Panel', m_elContainer, 'InspectItemImage');
            elPanel.BLoadLayoutSnippet("snippet-image");
        }
        const elImagePanel = elPanel.FindChildTraverse('ImagePreviewPanel');
        elImagePanel.itemid = itemId;
        elImagePanel.RemoveClass('hidden');
        _TintSprayImage(itemId, elImagePanel);
        return elImagePanel;
    }
    function _SetImageBackgroundMap() {
        let mapName = _GetBackGroundMap();
        let elPanel = $.CreatePanel('MapPlayerPreviewPanel', m_elContainer, 'id-inspect-image-bg-map', {
            "require-composition-layer": "true",
            'transparent-background': 'false',
            'disable-depth-of-field': 'false',
            "pin-fov": "vertical",
            class: 'full-width full-height',
            camera: "cam_default",
            player: "false",
            map: mapName
        });
        _TransitionCamera(elPanel, "default", true, 0);
        _AdditionalMapLoadSettings(elPanel, 0, mapName);
    }
    function _TintSprayImage(id, elImage) {
        TintSprayIcon.CheckIsSprayAndTint(id, elImage);
    }
    function SetCharScene(characterItemId, weaponItemId) {
        ItemInfo.GetOrUpdateVanityCharacterSettings(characterItemId);
        _InitCharScene(characterItemId, true, weaponItemId);
    }
    InspectModelImage.SetCharScene = SetCharScene;
    function ShowHideItemPanel(bshow) {
        if (!m_elContainer.IsValid())
            return;
        const elItemPanel = GetExistingItemPanel('ItemPreviewPanel');
        elItemPanel.SetHasClass('hidden', !bshow);
        if (bshow)
            $.DispatchEvent("CSGOPlaySoundEffect", "weapon_showSolo", "MOUSE");
    }
    InspectModelImage.ShowHideItemPanel = ShowHideItemPanel;
    function ShowHideCharPanel(bshow) {
        if (!m_elContainer.IsValid())
            return;
        const elCharPanel = GetExistingItemPanel('CharPreviewPanel');
        if (elCharPanel)
            elCharPanel.SetHasClass('hidden', !bshow);
        if (bshow)
            $.DispatchEvent("CSGOPlaySoundEffect", "weapon_showOnChar", "MOUSE");
    }
    InspectModelImage.ShowHideCharPanel = ShowHideCharPanel;
    function GetModelPanel() {
        return m_elPanel;
    }
    InspectModelImage.GetModelPanel = GetModelPanel;
    function UpdateModelOnly(itemId) {
        let elpanel = m_elPanel;
        if (elpanel && elpanel.IsValid()) {
            elpanel.SetItemItemId(itemId, '');
        }
    }
    InspectModelImage.UpdateModelOnly = UpdateModelOnly;
    function SwitchMap(elParent) {
        for (let element of ['ItemPreviewPanel', 'CharPreviewPanel', 'id-inspect-image-bg-map']) {
            let elPanel = elParent.FindChildTraverse(element);
            if (elPanel && elPanel.IsValid()) {
                let mapName = _GetBackGroundMap();
                if (mapName !== elPanel.Data().loadedMap) {
                    elPanel.SwitchMap(mapName);
                    elPanel.Data().loadedMap = mapName;
                    _AdditionalMapLoadSettings(elPanel, elPanel.Data().active_item_idx, elPanel.Data().loadedMap);
                    if (ItemInfo.IsWeapon(elPanel.Data().itemId)) {
                        SetItemCameraByWeaponType(elPanel.Data().itemId, elPanel, true);
                    }
                    else {
                        _TransitionCamera(elPanel, elPanel.Data().camera, true);
                    }
                }
            }
        }
    }
    InspectModelImage.SwitchMap = SwitchMap;
    function _HidePanelCharEntities(elPanel, bIsPlayerInspect = false) {
        elPanel.FireEntityInput('vanity_character', 'Alpha');
        elPanel.FireEntityInput('vanity_character1', 'Alpha');
        elPanel.FireEntityInput('vanity_character2', 'Alpha');
        elPanel.FireEntityInput('vanity_character3', 'Alpha');
        elPanel.FireEntityInput('vanity_character4', 'Alpha');
        if (!bIsPlayerInspect) {
            elPanel.FireEntityInput('vanity_character5', 'Alpha');
        }
    }
    function HidePanelItemEntities(elPanel) {
        _HideItemEntities(-1, elPanel);
    }
    InspectModelImage.HidePanelItemEntities = HidePanelItemEntities;
    function _HideItemEntities(indexShow, elPanel) {
        let numItemEntitiesInMap = 8;
        for (let i = 0; i <= numItemEntitiesInMap; i++) {
            let itemIndexMod = i === 0 ? '' : i.toString();
            if (indexShow !== i) {
                elPanel.FireEntityInput('item' + itemIndexMod, 'Alpha');
                elPanel.FireEntityInput('light_item' + itemIndexMod, 'Disable');
                elPanel.FireEntityInput('light_item_new' + itemIndexMod, 'Disable');
            }
            else {
                _SetRimLight(itemIndexMod, elPanel);
            }
        }
    }
    function _SetParticlesBg(elPanel) {
        if (!m_useAcknowledge) {
            return;
        }
        const oColor = _HexColorToRgb(m_rarityColor);
        const sColor = `${oColor.r} ${oColor.g} ${oColor.b}`;
        elPanel.FireEntityInput('acknowledge_particle', 'SetControlPoint', '16: ' + sColor);
    }
    function _SetRimLight(indexShow, elPanel) {
        if (m_useAcknowledge) {
            elPanel.FireEntityInput('light_item' + indexShow, 'Disable');
            const oColor = _HexColorToRgb(m_rarityColor);
            const sColor = `${oColor.r} ${oColor.g} ${oColor.b}`;
            let lightNameInMap = "light_item_new" + indexShow;
            elPanel.FireEntityInput(lightNameInMap, 'SetColor', sColor);
        }
        else {
            elPanel.FireEntityInput('light_item_new' + indexShow, 'Disable');
        }
    }
    function _SetSunBrightness(elPanel) {
        elPanel.FireEntityInput('sun', 'SetLightBrightness', '1.1');
    }
    function _SetSpotlightBrightness(elPanel) {
        elPanel.FireEntityInput('main_light', 'SetBrightness', '1.1');
    }
    function _HexColorToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }
})(InspectModelImage || (InspectModelImage = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zcGVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2NvbnRlbnQvY3Nnby9wYW5vcmFtYS9zY3JpcHRzL2luc3BlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGlEQUFpRDtBQUNqRCwyQ0FBMkM7QUFDM0Msa0RBQWtEO0FBRWxELElBQVUsaUJBQWlCLENBK2dDMUI7QUEvZ0NELFdBQVUsaUJBQWlCO0lBRTFCLElBQUksU0FBUyxHQUFrRSxJQUFLLENBQUM7SUFDckYsSUFBSSxhQUFhLEdBQVksSUFBSyxDQUFDO0lBQ25DLElBQUksZ0JBQWdCLEdBQVksS0FBSyxDQUFDO0lBQ3RDLElBQUksZ0JBQWdCLEdBQVcsRUFBRSxDQUFDO0lBQ2xDLElBQUksYUFBYSxHQUFXLEVBQUUsQ0FBQztJQUMvQixJQUFJLHNCQUFzQixHQUFZLEtBQUssQ0FBQztJQUM1QyxJQUFJLGtCQUFrQixHQUFZLEtBQUssQ0FBQztJQUN4QyxJQUFJLGFBQWEsR0FBVyxFQUFFLENBQUM7SUFDL0IsSUFBSSxtQkFBbUIsR0FBWSxLQUFLLENBQUM7SUEwQjlCLDJDQUF5QixHQUE0QjtRQUUvRCxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUcsdUNBQXVDLEVBQUU7UUFDMUYsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFHLGlCQUFpQixFQUFFO1FBQ3BFLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRyx5Q0FBeUMsRUFBRTtRQUM5RixFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUcsMkNBQTJDLEVBQUU7UUFDaEcsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFHLHlDQUF5QyxFQUFFO1FBQzdGLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFHLDJEQUEyRCxFQUFFO1FBQ3hILEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO1FBQ3JDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRywyQ0FBMkMsRUFBRTtRQUNoRyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRyxxQkFBcUIsRUFBRTtRQUM1RSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUcseUNBQXlDLEVBQUM7UUFDNUYsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFHLDJDQUEyQyxFQUFFO1FBRWpHLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO1FBQ3JDLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRyxvQkFBb0IsRUFBQztRQUN6RSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUcsa0JBQWtCLEVBQUU7UUFDdEUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUM7UUFDcEMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7UUFDckMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUM7UUFDbkMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFHLDJDQUEyQyxFQUFFO1FBQy9GLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUM7UUFDdkMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFHLG1CQUFtQixFQUFFO1FBRXhFLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFHLEdBQUcsRUFBRTtRQUMvRCxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUNyQyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUNwQyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO1FBRXhDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO1FBQ2xDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO0tBR3JDLENBQUM7SUFFRixTQUFnQixJQUFJLENBQUUsV0FBb0IsRUFBRSxNQUFjLEVBQUUsc0JBQTRFLEVBQUUsY0FBdUI7UUFJaEssTUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFFLFVBQVUsRUFBRSxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRTNGLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFeEQsbUJBQW1CLEdBQUcsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFFLGlCQUFpQixFQUFFLE9BQU8sQ0FBRSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3ZILHNCQUFzQixHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBRSxvQkFBb0IsRUFBRSxPQUFPLENBQUUsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM3SCxrQkFBa0IsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUUsa0JBQWtCLEVBQUUsT0FBTyxDQUFFLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFdkgsSUFBSyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUUsTUFBTSxDQUFFLEVBQzFDO1lBQ0MsT0FBTyxFQUFFLENBQUM7U0FDVjtRQUVELGFBQWEsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUUsZUFBZSxFQUFFLEVBQUUsQ0FBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFNUYsYUFBYSxHQUFHLFdBQVcsQ0FBQztRQUM1QixnQkFBZ0IsR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDckcsYUFBYSxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsQ0FBRSxNQUFNLENBQUUsQ0FBQztRQUkxRCxJQUFLLFFBQVEsQ0FBQyw2QkFBNkIsQ0FBRSxNQUFNLEVBQUUscUJBQXFCLENBQUUsSUFBSSxXQUFXLEtBQUssVUFBVTtZQUN6RyxNQUFNLEdBQUcsUUFBUSxDQUFDLHdCQUF3QixDQUFFLE1BQU0sRUFBRSxVQUFVLENBQUUsQ0FBQztRQUVsRSxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMseUJBQXlCLENBQUUsTUFBTSxDQUFFLENBQUM7UUFDM0QseUJBQXlCLENBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBRSxDQUFDO1FBRTNDLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQWhDZSxzQkFBSSxPQWdDbkIsQ0FBQTtJQUVELFNBQVMseUJBQXlCLENBQUUsS0FBWSxFQUFFLE1BQWE7UUFFOUQsSUFBSyxRQUFRLENBQUMsV0FBVyxDQUFFLE1BQU0sQ0FBRSxFQUNuQztZQUNDLFNBQVMsR0FBRyxjQUFjLENBQUUsTUFBTSxDQUFFLENBQUM7U0FDckM7YUFDSSxJQUFLLFlBQVksQ0FBQyxrQkFBa0IsQ0FBRSxNQUFNLENBQUUsSUFBSSxPQUFPLEVBQzlEO1lBQ0MsU0FBUyxHQUFHLGVBQWUsQ0FBRSxNQUFNLENBQUUsQ0FBQztTQUN0QzthQUNJLElBQUssUUFBUSxDQUFDLFFBQVEsQ0FBRSxNQUFNLENBQUUsRUFDckM7WUFDQyx1QkFBdUIsQ0FBRSxNQUFNLEVBQUMsa0JBQWtCLENBQUUsQ0FBQztZQUNyRCxTQUFTLEdBQUcsZ0JBQWdCLENBQUUsTUFBTSxDQUFFLENBQUM7U0FDdkM7YUFDSSxJQUFLLFFBQVEsQ0FBQyxhQUFhLENBQUUsTUFBTSxDQUFFLEVBQzFDO1lBQ0MsdUJBQXVCLENBQUUsTUFBTSxFQUFDLGtCQUFrQixDQUFFLENBQUM7WUFDckQsU0FBUyxHQUFHLGlCQUFpQixDQUFFLE1BQU0sQ0FBRSxDQUFDO1NBQ3hDO2FBQ0ksSUFBSyxZQUFZLENBQUMsa0JBQWtCLENBQUUsTUFBTSxDQUFFLElBQUksVUFBVSxFQUNqRTtZQUNDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBRSxNQUFNLENBQUUsQ0FBQztTQUN6QzthQUNJLElBQUssUUFBUSxDQUFDLFlBQVksQ0FBRSxNQUFNLENBQUUsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFFLE1BQU0sQ0FBRSxFQUM3RTtZQUNDLHVCQUF1QixDQUFFLE1BQU0sRUFBQyxrQkFBa0IsQ0FBRSxDQUFDO1lBQ3JELFNBQVMsR0FBRyxlQUFlLENBQUUsTUFBTSxDQUFHLENBQUM7U0FDdkM7YUFDSSxJQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUUsTUFBTSxDQUFFLEVBQ25DO1lBQ0MsU0FBUyxHQUFHLGNBQWMsQ0FBRSxNQUFNLENBQUUsQ0FBQztTQUNyQzthQUNJLElBQUssUUFBUSxDQUFDLFNBQVMsQ0FBRSxNQUFNLENBQUUsRUFDdEM7WUFDQyxTQUFTLEdBQUcsaUJBQWlCLENBQUUsTUFBTSxDQUFFLENBQUM7U0FDeEM7YUFDSSxJQUFLLFFBQVEsQ0FBQyxTQUFTLENBQUUsTUFBTSxDQUFFLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBRSxNQUFNLENBQUUsRUFDcEU7WUFDQyx1QkFBdUIsQ0FBRSxNQUFNLEVBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNwRCxTQUFTLEdBQUcsaUJBQWlCLENBQUUsTUFBTSxDQUFFLENBQUM7U0FDeEM7YUFHSSxJQUFLLEtBQUssRUFDZjtZQUNDLElBQUssWUFBWSxDQUFDLGtCQUFrQixDQUFFLE1BQU0sQ0FBRSxLQUFLLFVBQVUsRUFDN0Q7Z0JBQ0MsU0FBUyxHQUFHLGdCQUFnQixDQUFFLE1BQU0sQ0FBRSxDQUFDO2FBQ3ZDO2lCQUNJLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBRSxzQkFBc0IsQ0FBRSxFQUNqRDtnQkFDQyxTQUFTLEdBQUcsY0FBYyxDQUFFLE1BQU0sQ0FBRSxDQUFDO2FBQ3JDO1NBQ0Q7YUFHSSxJQUFLLENBQUMsS0FBSyxFQUNoQjtZQUNDLFNBQVMsR0FBRyxTQUFTLENBQUUsTUFBTSxDQUFFLENBQUM7U0FDaEM7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBRUQsU0FBUyxjQUFjLENBQUcsTUFBYyxFQUFFLFFBQWlCLEtBQUssRUFBRSxlQUF1QixFQUFFO1FBSTFGLElBQUksT0FBTyxHQUFHLG9CQUFvQixDQUFFLGtCQUFrQixDQUFvQyxDQUFDO1FBQzNGLElBQUksZUFBZSxHQUFXLENBQUMsQ0FBQztRQUNoQyxJQUFJLE9BQU8sR0FBRyxpQkFBaUIsRUFBRSxDQUFDO1FBRWxDLElBQUssQ0FBQyxPQUFPLEVBQ2I7WUFDQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBRSx1QkFBdUIsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUU7Z0JBQ3BGLDJCQUEyQixFQUFFLE1BQU07Z0JBQ25DLFNBQVMsRUFBRSxVQUFVO2dCQUNyQixLQUFLLEVBQUUsK0JBQStCO2dCQUN0QyxNQUFNLEVBQUUsNkJBQTZCO2dCQUNyQyxNQUFNLEVBQUUsTUFBTTtnQkFDZCxHQUFHLEVBQUUsT0FBTztnQkFDWixjQUFjLEVBQUUsTUFBTTtnQkFDdEIsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLFVBQVUsRUFBRSxrQkFBa0I7Z0JBQzlCLHNCQUFzQixFQUFFLG1CQUFtQjtnQkFDM0MsY0FBYyxFQUFFLE9BQU87Z0JBQ3ZCLGdCQUFnQixFQUFFLG1CQUFtQjthQUNyQyxDQUE2QixDQUFDO1lBRS9CLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO1NBQ25DO1FBRUQsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDL0IsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGtDQUFrQyxDQUFFLE1BQU0sQ0FBRSxDQUFDO1FBRXZFLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBRSxlQUFlLENBQUUsQ0FBQztRQUM5QyxRQUFRLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztRQUN6QixRQUFRLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFekcsY0FBYyxDQUFDLGdCQUFnQixDQUFFLFFBQVEsQ0FBRSxDQUFDO1FBRTVDLElBQUssYUFBYSxLQUFLLFdBQVcsSUFBSSxhQUFhLEtBQUssY0FBYyxFQUN0RTtZQUNDLGlCQUFpQixDQUFFLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1NBQ2pEO1FBRUQsSUFBSyxDQUFDLEtBQUssRUFDWDtZQUNDLE9BQU8sQ0FBQyxXQUFXLENBQUUsUUFBUSxDQUFFLENBQUM7U0FDaEM7UUFFRCwwQkFBMEIsQ0FBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRS9ELElBQUksY0FBYyxHQUFHLG9CQUFvQixDQUFDLGtCQUFrQixDQUFpQyxDQUFDO1FBQzlGLElBQUksY0FBYyxFQUFFO1lBQ25CLFFBQVEsQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDO1lBQ2hDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMxQztRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFHRCxTQUFnQixpQkFBaUI7UUFFaEMsSUFBSSxjQUFjLEdBQUcsb0JBQW9CLENBQUMsa0JBQWtCLENBQWlDLENBQUM7UUFDOUYsSUFBSSxjQUFjLEVBQUU7WUFDbkIsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUM7U0FDbkM7SUFDRixDQUFDO0lBTmUsbUNBQWlCLG9CQU1oQyxDQUFBO0lBR0QsU0FBZ0IsZUFBZTtRQUU5QixJQUFJLGNBQWMsR0FBRyxvQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBaUMsQ0FBQztRQUM5RixJQUFJLGNBQWMsRUFBRTtZQUNuQixjQUFjLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDakM7SUFDRixDQUFDO0lBTmUsaUNBQWUsa0JBTTlCLENBQUE7SUFNRCxTQUFTLGtDQUFrQyxDQUFFLE9BQTBCLEVBQUUsYUFBcUI7UUFFN0YsSUFBSSxxQkFBcUIsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSyxhQUFhLEtBQUssbUJBQW1CLEVBQzFDO1lBQ0MscUJBQXFCLEdBQUcsS0FBSyxDQUFBO1NBQzdCO2FBQ0ksSUFBSyxhQUFhLEtBQUssa0JBQWtCLEVBQzlDO1lBQ0MscUJBQXFCLEdBQUcsS0FBSyxDQUFBO1NBQzdCO2FBQ0ksSUFBSyxhQUFhLEtBQUssbUJBQW1CLEVBQy9DO1lBQ0MscUJBQXFCLEdBQUcsS0FBSyxDQUFBO1NBQzdCO2FBQ0ksSUFBSyxhQUFhLEtBQUssaUJBQWlCLEVBQzdDO1lBQ0MscUJBQXFCLEdBQUcsS0FBSyxDQUFBO1NBQzdCO2FBQ0ksSUFBSyxhQUFhLEtBQUssbUJBQW1CLEVBQy9DO1lBQ0MscUJBQXFCLEdBQUcsS0FBSyxDQUFBO1NBQzdCO2FBQ0ksSUFBSyxhQUFhLEtBQUssaUJBQWlCLEVBQzdDO1lBQ0MscUJBQXFCLEdBQUcsS0FBSyxDQUFBO1NBQzdCO2FBQ0ksSUFBSyxhQUFhLEtBQUssa0JBQWtCLEVBQzlDO1lBQ0MscUJBQXFCLEdBQUcsS0FBSyxDQUFBO1NBQzdCO2FBQ0ksSUFBSyxhQUFhLEtBQUssb0JBQW9CLEVBQ2hEO1lBQ0MscUJBQXFCLEdBQUcsS0FBSyxDQUFBO1NBQzdCO2FBQ0ksSUFBSyxhQUFhLEtBQUssbUJBQW1CLEVBQy9DO1lBQ0MscUJBQXFCLEdBQUcsS0FBSyxDQUFBO1NBQzdCO2FBQ0ksSUFBSyxhQUFhLEtBQUsscUJBQXFCLEVBQ2pEO1lBQ0MscUJBQXFCLEdBQUcsS0FBSyxDQUFBO1NBQzdCO1FBRUQsSUFBSyxxQkFBcUIsR0FBRyxHQUFHLEVBQ2hDO1lBQ0MsT0FBTyxDQUFDLGlDQUFpQyxDQUFFLHFCQUFxQixDQUFFLENBQUM7U0FDbkU7SUFDRixDQUFDO0lBR0QsU0FBUyxnQkFBZ0IsQ0FBRyxNQUFjO1FBS3pDLElBQUksU0FBUyxHQUFzQjtZQUNsQyxVQUFVLEVBQUUscUJBQXFCO1lBQ2pDLGVBQWUsRUFBRSxDQUFDO1lBQ2xCLE1BQU0sRUFBRSxhQUFhO1lBQ3JCLGNBQWMsRUFBRSxNQUFNO1lBQ3RCLFlBQVksRUFBRSxNQUFNO1lBQ3BCLGdCQUFnQixFQUFFLEtBQUs7WUFDdkIsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixhQUFhLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUNsRCxhQUFhLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUNsRCxvQkFBb0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQzFELG9CQUFvQixFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDMUQsYUFBYSxFQUFFLEtBQUs7WUFDcEIsTUFBTSxFQUFFLE9BQU87U0FDZixDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFFLE1BQU0sRUFBRSxTQUFTLENBQUUsQ0FBQztRQUNuRCxlQUFlLENBQUUsS0FBSyxDQUFFLENBQUM7UUFDekIseUJBQXlCLENBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUUsQ0FBQztRQUVsRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsa0NBQWtDLEVBQUUsQ0FBQztRQUUvRCxRQUFRLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUN2QixRQUFRLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUUzQixPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCxTQUFTLGVBQWUsQ0FBRyxNQUFjO1FBS3hDLElBQUksU0FBUyxHQUFzQjtZQUNsQyxVQUFVLEVBQUUscUJBQXFCO1lBQ2pDLGVBQWUsRUFBRSxDQUFDO1lBQ2xCLE1BQU0sRUFBRSxpQkFBaUI7WUFDekIsY0FBYyxFQUFFLE1BQU07WUFDdEIsWUFBWSxFQUFFLE1BQU07WUFDcEIsZ0JBQWdCLEVBQUUsS0FBSztZQUN2QixnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLGFBQWEsRUFBRSxJQUFJO1lBQ25CLGFBQWEsRUFBRSxJQUFJO1lBQ25CLG9CQUFvQixFQUFFLElBQUk7WUFDMUIsb0JBQW9CLEVBQUUsSUFBSTtZQUMxQixhQUFhLEVBQUUsS0FBSztZQUNwQixNQUFNLEVBQUUsT0FBTztTQUNmLENBQUM7UUFFRixNQUFNLEtBQUssR0FBRyxlQUFlLENBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBRSxDQUFDO1FBQ25ELGVBQWUsQ0FBRSxLQUFLLENBQUUsQ0FBQztRQUV6QixpQkFBaUIsQ0FBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFbkMsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsU0FBUyxpQkFBaUIsQ0FBRyxNQUFjO1FBSTFDLElBQUksU0FBUyxHQUFzQjtZQUNsQyxVQUFVLEVBQUUscUJBQXFCO1lBQ2pDLGVBQWUsRUFBRSxDQUFDO1lBQ2xCLE1BQU0sRUFBRSx5QkFBeUI7WUFDakMsY0FBYyxFQUFFLE1BQU07WUFDdEIsWUFBWSxFQUFFLE1BQU07WUFDcEIsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLGFBQWEsRUFBRSxJQUFJO1lBQ25CLGFBQWEsRUFBRSxHQUFHO1lBQ2xCLG9CQUFvQixFQUFFLElBQUk7WUFDMUIsb0JBQW9CLEVBQUUsSUFBSTtZQUMxQixhQUFhLEVBQUUsS0FBSztZQUNwQixNQUFNLEVBQUUsT0FBTztTQUNmLENBQUM7UUFFRixNQUFNLEtBQUssR0FBRyxlQUFlLENBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBRSxDQUFDO1FBQ25ELGVBQWUsQ0FBRSxLQUFLLENBQUUsQ0FBQztRQUN6QixpQkFBaUIsQ0FBRSxLQUFLLEVBQUUsZUFBZSxDQUFFLENBQUM7UUFFNUMsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsU0FBUyxlQUFlLENBQUcsTUFBYztRQUl4QyxJQUFJLFNBQVMsR0FBc0I7WUFDbEMsVUFBVSxFQUFFLHFCQUFxQjtZQUNqQyxlQUFlLEVBQUUsQ0FBQztZQUNsQixNQUFNLEVBQUUsbUJBQW1CO1lBQzNCLGNBQWMsRUFBRSxNQUFNO1lBQ3RCLFlBQVksRUFBRSxPQUFPO1lBQ3JCLGdCQUFnQixFQUFFLEVBQUU7WUFDcEIsZ0JBQWdCLEVBQUUsRUFBRTtZQUNwQixhQUFhLEVBQUUsRUFBRTtZQUNqQixhQUFhLEVBQUUsRUFBRTtZQUNqQixvQkFBb0IsRUFBRSxFQUFFO1lBQ3hCLG9CQUFvQixFQUFFLEVBQUU7WUFDeEIsYUFBYSxFQUFFLEtBQUs7WUFDcEIsTUFBTSxFQUFFLE9BQU87U0FDZixDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFFLE1BQU0sRUFBRSxTQUFTLENBQUUsQ0FBQztRQUNuRCxpQkFBaUIsQ0FBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUUsQ0FBQztRQUVsRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCxTQUFTLGlCQUFpQixDQUFHLE1BQWM7UUFJMUMsSUFBSSxhQUFhLEdBQUcsWUFBWSxDQUFDLHNCQUFzQixDQUFFLE1BQU0sQ0FBRSxLQUFLLEdBQUcsQ0FBQztRQUMxRSxJQUFJLGlCQUFpQixHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDckQsSUFBSSxtQkFBbUIsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3ZELElBQUksdUJBQXVCLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUUzRCxJQUFJLFNBQVMsR0FBc0I7WUFDbEMsVUFBVSxFQUFFLHFCQUFxQjtZQUNqQyxlQUFlLEVBQUUsQ0FBQztZQUNsQixNQUFNLEVBQUUseUJBQXlCO1lBQ2pDLGNBQWMsRUFBRSxNQUFNO1lBQ3RCLFlBQVksRUFBRSxNQUFNO1lBQ3BCLGdCQUFnQixFQUFFLGlCQUFpQjtZQUNuQyxnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLGFBQWEsRUFBRSxtQkFBbUI7WUFDbEMsYUFBYSxFQUFFLElBQUk7WUFDbkIsb0JBQW9CLEVBQUUsdUJBQXVCO1lBQzdDLG9CQUFvQixFQUFFLElBQUk7WUFDMUIsYUFBYSxFQUFFLEtBQUs7WUFDcEIsTUFBTSxFQUFFLE9BQU87U0FDZixDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFFLE1BQU0sRUFBRSxTQUFTLENBQUUsQ0FBQztRQUNuRCxlQUFlLENBQUUsS0FBSyxDQUFFLENBQUM7UUFFekIsaUJBQWlCLENBQUUsS0FBSyxFQUFFLGVBQWUsQ0FBRSxDQUFDO1FBRTVDLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVMsa0JBQWtCLENBQUcsTUFBYztRQUkzQyxJQUFJLFNBQVMsR0FBc0I7WUFDbEMsVUFBVSxFQUFFLHFCQUFxQjtZQUNqQyxlQUFlLEVBQUUsQ0FBQztZQUNsQixNQUFNLEVBQUUsb0JBQW9CO1lBQzVCLGNBQWMsRUFBRSxNQUFNO1lBQ3RCLFlBQVksRUFBRSxNQUFNO1lBQ3BCLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixhQUFhLEVBQUUsSUFBSTtZQUNuQixhQUFhLEVBQUUsR0FBRztZQUNsQixvQkFBb0IsRUFBRSxJQUFJO1lBQzFCLG9CQUFvQixFQUFFLElBQUk7WUFDMUIsYUFBYSxFQUFFLEtBQUs7WUFDcEIsTUFBTSxFQUFFLE9BQU87U0FDZixDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFFLE1BQU0sRUFBRSxTQUFTLENBQUUsQ0FBQztRQUNuRCxlQUFlLENBQUUsS0FBSyxDQUFFLENBQUM7UUFFekIsaUJBQWlCLENBQUUsS0FBSyxFQUFFLGdCQUFnQixDQUFFLENBQUM7UUFFN0MsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsU0FBUyxjQUFjLENBQUcsTUFBYztRQUl2QyxJQUFJLFNBQVMsR0FBc0I7WUFDbEMsVUFBVSxFQUFFLHFCQUFxQjtZQUNqQyxlQUFlLEVBQUUsQ0FBQztZQUNsQixNQUFNLEVBQUUsZ0JBQWdCO1lBQ3hCLGNBQWMsRUFBRSxNQUFNO1lBQ3RCLFlBQVksRUFBRSxPQUFPO1lBQ3JCLGdCQUFnQixFQUFFLEVBQUU7WUFDcEIsZ0JBQWdCLEVBQUUsRUFBRTtZQUNwQixhQUFhLEVBQUUsRUFBRTtZQUNqQixhQUFhLEVBQUUsRUFBRTtZQUNqQixvQkFBb0IsRUFBRSxFQUFFO1lBQ3hCLG9CQUFvQixFQUFFLEVBQUU7WUFDeEIsYUFBYSxFQUFFLEtBQUs7WUFDcEIsTUFBTSxFQUFFLE9BQU87U0FDZixDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFFLE1BQU0sRUFBRSxTQUFTLENBQUUsQ0FBQztRQUNuRCxlQUFlLENBQUUsS0FBSyxDQUFFLENBQUM7UUFFekIsaUJBQWlCLENBQUUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUUsQ0FBQztRQUV4RyxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUFHLE1BQWM7UUFJekMsSUFBSSxTQUFTLEdBQXNCO1lBQ2xDLFVBQVUsRUFBRSxxQkFBcUI7WUFDakMsZUFBZSxFQUFFLENBQUM7WUFDbEIsTUFBTSxFQUFFLFlBQVk7WUFDcEIsY0FBYyxFQUFFLE1BQU07WUFDdEIsWUFBWSxFQUFFLE9BQU87WUFDckIsZ0JBQWdCLEVBQUUsRUFBRTtZQUNwQixnQkFBZ0IsRUFBRSxFQUFFO1lBQ3BCLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLG9CQUFvQixFQUFFLEVBQUU7WUFDeEIsb0JBQW9CLEVBQUUsRUFBRTtZQUN4QixhQUFhLEVBQUUsS0FBSztZQUNwQixNQUFNLEVBQUUsT0FBTztTQUNmLENBQUM7UUFFRixNQUFNLEtBQUssR0FBRyxlQUFlLENBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBRSxDQUFDO1FBQ25ELGVBQWUsQ0FBRSxLQUFLLENBQUUsQ0FBQztRQUN6QixpQkFBaUIsQ0FBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBRSxDQUFDO1FBRTNDLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVMsaUJBQWlCLENBQUcsTUFBYztRQUkxQyxJQUFJLFNBQVMsR0FBc0I7WUFDbEMsVUFBVSxFQUFFLHFCQUFxQjtZQUNqQyxlQUFlLEVBQUUsQ0FBQztZQUNsQixNQUFNLEVBQUUseUJBQXlCO1lBQ2pDLGNBQWMsRUFBRSxNQUFNO1lBQ3RCLFlBQVksRUFBRSxNQUFNO1lBQ3BCLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixhQUFhLEVBQUUsSUFBSTtZQUNuQixhQUFhLEVBQUUsR0FBRztZQUNsQixvQkFBb0IsRUFBRSxJQUFJO1lBQzFCLG9CQUFvQixFQUFFLElBQUk7WUFDMUIsYUFBYSxFQUFFLEtBQUs7WUFDcEIsTUFBTSxFQUFFLE9BQU87U0FDZixDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFFLE1BQU0sRUFBRSxTQUFTLENBQUUsQ0FBQztRQUNuRCxlQUFlLENBQUUsS0FBSyxDQUFFLENBQUM7UUFDekIsaUJBQWlCLENBQUUsS0FBSyxFQUFFLGVBQWUsQ0FBRSxDQUFDO1FBRTVDLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVMsaUJBQWlCO1FBRXpCLElBQUssZ0JBQWdCLEVBQ3JCO1lBQ0MsT0FBTyxxQkFBcUIsQ0FBQztTQUM3QjtRQUVELElBQUksYUFBYSxHQUFHLGdCQUFnQixDQUFDLGdCQUFnQixDQUFFLHNCQUFzQixDQUFFLENBQUM7UUFDaEYsSUFBSyxhQUFhLElBQUksVUFBVSxFQUNoQztZQUNDLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBRSx5QkFBeUIsQ0FBRSxDQUFDO1NBQy9FO1FBRUQsYUFBYSxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7UUFFM0UsT0FBTyxhQUFhLENBQUM7SUFDdEIsQ0FBQztJQUVELFNBQVMsZUFBZSxDQUFHLE1BQWMsRUFBRSxTQUE0QjtRQUV0RSxJQUFJLE9BQU8sR0FBRyxpQkFBaUIsRUFBRSxDQUFDO1FBQ2xDLElBQUksT0FBTyxHQUFHLG9CQUFvQixDQUFFLGtCQUFrQixDQUFrQyxDQUFDO1FBSXpGLElBQUksQ0FBQyxPQUFPLEVBQ1o7WUFDQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBRSxTQUFTLENBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRTtnQkFDakYsMkJBQTJCLEVBQUUsTUFBTTtnQkFDbkMsd0JBQXdCLEVBQUUsT0FBTztnQkFDakMsd0JBQXdCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTztnQkFDN0QsU0FBUyxFQUFFLFVBQVU7Z0JBQ3JCLEtBQUssRUFBRSw2REFBNkQ7Z0JBQ3BFLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTTtnQkFDeEIsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsR0FBRyxFQUFFLE9BQU87Z0JBQ1osY0FBYyxFQUFFLE1BQU07Z0JBQ3RCLFlBQVksRUFBRSxTQUFTLENBQUMsWUFBWTtnQkFDcEMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLGdCQUFnQjtnQkFDNUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLGdCQUFnQjtnQkFDNUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxhQUFhO2dCQUN0QyxhQUFhLEVBQUUsU0FBUyxDQUFDLGFBQWE7Z0JBQ3RDLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxvQkFBb0I7Z0JBQ3BELG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxvQkFBb0I7Z0JBQ3BELGFBQWEsRUFBRSxTQUFTLENBQUMsYUFBYTtnQkFDdEMsZ0JBQWdCLEVBQUUsbUJBQW1CO2dCQUNyQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsa0JBQWtCLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxLQUFLLGFBQWE7Z0JBQ3ZHLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLEtBQUssZ0JBQWdCO2FBQ3JHLENBQTJCLENBQUM7U0FDN0I7UUFFRCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUMvQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUM7UUFDM0QsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUM7UUFFbkMsT0FBTyxDQUFDLGFBQWEsQ0FBRSxTQUFTLENBQUMsZUFBZSxDQUFFLENBQUM7UUFDbkQsT0FBTyxDQUFDLGFBQWEsQ0FBRSxNQUFNLEVBQUUsZ0JBQWdCLENBQUUsQ0FBQztRQUNsRCxPQUFPLENBQUMsV0FBVyxDQUFFLG1DQUFtQyxDQUFFLENBQUM7UUFDM0QsMEJBQTBCLENBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFFLENBQUM7UUFDMUUsZUFBZSxDQUFFLE9BQU8sQ0FBRSxDQUFDO1FBRTNCLE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFRCxTQUFTLG9CQUFvQixDQUFFLE9BQWM7UUFFNUMsS0FBTSxJQUFJLE9BQU8sSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQzdDO1lBQ0MsSUFBSyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLDBCQUEwQixFQUN6RztnQkFDQyxPQUFPLE9BQU8sQ0FBQzthQUNmO1NBQ0Q7UUFDRCxPQUFPLElBQUksQ0FBQTtJQUNaLENBQUM7SUFFRCxTQUFTLHVCQUF1QixDQUFFLE1BQWEsRUFBRSxTQUFnQjtRQU9oRSxJQUFJLG1CQUFtQixHQUFHLG9CQUFvQixDQUFFLFNBQVMsQ0FBRSxDQUFDO1FBQzVELElBQUksQ0FBQyxtQkFBbUI7WUFDdkIsT0FBTztRQUVSLElBQUssbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFDakQ7WUFDQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUM7WUFDN0QsbUJBQW1CLENBQUMsUUFBUSxDQUFFLG1DQUFtQyxDQUFFLENBQUM7WUFDcEUsbUJBQW1CLENBQUMsV0FBVyxDQUFFLEVBQUUsQ0FBRSxDQUFDO1NBQ3RDO0lBQ0YsQ0FBQztJQUVELFNBQVMsMEJBQTBCLENBQUUsT0FBdUQsRUFBRSxlQUFzQixFQUFFLE9BQWM7UUFFbkksSUFBSSxPQUFPLENBQUMsRUFBRSxLQUFLLGtCQUFrQixFQUNyQztZQUNDLHFCQUFxQixDQUFFLE9BQWtDLENBQUUsQ0FBQztZQUM1RCxzQkFBc0IsQ0FBRSxPQUFPLEVBQUUsSUFBSSxDQUFFLENBQUM7WUFDeEMsa0NBQWtDLENBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBRSxDQUFDO1NBQ3ZEO2FBQ0ksSUFBSSxPQUFPLENBQUMsRUFBRSxLQUFLLHlCQUF5QixFQUNqRDtZQUNDLHFCQUFxQixDQUFFLE9BQWtDLENBQUUsQ0FBQztZQUM1RCxzQkFBc0IsQ0FBRSxPQUFPLEVBQUUsS0FBSyxDQUFFLENBQUM7U0FDekM7YUFFRDtZQUNDLHNCQUFzQixDQUFFLE9BQU8sRUFBRSxLQUFLLENBQUUsQ0FBQztZQUV6QyxpQkFBaUIsQ0FBRSxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDN0MsSUFBSyxPQUFPLEtBQUssZ0JBQWdCLEVBQ2pDO2dCQUNDLHVCQUF1QixDQUFFLE9BQU8sQ0FBRSxDQUFDO2FBQ25DO2lCQUVEO2dCQUNDLGlCQUFpQixDQUFFLE9BQU8sQ0FBRSxDQUFDO2FBQzdCO1NBQ0Q7UUFFRCxrQ0FBa0MsQ0FBRSxPQUFPLENBQUUsQ0FBQztJQUMvQyxDQUFDO0lBRUQsU0FBUyxrQ0FBa0MsQ0FBRyxXQUE4QjtRQUUzRSxJQUFLLG1CQUFtQixFQUN4QjtZQUVDLElBQUksc0JBQXNCLEdBQUcsWUFBWSxDQUFDLDZCQUE2QixDQUFFLHdCQUF3QixDQUFFLENBQUM7WUFDcEcsSUFBSSxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsNkJBQTZCLENBQUUsa0JBQWtCLENBQUUsQ0FBQztZQUN4RixJQUFJLHFCQUFxQixHQUFHLFlBQVksQ0FBQyw2QkFBNkIsQ0FBRSxnQkFBZ0IsQ0FBRSxDQUFDO1lBRTNGLElBQUssc0JBQXNCLEtBQUssR0FBRyxFQUNuQztnQkFDQyxXQUFXLENBQUMscUJBQXFCLENBQUUsSUFBSSxDQUFFLENBQUM7Z0JBQzFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBRSxJQUFJLENBQUUsQ0FBQztnQkFDckMsV0FBVyxDQUFDLHdCQUF3QixDQUFFLElBQUksQ0FBRSxDQUFDO2dCQUk3QyxhQUFhLENBQUMsV0FBVyxDQUFFLDBCQUEwQixFQUFFLEtBQUssQ0FBRSxDQUFDO2FBQy9EO2lCQUNJLElBQUssZ0JBQWdCLEVBQzFCO2dCQUNDLE1BQU0sTUFBTSxHQUFHLGNBQWMsQ0FBRSxnQkFBZ0IsQ0FBRSxDQUFDO2dCQUNsRCxXQUFXLENBQUMscUJBQXFCLENBQUUsSUFBSSxDQUFFLENBQUM7Z0JBQzFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBRSxJQUFJLENBQUUsQ0FBQztnQkFDckMsV0FBVyxDQUFDLGtCQUFrQixDQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO2dCQUNsRSxXQUFXLENBQUMsd0JBQXdCLENBQUUsS0FBSyxDQUFFLENBQUM7YUFDOUM7aUJBRUQ7Z0JBQ0MsV0FBVyxDQUFDLHFCQUFxQixDQUFFLEtBQUssQ0FBRSxDQUFDO2dCQUMzQyxXQUFXLENBQUMsZ0JBQWdCLENBQUUsS0FBSyxDQUFFLENBQUM7Z0JBQ3RDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUUsQ0FBQztnQkFDL0MsV0FBVyxDQUFDLHdCQUF3QixDQUFFLEtBQUssQ0FBRSxDQUFDO2FBQzlDO1lBRUQsSUFBSyxxQkFBcUIsS0FBSyxHQUFHLEVBQ2xDO2dCQUNDLFdBQVcsQ0FBQywrQkFBK0IsQ0FBRSxJQUFJLENBQUUsQ0FBQzthQUNwRDtpQkFFRDtnQkFDQyxXQUFXLENBQUMsK0JBQStCLENBQUUsS0FBSyxDQUFFLENBQUM7YUFDckQ7U0FDRDtJQUNGLENBQUM7SUFFRCxTQUFnQix5QkFBeUIsQ0FBRSxNQUFjLEVBQUUsV0FBOEIsRUFBRSxVQUFtQjtRQUU3RyxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsa0JBQWtCLENBQUUsTUFBTSxDQUFFLENBQUM7UUFDM0QsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLHFCQUFxQixDQUFFLE1BQU0sQ0FBRSxDQUFDO1FBRzdELElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQztRQUNwQixJQUFJLE1BQU0sR0FBRyxrQkFBQSx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFFLENBQUM7UUFFN0UsSUFBSSxNQUFNLEVBQ1Y7WUFDQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztTQUMxQjthQUVEO1lBQ0MsUUFBUyxRQUFRLEVBQ2pCO2dCQUNDLEtBQUssV0FBVztvQkFBRSxTQUFTLEdBQUcsR0FBRyxDQUFDO29CQUFDLE1BQU07Z0JBQ3pDLEtBQUssS0FBSztvQkFBRSxTQUFTLEdBQUcsR0FBRyxDQUFDO29CQUFDLE1BQU07YUFDbkM7U0FDRDtRQUVELGlCQUFpQixDQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFFLENBQUM7SUFDekQsQ0FBQztJQXZCZSwyQ0FBeUIsNEJBdUJ4QyxDQUFBO0lBRUQsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7SUFFekIsU0FBUyxpQkFBaUIsQ0FBRyxPQUEwQixFQUFFLFNBQWlCLEVBQUUsYUFBcUIsS0FBSyxFQUFFLFlBQW1CLENBQUM7UUFFM0gsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFFbEMsSUFBSyxtQkFBbUIsRUFDeEI7WUFFQyxPQUFPLENBQUMsa0JBQWtCLENBQUUsTUFBTSxHQUFHLFNBQVMsRUFBRSxDQUFDLENBQUUsQ0FBQztZQUNwRCxPQUFPO1NBQ1A7UUFFRCxJQUFLLFVBQVUsSUFBSSxrQkFBa0IsRUFDckM7WUFDQyxPQUFPLENBQUMsa0JBQWtCLENBQUUsTUFBTSxHQUFHLFNBQVMsRUFBRSxTQUFTLENBQUUsQ0FBQztZQUM1RCxPQUFPO1NBQ1A7UUFHRCxPQUFPLENBQUMsa0JBQWtCLENBQUUsTUFBTSxHQUFHLFNBQVMsR0FBRyxRQUFRLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFFL0QsSUFBSyxnQkFBZ0IsS0FBSyxDQUFDLEVBQzNCO1lBQ0MsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO2dCQUV4QyxJQUFLLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxPQUFPLEVBQ2pDO29CQUNDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBRSxNQUFNLEdBQUcsU0FBUyxFQUFFLENBQUMsQ0FBRSxDQUFDO2lCQUNwRDtZQUNGLENBQUMsQ0FBRSxDQUFDO1NBQ0o7SUFHRixDQUFDO0lBRUQsU0FBZ0IsVUFBVSxDQUFFLEtBQWM7UUFFekMsSUFBSSxPQUFPLEdBQUcsU0FBa0MsQ0FBQztRQUNqRCxNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMscUJBQXFCLENBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBRSxDQUFDO1FBQzlFLElBQUksTUFBTSxHQUFHLGtCQUFBLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUUsQ0FBQztRQUU3RSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDN0QsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLEtBQUssRUFBRTtZQUNqQyxPQUFPO1FBRVIsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBRSxHQUFHLENBQUMsQ0FBQztRQUNyQyxPQUFPLENBQUMsV0FBVyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFDL0IsaUJBQWlCLENBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFFLENBQUM7SUFDdEQsQ0FBQztJQWJlLDRCQUFVLGFBYXpCLENBQUE7SUFFRCxTQUFnQixTQUFTLENBQUUsUUFBZ0I7UUFFMUMsSUFBSSxPQUFPLEdBQUcsU0FBa0MsQ0FBQztRQUNqRCxNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMscUJBQXFCLENBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBRSxDQUFDO1FBRTVFLElBQUksTUFBTSxHQUFHLGtCQUFBLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUUsQ0FBQztRQUM3RSxJQUFJLFNBQVMsR0FBRyxNQUFNLEVBQUUsV0FBVyxDQUFDO1FBRXBDLElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxLQUFLLEVBQUU7WUFDakMsT0FBTztRQUVSLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUUsR0FBRyxDQUFDLENBQUM7UUFDckMsSUFBSSxjQUFjLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RCxPQUFPLENBQUMsV0FBVyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFDL0IsaUJBQWlCLENBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFFLENBQUM7SUFDekQsQ0FBQztJQWZlLDJCQUFTLFlBZXhCLENBQUE7SUFFRCxTQUFTLFNBQVMsQ0FBRSxNQUFjO1FBR2pDLElBQUksT0FBTyxHQUFHLG9CQUFvQixDQUFFLGtCQUFrQixDQUFFLENBQUM7UUFDekQsSUFBSyxDQUFDLE9BQU8sRUFDYjtZQUNDLHNCQUFzQixFQUFFLENBQUM7WUFDekIsT0FBTyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsQ0FBRSxDQUFDO1lBQ3RFLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBRSxlQUFlLENBQUUsQ0FBQztTQUM5QztRQUVELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBRSxtQkFBbUIsQ0FBaUIsQ0FBQztRQUNyRixZQUFZLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUM3QixZQUFZLENBQUMsV0FBVyxDQUFFLFFBQVEsQ0FBRSxDQUFDO1FBRXJDLGVBQWUsQ0FBRSxNQUFNLEVBQUUsWUFBWSxDQUFFLENBQUM7UUFFeEMsT0FBTyxZQUFZLENBQUM7SUFDckIsQ0FBQztJQUVELFNBQVMsc0JBQXNCO1FBRTlCLElBQUksT0FBTyxHQUFHLGlCQUFpQixFQUFFLENBQUM7UUFFbEMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBRSx1QkFBdUIsRUFBRSxhQUFhLEVBQUUseUJBQXlCLEVBQUU7WUFDL0YsMkJBQTJCLEVBQUUsTUFBTTtZQUNuQyx3QkFBd0IsRUFBRSxPQUFPO1lBQ2pDLHdCQUF3QixFQUFFLE9BQU87WUFDakMsU0FBUyxFQUFFLFVBQVU7WUFDckIsS0FBSyxFQUFFLHdCQUF3QjtZQUMvQixNQUFNLEVBQUUsYUFBYTtZQUNyQixNQUFNLEVBQUUsT0FBTztZQUNmLEdBQUcsRUFBRSxPQUFPO1NBQ1osQ0FBNkIsQ0FBQztRQUUvQixpQkFBaUIsQ0FBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUUsQ0FBQztRQUNqRCwwQkFBMEIsQ0FBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ25ELENBQUM7SUFFRCxTQUFTLGVBQWUsQ0FBRSxFQUFVLEVBQUUsT0FBZ0I7UUFFckQsYUFBYSxDQUFDLG1CQUFtQixDQUFFLEVBQUUsRUFBRSxPQUFPLENBQUUsQ0FBQztJQUNsRCxDQUFDO0lBRUQsU0FBZ0IsWUFBWSxDQUFFLGVBQXVCLEVBQUUsWUFBb0I7UUFFMUUsUUFBUSxDQUFDLGtDQUFrQyxDQUFFLGVBQWUsQ0FBRSxDQUFDO1FBQy9ELGNBQWMsQ0FBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBRSxDQUFDO0lBQ3ZELENBQUM7SUFKZSw4QkFBWSxlQUkzQixDQUFBO0lBRUQsU0FBZ0IsaUJBQWlCLENBQUUsS0FBYztRQUVoRCxJQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtZQUM1QixPQUFPO1FBRVIsTUFBTSxXQUFXLEdBQUcsb0JBQW9CLENBQUUsa0JBQWtCLENBQUcsQ0FBQztRQUNoRSxXQUFXLENBQUMsV0FBVyxDQUFFLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBRSxDQUFDO1FBRTVDLElBQUssS0FBSztZQUNULENBQUMsQ0FBQyxhQUFhLENBQUUscUJBQXFCLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDdkUsQ0FBQztJQVZlLG1DQUFpQixvQkFVaEMsQ0FBQTtJQUVELFNBQWdCLGlCQUFpQixDQUFFLEtBQWM7UUFFaEQsSUFBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUU7WUFDNUIsT0FBTztRQUVSLE1BQU0sV0FBVyxHQUFHLG9CQUFvQixDQUFFLGtCQUFrQixDQUFFLENBQUM7UUFFL0QsSUFBSSxXQUFXO1lBQ2QsV0FBVyxDQUFDLFdBQVcsQ0FBRSxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUUsQ0FBQztRQUU3QyxJQUFLLEtBQUs7WUFDVCxDQUFDLENBQUMsYUFBYSxDQUFFLHFCQUFxQixFQUFFLG1CQUFtQixFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ3pFLENBQUM7SUFaZSxtQ0FBaUIsb0JBWWhDLENBQUE7SUFFRCxTQUFnQixhQUFhO1FBRTVCLE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFIZSwrQkFBYSxnQkFHNUIsQ0FBQTtJQUVELFNBQWdCLGVBQWUsQ0FBRSxNQUFhO1FBRTdDLElBQUksT0FBTyxHQUFHLFNBQTRELENBQUM7UUFFM0UsSUFBSyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUNqQztZQUNDLE9BQU8sQ0FBQyxhQUFhLENBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBRSxDQUFDO1NBQ3BDO0lBQ0YsQ0FBQztJQVJlLGlDQUFlLGtCQVE5QixDQUFBO0lBRUQsU0FBZ0IsU0FBUyxDQUFFLFFBQWlCO1FBRTNDLEtBQU0sSUFBSSxPQUFPLElBQUksQ0FBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSx5QkFBeUIsQ0FBQyxFQUN6RjtZQUNDLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBRSxPQUFPLENBQXFELENBQUM7WUFFdkcsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUNoQztnQkFDQyxJQUFJLE9BQU8sR0FBRyxpQkFBaUIsRUFBRSxDQUFDO2dCQUNsQyxJQUFJLE9BQU8sS0FBSyxPQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUN6QztvQkFDQyxPQUFRLENBQUMsU0FBUyxDQUFFLE9BQU8sQ0FBRSxDQUFDO29CQUM5QixPQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztvQkFFcEMsMEJBQTBCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxlQUFlLEVBQUUsT0FBUSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBRSxDQUFDO29CQUVoRyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBRSxFQUM5Qzt3QkFDQyx5QkFBeUIsQ0FBRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUUsQ0FBQztxQkFDbEU7eUJBRUQ7d0JBQ0MsaUJBQWlCLENBQUUsT0FBTyxFQUFFLE9BQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFFLENBQUM7cUJBQzNEO2lCQUVEO2FBQ0Q7U0FDRDtJQUNGLENBQUM7SUE1QmUsMkJBQVMsWUE0QnhCLENBQUE7SUFFRCxTQUFTLHNCQUFzQixDQUFFLE9BQXdELEVBQUUsbUJBQTRCLEtBQUs7UUFFM0gsT0FBTyxDQUFDLGVBQWUsQ0FBRSxrQkFBa0IsRUFBRSxPQUFPLENBQUUsQ0FBQztRQUN2RCxPQUFPLENBQUMsZUFBZSxDQUFFLG1CQUFtQixFQUFFLE9BQU8sQ0FBRSxDQUFDO1FBQ3hELE9BQU8sQ0FBQyxlQUFlLENBQUUsbUJBQW1CLEVBQUUsT0FBTyxDQUFFLENBQUM7UUFDeEQsT0FBTyxDQUFDLGVBQWUsQ0FBRSxtQkFBbUIsRUFBRSxPQUFPLENBQUUsQ0FBQztRQUN4RCxPQUFPLENBQUMsZUFBZSxDQUFFLG1CQUFtQixFQUFFLE9BQU8sQ0FBRSxDQUFDO1FBRXhELElBQUssQ0FBQyxnQkFBZ0IsRUFDdEI7WUFDQyxPQUFPLENBQUMsZUFBZSxDQUFFLG1CQUFtQixFQUFFLE9BQU8sQ0FBRSxDQUFDO1NBQ3hEO0lBQ0YsQ0FBQztJQUVELFNBQWdCLHFCQUFxQixDQUFFLE9BQWdDO1FBRXRFLGlCQUFpQixDQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ2xDLENBQUM7SUFIZSx1Q0FBcUIsd0JBR3BDLENBQUE7SUFFRCxTQUFTLGlCQUFpQixDQUFFLFNBQWlCLEVBQUUsT0FBd0Q7UUFLdEcsSUFBSSxvQkFBb0IsR0FBRyxDQUFDLENBQUM7UUFFN0IsS0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLG9CQUFvQixFQUFFLENBQUMsRUFBRSxFQUMvQztZQUNDLElBQUksWUFBWSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQy9DLElBQUssU0FBUyxLQUFLLENBQUMsRUFDcEI7Z0JBQ0MsT0FBTyxDQUFDLGVBQWUsQ0FBRSxNQUFNLEdBQUcsWUFBWSxFQUFFLE9BQU8sQ0FBRSxDQUFDO2dCQUMxRCxPQUFPLENBQUMsZUFBZSxDQUFFLFlBQVksR0FBRyxZQUFZLEVBQUUsU0FBUyxDQUFFLENBQUM7Z0JBQ2xFLE9BQU8sQ0FBQyxlQUFlLENBQUUsZ0JBQWdCLEdBQUcsWUFBWSxFQUFFLFNBQVMsQ0FBRSxDQUFDO2FBQ3RFO2lCQUVEO2dCQUNDLFlBQVksQ0FBRSxZQUFZLEVBQUUsT0FBTyxDQUFFLENBQUM7YUFDdEM7U0FDRDtJQUNGLENBQUM7SUFHRCxTQUFTLGVBQWUsQ0FBRSxPQUF3RDtRQUVqRixJQUFLLENBQUMsZ0JBQWdCLEVBQ3RCO1lBQ0MsT0FBTztTQUNQO1FBRUQsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFFLGFBQWEsQ0FBRSxDQUFDO1FBQy9DLE1BQU0sTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUdyRCxPQUFPLENBQUMsZUFBZSxDQUFFLHNCQUFzQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sR0FBRyxNQUFNLENBQUUsQ0FBQztJQUN2RixDQUFDO0lBRUQsU0FBUyxZQUFZLENBQUUsU0FBaUIsRUFBRSxPQUF3RDtRQUVqRyxJQUFLLGdCQUFnQixFQUNyQjtZQUNDLE9BQU8sQ0FBQyxlQUFlLENBQUUsWUFBWSxHQUFHLFNBQVMsRUFBRSxTQUFTLENBQUUsQ0FBQztZQUUvRCxNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUUsYUFBYSxDQUFFLENBQUM7WUFDL0MsTUFBTSxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3JELElBQUksY0FBYyxHQUFHLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztZQUdsRCxPQUFPLENBQUMsZUFBZSxDQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFFLENBQUM7U0FDOUQ7YUFFRDtZQUNDLE9BQU8sQ0FBQyxlQUFlLENBQUUsZ0JBQWdCLEdBQUcsU0FBUyxFQUFFLFNBQVMsQ0FBRSxDQUFDO1NBQ25FO0lBQ0YsQ0FBQztJQUVELFNBQVMsaUJBQWlCLENBQUUsT0FBd0Q7UUFFbkYsT0FBTyxDQUFDLGVBQWUsQ0FBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUUsS0FBSyxDQUFFLENBQUM7SUFDL0QsQ0FBQztJQUVELFNBQVMsdUJBQXVCLENBQUUsT0FBd0Q7UUFFekYsT0FBTyxDQUFDLGVBQWUsQ0FBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLEtBQUssQ0FBRSxDQUFDO0lBQ2pFLENBQUM7SUFFRCxTQUFTLGNBQWMsQ0FBRSxHQUFXO1FBRW5DLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBRSxHQUFHLENBQUMsS0FBSyxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFBRSxFQUFFLENBQUUsQ0FBQztRQUM1QyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQUUsRUFBRSxDQUFFLENBQUM7UUFDNUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDO1FBRTVDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ3BCLENBQUM7QUFDRixDQUFDLEVBL2dDUyxpQkFBaUIsS0FBakIsaUJBQWlCLFFBK2dDMUIifQ==