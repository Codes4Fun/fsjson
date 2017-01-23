
var http = require('http');
var url = require('url');
var fs = require('fs');

var ext = require('./gistfile1.js').ext;

function getConfig()
{
	var dir = fs.readdirSync('.');
	var config;
	if (dir.indexOf('config.json') == -1)
	{
		config = {};
		config.root = 'root';
		config.trashbin = 'trash';
		config.port = 8000;
		console.log('config.json does not exist, using defaults');
	}
	else
	{
		config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
	}

	console.log('   config.root = ' + config.root);
	console.log('   config.port = ' + config.port);
	
	if (config.port < 0 || config.port > 65535)
	{
		throw new Error('"' + config.port + '" is an invalid port');
	}

	if (dir.indexOf(config.root) == -1)
	{
		console.log('root does not exist, creating');
		fs.mkdirSync(config.root);
	}
	else
	{
		try
		{
			var stat = fs.statSync(config.root);
		}
		catch (e)
		{
			throw new Error('status error with root directory: ' + config.root);
		}

		if (!stat.isDirectory())
		{
			throw new Error('root "' + config.root + '" is not a directory');
		}
	}
	
	if (dir.indexOf(config.trashbin) == -1)
	{
		console.log('trashbin does not exist, creating');
		fs.mkdirSync(config.trashbin);
		fs.writeFileSync(config.trashbin + '/contents.json', '[]');
	}
	else
	{
		try
		{
			var stat = fs.statSync(config.trashbin);
		}
		catch (e)
		{
			throw new Error('status error with trashbin directory: ' + config.trashbin);
		}

		if (!stat.isDirectory())
		{
			throw new Error('trashbin "' + config.trashbin + '" is not a directory');
		}
	}

	return config;
}

var config = getConfig();


if (process.platform == 'win32')
{
	var child_process = require('child_process')

	var info = child_process.execSync('ipconfig', {encoding:'utf8'});
	var lines = info.split('\n');
	
	for (var i = 0; i < lines.length; i++)
	{
		if (lines[i].indexOf('IPv4 Address') != -1)
		{
			console.log(lines[i]);
		}
	}
}



function getFileMeta(name, stat)
{
	var meta =
	{
		'name' : name,
		'type' : stat.isDirectory()? 'directory' : stat.isFile()? 'file' : 'unknown',
		//'birthtime' : stat.birthtime.getTime(),
		'ctime' : stat.ctime.getTime(),
		'mtime' : stat.ctime.getTime(),
		'atime' : stat.atime.getTime(),
		'size' : stat.size,
	};
	return meta;
}


function TrashBin()
{
	var contents = JSON.parse(fs.readFileSync(config.trashbin + '/contents.json', 'utf8'));

	function releaseFile(path)
	{
		fs.unlinkSync(path);
	}

	function releaseDir(path)
	{
		var files = readdirstat(path);

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
			releaseDir(config.trashbin + '/' + item.file + '/');
		}
		else
		{
			releaseFile(config.trashbin + '/' + item.file);
		}
	}
	
	this.saveContents = function ()
	{
		fs.writeFileSync(config.trashbin + '/contents.json', JSON.stringify(contents));
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
			fs.renameSync(config.trashbin + '/' + contents[i].file, contents[i].name);
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
				fs.renameSync(config.trashbin + '/' + file, contents[i].name);
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
		
		var item = getFileMeta(path, stat);

		var newName = (new Date()).getTime().toString();
		var newPath = config.trashbin + '/' + newName;
		fs.renameSync(path, newPath);

		item.file = newName;
		contents.push(item);
		
		this.saveContents();
		
		return newName;
	}
}

var trashbin = new TrashBin();





function readdirstat(path)
{
	var dir = fs.readdirSync(path);
	var dirstat = [];
	for (var i = 0; i < dir.length; i++)
	{
		try
		{
			var stat = fs.statSync(path + dir[i]);
		}
		catch (e)
		{
			var stat = {};
		}
		dirstat.push({ name : dir[i], stat : stat});
	}
	return dirstat;
}

function getIndex(dirstat)
{
	var index = undefined;
	dirstat.some(function (v)
	{
		if (!v.stat.isDirectory() && v.name.search(/^index.htm[l]?$/i) != -1)
		{
			index = v.name; return true;
		}
		return false;
	});
	return index;
}

//debugreq = [];

var server = http.createServer(function (req, res)
{
	console.log(req.url);
	urlObj = url.parse(req.url, true);
	var subpath = decodeURI(urlObj.pathname);
	var filename = '';
	var pathname = config.root + subpath;
	//debugreq.push(req);
	debugreq = req;
	res.setHeader('Access-Control-Allow-Origin', '*');
	if (req.method == 'GET')
	{
		if (urlObj.query['trashbin'] != undefined)
		{
			var jdir = {};
			jdir.path = 'trashbin';
			jdir.file = '';
			jdir.contents = trashbin.getContents();
			res.writeHead(200, {'Content-Type': 'application/json' });
			res.end(JSON.stringify(jdir));
			return;
		}

		try
		{
			var stat = fs.statSync(pathname);
		}
		catch (e)
		{
			res.writeHead(404, {'Content-Type': 'text/plain' });
			res.end('404');
			return;
		}

		var queryReaddir = (urlObj.query['readdir'] != undefined);
		dirstat = undefined;

		if (stat.isDirectory())
		{
			if (subpath[subpath.length-1] != '/')
			{
				subpath += '/';
				//pathname = config.root + subpath;
				res.writeHead(302, {'Location': subpath});
				res.end();
				return;
			}

			dirstat = readdirstat(pathname);

			// if not a readdir request, and we have an index.html use it instead
			if (!queryReaddir)
			{
				var index = getIndex(dirstat);
				if (index)
				{
					subpath += index;
					pathname = config.root + subpath;
					dirstat = undefined;
				}
			}
		}
		else
		{
			// not a directory, remove any mistaken '/'
			if (subpath[subpath.length-1] == '/')
			{
				subpath = subpath.substr(0, subpath.length-1);
				pathname = config.root + subpath;
			}

			// if a readdir request, get the directory of the file
			if (queryReaddir)
			{
				// remove file from path
				var index = subpath.lastIndexOf('/');
				if (index == -1)
				{
					filename = subpath;
					subpath = '/';
				}
				else
				{
					filename = subpath.substr(index+1);
					subpath = subpath.substr(0,index+1);
				}
				pathname = config.root + subpath;
				dirstat = readdirstat(pathname);
			}
		}

		// return the directory content
		if (dirstat)
		{
			var jdir = {};
			jdir.path = subpath;
			jdir.file = filename;
			jdir.contents = [];
			for (var i = 0; i < dirstat.length; i++)
			{
				jdir.contents.push(getFileMeta(dirstat[i].name, dirstat[i].stat));
			}

			res.writeHead(200, {'Content-Type': 'application/json' });
			res.end(JSON.stringify(jdir));
			return;
		}

		// return file content
		//console.log(ext.getExt(pathname));
		//console.log(ext.getContentType(ext.getExt(pathname)));
		
		if (req.headers.range != undefined && req.headers.range.startsWith('bytes='))
		{
			var values = req.headers.range.substr(6).split('-');
			if (values.length == 2 && !isNaN(values[0]) && !isNaN(values[1]) && values[1].length > 0 )
			{
				/*
				var position = parseInt(values[0]);
				var length = parseInt(values[1]) - position + 1;
				var buffer = new Buffer(length);
				var fd = fs.openSync(pathname, 'r');
				fs.readSync(fd, buffer, 0, length, position);
				res.writeHead(200, {'Content-Type': ext.getContentType(ext.getExt(pathname))});
				res.end(buffer);
				*/
				/*
				var start = parseInt(values[0]);
				var end = parseInt(values[1]);
				var rs = fs.createReadStream(pathname, { start : start, end : end });
				res.writeHead(200, {'Content-Type': ext.getContentType(ext.getExt(pathname))});
				res.end(rs);
				*/
				var start = parseInt(values[0]);
				var end = parseInt(values[1]);
				var rs = fs.createReadStream(pathname, { start : start, end : end });
				res.writeHead(200, {'Content-Type': ext.getContentType(ext.getExt(pathname))});
				rs.on('data', function (chunk) {
					if(!res.write(chunk)){
						rs.pause();
					}
				});
				rs.on('end', function () {
					res.end();
				});
				res.on("drain", function () {
					rs.resume();
				});
   				return;
			}
		}

		/*
		var data = fs.readFileSync(pathname);
		res.writeHead(200, {'Content-Type': ext.getContentType(ext.getExt(pathname))});
		res.end(data);
		*/
		var rs = fs.createReadStream(pathname);
		res.writeHead(200, {'Content-Type': ext.getContentType(ext.getExt(pathname))});
		rs.on('data', function (chunk) {
			if(!res.write(chunk)){
				rs.pause();
			}
		});
		rs.on('end', function () {
			res.end();
		});
		res.on("drain", function () {
			rs.resume();
		});
		return;
	}
	else if (req.method == 'DELETE')
	{
		if (urlObj.query['garbagecollect'] != undefined)
		{
			console.log('trashbin.releaseAll');
			trashbin.releaseAll();
			res.writeHead(200, {'Content-Type': 'text/plain' });
			res.end('garbage collected trashbin');
			return;
		}
		if (urlObj.query['release'] != undefined)
		{
			var file = pathname.substr(pathname.lastIndexOf('/') + 1);
			console.log('trashbin.release ' + file);
			trashbin.release(file);
			res.writeHead(200, {'Content-Type': 'text/plain' });
			res.end('removed ' + file + ' from trashbin');
			return;
		}
		console.log('trashbin.add ' + pathname);
		var file = trashbin.add(pathname);
		res.writeHead(200, {'Content-Type': 'text/plain' });
		res.end(file);
		return;
	}
	else if (req.method == 'PUT')
	{
		if (urlObj.query['recover'] != undefined)
		{
			var file = pathname.substr(pathname.lastIndexOf('/') + 1);
			console.log('trashbin.recover ' + file);
			trashbin.recover(file);
			res.writeHead(200, {'Content-Type': 'text/plain' });
			res.end('removed ' + file + ' from trashbin');
			return;
		}
		if (urlObj.query['mkdir'] != undefined)
		{
			try
			{
				fs.mkdirSync(pathname);
				res.writeHead(201, {'Content-Type': 'text/plain' });
				res.end(pathname);
			}
			catch (e)
			{
				if (e.code == 'EEXIST')
				{
					res.writeHead(409, {'Content-Type': 'text/plain' });
					res.end(e.message);
					return;
				}
				res.writeHead(400, {'Content-Type': 'text/plain' });
				res.end(e.message);
			}
			return;
		}
		try
		{
			console.log('openSync ' + pathname);
			fd = fs.openSync(pathname, 'w');
			console.log('creatingWriteStream');
			writable = fs.createWriteStream(pathname, {fd: fd});
			console.log('piping');
			req.pipe(writable);
			writable.on('error', function (e) {
				console.log('writable.error');
				//console.log(e);
				//console.log('sending error');
				res.writeHead(400, {'Content-Type': 'text/plain' });
				res.end(e.message);
				//console.log('unpiping');
				req.unpipe(writable);
			});
			writable.on('finish', function (e) {
				console.log('writable.finish');
			});
			req.on('end', function () {
				console.log('req.end');
				res.writeHead(201, {'Content-Type': 'text/plain' });
				res.end("file written");
			});
			req.on('close', function () {
				console.log('req.close');
			});
			req.on('error', function (e) {
				console.log('req.error');
				res.writeHead(400, {'Content-Type': 'text/plain' });
				res.end(e.message);
			});
			//res.writeHead(200, {'Content-Type': 'text/plain' });
			//res.end("file write request accepted");
			console.log('done');
		}
		catch (e)
		{
			console.log(e);
			res.writeHead(400, {'Content-Type': 'text/plain' });
			res.end(e.message);
		}
		return;
	}
	res.writeHead(400, {'Content-Type': 'text/plain' });
	res.end("Unknown or unsupported request");
});
server.listen(config.port);

