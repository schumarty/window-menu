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

const windowMenu = new Lang.Class({
  Name: 'WindowMenu.WindowMenu',
  Extends: PanelMenu.Button,

  _init: function() {
    // I think this calls the constructor of the parent class but I'm not sure
    this.parent(0.0, _("Windows"));

    let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
    let label = new St.Label({
      text: _("Windows"),
      y_expand: true,
      y_align: Clutter.ActorAlign.CENTER
    });
    hbox.add_child(label);
    hbox.add_child(PopupMenu.arrowIcon(St.Side.BOTTOM));

    this.actor.add_actor(hbox);

    let section = new PopupMenu.PopupMenuSection();

    this.menu.addMenuItem(section);
  },

  destroy: function() {
    this.parent();
  },
});

function init() {
  // Nothing to do here right now
};

// Track object when extension is enabled so we can remove it upon disable
let _indicator;

function enable() {
  _indicator = new windowMenu();

  // Not sure how this interacts with other items with the same pos number
  let pos = 1;
  if ('apps-menu' in Main.panel.statusArea) {
    pos = 2;
  }
  Main.panel.addToStatusArea('window-menu', _indicator, pos, 'left');
};

function disable() {
  _indicator.destroy();
};
