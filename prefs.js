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

        this.margin = 12;
        this.row_spacing = 6;
        this.column_spacing = 6;
        this.orientation = Gtk.Orientation.VERTICAL;

        this._settings = Convenience.getSettings();

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
        this.attach(iconLabel, 0, 0, 1, 1);
        this.attach(iconSwitch, 1, 0, 1, 1);

        const titleLabel = new Gtk.Label({
            label: _("Maximum Title Length"),
            halign: Gtk.Align.START,
            hexpand: true,
        });
        const titleAdjustment = new Gtk.Adjustment({
            value: 1.0,
            lower: 1.0,
            upper: 1000.0,
            step_increment: 1.0,
            page_increment: 5.0,
            page_size: 0.0,
        });
        const titleSpin = new Gtk.SpinButton({
            adjustment: titleAdjustment,
            climb_rate: 0.0,
            digits: 0,
            halign: Gtk.Align.END,
            hexpand: true,
        });
        this._settings.bind('max-title-length', titleSpin, 'value', Gio.SettingsBindFlags.DEFAULT);
        this.attach(titleLabel, 0, 1, 1, 1);
        this.attach(titleSpin, 1, 1, 1, 1);
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
