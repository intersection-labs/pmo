///////////////////////////////////////////////////////////////////////////////
// EAP.R1
// Dependencies: Generics.R1; constants.js
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// UI class
///////////////////////////////////////////////////////////////////////////////

var UI = {

	// Variables:
	currentLayers: new Array(),
	// TODO remove
	//hideTimeout: null,

	// Methods:
	hideAll: function() {
		while(this.currentLayers.length > 0) {
			DOM.hide(this.currentLayers.pop());
		}
	},
	
	show: function(node) {
		this.currentLayers.push(node);
		DOM.show(node);
	},

	center: function(element) {
		var winWidth = DOM.getWindowWidth();
		var winHeight = DOM.getWindowHeight();
		element.style.left = ((winWidth / 2) - (element.offsetWidth / 2))+"px";
		element.style.top = ((winHeight / 2) - (element.offsetHeight / 2))+"px";
	},
	
	resizeHeight: function(cId) {
		var componentHeight = DOM.getWindowHeight() - Constants.UI.FRAMESET_TOP_PANE_HEIGHT - Constants.UI.FRAMESET_BOTTOM_PANE_HEIGHT;
		DOM.id(cId).style.height = componentHeight+"px";
	},
	
	resizeWidth: function(cId) {
		var componentWidth = DOM.getWindowWidth();
		DOM.id(cId).style.width = componentWidth+"px";
	},
	
	openPage: function(page) {
		DOM.id("frame-main").src = page;
	}
}



///////////////////////////////////////////////////////////////////////////////
// FormManager class
///////////////////////////////////////////////////////////////////////////////

var FormManager = {
	
	// Variables:
	forms: new Array(),
	lastLayerShown: null,
	lastLayerIsValidation: false,
	lastCorrectedLayer: null,
	
	// Methods:
	registerForm: function(form) {
		// Pre-load form images:
		if(this.forms.length == 0) {
			var div = document.createElement("div");
			div.style.display = "none";
			document.body.appendChild(div);
			var formImages = new Array(
				"files/img/button-loading.gif",
				"files/img/icon-ok.png",
				"files/img/icon-warn.png",
				"files/img/icon-error.png",
				"files/img/icon-point-left.png",
				"files/img/icon-point-bottom.png",
				"files/img/icon-point-right.png"
			);
			for(i in formImages) {
				var img = document.createElement("img");
				img.src = formImages[i];
				div.appendChild(img);
			}
		}
		// Register the form:
		var eapForm = new Form(form, this.forms.length+1);
		this.forms.push(eapForm);
		return eapForm;
	},
	
	checkUnsavedChanges: function(fc) {
		if(this.forms.length == 1) {
			return false;
		}
		for(var i=0; i<this.forms.length; i++) {
			if(this.forms[i] != fc) {
				if(this.forms[i]._showUnsavedChanges) {
					if(this.forms[i].hasChanges()) {
						this.hideLastLayer();
						this.forms[i].showUnsavedLayer();
						this.lastLayerShown = this.forms[i]._unsavedLayer;
						this.lastLayerIsValidation = true;
						return true;
					}
					else {
						if(DOM.id(this.forms[i]._unsavedLayer) != null) {
							DOM.hide(DOM.id(this.forms[i]._unsavedLayer));
						}
					}
				}
			}
		}
		return false;
	},

	id: function(fieldId) {
		var field = DOM.id(fieldId);
		if(field == null) {
			return null;
		}
		return field.eap.wrapper;
	},

	show: function(layerId, isValidation) {
		// Must use UI.show instead of DOM.show:
		UI.show(DOM.id(layerId));
		this.lastLayerShown = layerId;
		this.lastLayerIsValidation = isValidation;
	},
	
	hideLastLayer: function() {
		if(this.lastLayerShown != null) {
			DOM.hide(DOM.id(this.lastLayerShown));
			this.lastLayerShown = null;
			this.lastLayerIsValidation = false;
		}
	},
	
	scheduleHide: function(layerId) {
		// Note: we cannot use FormManager.lastLayerShown and need a separate variable:
		this.lastCorrectedLayer = layerId;
		// Note: remove this if we want the confirmation to appear at the same time as info.
		this.lastLayerIsValidation = true;
		setTimeout(this.hideConfirmation, 1500);
	},

	// Note: because this function is called from within a timer,
	// we cannot use references to "this" and must use "FormManager" instead
	hideConfirmation: function() {
		DOM.hide(DOM.id(FormManager.lastCorrectedLayer));
		FormManager.lastLayerIsValidation = false;
	}
};



///////////////////////////////////////////////////////////////////////////////
// Form class
// Note: the Form constructor is called by FormManager
///////////////////////////////////////////////////////////////////////////////

// TODO add underscore to private variables
function Form(args, index) {

	// Public variables:
	this.elements = new Array();
	// Private variables:
	this._index = index;
	this._validator = args.validator;
	this._showUnsavedChanges = args.showUnsavedChanges;
	this._unsavedLayer = null;
	this._confLayer = null;
	this._button = args.button;

	// Listen on submit:
	args.form.eap = new Object();
	args.form.eap.fc = this;
	args.form.onsubmit = function() {
		try {
			var result = this.eap.fc.validateFields(true);
			if(!result) {
				return false;
			}
			result = this.eap.fc.validateForm();
			if(result && args.button) {
				if(args.button.showProgress == true) {
					// Substitute the button with an image (if we keep the
					// element as a button, IE displays a border around it)
					var oldButton = DOM.id(args.button.id);
					if(oldButton.eap) {
						// Ensure we substitute both buttons in case of ButtonMenu:
						if(oldButton.eap.widget.wgNode) {
							var rightButton = oldButton.eap.widget.wgNode;
							var div = document.createElement("div");
							oldButton.parentNode.replaceChild(div, oldButton);
							oldButton = rightButton;
						}
					}
					var progressImg = document.createElement("img");
					progressImg.src = "files/img/button-loading.gif";
					progressImg.style.width = Constants.UI.PROGRESS_IMG_WIDTH+"px";
					progressImg.style.height = Constants.UI.PROGRESS_IMG_HEIGHT+"px";
					oldButton.parentNode.replaceChild(progressImg, oldButton);
				}
			}
			return result;
		}
		catch(error) {
			Logger.error("[In Form]: "+error);
			return false;
		}
	};

	// Methods:
	this.registerField = function(args) {
		var field = new FieldWrapper(args, this);
		this.elements.push(field);
		return field;
	};
	
	this.validateFields = function() {
		for(var i=0; i<this.elements.length; i++) {
			var msg = null;
			if(this.elements[i]._mandatory && this.elements[i].isEmpty()) {
				if(this.elements[i].domNode.type == "text" || this.elements[i].domNode.type == "password" || this.elements[i].domNode.type == "textarea") {
					msg = Strings.replace(Constants.Locale.FIELD_CANNOT_BE_EMPTY, "{1}", this.elements[i]._name);
				}
				else if(Option.isOption(this.elements[i].domNode) || Radio.isRadio(this.elements[i].domNode)) {
					msg = Strings.replace(Constants.Locale.MUST_SELECT_OPTION, "{1}", this.elements[i]._name.toLowerCase());
				}
				else {
					msg = "UNRECOGNIZED";
				}
			}
			else {
				if(this.elements[i]._validator != null) {
					msg = this.elements[i]._validator(this.elements[i].domNode);
				}
			}
			this.elements[i]._valid = (msg == null);
			if(!this.elements[i]._valid) {
				this.elements[i].domNode.focus();
				this.elements[i].showValidation(false, msg);
				return false;
			}
		}
		FormManager.hideLastLayer();
		return true;
	};
	
	this.validateForm = function() {
		if(this._validator == null) {
			return true;
		}
		var msgs = this._validator(args.form);
		if(msgs == null) {
			return true;
		}
		if(msgs.length == 0) {
			return true;
		}
		// Show error messages with dialog box, or alert if not in frameset
		var dialog = null;
		var nl = "\n";
		if(top.Dialog) {
			dialog = new top.Dialog({width: 315});
			dialog.setTitle({text: "Validation Errors", align: "center"});
			nl = "<br>";
		}
		var txt = "The information you are trying to submit has errors. Please correct them before continuing:"+nl;
		for(var i=0; i<msgs.length; i++) {
			txt = txt + nl + "- " + msgs[i];
		}
		if(dialog != null) {
			dialog.setContents({text: txt, align: "left"});
			dialog.addButton({text:"OK", handler:function(d) {
				d.hide();
			}});
			dialog.show();
		}
		else {
			alert(txt);
		}
		return false;
	};

	this.hasChanges = function() {
		for(var i=0; i<this.elements.length; i++) {
			if(this.elements[i]._changed) {
				return true;
			}
		}
		return false;
	};
	
	this.reset = function() {
		for(var i=0; i<this.elements.length; i++) {
			// TODO careful with options and radio
			this.elements[i].domNode.value = "";
			this.elements[i]._changed = false;
			this.elements[i]._valid = true;
		}
	};
	
	this.showUnsavedLayer = function() {
		var div1 = null;
		// Lazy DOM initialization:
		if(this._unsavedLayer == null) {
			if(args.button == null) {
				Logger.error("Cannot show unsaved changes layer without a button assigned to the form");
				return;
			}
			this._unsavedLayer = "form_"+this._index+"_unsaved";
			div1 = document.createElement("div");
			div1.setAttribute("id", this._unsavedLayer);
			div1.setAttribute("class", "field-msg-bottom-container");
			div1.style.width = Constants.UI.FORM_UNSAVED_LAYER_WIDTH+"px";
			document.body.appendChild(div1);
			var div2 = document.createElement("div");
			div2.setAttribute("class", "field-msg-bottom-content");
			div2.innerHTML = Constants.Locale.FORM_UNSAVED_CHANGES_MSG;
			div1.appendChild(div2);
			var div3 = document.createElement("div");
			div3.setAttribute("class", "field-msg-bottom-icon");
			var icon = document.createElement("img");
			icon.src = "files/img/icon-point-bottom.png";
			div3.appendChild(icon);
			div1.appendChild(div3);
		}
		else {
			div1 = DOM.id(this._unsavedLayer);
		}
		DOM.show(div1);
		this._position(div1);
	};

	this.showConfirmation = function(msg) {
		var div1 = null;
		// Lazy DOM initialization:
		if(this._confLayer == null) {
			if(args.button == null) {
				Logger.error("Cannot show confirmation layer without a button assigned to the form");
				return;
			}
			this._confLayer = "form_"+this._index+"_conf";
			div1 = document.createElement("div");
			div1.setAttribute("id", this._confLayer);
			div1.setAttribute("class", "field-msg-left-container");
			document.body.appendChild(div1);
			var div2 = document.createElement("div");
			div2.setAttribute("class", "field-msg-left-icon");
			div1.appendChild(div2);
			var icon = document.createElement("img");
			icon.src = "files/img/icon-ok.png";
			div2.appendChild(icon);
			var div3 = document.createElement("div");
			div3.setAttribute("class", "field-msg-left-content");
			div3.style.width = Constants.UI.FORM_UNSAVED_LAYER_WIDTH+"px";
			div3.innerHTML = "EMPTY";
			div1.appendChild(div3);
		}
		else {
			div1 = DOM.id(this._confLayer);
		}
		div1.getElementsByTagName("div")[1].innerHTML = msg;
		DOM.show(div1);
		this._position(div1);
		FormManager.scheduleHide(this._confLayer);
	};

	this._position = function(layer) {
		var pos = DOM.getPosition(DOM.id(this._button.id));
		layer.style.top = (pos.y - layer.offsetHeight + Constants.UI.FORM_UNSAVED_LAYER_TOP_SHIFT)+"px";
		layer.style.left = (pos.x + DOM.id(args.button.id).offsetWidth - layer.offsetWidth)+"px";
	};
	
	return this;
}



///////////////////////////////////////////////////////////////////////////////
// FieldWrapper class
///////////////////////////////////////////////////////////////////////////////

function FieldWrapper(args, fc, index) {

	// Variables:
	this.domNode = args.field;
	args.field.eap = new Object();
	args.field.eap.wrapper = this;
	this._name = args.name;
	this._layerId = args.layerId;
	this._width = args.width ? args.width : Constants.UI.FORM_FIELD_INFO_WIDTH;
	this._shift = {top:0, left:0};
	this._shift.top = args.shift ? (args.shift.top ? args.shift.top : 0) : 0;
	this._shift.left = args.shift ? (args.shift.left ? args.shift.left : 0) : 0;
	this._info = args.info;
	this._mandatory = args.mandatory == null ? false : args.mandatory;
	this._validator = args.validator;
	this._showCorrected = args.showCorrected == null ? true : args.showCorrected;
	this._valid = true;
	// TODO careful with radio buttons
	this._originalValue = args.field.value;
	this._changed = false;
	this._fc = fc;

	// DOM layer:
	if(args.layerId != null) {
		this._layerId = args.layerId;
	}
	else {
		this._layerId = "form_"+fc.index+"_field_"+(fc.elements.length+1)+"_info";
		var div1 = document.createElement("div");
		div1.setAttribute("id", this._layerId);
		div1.setAttribute("class", "field-msg-left-container");
		document.body.appendChild(div1);
		var div2 = document.createElement("div");
		div2.setAttribute("class", "field-msg-left-icon");
		div1.appendChild(div2);
		var icon = document.createElement("img");
		icon.src = "files/img/icon-point-left.png";
		div2.appendChild(icon);
		var div3 = document.createElement("div");
		div3.setAttribute("class", "field-msg-left-content");
		div3.style.width = this._width + "px";
		div3.innerHTML = "EMPTY";
		div1.appendChild(div3);
	}
	
	// Event handlers:
	args.field.onfocus = function() {
		this.eap.wrapper.showMessage();
	};
	if(Option.isOption(args.field)) {
		args.field.onchange = function() {
			this.eap.wrapper.validate();
		};
	}
	else {
		args.field.onblur = function() {
			this.eap.wrapper.validate();
			// Custom event handler:
			if(this.eap.wrapper.onBlur != null) {
				this.eap.wrapper.onBlur();
			}
		};
	}
	
	// Methods:
	this.hasChanged = function() {
		return this._changed;
	};

	this.showMessage = function() {
		// Position this field's layer:
		if(this._layerId != null) {
			// Calculate y position:
			var pos = DOM.getPosition(this.domNode);
			var topPos = pos.y;
			// For input elements except text areas, we shift the layer a bit up:
			if(this.domNode.type != "textarea") {
				topPos += Constants.UI.FORM_FIELD_INFO_TOP_SHIFT;
			}
			DOM.id(this._layerId).style.top = (topPos + this._shift.top)+"px";
			// Calculate x position:
			DOM.id(this._layerId).style.left = (pos.x + this.domNode.offsetWidth + Constants.UI.FORM_FIELD_INFO_LEFT_SHIFT + this._shift.left)+"px";
		}
		if(FormManager.checkUnsavedChanges(this._fc)) {
			return false;
		}
		if(!this._valid) {
			this.showValidation(false);
			return true;
		}
		else {
			if(top.Config) {
				if(!top.Config.helpOn) {
					return false;
				}
			}
			this.showInfo();
			return true;
		}
	};

	this.validate = function() {
		if(this.domNode.value != this._originalValue) {
			this._changed = true;
		}
		else {
			this._changed = false;
		}
		// If the field is empty, we do not validate it:
		if(this.isEmpty()) {
			return false;
		}
		var msg = null;
		if(this._validator != null) {
			msg = this._validator(this.domNode);
		}
		if(msg != null) {
			this.showValidation(false, msg);
			this._valid = false;
			return false;
		}
		else {
			// We only show the "Corrected" message if the error
			// message currently being displayed is related to this field:
			if(!this._valid && FormManager.lastLayerShown == this._layerId) {
				this.showValidation(true);
			}
			this._valid = true;
			return true;
		}
	};
	
	this.showInfo = function() {
		if(!FormManager.lastLayerIsValidation) {
			FormManager.hideLastLayer();
			if(this._info != null) {
				DOM.id(this._layerId).getElementsByTagName("img")[0].src = "files/img/icon-point-left.png";
				DOM.id(this._layerId).getElementsByTagName("div")[1].innerHTML = this._info;
				FormManager.show(this._layerId, false);
			}
		}
	};

	this.showValidation = function(ok, msg) {
		FormManager.hideLastLayer();
		if(ok) {
			if(!this._showCorrected) {
				// We only show the corrected message if the element has been configured such
				return;
			}
			DOM.id(this._layerId).getElementsByTagName("img")[0].src = "files/img/icon-ok.png";
			DOM.id(this._layerId).getElementsByTagName("div")[1].innerHTML = msg==null ? "Corrected" : msg;
			DOM.show(DOM.id(this._layerId));
			FormManager.scheduleHide(this._layerId);
		}
		else {
			DOM.id(this._layerId).getElementsByTagName("img")[0].src = "files/img/icon-error.png";
			if (msg != null) {
				DOM.id(this._layerId).getElementsByTagName("div")[1].innerHTML = msg;
			}
			FormManager.show(this._layerId, true);
		}
	};

	this.isEmpty = function() {
		if(this.domNode.type == "text" || this.domNode.type == "password" || this.domNode.type == "textarea") {
			return Validator.isEmpty(this.domNode.value);
		}
		else if(Option.isOption(this.domNode)) {
			return !Option.isSelected(this.domNode);
		}
		else if(Radio.isRadio(this.domNode)) {
			return !Radio.isSelected(this.domNode);
		}
		else {
			Logger.error("unrecognized field type: "+this.domNode.type);
			return true;
		}
	};

	this.reset = function() {
		this._valid = true;
		if(FormManager.lastLayerShown == this._layerId) {
			FormManager.hideLastLayer();
		}
	};
	
	return this;
}



///////////////////////////////////////////////////////////////////////////////
// AjaxRequest class
// Note: this only works with the EAP standard XML message format
// TODO separate Ajax and EAP specific functionality
///////////////////////////////////////////////////////////////////////////////

function AjaxRequest(args) {
	
	this.url = args.url;
	this.method = args.method == null ? "GET" : args.method.toUpperCase();
	this.async = args.async==null ? true : args.async;
	this.parameters = args.parameters;
	this.onSuccess = args.onSuccess;
	this.onFailure = args.onFailure;
	
	this.send = function() {
		request = this._getXmlHttp();
		request.onreadystatechange = this._onChangeState;
		request.onSuccess = this.onSuccess;
		request.onFailure = this.onFailure;
		// Build request parameters:
		var reqParams = null;
		if(this.parameters != null) {
			reqParams = "";
			for(var i=0; i<this.parameters.length; i++) {
				reqParams += (this.parameters[i].name + "=" + this.parameters[i].value);
				if(i != this.parameters.length-1) {
					reqParams += "&";
				}
			}
		}
		if(this.method == "GET") {
			request.open(this.method, this.url + (reqParams != null ? "?" + reqParams : ""), this.async);
			request.send(null);
		}
		else if(this.method == "POST") {
			request.open(this.method, this.url, this.async);
			request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			request.setRequestHeader("Content-length", reqParams.length);
			request.setRequestHeader("Connection", "close");
			request.send(reqParams);
		}
		else {
			Logger.error("wrong method argument: "+this.method);
			return;
		}
	};
	
	this._getXmlHttp = function() {
		try { return new XMLHttpRequest(); } catch(e) {}
		try { new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch(e) {}
		try { new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch(e) {}
		try { new ActiveXObject("Msxml2.XMLHTTP"); } catch(e) {}
		try { new ActiveXObject("Microsoft.XMLHTTP"); } catch(e) {}
		throw "XML HTTP not supported";
	};
	
	this._onChangeState = function() {
		if(this.readyState == 4) {
			try {
				// Note: status is 0 if the script is run on a local drive
				if(this.status != 200 && this.status != 0) {
					throw "server status code: "+this.status+(this.statusText ? " ("+this.statusText+")" : "");
				}
				var xml = this.responseXML;
				if(xml == null) {
					throw "XML response is null. Text: '"+this.responseText+"'";
				}
				if(this.responseXML.firstChild == null) {
					throw "response not in XML format. Text: '"+this.responseText+"'";
				}
				var status = xml.getElementsByTagName("status")[0].childNodes[0].nodeValue;
				if(status.toUpperCase() == "OK") {
					try {
						this.onSuccess(xml);
					}
					catch(error) {
						Logger.error("[AjaxRequest error on custom onSuccess callback]: "+ error);
					}
				}
				else if(status.toUpperCase() == "ERROR") {
					var errorCode = xml.getElementsByTagName("error-code").length > 0 ? xml.getElementsByTagName("error-code")[0].childNodes[0].nodeValue : null;
					var message = xml.getElementsByTagName("message").length > 0 ? xml.getElementsByTagName("message")[0].childNodes[0].nodeValue : null;
					try {
						this.onFailure(errorCode, message);
					}
					catch(error) {
						Logger.error("[AjaxRequest error on custom onFailure callback]: "+ error);
					}
				}
				else {
					throw "unknown response status: "+status;
				}
			}
			catch(error) {
				Logger.error("[In AjaxRequest]: "+error);
			}
		}
	};
	
	return this;
}


///////////////////////////////////////////////////////////////////////////////
// AjaxRequest2 class
// WIP to use JSON functionality instead of XML
///////////////////////////////////////////////////////////////////////////////

function AjaxRequest2(args) {
	
	this.url = args.url;
	this.method = args.method == null ? "GET" : args.method.toUpperCase();
	this.async = args.async==null ? true : args.async;
	this.parameters = args.parameters;
	this.onSuccess = args.onSuccess;
	this.onFailure = args.onFailure;
	
	this.send = function() {
		request = this._getXmlHttp();
		request.onreadystatechange = this._onChangeState;
		request.fluid = {};
		request.fluid.onSuccess = this.onSuccess;
		request.fluid.onFailure = this.onFailure;
		// Build request parameters:
		var reqParams = null;
		if(this.parameters != null) {
			reqParams = "";
			for(var i=0; i<this.parameters.length; i++) {
				reqParams += (this.parameters[i].name + "=" + this.parameters[i].value);
				if(i != this.parameters.length-1) {
					reqParams += "&";
				}
			}
		}
		if(this.method == "GET") {
			request.open(this.method, this.url + (reqParams != null ? "?" + reqParams : ""), this.async);
			request.send(null);
		}
		else if(this.method == "POST") {
			request.open(this.method, this.url, this.async);
			request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			request.setRequestHeader("Content-length", reqParams.length);
			request.setRequestHeader("Connection", "close");
			request.send(reqParams);
		}
		else {
			throw "wrong method argument: "+this.method;
		}
	};
	
	this._getXmlHttp = function() {
		try { return new XMLHttpRequest(); } catch(e) {}
		try { new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch(e) {}
		try { new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch(e) {}
		try { new ActiveXObject("Msxml2.XMLHTTP"); } catch(e) {}
		try { new ActiveXObject("Microsoft.XMLHTTP"); } catch(e) {}
		throw "XML HTTP not supported";
	};
	
	this._onChangeState = function() {
		if(this.readyState == 4) {
			// Note: status is 0 if the script is run on a local drive
			if(this.status != 200 && this.status != 0) {
				throw "server status code: "+this.status+(this.statusText ? " ("+this.statusText+")" : "");
			}
			if(Utils.not(this.responseText)) {
				throw "Ajax response is null";
			}
			var data = eval(this.responseText);
			// TODO do some sort of parsing to check if the URL returned an error response
			this.fluid.onSuccess(data);
		}
	};
	
	return this;
}



///////////////////////////////////////////////////////////////////////////////
// EAP class
// This is used to hold any function that does not fit the other classes
///////////////////////////////////////////////////////////////////////////////

var EAP = {

	checkIdentifier: function(field) {
		var str = field.value;
		if(!Validator.isAlphabetic(str.charAt(0))) {
			return Strings.replace(Constants.Locale.USERNAME_START_WITH_LETTER, "{1}", "Username");
		}
		str = Strings.replace(str, ".", "");
		str = Strings.replace(str, "_", "");
		str = Strings.replace(str, "-", "");
		if(!Validator.isAlphaNumeric(str)) {
			return Strings.replace(Constants.Locale.USERNAME_ILLEGAL_CHARS, "{1}", "Username");
		}
		return null;
	},
	
	checkPassword: function(field) {
		if(Strings.trim(field.value).length != field.value.length) {
			return Constants.Locale.PASSWORD_CANNOT_HAVE_SPACES;
		}
		if(field.value.length < Constants.Other.VAL_PASSWORD_MAX_LENGTH) {
			return Strings.replace(Strings.replace(Constants.Locale.FIELD_MUST_HAVE_MIN_LENGTH, "{1}", "Password"), "{2}", Constants.Other.VAL_PASSWORD_MAX_LENGTH+"");
		}
		return null;
	},
	
	getCurrentTime: function() {
		var today = new Date();
		return Constants.Locale.DAY_NAMES[today.getDay()] + " " + today.getDate() + " " + Dates.formatTime(today);
	}	
};

