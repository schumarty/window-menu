/*
  * First attempt at creating an extension for GNOME, not totally sure what I'm
  * doin here. Code is mosty coppied over from the 'places-menu' extension which
  * is included in GNOME Shell.
  */

/* eslint indent: ["error", 4] */
/* global imports */

const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Lang = imports.lang;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Gettext = imports.gettext.domain('window-menu');
const _ = Gettext.gettext;

const PLACEMENT_POSITION = 2;

const MenuItem = new Lang.Class({
    Name: 'MenuItem',
    Extends: PopupMenu.PopupBaseMenuItem,

    _init(window) {
        this.parent();
        this._window = window;

        if (window.minimized) {
            this.actor.add_style_class_name('minimized');
        }

        if (global.display.focus_window === this._window) {
            this.actor.add_style_class_name('focused');
        }

        const label = new St.Label({ text: this._window.title });
        this.actor.add_child(label);
    },

    destroy() {
        this.parent();
    },

    activate(event) {
        this._window.activate(global.get_current_time());

        this.parent(event);
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

        this._updateMenu();

        this.menu.connect('open-state-changed', Lang.bind(this, this._updateMenu));
    },

    destroy() {
        this.parent();
    },

    _updateMenu() {
        this.menu.removeAll();

        const wkspWindows = global.screen.get_active_workspace().list_windows();

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
});

var init = function () {
    // Nothing to do here right now
};

// Track object when extension is enabled so we can remove it upon disable
let _indicator;

var enable = function () {
    _indicator = new WindowMenu();

    Main.panel.addToStatusArea('window-menu', _indicator, PLACEMENT_POSITION, 'left');
};

var disable = function() {
    _indicator.destroy();
};
