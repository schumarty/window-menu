/* eslint indent: ["error", 4] */
/* global imports */

const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const Gettext = imports.gettext.domain('window-menu');
const _ = Gettext.gettext;

const ExtPrefsWidget = new GObject.Class({
    Name: 'WindowMenu.Prefs.Widget',
    GTypeName: 'WindowMenuPrefsWidget',
    Extends: Gtk.Grid,

    _init(params) {
        this.parent(params);

        this.margin = 24;
        this.row_spacing = 6;
        this.column_spacing = 6;
        this.orientation = Gtk.Orientation.VERTICAL;

        this._settings = Convenience.getSettings();

        // Workspaces Switch
        const wkspLabel = new Gtk.Label({
            label: _("List Workspaces"),
            halign: Gtk.Align.START,
            hexpand: true,
        });
        const wkspSwitch = new Gtk.Switch({
            halign: Gtk.Align.END,
            hexpand: true,
        });
        this._settings.bind('show-workspaces', wkspSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.attach(wkspLabel, 0, 0, 1, 1);
        this.attach(wkspSwitch, 1, 0, 1, 1);

        // Icon Switch
        const iconLabel = new Gtk.Label({
            label: _("Show Icons"),
            halign: Gtk.Align.START,
            hexpand: true,
        });
        const iconSwitch = new Gtk.Switch({
            halign: Gtk.Align.END,
            hexpand: true,
        });
        this._settings.bind('show-icons', iconSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.attach(iconLabel, 0, 1, 1, 1);
        this.attach(iconSwitch, 1, 1, 1, 1);

        // Menu Placement Position Setting
        const widthLabel = new Gtk.Label({
            label: _("Menu Width"),
            halign: Gtk.Align.START,
            hexpand: true,
        });
        const widthAdjustment = new Gtk.Adjustment({
            value: 20.0,
            lower: 10.0,
            upper: 100.0,
            step_increment: 1.0,
            page_increment: 5.0,
            page_size: 0.0,
        });
        const widthSpin = new Gtk.SpinButton({
            adjustment: widthAdjustment,
            climb_rate: 0.0,
            digits: 0,
            halign: Gtk.Align.END,
            hexpand: true,
        });
        this._settings.bind('menu-width', widthSpin, 'value', Gio.SettingsBindFlags.DEFAULT);
        this.attach(widthLabel, 0, 3, 1, 1);
        this.attach(widthSpin, 1, 3, 1, 1);

        // Menu Placement Position Setting
        const posLabel = new Gtk.Label({
            label: _("Menu Placement Position"),
            halign: Gtk.Align.START,
            hexpand: true,
        });
        const posAdjustment = new Gtk.Adjustment({
            value: 1.0,
            lower: 0.0,
            upper: 10.0,
            step_increment: 1.0,
            page_increment: 5.0,
            page_size: 0.0,
        });
        const posSpin = new Gtk.SpinButton({
            adjustment: posAdjustment,
            climb_rate: 0.0,
            digits: 0,
            halign: Gtk.Align.END,
            hexpand: true,
        });
        this._settings.bind('menu-placement-position', posSpin, 'value', Gio.SettingsBindFlags.DEFAULT);
        this.attach(posLabel, 0, 4, 1, 1);
        this.attach(posSpin, 1, 4, 1, 1);

        // Horizontal Line
        const hLine = new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL });
        this.attach(hLine, 0, 5, 2, 1);

        // Sorting Options Radio Buttons
        const sortLabel = new Gtk.Label({
            label: _("Sorting method for windows:"),
            halign: Gtk.Align.START,
            hexpand: true,
        });

        const stableRadio = new Gtk.RadioButton({
            label: _("Stable Sequence: order in which windows were opened"),
        });
        stableRadio.connect('toggled', (radio) => {
            if (radio.active) this._settings.set_string('sort-type', 'stableSequence');
        });

        const appRadio = new Gtk.RadioButton({
            label: _("App Name: name of application inside window"),
            group: stableRadio,
        });
        appRadio.connect('toggled', (radio) => {
            if (radio.active) this._settings.set_string('sort-type', 'appName');
        });

        const activeRadio = this._settings.get_string('sort-type');
        if (activeRadio === 'appName') appRadio.active = true;

        this.attach(sortLabel, 0, 6, 2, 1);
        this.attach(stableRadio, 0, 7, 2, 1);
        this.attach(appRadio, 0, 8, 2, 1);
    },
});

/* eslint-disable no-var, no-unused-vars */
var init = function() {
};

var buildPrefsWidget = function() {
    const widget = new ExtPrefsWidget();
    widget.show_all();

    return widget;
};
