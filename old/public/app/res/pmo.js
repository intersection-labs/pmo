
var PMO = {

	listOrgs: function() {
		var request = new AjaxRequest2({
			url: "../tmp/organisations.json",
			method: "get",
			async: true,
			onSuccess: function(data) {
				var c = Fluid.addColumn({position:1, width:250, title:"Organisations"});
				c.form.grid.rows[0].cols[0].node.children[0].style.textAlign = "center";
				// Create Home and Personal links:
				c.header.node.className = "fluid-form";
				c.header.grid = new Widgets.Table(Fluid.Constants.gridView).attachTo(c.header.node);
				var row = c.header.grid.addRow();
				var block = row.cols[0].addBlock({text:"HOME"});
				block.node.onclick = function() {
					PMO.viewHome();
				}
				c.blockGroup = new Group({widget:"block"});
				c.blockGroup.push(block.node);
				block = row.cols[0].addBlock({text:"PERSONAL"});
				block.node.onclick = function() {
					PMO.viewPersonal();
				}
				c.blockGroup.push(block.node);
				row = c.form.grid.addRow();
				// List organisations:
				for(var i=0; i<data.length; i++) {
					var org = data[i];
					block = row.cols[0].addBlock({text:org.name});
					block.id = org.id;
					block.node.onclick = function(node) {
						PMO.viewOrg(node.wrapper.id);
					}
					c.blockGroup.push(block.node);
				}
				// Add buttons to footer:
				c.footer.addButton({type:"add"});
				c.show();
				// TODO put this code somewhere else
				PMO.viewHome();
			},
			onFailure: null
		});
		request.send();
	},

	viewHome: function() {
		Fluid.addColumn({position:2, width:500, title:"Home"}).show();
	},

	viewPersonal: function() {
		//Fluid.addColumn({position:2, width:500, title:"Personal"});
		PMO.viewProject(1);
	},
	
	viewOrg: function(org) {
		var request = new AjaxRequest2({
			url: "../tmp/org-"+org+".json",
			method: "get",
			async: true,
			onSuccess: function(data) {
				var org = data[0];
				var c = Fluid.addColumn({position:2, width:280, title: org.name});
				var buttons = new Array();
				buttons.push({text:"Programs", action:function() {
					// TODO org.id is incorrect
					PMO.listPrograms(org.id);
				}});
				buttons.push({text:"People", action:function() {
					PMO.listPeople(org.id);
				}});
				var row = c.form.grid.addRow();
				row.last().addButtonGrid({buttons:buttons});
				row = c.form.grid.addRow();
				row.last().addText({text:org.domain, href:"http://"+org.domain});
				row.last().addText({text:org.employees+" employees"});
				//row = c.form.grid.addRow();
				row.last().addText({text:org.description});
				c.footer.addButton({type:"edit"});
				c.footer.addButton({type:"history"});
				c.footer.addButton({type:"leave", side:"left"});
				c.show();
			},
			onFailure: null
		});
		request.send();
	},
	
	listPrograms: function(org) {
		// TODO this needs to come from JSON
		var data = new Array();
		data.push({id:1, name:"Digital Presence", projects:3});
		Fluid.addListColumn({position:3, width:430, title:"Programs", data:data, render:function(node, item) {
			node.onclick = function() {
				PMO.viewProgram(item.id);
			}
			var table = new Widgets.Table().attachTo(node);
			var row = table.addRow();
			row.last().addText({text:item.name, title:true, margin:3});
			row.last().addText({text:item.projects + " projects"});
		}}).show();
	},
	
	listPeople: function(org) {
		Fluid.addColumn({position:3, width:280, title:"People"}).show();
	},
	
	viewProgram: function(id) {
		var request = new AjaxRequest2({
			url: "../tmp/program-"+id+".json",
			method: "get",
			async: true,
			onSuccess: function(data) {
				var p = data[0];
				var c = Fluid.addColumn({position:4, width:280, title:p.name});
				var buttons = new Array();
				buttons.push({text:"Projects", action:function() {
					PMO.listProjects(p.id);
				}});
				buttons.push({text:"Status", action:function() {
					alert("Not set!");
				}});
				c.form.grid.addRow().last().addButtonGrid({buttons:buttons});
				c.form.grid.addRow().last().addText({text:p.description});
				c.footer.addButton({type:"edit"});
				c.footer.addButton({type:"history"});
				c.show();
			},
			onFailure: null
		});
		request.send();
	},
	
	listProjects: function(id) {
		// TODO this needs to come from JSON
		var data = new Array();
		data.push({id: 1, name: "Web Billing Platform", people: 5, startDate: "12 August", endDate: "18 October"});
		data.push({id: 2, name: "Back Office API", people: 0, startDate: "5 October 2012", endDate: "25 November 2013"});
		data.push({id: 3, name: "E-Commerce Business Case", people: 2, startDate: "4 April", endDate: "12 June"});
		Fluid.addListColumn({position:5, width:430, title:"Projects", data:data, render:function(node, item) {
			node.onclick = function() {
				PMO.viewProject(item.id);
			}
			var table = new Widgets.Table().attachTo(node);
			var row = table.addRow();
			row.last().addText({text:item.name, title:true, margin:3});
			row.last().addText({text:item.people? item.people+" people" : "Open to all employees", margin:3});
			row.last().addText({text:item.startDate + " to " + item.endDate});
		}}).show();
	},
	
	viewProject: function(id) {
		var request = new AjaxRequest2({
			url: "../tmp/project-"+1+".json",
			method: "get",
			async: true,
			onSuccess: function(data) {
				var p = data[0];
				var c = Fluid.addColumn({position:6, width:280, title:p.name});
				var buttons = new Array();
				buttons.push({text:"Status", action:function() {
					PMO.viewStatus(p.id);
				}});
				buttons.push({text:"Risks", action:function() {
					alert("Not set!");
				}});
				buttons.push({text:"Issues", action:function() {
					alert("Not set!");
				}});
				var row = c.form.grid.addRow();
				row.last().addButtonGrid({buttons:buttons});
				row = c.form.grid.addRow();
				row.last().addText({text:p.description});
				row = c.form.grid.addRow();
				row.last().addLabel({text:"Start Date", float:true});
				row.last().addText({text:p.startDate});
				row.last().addLabel({text:"Planned End Date", float:true});
				row.last().addText({text:p.endDate});
				row = c.form.grid.addRow();
				row.last().addUserBlock({type:"label", text:"Project Managers"});
				row.last().addUserBlock({type:"company", text:"Anna Fiore"});
				row.last().addUserBlock({type:"external", text:"AJ"});
				row.last().addUserBlock({type:"company", text:"Carlo Abruzzo"});
				row.last().addUserBlock({type:"external", text:"John Cutler"});
				row = c.form.grid.addRow();
				row.last().addUserBlock({type:"label", text:"Project Team"});
				row.last().addUserBlock({type:"group", text:"Innovair"});
				// Footer buttons:
				c.footer.addButton({type:"edit", onclick:function(node) {
					PMO.editProject(node.wrapper.fluidColumn, p);
				}});
				c.footer.addButton({type:"history"});
				c.show();
			},
			onFailure: null
		});
		request.send();
	},
	
	editProject: function(pCol, p) {
		pCol.edit({render:function(c) {
			var row = c.form.grid.addRow();
			row.last().addLabel({text:"Title", mandatory:true});
			var wg = row.last().addTextBox({name:"title", width:c.getMaxNodeWidth(), text:p.name});
			wg.node.focus();
			var row = c.form.grid.addRow();
			row.last().addLabel({text:"Description", mandatory:true});
			row.last().addTextArea({name:"description", width:c.getMaxNodeWidth(), height:100, text:p.description});
			var row = c.form.grid.addRow();
			row.last().addLabel({text:"Start Date", mandatory:true});
			row.last().addDatePicker({name:"startDate", text:p.startDate});
			var row = c.form.grid.addRow();
			row.last().addLabel({text:"Planned End Date"});
			row.last().addDatePicker({name:"endDate", text:p.endDate});
			var row = c.form.grid.addRow();
			row.last().addLabel({text:"Project Managers", mandatory:true});
			wg = row.last().addText({text:"Select one or more project managers for this project. Project managers are able to edit project details (including selecting the project team and other project managers) and are responsible for completing the project's status reports.", margin:true});
			row.last().addUserBlock({type:"company", text:"Carlo Abruzzo"});
			var row = c.form.grid.addRow();
			row.last().addLabel({text:"Project Team", mandatory:true});
			row.last().addText({text:"Select users that are allowed to collaborate in this project. Note that by default projects are open to your company; if you prefer to select individual users, please remove Innovair from the team.", margin:true});
			row.last().addUserBlock({type:"group", text:"Innovair"});
			// Footer buttons:
			c.footer.addButton({type:"save-inactive", onclick:function(node) {
				//TODO PMO.editProject(p, node.wrapper.fluidColumn);
			}});
			c.footer.addButton({type:"history"});
			return c;
		}});
	},
	
	viewStatus: function(id) {
		Fluid.addColumn({position:7, width:500, title:"Status", isSubtitle:true}).show();
	}
};

