/*
 * First attempt at creating an extension for GNOME, not totally sure what I'm
 * doin here. Code is mosty coppied over from the 'places-menu' extension which
 * is included in GNOME Shell.
 */

const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Lang = imports.lang;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Gettext = imports.gettext.domain('window-menu');
const _ = Gettext.gettext;

const MenuItem = new Lang.Class({
  Name: 'MenuItem',
  Extends: PopupMenu.PopupBaseMenuItem,

  _init: function(window) {
    this.parent();
    this._window = window;

    this._label = new St.Label({ text: this._window.title });
    this.actor.add_child(this._label);

    global.log('[window-menu]: title=' + this._window.title);
  },

  destroy: function() {
    this.parent();
  },

  activate: function(event) {
    this._window.activate(global.get_current_time());

    this.parent(event);
  },
});

const WindowMenu = new Lang.Class({
  Name: 'WindowMenu',
  Extends: PanelMenu.Button,

  _init: function() {
    // I think this calls the constructor of the parent class but I'm not sure
    this.parent(0.0, _("Windows"));

    let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
    let label = new St.Label({
      text: _("Windows"),
      y_expand: true,
      y_align: Clutter.ActorAlign.CENTER,
    });
    hbox.add_child(label);
    hbox.add_child(PopupMenu.arrowIcon(St.Side.BOTTOM));

    this.actor.add_actor(hbox);

    global.screen.connect('restacked', Lang.bind(this, this._updateMenu));
  },

  destroy: function() {
    this.parent();
  },

  _updateMenu: function() {
    global.log('[window-menu]: updating menu');

    this.menu.removeAll();

    let wkspWindows = global.screen.get_active_workspace().list_windows();

    for (let i = 0; i < wkspWindows.length; i++) {
      this.menu.addMenuItem(new MenuItem(wkspWindows[i]));
    }
  },
});

function init() {
  // Nothing to do here right now
}

// Track object when extension is enabled so we can remove it upon disable
let _indicator;

function enable() {
  _indicator = new WindowMenu();

  // Not sure how this interacts with other items with the same pos number
  let pos = 1;
  if ('apps-menu' in Main.panel.statusArea) {
    pos = 2;
  }
  Main.panel.addToStatusArea('window-menu', _indicator, pos, 'left');
}

function disable() {
  _indicator.destroy();
}
