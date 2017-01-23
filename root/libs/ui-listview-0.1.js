
// default element builders

function createListCellText(text, textAlign)
{
	var cellText = document.createElement('div');
	cellText.className = 'list-cell-text';
	cellText.textContent = text;
	cellText.style.textAlign = textAlign;
	return cellText;
}

function defaultListCellText(property, textAlign)
{
	return function (item)
	{
		return createListCellText(item[property], textAlign);
	}
}

// default sort compares

function defaultListCellCompare(property)
{
	return function (itemA, itemB)
	{
		if (itemA[property] < itemB[property]) return -1;
		if (itemA[property] > itemB[property]) return 1;
		return 0;
	}
}

function defaultListCellNumberCompare(property)
{
	return function (itemA, itemB)
	{
		return (itemA[property] - itemB[property]);
	}
}

// main object

function ListView(headers, ondblclick, primarySort)
{
	var view = document.createElement('div');
	view.style.overflow = 'auto';
	view.style.position = 'relative';
	view.style.border = '1px inset';
	view.style.backgroundColor = 'white';
	view.style.height = 'inherit';
	
	this.getElement = function () { return view; }
	
	var table = document.createElement('div');
	view.appendChild(table);
	
	var order = [];
	var sortHeader = 0;
	
	var hdrs = [];
	var items = [];
	
	function sort()
	{
		var h = sortHeader;
		if (hdrs[h].sortDescending)
		{
			order.sort(function (a,b) {
				var v = primarySort? primarySort(items[a], items[b]) : 0;
				if (v == 0)
				{
					v = headers[h].compare(items[a], items[b]);
				}
				return v;
			});
		}
		else
		{
			order.sort(function (a,b) {
				var v = primarySort? primarySort(items[a], items[b]) : 0;
				if (v == 0)
				{
					v = headers[h].compare(items[a], items[b]);
				}
				return -v;
			});
		}

		for (var i = 0; i < order.length; i++)
		{
			var row = select2rows[order[i]];
			row.orderIndex = i;
			itemsDiv.removeChild(row);
			itemsDiv.appendChild(row);
		}
	}
	
	var width = 0;
	var headerRow = document.createElement('div');
	headerRow.className = 'list-row list-header-row';
	headerRow.style.position = 'absolute';
	table.appendChild(headerRow);
	for (var h = 0; h < headers.length; h++)
	{
		var cell = document.createElement('div');
		headerRow.appendChild(cell);
		cell.className = 'list-cell list-header';
		cell.style.width = headers[h].width + 'px';

		hdrs[h] = {};
		hdrs[h].cell = cell;
		hdrs[h].items = [];
		hdrs[h].sortDescending = true;

		cell.onmousedown = (function (h) { return function ()
		{
			if (sortHeader == h)
			{
				hdrs[h].sortDescending = !hdrs[h].sortDescending;
			}
			else
			{
				sortHeader = h;
			}
			sort();
		}})(h);

		var resizer = document.createElement('div');
		cell.appendChild(resizer);
		resizer.style.width = '8px';
		resizer.style.float = 'right';
		resizer.style.textAlign = 'right';
		resizer.textContent = '|';

		makeWidthResizer(resizer,
			(function(c){return function(){return c.offsetWidth;};})(cell),
			(function(hdr, table, header) { return function (newWidth, oldWidth)
			{
				var tableWidth = (table.offsetWidth + newWidth - oldWidth) + 'px';
				table.style.width = tableWidth;
				header.style.width = tableWidth;
				var newWidthPx = newWidth + 'px';
				hdr.cell.style.width = newWidthPx;
				for (var i = 0; i < hdr.items.length; i++)
				{
					hdr.items[i].style.width = newWidthPx;
				}
			};
			})(hdrs[h], table, headerRow));

		var cellText = document.createElement('div');
		cell.appendChild(cellText);
		cellText.className = 'list-header-text';
		cellText.textContent = headers[h].title;

		width += headers[h].width;
	}
	width += 4 + 2; // padding + borders
	table.style.width = width + 'px';
	headerRow.style.width = width + 'px';

	view.addEventListener('scroll', (function (view, header) { return function () {
		header.style.transform = 'translate(0px,' + view.scrollTop + 'px)';
	}})(view, headerRow), true);
	
	var headerHome = document.createElement('div');
	headerHome.className = 'list-row list-header-home';
	table.appendChild(headerHome);

	var focusedItem = 0;
	var pivotItem = 0;
	var selectItems = true;
	var selectedItems = {};
	
	function clearSelection()
	{
		for (var index in selectedItems)
		{
			selectedItems[index].selected = false;
			selectedItems[index].className = 'list-row list-item-row';
			delete selectedItems[index];
		}
		selectItems = true;
	}

	// disable text selection
	view.style.cursor = 'default';
	table.addEventListener('mousedown', function (e)
	{
		e.preventDefault();
		e.stopPropagation()
	}, false);
	view.addEventListener('mousedown', function (e)
	{
		e.preventDefault();
		if (!e.ctrlKey && !e.shiftKey) clearSelection();
	}, false);

	var itemsDiv = document.createElement('div');
	table.appendChild(itemsDiv);

	var select2rows = [];

	this.clearItems = function ()
	{
		clearSelection();
		focusedItem = 0;
		pivotItem = 0;
		select2rows = [];
		order = [];
		for (var h = 0; h < hdrs.length; h++)
		{
			hdrs[h].items = [];
		}
		while (itemsDiv.children.length > 0)
		{
			itemsDiv.removeChild(itemsDiv.children[0]);
		}
		// is there a way to preserve this?
		view.scrollTop = 0;
	}

	function onclickItemRow(e)
	{
		// if control key not held, wipe out previous selection
		if (!e.ctrlKey)
		{
			clearSelection();
		}
		// shift key sweeps select or deselect from pivot to focus items
		if (e.shiftKey)
		{
			focusedItem = e.currentTarget.orderIndex;
			var startItem;
			var endItem;
			if (focusedItem < pivotItem)
			{
				startItem = focusedItem;
				endItem = pivotItem;
			}
			else
			{
				startItem = pivotItem;
				endItem = focusedItem;
			}
			if (selectItems)
			{
				for (;startItem <= endItem; startItem++)
				{
					var row = itemsDiv.children[startItem];
					if (!row.selected)
					{
						selectedItems[row.itemIndex] = row;
						row.selected = true;
						row.className = 'list-row list-item-row-selected';
					}
				}
			}
			else
			{
				for (;startItem <= endItem; startItem++)
				{
					var row = itemsDiv.children[startItem];
					if (row.selected)
					{
						row.selected = false;
						row.className = 'list-row list-item-row';
						delete selectedItems[row.itemIndex];
					}
				}
			}
		}
		else
		{
			if (!e.currentTarget.selected)
			{
				selectedItems[e.currentTarget.itemIndex] = e.currentTarget;
				e.currentTarget.selected = true;
				e.currentTarget.className = 'list-row list-item-row-selected';
			}
			else if (e.ctrlKey)
			{
				e.currentTarget.selected = false;
				e.currentTarget.className = 'list-row list-item-row';
				delete selectedItems[e.currentTarget.itemIndex];
				selectItems = false;
			}
			focusedItem = e.currentTarget.orderIndex;
			pivotItem = e.currentTarget.orderIndex;
		}
		
		e.currentTarget.focus();
		db = e.currentTarget;
	};

	this.setItems = function (_items)
	{
		items = _items;
		this.clearItems();
		for (var i = 0; i < items.length; i++)
		{
			var row = document.createElement('div');
			row.className = 'list-row list-item-row';
			itemsDiv.appendChild(row);
			
			row.tabIndex = 0;

			order.push(i);
			select2rows[i] = row;
			row.itemIndex = i;
			row.orderIndex = i;
			row.selected = false;
			row.onclick = onclickItemRow;
			if (ondblclick)
			{
				row.ondblclick = (function (row, ondblclick) {
					return function (e)
					{
						ondblclick(row.itemIndex, items[row.itemIndex]);
					}
				})(row, ondblclick);
			}

			for (var h = 0; h < headers.length; h++)
			{
				var cell = document.createElement('div');
				row.appendChild(cell);
				cell.className = 'list-cell';
				cell.style.width = headerRow.children[h].style.width;
				hdrs[h].items.push(cell);

				var cellText = headers[h].create(items[i]);
				if (cellText)
				{
					cell.appendChild(cellText);
				}
			}
		}

		sort();
	};

	table.style.display = 'inline-block';

	this.clearSelection = clearSelection;

	this.select = function (start, end)
	{
		this.clearSelection();

		if (!end)
		{
			var indices = (start.constructor == Number)? [start] : start;
			console.log(indices);
			for (var i = 0; i < indices.length; i++)
			{
				var index = indices[i];
				if (index < 0 || index >= select2rows.length)
				{
					continue;
				}

				var row = select2rows[index];
				selectedItems[index] = row;
				row.selected = true;
				row.className = 'list-row list-item-row-selected';
			}
		}
		else
		{
			if (end < start)
			{
				var temp = start;
				start = end;
				end = temp;
			}
			// in scope
			if (start >= select2rows.length || end < 0)
			{
				return;
			}
			if (start < 0)
			{
				start = 0;
			}
			if (end >= select2rows.length)
			{
				end = select2rows.length-1;
			}
			for (var index = start; index <= end; index++)
			{
				var row = select2rows[index];
				selectedItems[index] = row;
				row.selected = true;
				row.className = 'list-row list-item-row-selected';
			}
		}
	}

	this.getSelection = function ()
	{
		var selected = [];
		for (var index in selectedItems)
		{
			selected.push(parseInt(index));
		}
		return selected;
	};

	this.getSelectedItems = function ()
	{
		var selected = [];
		for (var index in selectedItems)
		{
			selected.push(items[index]);
		}
		return selected;
	};
}




