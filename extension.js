/* eslint indent: ["error", 4] */
/* global imports */

const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Lang = imports.lang;
const Shell = imports.gi.Shell;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Gettext = imports.gettext.domain('window-menu');
const _ = Gettext.gettext;

const MENU_PLACEMENT_POSITION = 1;
const ICON_SIZE = 16;
const SORT_TYPE = 'orderOpened';

const sortWindowsBy = {
    orderOpened(a, b) {
        return a.get_stable_sequence() - b.get_stable_sequence();
    },

};

const MenuItem = new Lang.Class({
    Name: 'MenuItem',
    Extends: PopupMenu.PopupBaseMenuItem,

    _init(window) {
        this.parent();
        this._window = window;
        this._windowApp = Shell.WindowTracker.get_default().get_window_app(this._window);

        this._icon = this._windowApp.create_icon_texture(ICON_SIZE);
        this.actor.add_child(this._icon);

        const label = new St.Label({ text: this._window.title });
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
            this._icon.opacity = 128;
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

        this._restack = global.screen.connect('restacked', Lang.bind(this, this._onRestack));
    },

    destroy() {
        global.disconnect(this._restack);
        this.parent();
    },

    _updateMenu() {
        global.log("[Menu List]: updating menu!");
        this.menu.removeAll();

        const wkspWindows = global.screen.get_active_workspace().list_windows();
        wkspWindows.sort(sortWindowsBy[SORT_TYPE]);

        if (wkspWindows.length > 0) {
            for (let i = 0; i < wkspWindows.length; i++) {
                this.menu.addMenuItem(new MenuItem(wkspWindows[i]));
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

/* eslint-disable no-var, no-unused-vars */
var init = function() {
    // Nothing to do here right now
};

let _indicator;

var enable = function () {
    _indicator = new WindowMenu();

    Main.panel.addToStatusArea('window-menu', _indicator, MENU_PLACEMENT_POSITION, 'left');
};

var disable = function() {
    _indicator.destroy();
};
