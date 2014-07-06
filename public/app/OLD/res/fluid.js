///////////////////////////////////////////////////////////////////////////////
// Fluid UI
// Dependencies: Generics.R1; constants.js
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// Fluid class
///////////////////////////////////////////////////////////////////////////////

var Fluid = {

	Constants: {
		gridView: {tableClass:"fluid-grid", colClass:"fluid-cell-view"},
		gridEdit: {tableClass:"fluid-grid", colClass:"fluid-cell-edit"},
		colPadding: 20,
		formFooterHeight: 65,
		formPaddingTop: 10,
		formPaddingBottom: 20,
		buttonMargin: 5
	},

	columns: new Array(),

	init: function() {
		// Expand the container:
		this._nodes.container = DOM.id("fluid-container-div");
		this._nodes.container.style.width = DOM.getWindowWidth() + "px";
		window.onresize = Fluid.pack;
		// Get a reference to the UI grid:
		this._nodes.grid = DOM.id("fluid-grid");
	},

	pack: function() {
		Fluid._nodes.container.style.width = DOM.getWindowWidth() + "px";
		for(var i=0; i<Fluid.columns.length; i++) {
			//Fluid.packColumn(Fluid.columns[i]);
			Fluid.columns[i].pack();
		}
	},
	
	addColumn: function(args) {
		return this._addColumn(args, {form:true, list:false});
	},
	
	addListColumn: function(args) {
		Utils.checkArgs(args, "data", "render");
		return this._addColumn(args, {form:false, list:true});
	},
	
	clearFrom: function(position) {
		Utils.checkMinArgValue(position, 1);
		// Remove hidden columns:
		while(this.columns.length > position-1) {
			var c = Arrays.last(this.columns);
			if(DOM.isFullyHiddenX(Fluid._nodes.container, c.node)) {
				this.columns.pop();
				DOM.release(c.node);
				c.node = null;
			}
			else {
				break;
			}
		}
		// Clear visible columns:
		for(var i=position-1; i<this.columns.length; i++) {
			this.columns[i].clear();
		}
		return this;
	},
	
	findNextClearedColumn: function(position) {
		// Return first cleared column:
		for(var i=0; i<this.columns.length; i++) {
			var c = this.columns[i];
			if(c.status.cleared) {
				return c;
			}
			// Return column at position even if not cleared:
			if(i == position-1) {
				return c;
			}
		}
		// No column found, need to add:
		return null;
	},
	
	// PRIVATE:
	_nodes: {},

	_addColumn: function(args, type) {
		Utils.checkArgs(args, "position", "width", "title");
		Utils.checkArgs(type);
		Utils.checkMinArgValue(args.position, 1);
		var initialScroll = Fluid._nodes.container.scrollLeft;
		// Create or reuse column:
		this.clearFrom(args.position);
		var c = this.findNextClearedColumn(args.position);
		if(c == null) {
			c = {};
			this.columns.push(c);
			// Create the column container:
			c.node = DOM.addNode(this._nodes.grid, "td");
			c.node.fluid = this;
			c.node.style.visibility = "hidden";
		}
		else {
			DOM.release(c.header.node);
			c.header = null;
		}
		c.type = type;
		c.status = {cleared:false};
		c.width = args.width;
		c.node.className = "fluid-col";

		// Function needed internally:
		c.getMaxNodeWidth = function(args) {
			args = Utils.not(args) ? {} : args;
			Utils.checkArgs(args, "border=0", "padding=0");
			args.size = this.width;
			args.padding += Fluid.Constants.colPadding;
			return DOM.getStyleSize(args);
		};
		
		// Create header:
		c.header = {node:DOM.addNode(c.node, "div")};
		c.header.node.wrapper = c.header;
		c.header.node.style.width = args.width+"px";
		if(c.type.list) {
			c.header.node.className = "fluid-filter-header";
			c.header.grid = new Widgets.Table(Fluid.Constants.gridView).attachTo(c.header.node);
			c.header.grid.addRow().last().addTitle({text:args.title, subtitle:true});
			// Create the filter section:
			var filterDiv = DOM.addNode(c.header.grid.addRow().last().node, "div");
			filterDiv.className = "fluid-filter-box";
			filterDiv.style.width = c.getMaxNodeWidth({border:1}) + "px";
			var table = new Widgets.Table({numCols:3}).attachTo(filterDiv);
			var row = table.addRow();
			row.cols[1].node.style.width = "100%";
			row.cols[2].node.style.verticalAlign = "middle";
			for(var i=0; i<row.cols.length; i++) {
				row.cols[i].node.className = "fluid-filter-cell";
			}
			var sIcon = DOM.addNode(row.cols[0].node, "img");
			sIcon.src = "../img/icon-search.png";
			var input = DOM.addNode(row.cols[1].node, "input");
			input.wrapper = {};
			input.wrapper.clearIconVisible = false;
			input.wrapper.clearIconCell = row.cols[2].node;
			input.type = "text";
			input.className = "fluid-filter-input fnt-filter-input";
			input.value = Locale.filterResults;
			input.onfocus = function() {
				if(input.value == Locale.filterResults) {
					input.value = "";
					input.className = "fluid-filter-input fnt-normal";
				}
			};
			input.onblur = function() {
				if(!input.value) {
					input.value = Locale.filterResults;
					input.className = "fluid-filter-input fnt-filter-input";
					if(this.wrapper.clearIconVisible) {
						this.wrapper.clearIconCell.innerHTML = "";
						this.wrapper.clearIconVisible = false;
					}
				}
			};
			input.onkeyup = function() {
				if(!this.wrapper.clearIconVisible && this.value != "") {
					var cIcon = DOM.addNode(this.wrapper.clearIconCell, "img");
					cIcon.src = "../img/icon-clear-filter.png";
					cIcon.className = "pointer";
					cIcon.wrapper = {};
					cIcon.wrapper.input = this;
					cIcon.onclick = function() {
						this.wrapper.input.value = "";
						this.wrapper.input.fluid.clearIconCell.innerHTML = "";
						this.wrapper.input.fluid.clearIconVisible = false;
						this.wrapper.input.focus();
					};
					this.wrapper.clearIconVisible = true;
				}
				else {
					if(this.value == "") {
						this.wrapper.clearIconCell.innerHTML = "";
						this.wrapper.clearIconVisible = false;
					}
				}
			};
		}

		// Create the resizable form section:
		c.form = {node: DOM.addNode(c.node, "div")};
		c.form.node.wrapper = c.form;
		c.form.node.className = "fluid-form";
		c.form.node.style.width = args.width+"px";
		if(c.type.list) {
			c.form.node.style.paddingTop = "0px";
			c.form.node.style.paddingBottom = "0px";
		}
		c.form.grid = new Widgets.Table(Fluid.Constants.gridView).attachTo(c.form.node);
		if(c.type.form) {
			var row = c.form.grid.addRow();
			row.last().addTitle({text:args.title});
		}
		
		// Render data (if list):
		if(c.type.list) {
			c.form.list = {data:args.data, group:new Group({activeClass:"fluid-list-cell", selectedClass:"fluid-list-cell-s"})};
			for(var i=0; i<args.data.length; i++) {
				var item = args.data[i];
				var row = c.form.grid.addRow();
				var node = row.last().node;
				node.className = "fluid-list-cell";
				if(i == args.data.length-1) {
					node.style.borderBottom = "none";
				}
				args.render(node, item);
				c.form.list.group.push(node);
			}
		}

		// Create the footer section:
		c.footer = {node: DOM.addNode(c.node, "div")};
		c.footer.node.wrapper = c.footer;
		c.footer.node.className = "fluid-footer";
		c.footer.node.style.width = args.width+"px";
		c.footer.grid = new Widgets.Table({numCols:3}).attachTo(c.footer.node);
		c.footer.grid.node.style.width = "100%";
		c.footer.grid.node.style.padding = "10px";
		c.footer.grid.node.style.paddingLeft = "20px";
		c.footer.grid.node.style.paddingRight = "20px";
		var row = c.footer.grid.addRow();
		row.cols[0].node.style.textAlign = "left";
		row.cols[0].node.style.width = "50%";
		row.cols[1].node.style.textAlign = "center";
		row.cols[1].node.style.verticalAlign = "middle";
		row.cols[1].node.style.whiteSpace = "nowrap";
		row.cols[2].node.style.textAlign = "right";
		row.cols[2].node.style.width = "50%";
		c.footer.leftButtons = new Array();
		c.footer.rightButtons = new Array();

		// Footer functions:
		c.footer.addButton = function(args) {
			Utils.checkArgs(args, "name=DOM.generateId()", "type", "side='right'");
			// TODO check allowed button types
			Utils.checkArgValues(args.side, "left", "right");
			var b = {fluidColumn:c};
			if(args.side == "left") {
				b.node = DOM.addNode(this.grid.rows[0].cols[0].node, "input");
				b.node.style.marginRight = Fluid.Constants.buttonMargin + "px";
				this.leftButtons.push(b);
			}
			else if(args.side == "right") {
				b.node = DOM.addNode(this.grid.rows[0].cols[2].node, "input");
				b.node.style.marginLeft = Fluid.Constants.buttonMargin + "px";
				this.rightButtons.push(b);
			}
			else {
				throw new Error(args.side);
			}
			b.node.wrapper = b;
			b.node.type = "submit";
			b.node.name = args.name;
			b.node.id = args.name;
			b.node.value = "";
			b.node.className = "button-"+args.type;
			if(args.onclick) {
				DOM.addEvent(b.node, "onclick", args.onclick);
			}
			return b;
		};
		
		// List footer:
		if(c.type.list) {
			c.footer.grid.last().cols[1].node.innerHTML = "Page 1 of 1";
			c.footer.addButton({type:"next-inactive"});
			c.footer.addButton({type:"add"});
			c.footer.addButton({type:"prev-inactive", side:"left"});
		}
		
		// Any additional functions:
		c.show = function() {
			if(this.status.cleared) {
				return false;
			}
			this.node.style.visibility = "visible";
			// Scroll if required:
			Fluid._nodes.container.scrollLeft = initialScroll;
			if(DOM.isPartiallyHiddenX(Fluid._nodes.container, c.node)) {
				Fluid._nodes.container.scrollLeft += DOM.scrollByX(Fluid._nodes.container, c.node);
			}
			return this.pack();
		};

		c.pack = function(c) {
			if(this.status.cleared) {
				return false;
			}
			// Calculate the maximum allowed height:
			var maxHeight = DOM.getWindowHeight() - DOM.id("header").offsetHeight - DOM.id("footer").offsetHeight - this.footer.node.offsetHeight - 1;
			if(this.header.node) {
				maxHeight -= this.header.node.offsetHeight;
			}
			if(DOM.getSize(this.form.node).height > maxHeight) {
				// The height style value must not include padding.
				// Note that list columns have no top or bottom padding.
				var styleHeight = maxHeight;
				if(this.type.form) {
					styleHeight -= (Fluid.Constants.formPaddingTop + Fluid.Constants.formPaddingBottom);
				}
				this.form.node.style.height = styleHeight+"px";
			}
			else {
				this.form.node.style.height = "";
			}
			return this;
		};
		
		c.clear = function() {
			if(this.status.cleared) {
				return false;
			}
			this.status.cleared = true;
			// Release all objects:
			DOM.releaseChildren(this.node);
			Arrays.clear(this.footer.leftButtons);
			Arrays.clear(this.footer.rightButtons);
			this.header = this.form = this.footer = null;
			// Keep the column width (needs to be done with a div node):
			this.node.className = "";
			this.header = {node:DOM.addNode(c.node, "div")};
			this.header.node.wrapper = c.header;
			this.header.node.style.width = this.width+"px";
			return this;
		};

		// TODO move inside edit
		c.clearForEdit = function() {
			// Header:
			DOM.releaseChildren(this.header.node);
			if(this.header.grid) {
				// TODO this call may not be need anymore
				DOM.release(this.header.grid.node);
				this.header.grid = null;
			}
			// Form:
			DOM.release(this.form.grid.node);
			this.form.grid = null;
			// Footer:
			// Note: the footer layout must be kept
			while(this.footer.leftButtons.length > 0) {
				var b = this.footer.leftButtons.pop();
				DOM.release(b.node);
			}
			while(this.footer.rightButtons.length > 0) {
				var b = this.footer.rightButtons.pop();
				DOM.release(b.node);
			}
			return this;
		};

		if(c.type.form) {
			c.edit = function(args) {
				Utils.checkArgs(args, "render");
				this.clearForEdit();
				// Header:
				this.header.node.innerHTML = "Editing";
				this.header.node.className = "fluid-edit";
				this.header.node.style.width = DOM.getStyleSize({size:c.width, padding:20}) + "px";
				// Form:
				this.form.grid = new Widgets.Table(Fluid.Constants.gridEdit).attachTo(this.form.node);
				// User-defined render:
				args.render(this);
				return this.pack();
			};
		}

		return c;
	}
};

