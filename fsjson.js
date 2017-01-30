
var fs = require('fs');
var stdhttp = require('./stdhttp');

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

function respondDir(response, subpath, filename, dirstat)
{
	var jdir = {};
	jdir.path = subpath;
	jdir.file = filename;
	jdir.contents = [];
	for (var i = 0; i < dirstat.length; i++)
	{
		jdir.contents.push(getFileMeta(dirstat[i].name, dirstat[i].stat));
	}

	response.writeHead(200, {'Content-Type': 'application/json' });
	response.end(JSON.stringify(jdir));
}

function respondMkdir(response, pathname)
{
	try
	{
		fs.mkdirSync(pathname);
		response.writeHead(201, {'Content-Type': 'text/plain' });
		response.end(pathname);
	}
	catch (e)
	{
		if (e.code == 'EEXIST')
		{
			stdhttp.respondConflict(response, e.message);
			return;
		}
		stdhttp.respondBadRequest(response, e.message);
	}
}

module.exports.readdirstat = readdirstat;
module.exports.getIndex = getIndex;
module.exports.getFileMeta = getFileMeta;
module.exports.respondDir = respondDir;
module.exports.respondMkdir = respondMkdir;

