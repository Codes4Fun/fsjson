
///////
// UI Building tools
///////

function VBox()
{
	var table = document.createElement('table');
	//table.style.cssText = "width:100%;height:100%;table-layout:fixed;border-spacing:0";
	table.style.cssText = "width:100%;height:100%;border-spacing:0";
	this.getElement = function () { return table; };
	
	var tbody = document.createElement('tbody');
	table.appendChild(tbody);
	
	this.appendChild = function (child, expands)
	{
		var tr = document.createElement('tr');
		tbody.appendChild(tr);
		
		var td = document.createElement('td');
		if (expands)
		{
			td.style.cssText = "width: 100%;height: 100%;";
		}
		tr.appendChild(td);
		
		if (child)
		{
			if (child.getElement)
			{
				td.appendChild(child.getElement());
			}
			else
			{
				td.appendChild(child);
			}
		}
	};
}

function HBox()
{
	var table = document.createElement('table');
	table.style.cssText = "width:100%;height:100%;border-spacing:0";
	this.getElement = function () { return table; };
	
	var tbody = document.createElement('tbody');
	table.appendChild(tbody);

	var tr = document.createElement('tr');
	tbody.appendChild(tr);
	
	this.appendChild = function (child, expands)
	{
		var td = document.createElement('td');
		if (expands)
		{
			td.style.cssText = "width: 100%;height: 100%;";
		}
		tr.appendChild(td);
		
		if (child)
		{
			if (child.getElement)
			{
				td.appendChild(child.getElement());
			}
			else
			{
				td.appendChild(child);
			}
		}
	};
}

function HMenu()
{
	var table = document.createElement('table');
	table.style.cssText = "border-spacing:0";
	this.getElement = function () { return table; };
	
	//table.addEventListener('focus', function () { console.log('got focus'); }, true);
	//table.addEventListener('blur', function () { console.log('got blur'); }, true);
	//table.addEventListener('mousedown', function () { console.log('got mousedown'); }, true);
	//table.addEventListener('mouseup', function () { console.log('got mouseup'); }, true);
	//table.addEventListener('click', function () { console.log('got click'); }, true);
	
	var tbody = document.createElement('tbody');
	table.appendChild(tbody);
	
	var trItems = document.createElement('tr');
	tbody.appendChild(trItems);
	
	var trSubMenus = document.createElement('tr');
	tbody.appendChild(trSubMenus);
	
	var scope = this;
	var itemFocus = null;
	var submenuFocus = null;
	var ignoreBlur = false;
	table.addEventListener('mousedown', function (e)
	{
		//console.log(e);
		if (scope.isSubmenu(e.target))
		{
			ignoreBlur = true;
		}
	}, true);
	table.addEventListener('blur', function (e)
	{
		//console.log(e);
		if (!ignoreBlur)
		{
			scope.close();
		}
		ignoreBlur = false;
	}, true);
	table.addEventListener('click', function (e)
	{
		scope.close();
	}, false);

	this.close = function ()
	{
		if (itemFocus)
		{
			//itemFocus.className = 'menuitem';
			itemFocus.children[0].className = 'menuitem';
			submenuFocus.style.cssText = 'display:none';
			itemFocus = null;
			submenuFocus = null;
		}
	}

	this.isSubmenu = function (target)
	{
		var i = 0;
		while (target && target.parentElement != table)
		{
			target = target.parentElement;
			i++;
		}
		//console.log(i);
		return (target.parentElement == table && i > 3);
	};
	
	this.appendItem = function (name, action)
	{
		var tdItem = document.createElement('td');
		//tdItem.className = "menuitem";
		//tdItem.innerHTML = name;
		tdItem.innerHTML = '<div class="menuitem">' + name + '</div>';
		trItems.appendChild(tdItem);

		var tdSubMenu = document.createElement('td');
		trSubMenus.appendChild(tdSubMenu);
		
		if (action == undefined)
			return;

		if (action.constructor == VMenu)
		{
			var divPos = document.createElement('div');
			divPos.style.cssText = 'position:absolute;z-index:1';
			tdSubMenu.appendChild(divPos);
			
			var divStyle = document.createElement('div');
			divStyle.className = 'popupmenu';
			divStyle.style.cssText = 'display:none';
			divPos.appendChild(divStyle);
			
			tdItem.tabIndex = 0;
			tdItem.addEventListener('click', (function (tdItem, divStyle)
			{
				return function (e)
				{
					e.stopPropagation();
					if (divStyle.style.display == 'none')
					{
						//tdItem.className = 'menuitem-selected';
						tdItem.children[0].className = 'menuitem-selected';
						divStyle.style.display = 'block';
						itemFocus = tdItem;
						submenuFocus = divStyle;
					}
					else
					{
						divStyle.style.display = 'none';
					}
				}
			})(tdItem, divStyle), true);;

			divStyle.appendChild(action.getElement());
		}
		else if (action.constructor == Function)
		{
			tdItem.onclick = action;
		}
	};
}

function VMenu()
{
	var table = document.createElement('table');
	table.style.cssText = "border-spacing:0;border-collapse:collapse";
	this.getElement = function () { return table; };
	
	var tbody = document.createElement('tbody');
	table.appendChild(tbody);
	
	this.appendSeparator = function ()
	{
		var tr = document.createElement('tr');
		tr.style.cssText = 'height:0.5em';
		tbody.appendChild(tr);
		
		var tdIcon = document.createElement('td');
		tdIcon.className = 'menuicon';
		tr.appendChild(tdIcon);

		var tdSpan = document.createElement('td');
		tdSpan.colSpan = 3;
		tr.appendChild(tdSpan);
		
		var div = document.createElement('div');
		div.className = 'menuseparator';
		tdSpan.appendChild(div);
	};
	
	this.appendItem = function (name, action, hotkey, icon)
	{
		var tr = document.createElement('tr');
		tr.className = 'vmenuitem';
		tr.tabIndex = 0;
		tbody.appendChild(tr);
		
		if (typeof(action) == 'function')
		{
			tr.onclick = action;
		}
		
		var tdIcon = document.createElement('td');
		tdIcon.className = 'menuicon';
		if (icon)
		{
			tdIcon.appendChild(icon);
		}
		tr.appendChild(tdIcon);

		var tdText = document.createElement('td');
		tdText.className = 'menutext';
		tdText.innerHTML = name;
		tr.appendChild(tdText);
		
		var tdHotkey = document.createElement('td');
		tdHotkey.style.cssText = 'float:right';
		tdHotkey.innerHTML = hotkey;
		tr.appendChild(tdHotkey);
		
		var tdSpacer = document.createElement('td');
		tdSpacer.style.cssText = 'width:1em';
		tr.appendChild(tdSpacer);

		return tr;
	}
}

function ModalDialog(title, onclose)
{
	var background = document.createElement('div');
	background.style.cssText = "display:none; position:absolute;left:0px;top:0px;right:0px;bottom:0px;background-color:rgba(40,40,40,0.8)";
	this.getElement = function () { return background; };

	this.show = function ()
	{
		background.style.display = "block";
	};
	
	this.hide = function ()
	{
		background.style.display = "none";
		if (onclose) onclose();
	};

	var dialog = document.createElement('table');
	dialog.style.cssText = 'position:absolute;background-color:#E0E0E0;border:2px outset;padding:2px;left:50%;top:50%;transform: translate(-50%,-50%);table-layout:fixed';
	//var dialog = document.createElement('div');
	//dialog.style.cssText = 'position:absolute;background-color:rgb(245,246,247);border:2px outset;padding:2px;left:50%;top:50%;transform: translate(-50%,-50%)';
	this.setWidth = function (width)
	{
		dialog.style.width = width;
	};
	this.setHeight = function (height)
	{
		dialog.style.height = height;
	};
	this.setSize = function (width, height)
	{
		dialog.style.width = width;
		dialog.style.height = height;
	};
	
	//var dialogTable = document.createElement('table');
	//var dialogBody = document.createElement('tbody');
	//dialogTable.appendChild(dialogBody);
	//dialog.appendChild(dialogTable);

	var dialogBody = document.createElement('tbody');
	dialog.appendChild(dialogBody);

	var header = document.createElement('table');
	header.style.cssText = 'width:100%;background-color:#B0B0B0;padding:2px;';
	var headerBody = document.createElement('tbody');
	header.appendChild(headerBody);
	var headerRow = document.createElement('tr');
	headerBody.appendChild(headerRow);
	var headerText = document.createElement('td');
	//headerText.style.cssText = "width:100%";
	headerText.innerHTML = title;
	this.setTitle = function (title) { headerText.innerHTML = title; }
	headerRow.appendChild(headerText);
	var headerClose = document.createElement('td');
	headerClose.className = 'closebutton';
	headerClose.innerHTML = 'x';
	headerClose.onclick = this.hide;
	headerRow.appendChild(headerClose);
	//dialog.appendChild(header);
	var tr = document.createElement('tr');
	var td = document.createElement('td');
	td.appendChild(header);
	tr.appendChild(td);
	dialogBody.appendChild(tr);

	//var contentArea = document.createElement('div');
	//this.getContentArea = function () { return contentArea; }
	//contentArea.style.cssText = 'padding:8px';
	//dialog.appendChild(contentArea);
	var tr = document.createElement('tr');
	var td = document.createElement('td');
	var contentArea = td;
	this.getContentArea = function () { return contentArea; }
	//contentArea.style.cssText = 'padding:8px';
	//td.appendChild(contentArea);
	tr.appendChild(td);
	dialogBody.appendChild(tr);

	background.appendChild(dialog);

	// experimental, close dialog on background click
	//background.addEventListener('click', this.hide, false);
	//dialog.addEventListener('click', function (e) {e.stopPropagation()}, false);
}



function makeWidthResizer(resizer, getWidth, changeWidth)
{
	var targetWidth;
	var targetHeight;
	var startX;
	var StartY;

	resizer.style.cursor = 'e-resize';

	function resizeMouseDown(e)
	{
		e.stopPropagation();
		e.preventDefault();
		targetWidth = getWidth();
		startX = e.clientX;
		document.addEventListener('mousemove', resizeMouseMoved, true);
		document.addEventListener('mouseup', resizeMouseUp, true);
	}

	function resizeMouseMoved(e)
	{
		var delta = e.clientX - startX;
		if (targetWidth + delta > 16)
		{
			startX = e.clientX;
			var oldWidth = targetWidth;
			targetWidth += delta;
			changeWidth(targetWidth, oldWidth);
		}
		return false;
	}

	function resizeMouseUp(e)
	{
		e.stopPropagation();
		e.preventDefault();
		document.removeEventListener('mousemove', resizeMouseMoved, true);
		document.removeEventListener('mouseup', resizeMouseUp, true);
		return false;
	}

	resizer.addEventListener('mousedown', resizeMouseDown, true);
}
