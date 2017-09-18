/* eslint indent: ["error", 4] */
/* global imports */

const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Lang = imports.lang;
const Shell = imports.gi.Shell;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const Gettext = imports.gettext.domain('window-menu');
const _ = Gettext.gettext;

const _settings = Convenience.getSettings();
const ICON_SIZE = 16;

const _sortMenuItemsBy = {
    stableSequence(a, b) {
        return a._window.get_stable_sequence() - b._window.get_stable_sequence();
    },

    /* eslint-disable indent */
    appName(a, b) {
        return a._windowApp.get_name().toLowerCase().localeCompare(
               b._windowApp.get_name().toLowerCase());
    },
    /* eslint-enable indent */
};

const _truncateString = function(string, maxLength) {
    if (string.length > maxLength) {
        return `${string.substring(0, maxLength)}...`;
    }
    return string;
};

const WkspMenuItem = new Lang.Class({
    Name: 'WkspMenuItem',
    Extends: PopupMenu.PopupBaseMenuItem,

    _init(wksp) {
        this.parent();

        this._wksp = wksp;
        this._indexNum = wksp.index();

        const label = new St.Label({
            text: `Workspace ${this._indexNum}`,
        });
        this.actor.add_child(label);
    },

    destroy() {
        this.parent();
    },

    activate(event) {
        if (Main.overview.visible) Main.overview.hide();

        this._wksp.activate(global.get_current_time());

        this.parent(event);
    },
});

const WindowMenuItem = new Lang.Class({
    Name: 'WindowMenuItem',
    Extends: PopupMenu.PopupBaseMenuItem,

    _init(window) {
        this.parent();

        this._window = window;
        this._windowApp = Shell.WindowTracker.get_default().get_window_app(this._window);

        if (_settings.get_boolean('show-icons')) {
            this._icon = this._windowApp.create_icon_texture(ICON_SIZE);
            this.actor.add_child(this._icon);
        }

        const label = new St.Label({
            text: _truncateString(this._window.title, _settings.get_int("max-title-length")),
        });
        this.actor.add_child(label);

        this._applyStyles();
    },

    destroy() {
        this.parent();
    },

    activate(event) {
        if (Main.overview.visible) Main.overview.hide();

        this._window.activate(global.get_current_time());

        this.parent(event);
    },

    _applyStyles() {
        if (this._window.minimized) {
            this.actor.add_style_class_name('minimized');
            if (_settings.get_boolean('show-icons')) this._icon.opacity = 128;
        }

        if (global.display.focus_window === this._window) {
            this.actor.add_style_class_name('focused');
        }
    },
});

const WindowMenu = new Lang.Class({
    Name: 'WindowMenu',
    Extends: PanelMenu.Button,

    _init() {
        this.parent(0.0, _("Windows"));

        const hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        const label = new St.Label({
            text: _("Windows"),
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        hbox.add_child(label);
        hbox.add_child(PopupMenu.arrowIcon(St.Side.BOTTOM));

        this.actor.add_actor(hbox);

        // Won't work without this - I think we must first create a menu
        // in order to have something to connect the signal to
        this._updateMenu();

        this.menu.connect('open-state-changed', Lang.bind(this, this._onOpenMenu));

        this._restackId = global.screen.connect('restacked', Lang.bind(this, this._onRestack));
    },

    destroy() {
        global.screen.disconnect(this._restackId);
        this.parent();
    },

    _updateMenu() {
        this.menu.removeAll();

        const nWorkspaces = global.screen.n_workspaces;
        for (let i = 0; i < nWorkspaces; i++) {
            const wkspItem = new WkspMenuItem(global.screen.get_workspace_by_index(i));
            this.menu.addMenuItem(wkspItem);
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const wkspWindows = global.screen.get_active_workspace().list_windows();

        if (wkspWindows.length > 0) {
            const menuItems = [];
            for (let i = 0; i < wkspWindows.length; i++) {
                if (!wkspWindows[i].skip_taskbar) {
                    menuItems.push(new WindowMenuItem(wkspWindows[i]));
                }
            }

            menuItems.sort(_sortMenuItemsBy[_settings.get_string('sort-type')]);

            for (let i = 0; i < menuItems.length; i++) {
                this.menu.addMenuItem(menuItems[i]);
            }
        } else {
            const emptyItem = new PopupMenu.PopupBaseMenuItem();
            emptyItem.actor.add_style_class_name('no-windows-msg');

            const label = new St.Label({ text: _("No Active Windows") });
            emptyItem.actor.add_child(label);
            this.menu.addMenuItem(emptyItem);
        }
    },

    _onOpenMenu() {
        if (this.menu.isOpen) this._updateMenu();
    },

    _onRestack() {
        // Refresh menu if windows change while menu is open
        if (this.menu.isOpen) this._updateMenu();
    },
});

let _indicator;
let _posChangeId;

const _placeMenu = function() {
    if ('window-menu' in Main.panel.statusArea) _indicator.destroy();
    _indicator = new WindowMenu();

    const position = _settings.get_int('menu-placement-position');
    Main.panel.addToStatusArea('window-menu', _indicator, position, 'left');
};

/* eslint-disable no-var, no-unused-vars */
var init = function() {
    // Nothing to do here right now
};

var enable = function () {
    _posChangeId = _settings.connect('changed::menu-placement-position', Lang.bind(this, _placeMenu));

    _placeMenu();
};

var disable = function() {
    _indicator.destroy();
    _settings.disconnect(_posChangeId);
};
