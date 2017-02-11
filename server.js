
var http = require('http');
var url = require('url');
var fs = require('fs');

var stdhttp = require('./stdhttp');
var fsjson = require('./fsjson');
var TrashBin = require('./trashbin');

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




var trashbin = new TrashBin(config.trashbin);







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
			trashbin.respondView(res);
			return;
		}

		try
		{
			var stat = fs.statSync(pathname);
		}
		catch (e)
		{
			stdhttp.respondNotFound(res);
			return;
		}

		var queryReaddir = (urlObj.query['readdir'] != undefined);
		console.log('queryReaddir ', queryReaddir);
		dirstat = undefined;

		if (stat.isDirectory())
		{
			if (subpath[subpath.length-1] != '/')
			{
				subpath += '/';
				pathname += '/';
				//pathname = config.root + subpath;
				if (!queryReaddir)
				{
					stdhttp.respondRedirect(res, subpath);
					return;
				}
			}

			dirstat = fsjson.readdirstat(pathname);

			// if not a readdir request, and we have an index.html use it instead
			if (!queryReaddir)
			{
				var index = fsjson.getIndex(dirstat);
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
				dirstat = fsjson.readdirstat(pathname);
			}
		}

		// return the directory content
		if (dirstat)
		{
			if (queryReaddir)
			{
			fsjson.respondDir(res, subpath, filename, dirstat);
			}
			else
			{
				stdhttp.respondDir(res, subpath, dirstat);
			}
			return;
		}

		// return file content
		var start = undefined;
		var end = undefined;
		if (req.headers.range != undefined && req.headers.range.startsWith('bytes='))
		{
			var values = req.headers.range.substr(6).split('-');
			if (values.length == 2 && !isNaN(values[0]) && !isNaN(values[1]) && values[1].length > 0 )
			{
				start = parseInt(values[0]);
				end = parseInt(values[1]);
			}
		}
		stdhttp.handleFileLoad(res, pathname, stat, start, end);
		return;
	}
	else if (req.method == 'DELETE')
	{
		if (urlObj.query['garbagecollect'] != undefined)
		{
			trashbin.respondClean(res);
			return;
		}
		if (urlObj.query['release'] != undefined)
		{
			trashbin.respondRelease(res, pathname);
			return;
		}
		trashbin.respondAdd(res, pathname);
		return;
	}
	else if (req.method == 'PUT')
	{
		if (urlObj.query['recover'] != undefined)
		{
			trashbin.respondRecover(res, pathname);
			return;
		}
		if (urlObj.query['mkdir'] != undefined)
		{
			fsjson.respondMkdir(res, pathname);
			return;
		}
		stdhttp.handleFileSave(req, res, pathname);
		return;
	}
	respondBadRequest(response, "Unknown or unsupported request");
});
server.listen(config.port);

