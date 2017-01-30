var fs = require('fs');
var fsjson = require('./fsjson');

function TrashBin(trashPath)
{
	var contents = JSON.parse(fs.readFileSync(trashPath + '/contents.json', 'utf8'));

	function releaseFile(path)
	{
		fs.unlinkSync(path);
	}

	function releaseDir(path)
	{
		var files = fsjson.readdirstat(path);

		for (var i = 0; i < files.length; i++)
		{
			var file = files[i];
			if (file.stat.isDirectory())
			{
				releaseDir(path + file.name + '/');
			}
			else
			{
				releaseFile(path + file.name);
			}
		}

		fs.rmdirSync(path);
	}

	function release(item)
	{
		if (item.type == 'directory')
		{
			releaseDir(trashPath + '/' + item.file + '/');
		}
		else
		{
			releaseFile(trashPath + '/' + item.file);
		}
	}
	
	this.saveContents = function ()
	{
		fs.writeFileSync(trashPath + '/contents.json', JSON.stringify(contents));
	}
	
	this.getContents = function ()
	{
		return contents;
	}
	
	this.releaseAll = function ()
	{
		for (var i = 0; i < contents.length; i++)
		{
			release(contents[i]);
		}
		contents = [];
		this.saveContents();
	}

	this.recoverAll = function ()
	{
		for (var i = 0; i < contents.length; i++)
		{
			fs.renameSync(trashPath + '/' + contents[i].file, contents[i].name);
		}
		contents = [];
		this.saveContents();
	}

	this.recover = function (file)
	{
		var newContents = [];
		for (var i = 0; i < contents.length; i++)
		{
			if (contents[i].file == file)
			{
				fs.renameSync(trashPath + '/' + file, contents[i].name);
				for (i++; i < contents.length; i++)
				{
					newContents.push(contents[i]);
				}
				contents = newContents;
				this.saveContents();
				return;
			}
			newContents.push(contents[i]);
		}
	}

	this.release = function (file)
	{
		var newContents = [];
		for (var i = 0; i < contents.length; i++)
		{
			if (contents[i].file == file)
			{
				release(contents[i]);
				for (i++; i < contents.length; i++)
				{
					newContents.push(contents[i]);
				}
				contents = newContents;
				this.saveContents();
				return;
			}
			newContents.push(contents[i]);
		}
	}
	
	this.add = function (path)
	{
		try
		{
			var stat = fs.statSync(path);
		}
		catch (e)
		{
			return '';
		}
		
		var item = fsjson.getFileMeta(path, stat);

		var newName = (new Date()).getTime().toString();
		var newPath = trashPath + '/' + newName;
		fs.renameSync(path, newPath);

		item.file = newName;
		contents.push(item);
		
		this.saveContents();
		
		return newName;
	}

	this.respondView = function (response)
	{
		var jdir = {};
		jdir.path = 'trashbin';
		jdir.file = '';
		jdir.contents = this.getContents();
		response.writeHead(200, {'Content-Type': 'application/json' });
		response.end(JSON.stringify(jdir));
	}

	this.respondClean = function (response)
	{
		console.log('trashbin.releaseAll');
		this.releaseAll();
		response.writeHead(200, {'Content-Type': 'text/plain' });
		response.end('garbage collected trashbin');
	}

	this.respondRelease = function(response, pathname)
	{
		var file = pathname.substr(pathname.lastIndexOf('/') + 1);
		console.log('trashbin.release ' + file);
		this.release(file);
		res.writeHead(200, {'Content-Type': 'text/plain' });
		res.end('removed ' + file + ' from trashbin');
	}

	this.respondAdd = function (response, pathname)
	{
		console.log('trashbin.add ' + pathname);
		var file = this.add(pathname);
		response.writeHead(200, {'Content-Type': 'text/plain' });
		response.end(file);
	}

	this.respondRecover = function (response, pathname)
	{
		var file = pathname.substr(pathname.lastIndexOf('/') + 1);
		console.log('trashbin.recover ' + file);
		this.recover(file);
		response.writeHead(200, {'Content-Type': 'text/plain' });
		response.end('removed ' + file + ' from trashbin');
	}
}

module.exports = TrashBin;

