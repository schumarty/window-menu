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
        this.orientation = Gtk.Orientation.VERTICAL;

        this._settings = Convenience.getSettings();

        const iconCheck = new Gtk.CheckButton({ label: _("Show Icons") });
        this._settings.bind('show-icons', iconCheck, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add(iconCheck);
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
