// Widgets.js
// Dependencies: Basics.R1; constants
// Copyright 2013 Int3raction.com, all rights reserved.
// Change log:
// 2013-12-26: Carlos Silva: created initial version of the file from old EAP functionality


// TODO decide whether to pull all UI-related functionality here and rename this file


///////////////////////////////////////////////////////////////////////////////
// Group class:
///////////////////////////////////////////////////////////////////////////////

function Group(args) {
	if(args.widget) {
		Utils.checkArgValues(args.widget, "block");
		if(args.widget == "block") {
			args.activeClass = "wg-block";
			args.selectedClass = "wg-block-s";
		}
	}
	Utils.checkArgs(args, "activeClass", "selectedClass");
	this.nodes = new Array();
	this._activeClass = args.activeClass;
	this._selectedClass = args.selectedClass;
	this._lastSelected = null;
	this._lastEventHandler = null;

	this.push = function(node) {
		this.nodes.push(node);
		if(!node.wrapper2) {
			node.wrapper2 = this;
		}
		node.className = this._activeClass;
		DOM.addEvent(node, "onclick", function(node) {
			// Re-enable the previously selected item:
			if(node.wrapper2._lastSelected != null) {
				node.wrapper2._lastSelected.className = node.wrapper2._activeClass;
				node.wrapper2._lastSelected.onclick = node.wrapper2._lastEventHandler;
			}
			node.wrapper2._lastSelected = node;
			// Disable the clicked node:
			node.className = node.wrapper2._selectedClass;
			node.wrapper2._lastEventHandler = node.onclick;
			node.onclick = null;
		});
	}
	return this;
};


///////////////////////////////////////////////////////////////////////////////
// Widgets class:
///////////////////////////////////////////////////////////////////////////////

var Widgets = {
	
	Constants: {
		defaultTableClass: false,
		defaultColClass: false,
		mandatoryColor: "#FA0000",
		marginBottom: 7
	},
	
	Table: function(args) {
		args = Utils.not(args) ? {} : args;
		Utils.checkArgs(args, "numCols=1");
		this.node = document.createElement("table");
		this.node.wrapper = this;
		this.rows = new Array();
		if(args.tableClass) {
			this.node.className = args.tableClass;
		}
		this.addRow = function() {
			var row = {node:DOM.addNode(this.node, "tr")};
			row.node.wrapper = row;
			this.rows.push(row);
			row.cols = new Array();
			for(var i=0; i<args.numCols; i++) {
				var col = {node:DOM.addNode(row.node, "td")};
				col.node.wrapper = col;
				row.cols.push(col);
				if(args.colClass) {
					col.node.className = args.colClass;
				}
				// Widget shortcut functions:
				col.addTable = function(args) { return new Widgets.Table(args).attachTo(this.node); };
				col.addBlock = function(args) { return new Widgets.Block(args).attachTo(this.node); };
				col.addTitle = function(args) { return new Widgets.Title(args).attachTo(this.node); };
				col.addLabel = function(args) { return new Widgets.Label(args).attachTo(this.node); };
				col.addText = function(args) { return new Widgets.Text(args).attachTo(this.node); };
				col.addButtonGrid = function(args) { return new Widgets.ButtonGrid(args).attachTo(this.node); };
				col.addUserBlock = function(args) { return new Widgets.UserBlock(args).attachTo(this.node); };
				col.addTextBox = function(args) { return new Widgets.TextBox(args).attachTo(this.node); };
				col.addTextArea = function(args) { return new Widgets.TextArea(args).attachTo(this.node); };
				col.addDatePicker = function(args) { return new Widgets.DatePicker(args).attachTo(this.node); };
			}
			row.last = function() {
				return Arrays.last(this.cols);
			};
			return row;
		};
		this.last = function() {
			return Arrays.last(this.rows);
		};
		this.attachTo = Widgets._attachTo;
		return this;
	},

	Block: function(args) {
		Utils.checkArgs(args, "text");
		this.node = document.createElement("div");
		this.node.wrapper = this;
		this.node.className = "wg-block";
		this.node.innerHTML = args.text;
		this.attachTo = Widgets._attachTo;
		return this;
	},
	
	Title: function(args) {
		Utils.checkArgs(args, "text");
		this.node = document.createElement("div");
		this.node.wrapper = this;
		if(args.subtitle) {
			this.node.className = "wg-subtitle";
		}
		else {
			this.node.className = "wg-title";
		}
		this.node.innerHTML = args.text;
		this.attachTo = Widgets._attachTo;
		return this;
	},

	Text: function(args) {
		Utils.checkArgs(args, "text");
		this.node = document.createElement("div");
		this.node.wrapper = this;
		this.node.className = "wg-text";
		if(args.href) {
			var a = DOM.addNode(this.node, "a");
			a.href = args.href;
			a.target = "_blank";
			a.innerHTML = args.text;
		}
		else {
			this.node.innerHTML = args.text;
		}
		if(args.title) {
			this.node.style.fontWeight = "bold";
			this.node.style.fontSize = "14px";		
		}
		if(args.margin) {
			this.node.style.marginBottom = args.margin+"px";
		}
		if(args.float) {
			this.node.style.float = "left";
			this.node.style.marginRight = "7px";			
		}
		this.attachTo = Widgets._attachTo;
		return this;
	},

	Label: function(args) {
		var text = new Widgets.Text(args);
		text.node.className = "wg-label";
		if(args.mandatory) {
			var span = DOM.addNode(text.node, "span");
			span.style.color = Widgets.Constants.mandatoryColor;
			span.innerHTML = "&nbsp;*";
		}
		return text;
	},

	ButtonGrid: function(args) {
		Utils.checkArgs(args, "buttons", "size='absolute'");
		Utils.checkArgValues(args.size, "relative", "absolute");
		// Count the number of characters in the buttons:
		var numChars = 0;
		if(args.size == "relative") {
			for(var i=0; i<args.buttons.length; i++) {
				numChars += args.buttons[i].text.length;
			}
		}
		this.node = document.createElement("table");
		this.node.className = "wg-button-grid";
		var tr = DOM.addNode(this.node, "tr");
		var wgGroup = new Group({activeClass:"wg-button-grid", selectedClass:"wg-button-grid-s"});
		for(var i=0; i<args.buttons.length; i++) {
			var button = args.buttons[i];
			var td = DOM.addNode(tr, "td");
			td.className = "wg-button-grid";
			if(args.size == "absolute") {
				td.style.width = parseInt(100/args.buttons.length)+"%";
			}
			else if(args.size == "relative") {
				td.style.width = parseInt(button.text.length/numChars*100)+"%";
			}
			else {
				throw "unexpected size value: "+args.size;
			}
			td.innerHTML= button.text;
			td.onclick = button.action;
			wgGroup.push(td);
		}
		this.attachTo = Widgets._attachTo;
	},
	
	UserBlock: function(args) {
		Utils.checkArgs(args, "type", "text");
		Utils.checkArgValues(args.type, "label", "company", "external", "group");
		this.node = document.createElement("div");
		this.node.wrapper = this;
		this.node.className = "wg-user-"+args.type;
		this.node.innerHTML = args.text;
		this.attachTo = Widgets._attachTo;
		return this;
	},
	
	TextBox: function(args) {
		Utils.checkArgs(args, "name", "width");
		this.node = document.createElement("input");
		this.node.type = "text";
		this.node.className = "wg-textbox";
		this.node.name = args.name;
		this.node.id = args.name;
		this.node.style.width = DOM.getStyleSize({size:args.width, border:1, padding:5}) + "px";
		if(args.text) {
			this.node.value = args.text;
		}
		this.attachTo = Widgets._attachTo;
		return this;
	},
	
	TextArea: function(args) {
		Utils.checkArgs(args, "name", "width", "height");
		this.node = document.createElement("textarea");
		this.node.className = "wg-textarea";
		this.node.name = args.name;
		this.node.id = args.name;
		this.node.style.width = DOM.getStyleSize({size:args.width, border:1, padding:5}) + "px";
		this.node.style.height = DOM.getStyleSize({size:args.height, border:1, padding:5}) + "px";
		if(args.text) {
			this.node.innerHTML = args.text;
		}
		this.attachTo = Widgets._attachTo;
		return this;
	},
	
	DatePicker: function(args) {
		Utils.checkArgs(args, "name");
		this.node = document.createElement("div");
		this.node.className = "wg-datepicker-box";
		var row = new Widgets.Table({numCols:2}).attachTo(this.node).addRow();
		var wgWidth = 130;
		var buttonWidth = 24;
		row.cols[0].node.style.width = (wgWidth-buttonWidth)+"px";
		var input = DOM.addNode(row.cols[0].node, "input");
		input.type = "text";
		input.name = args.name;
		input.id = args.name;
		if(args.text) {
			input.value = args.text;
		}
		input.className = "wg-datepicker-input";
		input.style.width = (DOM.getStyleSize({size:wgWidth, padding:5})-buttonWidth)+"px";
		row.cols[1].node.className = "wg-datepicker-icon-cell";
		row.cols[1].node.style.width = buttonWidth+"px";
		var button = DOM.addNode(row.cols[1].node, "input");
		button.type = "button";
		button.className = "wg-datepicker-icon";
		this.attachTo = Widgets._attachTo;
		return this;
	},

	Overlay: function(args) {
		// Checks:
		if(args.attachTo == null) {
			throw "attachTo is NULL";
		}
		// Public variables:
		this.type = Constants.UI.WG_TYPE_OVERLAY;
		this.domNode = args.attachTo;
		this.wgNode = null;
		// Private variables:
		var _title = args.title;
		var _content = args.content;
		var _width = args.width;
		var _shift = args.shift;
		// Private methods:
		this._render = function() {
			// DOM structure:
			this.wgNode = document.createElement("div");
			document.body.appendChild(this.wgNode);
			this.wgNode.id = this.domNode.id + "_overlay";
			this.wgNode.className = "info-container";
			this.wgNode.style.width = _width + "px";
			var div2 = document.createElement("div");
			this.wgNode.appendChild(div2);
			div2.className = "info-title";
			div2.innerHTML = _title;
			var div3 = document.createElement("div");
			this.wgNode.appendChild(div3);
			div3.innerHTML = _content;
			// Widget references:
			this.wgNode.eap = new Object();
			this.wgNode.eap.widget = this;
			// Widget event handlers:
			this.wgNode.onmouseout = function() {
				UI.hideAll();
			};
		};
		this._show = function() {
			if(this.wgNode == null) {
				this._render();
			}
			DOM.cover({toCover: this.domNode, cover: this.wgNode, paddingLeft: 5, paddingTop: 5, shift: _shift});
			UI.hideAll();
			UI.show(this.wgNode);
		};
		// DOM references:
		this.domNode.eap = new Object();
		this.domNode.eap.widget = this;
		// DOM event handlers:
		this.domNode.onmouseover = function() {
			this.eap.widget._show();
		};
	},
	
	Menu: function(args) {
		// Checks:
		if(args.attachTo == null) {
			throw "attachTo is NULL";
		}
		// Public variables:
		this.type = Constants.UI.WG_TYPE_MENU;
		this.domNode = args.attachTo;
		this.wgNode = null;
		this.keepVisible = args.keepVisible;
		// Protected variables:
		this._options = new Array();
		if(args.width == "inherit") {
			this._width = args.attachTo.offsetWidth - 2;
		}
		else {
			this._width = args.width;
		}
		this._lastOption = null;
		this._hideTimeout = false;
		this._parent = args.parent;
		this._event = args.event ? args.event : "onclick";
		// Private variables:
		var _wg = this;
		var _shift = args.shift ? args.shift : {top: 0, left: 0};
		var _position = args.position ? args.position : "bottom";
		var _align = args.align;
		var _visible = false;
		// Public functions:
		this.addOption = function(args, parent) {
			var option = new Widgets._MenuOption(this, args, parent);
			this._lastOption = option;
			this._options.push(option);
			return option;
		};
		this.addCover = function(args) {
			if(!args) {
				args = new Object();
			}
			args.text = this.domNode.innerHTML;
			if(!args.style) {
				args.style = this.domNode.className;
			}
			this._cover = new Widgets._MenuCover(this, args);
			// Modify DOM element to include arrow:
			this.domNode.innerHTML = "";
			this._cover._putArrow(this.domNode, args.text, true);
			return this._cover;
		};
		this.addSeparator = function() {
			this._options.push("separator");
			//if(this._lastOption != null) {
			//	this._lastOption.wgNode.childNodes[0].style.borderBottom = Constants.UI.WG_MENU_SEPARATOR_BORDER;
			//}
		};
		this.clearOptions = function() {
			if(_wg.wgNode != null) {
				document.body.removeChild(_wg.wgNode);
				_wg.wgNode = null;
			}
			Arrays.clear(this._options);
		};
		this.onShow = function(widget) {};
		this.onHide = function(widget) {};
		// toggle: used to show/hide the menu. This function needs to use the _wg
		// variable ("this" resolver) as it is used as an event handler for the domNode
		this.toggle = function() {
			if(_wg.wgNode == null) {
				_wg._render();
				// To ensure the first positioning is correct:
				_wg._position();
			}
			if(_wg._lastHighlighted) {
				_wg._lastHighlighted.className = "wg-menu-column";
			}
			if(_visible) {
				_wg._hide();
			}
			else {
				UI.hideAll();
				UI.show(_wg.wgNode);
				// Note: _position MUST be called after UI.show
				_wg._position();
				_visible = true;
				_wg.onShow(_wg);
				// Make the menu disappear after 2 seconds if the user does not use it:
				if(_wg._hideTimeout) {
					clearTimeout(_wg._hideTimeout);
				}
				_wg._hideTimeout = setTimeout(_wg._hide, 2000);
			}
		};
		// Private functions:
		this._render = function() {
			// DOM structure:
			this.wgNode = document.createElement("table");
			document.body.appendChild(this.wgNode);
			this.wgNode.id = DOM.generateId();
			this.wgNode.className = "wg-menu";
			this.wgNode.setAttribute("border", "0");
			// Widget references:
			this.wgNode.eap = new Object();
			this.wgNode.eap.widget = this;
			// Render cover:
			if(this._cover) {
				this._cover._render();
			}
			// Render options:
			for(var i=0; i<this._options.length; i++) {
				if(this._options[i] == "separator" && i>0) {
					this._options[i-1].wgNode.childNodes[0].style.borderBottom = Constants.UI.WG_MENU_SEPARATOR_BORDER;
				}
				else {
					this._options[i]._render();
				}
			}
		};
		// _position: Used to position the menu relatively to the DOM element. This is called
		// when the menu is showed, to ensure positioning is correct even if the window is resized.
		this._position = function() {
			var pos = DOM.getPosition(this.domNode);
			if(this._cover != null) {
				this.wgNode.style.left = pos.x + "px";
				this.wgNode.style.top = pos.y + "px";
			}
			else if(_position == "bottom" || _position == "top") {
				// Position the menu horizontally:
				if(_align == "right") {
					this.wgNode.style.left = (pos.x + _shift.left - this._width + this.domNode.offsetWidth - 2) + "px";
				}
				else {
					this.wgNode.style.left = (pos.x + _shift.left) + "px";
				}
				// Position the menu vertically:
				if(_position == "bottom") {
					this.wgNode.style.top = (pos.y + this.domNode.offsetHeight + _shift.top - 1) + "px";
				}
				else {
					this.wgNode.style.top = (pos.y - this.wgNode.offsetHeight - _shift.top + 1) + "px";
				}
			}
			else if(_position == "side") {
				// Position the menu horizontally:
				this.wgNode.style.left = (pos.x + _shift.left + this.domNode.offsetWidth) + "px";
				// Position the menu vertically:
				this.wgNode.style.top = (pos.y + _shift.top - 1) + "px";
			}
			else {
				throw "illegal position value: "+_position;
			}
		};
		// _hide: hides the menu. Used on the toggle function, as a timeout function,
		// and as an event handler (onmouseout) for the menu options
		this._hide = function() {
			DOM.hide(_wg.wgNode);
			_visible = false;
			clearTimeout(_wg._hideTimeout);
			_wg.onHide(_wg);
		};
		// _showSub: used instead of "toggle" to show the menu when it is a sub-menu
		this._showSub = function() {
			if(_wg.wgNode == null) {
				_wg._render();
			}
			UI.show(_wg.wgNode);
			_wg._position();
		};
		// DOM references:
		this.domNode.eap = new Object();
		this.domNode.eap.widget = this;
		// DOM event handlers:
		if(!this._parent) {
			this.domNode[this._event] = this.toggle;
			// If the DOM node is a link, we need to re-set its link to show the menu:
			if(this.domNode.nodeName == "A") {
				this.domNode.setAttribute("href", "javascript:DOM.id('"+this.domNode.id+"').onclick();");
			}
		}
	},
	
	// The MenuOption component is for internal Menu use:
	_MenuOption: function(menu, args, parent) {
		// Public variables:
		this.type = Constants.UI.WG_TYPE_MENU_OPTION;
		// Private variables:
		this._options = null;
		this._menu = menu;
		this._link = args.link;
		this._linkArgs = args.linkArgs;
		this._icon = args.icon;
		this._subMenu = null;
		this._parent = parent;
		this.keepVisible = args.keepVisible==null ? menu.keepVisible : args.keepVisible;
		// Public functions:
		this.getMenu = function() {
			return this._menu;
		};		
		this.setText = function(text) {
			this.wgNode.getElementsByTagName("td")[0].innerHTML = text;
		};
		this.addOption = function(subArgs) {
			if(this._options == null) {
				this._options = new Array();
			}
			// If the option does not have an icon, we need to add it:
			if(!this._icon) {
				this._icon = "files/img/wg-menu-arrow-option.png";
			}
			this._options.push(subArgs);
			// TODO what do we do here?
			// This may actually be an effective way of preventing sub-sub-options
			return null;
		};
		// Private functions:
		this._render = function() {
			// DOM structure:
			this.wgNode = document.createElement("tr");
			menu.wgNode.appendChild(this.wgNode);
			this.wgNode.className = "wg-menu-column";
			var td = document.createElement("td");
			this.wgNode.appendChild(td);
			td.className = "wg-menu-link";
			td.innerHTML = args.text;
			if(this._icon) {
				if(menu._width) {
					// TODO instead of using a constant, use the actual icon width
					td.width = this._menu._width - Constants.UI.WG_MENU_PADDING - Constants.UI.WG_MENU_ICON_WIDTH;
				}
				td = document.createElement("td");
				this.wgNode.appendChild(td);
				td.className = "wg-menu-img";
				td.width = Constants.UI.WG_MENU_ICON_WIDTH;
				var img = document.createElement("img");
				td.appendChild(img);
				img.src = this._icon;
			}
			else {
				if(this._menu._width) {
					td.width = this._menu._width - Constants.UI.WG_MENU_PADDING;
				}
				td.colSpan = "2";
			}
			// Widget references:
			this.wgNode.eap = new Object();
			this.wgNode.eap.widget = this;
			// Widget event handlers:
			this.wgNode.onmouseover = function() {
				var wg = this.eap.widget;
				if(wg.getMenu()._lastHighlighted) {
					wg.getMenu()._lastHighlighted.className = "wg-menu-column";
				}
				// Prevent the menu from disappearing while
				// the user has the mouse over it:
				if(wg.getMenu()._hideTimeout) {
					clearTimeout(wg.getMenu()._hideTimeout);
				}
				// If the option has a sub-menu, show it:
				if(wg._subMenu != null) {
					wg._subMenu._showSub();
					clearTimeout(wg._subMenu._hideTimeout);
				}
				// If the option is part of a sub-menu,
				// prevent the parent menu from disappearing:
				if(wg.getMenu()._parent != null) {
					clearTimeout(wg.getMenu()._parent._hideTimeout);
					wg._parent.wgNode.className = "wg-sub-menu-column";
					wg._parent.getMenu()._lastHighlighted = wg._parent.wgNode;
				}
			};
			this.wgNode.onmouseout = function() {
				var wg = this.eap.widget;
				// Make the menu disappear if the user hovers away:
				wg.getMenu()._hideTimeout = setTimeout(wg.getMenu()._hide, 500);
				// Also make the sub-menu disappear (if applicable):
				if(wg._subMenu) {
					wg._subMenu._hideTimeout = setTimeout(wg._subMenu._hide, 500);
				}
				// Also make the parent menu disappear (if applicable):
				if(wg.getMenu()._parent) {
					wg.getMenu()._parent._hideTimeout = setTimeout(wg.getMenu()._parent._hide, 500);
				}
			};
			this.wgNode.onclick = function() {
				var wg = this.eap.widget;
				if(typeof wg._link == "function") {
					// Function callback:
					wg._link(wg, wg._linkArgs);
				}
				else if(Strings.startsWith(wg._link, "javascript:")) {
					// JavaScript link:
					eval(wg._link);
				}
				else {
					// Regular (href) link:
					document.location = wg._link;
				}
				if(!wg.keepVisible) {
					// Hide the menu:
					wg.getMenu()._hide();
				}
			};
			// Render sub-menu:
			if(this._options != null) {
				var shift = System.browser.ie ? {top:0, left:0} : {top:1, left:1};
				this._subMenu = new Widgets.Menu({attachTo:this.wgNode.childNodes[1], position:"side", align:"left", keepVisible:true, parent:this.getMenu(), shift:shift});
				// Reset links for this option:
				this._link = this._subMenu._showSub;
				this._linkArgs = null;
				for(var i=0; i<this._options.length; i++) {
					this._subMenu.addOption(this._options[i], this);
				}
				this._subMenu._render();
			}
		}
		// DOM references: N/A
		// DOM event handlers: N/A
	},

	// The MenuCover component is for internal Menu use:
	_MenuCover: function(menu, args) {
		this._menu = menu;
		// Public functions:
		this.getMenu = function() {
			return this._menu;
		};		
		this.setText = function(text) {
			this.wgNode.getElementsByTagName("td")[0].innerHTML = text;
		};
		// Private functions:
		this._render = function() {
			// DOM structure:
			this.wgNode = document.createElement("tr");
			menu.wgNode.appendChild(this.wgNode);
			var td = document.createElement("td");
			this.wgNode.appendChild(td);
			td.colSpan = "2";
			td.className = args.style;
			td.style.color = "#FFFFFF";
			this._putArrow(td, args.text, false);
			// Widget references:
			this.wgNode.eap = new Object();
			this.wgNode.eap.widget = this;
			// Widget event handlers:
			this.wgNode.onmouseover = function() {
				var wg = this.eap.widget;
				// Prevent the menu from disappearing while
				// the user has the mouse over it:
				if(wg.getMenu()._hideTimeout) {
					clearTimeout(wg.getMenu()._hideTimeout);
				}
			};
			this.wgNode.onmouseout = function() {
				var wg = this.eap.widget;
				// Make the menu disappear if the user hovers away:
				wg.getMenu()._hideTimeout = setTimeout(wg.getMenu()._hide, 500);
			};
		};
		this._putArrow = function(elem, text, domNode) {
			var cTable = document.createElement("table");
			elem.appendChild(cTable);
			var cTr = document.createElement("tr");
			cTable.appendChild(cTr);
			var cTd1 = document.createElement("td");
			cTr.appendChild(cTd1);
			cTd1.innerHTML = text;
			var cTd2 = document.createElement("td");
			cTr.appendChild(cTd2);
			cTd2.style.paddingLeft = "5px";
			var cImg = document.createElement("img");
			cTd2.appendChild(cImg);
			cImg.src = domNode ? "files/img/wg-menu-cover-arrow-1.png" : "files/img/wg-menu-cover-arrow-2.png";
		};
		// DOM references: N/A
		// DOM event handlers: N/A
	},
	
	ButtonMenu: function(args) {
		this.type = Constants.UI.WG_TYPE_BUTTON_MENU;
		this.wgNode = null;
		// Create DOM structure:
		var nodeId = args.attachTo.id;
		args.attachTo.className = "wg-button-menu-left";
		var bParent = args.attachTo.parentNode;
		var table = document.createElement("table");
		table.setAttribute("cellspacing", "0");
		table.setAttribute("cellpadding", "0");
		table.setAttribute("border", "0");
		var tr = document.createElement("tr");
		table.appendChild(tr);
		var td = document.createElement("td");
		td.setAttribute("align", "right");
		td.innerHTML = bParent.innerHTML;
		tr.appendChild(td);
		var td = document.createElement("td");
		td.style.width = Constants.UI.WG_BUTTON_MENU_WIDTH+"px";
		tr.appendChild(td);
		this.wgNode = document.createElement("input");
		this.wgNode.id = DOM.generateId();
		this.wgNode.type = "button";
		this.wgNode.className = "wg-button-menu-right";
		this.wgNode.title = "Click to see additional options";
		td.appendChild(this.wgNode);
		bParent.innerHTML = "";
		bParent.appendChild(table);
		// References:
		this.domNode = DOM.id(nodeId);
		this.domNode.eap = new Object();
		this.domNode.eap.widget = this;
		this.wgNode.eap = new Object();
		this.wgNode.eap.widget = this;
		// Add menu:
		var width = args.menuWidth;
		if(width == "inherit") {
			// For ButtonMenu, inheriting the width means the original button + the newly created arrow button:
			width = this.domNode.offsetWidth + this.wgNode.offsetWidth - 2;
		}
		this._menu = new Widgets.Menu({attachTo: this.wgNode, position:"top", align:"right", width:width});
		
		// Methods:
		this.addOption = function(args) {
			this._menu.addOption(args);
		};
		
		this.clearOptions = function() {
			this._menu.clearOptions();
		};
	},
	
	SelectList: function() {
		this._pane1 = null;
		this._pane2 = null;

		// Methods:
		this.addPane = function(args) {
			if(this._pane2 != null) {
				throw "SelectList can only hold two panes";
			}
			// Work out widths of the panes:
			var paneWidth = 0;
			if(args.columns.length == 3) {
				if(this._pane1 != null) {
					throw "SelectList pane 2 cannot have 3 columns";
				}
				args.columns[0] = {name: args.columns[0], width: 75};
				args.columns[1] = {name: args.columns[1], width: 215};
				args.columns[2] = {name: args.columns[2], width: 53};
				paneWidth = 389;
			}
			else if(args.columns.length == 2) {
				if(this._pane1 == null || (this._pane1 != null && this._pane1._columns.length == 2)) {
					args.columns[0] = {name: args.columns[0], width: 85};
					args.columns[1] = {name: args.columns[1], width: 254};
					paneWidth = 369;
				}
				else {
					args.columns[0] = {name: args.columns[0], width: 75};
					args.columns[1] = {name: args.columns[1], width: 244};
					paneWidth = 349;
				}				
			}
			else {
				throw "SelectList panes can only have either 2 or 3 columns";
			}
			// Create the pane:
			var pane = new Widgets._SelectListPane(args, paneWidth);
			if(this._pane1 == null) {
				this._pane1 = pane;
			}
			else {
				this._pane2 = pane;
				this._pane1._connectTo(this._pane2);
			}
			return pane;
		};
	},

	Entry: function(id, name, description, checked) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.checked = checked;
	},
	
	// SelectListPane is for internal SelectList use:
	_SelectListPane: function(args, paneWidth) {
		// Init:
		this.entries = new Array();
		this.domNode = args.attachTo;
		this.domNode.eap = new Object();
		this.domNode.eap.widget = this;
		this.onCheck = null;
		this._columns = args.columns;
		this._otherList = null;
		this._paneId = DOM.generateId();
		this._tableId = DOM.generateId();
		// Constants:
		this._colorSelected = args.selectedColor == null ? Constants.UI.COLOR_BLUE : args.selectedColor;
		this._colorBlank = Constants.UI.COLOR_WHITE;
		this._colorHover = Constants.UI.COLOR_GREEN;
		this._colorBorder = "#999999";
		this._paneHeight = 200;
		this._col1Width = 0;
		this._col2Width = 0;
		this._col3Width = 0;
		if(paneWidth == 369) {
			this._col1Width = 84;
			this._col2Width = 245;
		}
		else if(paneWidth == 389) {
			this._col1Width = 74;
			this._col2Width = 224;
			this._col3Width = 45;
		}
		else if(paneWidth == 349) {
			this._col1Width = 74;
			this._col2Width = 245;
		}
		else {
			throw "unexpected paneWidth: "+paneWidth;
		}
		// Event handlers:
		this._onRollOver = function() {
			var row = this.parentNode;
			if(row.eap.entry.selected == false) {
				for(var i in row.eap.cols) {
					row.eap.cols[i].style.backgroundColor = row.eap.list._colorHover;
				}
			}
		};
		this._onRollOut = function() {
			var row = this.parentNode;
			if(row.eap.entry.selected == false) {
				for(var i in row.eap.cols) {
					row.eap.cols[i].style.backgroundColor = row.eap.list._colorBlank;
				}
			}
		};
		this._onClick = function() {
			var row = this.parentNode;
			if(row.eap.entry.selected) {
				for(var i in row.eap.cols) {
					row.eap.cols[i].style.backgroundColor = row.eap.list._colorBlank;
				}
				row.eap.entry.selected = false;
			}
			else {
				for(var i in row.eap.cols) {
					row.eap.cols[i].style.backgroundColor = row.eap.list._colorSelected;
				}
				row.eap.entry.selected = true;
			}
		};
		
		// Create DOM structure:
		var table = document.createElement("table");
		table.cellPadding = "0";
		table.cellSpacing = "0";
		table.border = "0";
		this.domNode.appendChild(table);
		var tr = document.createElement("tr");
		table.appendChild(tr);
		for(var i=0; i<args.columns.length; i++) {
			var td = document.createElement("td");
			td.style.width = args.columns[i].width+"px"
			td.innerHTML = args.columns[i].name;
			td.className = "wg-sl-title-cell wg-sl-title-b-right";
			tr.appendChild(td);
		}
		td.className = "wg-sl-title-cell";
		var div1 = document.createElement("div");
		div1.className = "wg-sl-pane-holder";
		this.domNode.appendChild(div1);
		var div2 = document.createElement("div");
		div2.className = "wg-sl-pane-content";
		div2.id = this._paneId;
		div2.style.width = paneWidth+"px";
		div1.appendChild(div2);
		table = document.createElement("table");
		table.cellPadding = 0;
		table.cellSpacing = 0;
		table.border = 0;
		table.width = paneWidth - 10;
		table.id = this._tableId;
		div2.appendChild(table);
		var div3 = document.createElement("div");
		div3.className = "wg-sl-pane-filler";
		div3.style.width = (paneWidth - 10)+"px";
		div2.appendChild(div3);
		
		// Methods:
		this.addEntry = function(entry) {
			this.entries.push(entry);
			var table = DOM.id(this._tableId);
			var tr = document.createElement("tr");
			entry.domNode = tr;
			entry.selected = false;
			tr.eap = new Object();
			tr.eap.entry = entry;
			tr.eap.list = this;
			tr.eap.cols = new Array();
			table.appendChild(tr);		
			var td1 = document.createElement("td");
			td1.className = "wg-sl-cell wg-sl-cell-b-right wg-sl-cell-b-bottom pointer";
			td1.style.backgroundColor = this._colorBlank;
			td1.width = this._col1Width;
			td1.onmouseover = this._onRollOver;
			td1.onmouseout = this._onRollOut;
			td1.onclick = this._onClick;
			var div1 = document.createElement("div");
			div1.className = "word-wrap";
			div1.style.width = this._col1Width+"px";
			td1.appendChild(div1);
			div1.innerHTML = entry.name;
			tr.appendChild(td1);
			tr.eap.cols.push(td1);
			var td2 = document.createElement("td");
			td2.className = "wg-sl-cell wg-sl-cell-b-bottom pointer";
			td2.style.backgroundColor = this._colorBlank;
			td2.width = this._col2Width;
			td2.onmouseover = this._onRollOver;
			td2.onmouseout = this._onRollOut;
			td2.onclick = this._onClick;
			td2.innerHTML = entry.description;
			tr.appendChild(td2);
			tr.eap.cols.push(td2);
			if(this._columns.length == 3) {
				td2.className += " wg-sl-cell-b-right";
				var td3 = document.createElement("td");
				td3.className = "wg-sl-cell wg-sl-cell-b-bottom";
				td3.style.backgroundColor = this._colorBlank;
				td3.width = this._col3Width;
				td3.onmouseover = this._onRollOver;
				td3.onmouseout = this._onRollOut;
				td3.style.textAlign = "center";
				tr.appendChild(td3);
				var radio = document.createElement("input");
				radio.eap = new Object();
				radio.eap.widget = this;
				radio.type = "radio";
				radio.name = "checked_entry";
				radio.value = entry.id;
				radio.className = "radio";
				if(entry.checked) {
					radio.checked = true;
				}
				// TODO change
				radio.onclick = function() {
					if(this.eap.widget.onCheck != null) {
						this.eap.widget.onCheck(this);
					}
				};
				td3.appendChild(radio);
				tr.eap.cols.push(td3);
			}
			return entry;
		}

		this.redraw = function() {
			var paneId = "#"+this._paneId;
			$(paneId).jScrollPane();
			if(this.entries.length == 0) {
				return;
			}
			// Set the bottom border on all rows:
			var totalHeight = 0;
			for(var i in this.entries) {
				totalHeight += this.entries[i].domNode.offsetHeight;
				var entry = this.entries[i];
				for(var j in entry.domNode.eap.cols) {
					entry.domNode.eap.cols[j].style.borderBottom = "1px solid "+this._colorBorder;
				}
			}
			// Remove the last row's border, if exceeding the pane's size:
			if(totalHeight > this._paneHeight) {
				var entry = Arrays.last(this.entries);
				for(var i in entry.domNode.eap.cols) {
					entry.domNode.eap.cols[i].style.borderBottom = "1px solid "+this._colorBlank;
				}
			}
			else {
				var entry = Arrays.last(this.entries);
				for(var i in entry.domNode.eap.cols) {
					entry.domNode.eap.cols[i].style.borderBottom = "1px solid "+this._colorBorder;
				}
			}
		};

		this.moveEntries = function() {
			var toRemove = new Array();
			for(var i in this.entries) {
				if(this.entries[i].selected) {
					var entry = this.entries[i];
					// Un-select primary role:
					entry.primary = false;
					entry.domNode.parentNode.removeChild(entry.domNode);
					this._otherList.addEntry(entry);
					toRemove.push(entry);
				}
			}
			for(var i in toRemove) {
				this._removeElement(this.entries, toRemove[i]);
			}
			this.redraw();
			this._otherList.redraw();
		};

		this._connectTo = function(otherList) {
			this._otherList = otherList;
			otherList._otherList = this;
		};

		this._removeElement = function(array, entry) {
			for(var i in array) {
				if(entry.name == array[i].name) {
					array.splice(i, 1);
					return true;
				}
			}
			return false;
		};
	},
	
	// PRIVATE:
	_attachTo: function(node) {
		node.appendChild(this.node);
		return this;
	}
};





