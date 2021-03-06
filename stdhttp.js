
var fs = require('fs');

var extTypes = { 
	"3gp"   : "video/3gpp"
	, "a"     : "application/octet-stream"
	, "ai"    : "application/postscript"
	, "aif"   : "audio/x-aiff"
	, "aiff"  : "audio/x-aiff"
	, "asc"   : "application/pgp-signature"
	, "asf"   : "video/x-ms-asf"
	, "asm"   : "text/x-asm"
	, "asx"   : "video/x-ms-asf"
	, "atom"  : "application/atom+xml"
	, "au"    : "audio/basic"
	, "avi"   : "video/x-msvideo"
	, "bat"   : "application/x-msdownload"
	, "bin"   : "application/octet-stream"
	, "bmp"   : "image/bmp"
	, "bz2"   : "application/x-bzip2"
	, "c"     : "text/x-c"
	, "cab"   : "application/vnd.ms-cab-compressed"
	, "cc"    : "text/x-c"
	, "chm"   : "application/vnd.ms-htmlhelp"
	, "class"   : "application/octet-stream"
	, "com"   : "application/x-msdownload"
	, "conf"  : "text/plain"
	, "cpp"   : "text/x-c"
	, "crt"   : "application/x-x509-ca-cert"
	, "css"   : "text/css"
	, "csv"   : "text/csv"
	, "cxx"   : "text/x-c"
	, "deb"   : "application/x-debian-package"
	, "der"   : "application/x-x509-ca-cert"
	, "diff"  : "text/x-diff"
	, "djv"   : "image/vnd.djvu"
	, "djvu"  : "image/vnd.djvu"
	, "dll"   : "application/x-msdownload"
	, "dmg"   : "application/octet-stream"
	, "doc"   : "application/msword"
	, "dot"   : "application/msword"
	, "dtd"   : "application/xml-dtd"
	, "dvi"   : "application/x-dvi"
	, "ear"   : "application/java-archive"
	, "eml"   : "message/rfc822"
	, "eps"   : "application/postscript"
	, "exe"   : "application/x-msdownload"
	, "f"     : "text/x-fortran"
	, "f77"   : "text/x-fortran"
	, "f90"   : "text/x-fortran"
	, "flv"   : "video/x-flv"
	, "for"   : "text/x-fortran"
	, "gem"   : "application/octet-stream"
	, "gemspec" : "text/x-script.ruby"
	, "gif"   : "image/gif"
	, "gz"    : "application/x-gzip"
	, "h"     : "text/x-c"
	, "hh"    : "text/x-c"
	, "htm"   : "text/html"
	, "html"  : "text/html"
	, "ico"   : "image/vnd.microsoft.icon"
	, "ics"   : "text/calendar"
	, "ifb"   : "text/calendar"
	, "iso"   : "application/octet-stream"
	, "jar"   : "application/java-archive"
	, "java"  : "text/x-java-source"
	, "jnlp"  : "application/x-java-jnlp-file"
	, "jpeg"  : "image/jpeg"
	, "jpg"   : "image/jpeg"
	, "js"    : "application/javascript"
	, "json"  : "application/json"
	, "log"   : "text/plain"
	, "m3u"   : "audio/x-mpegurl"
	, "m4v"   : "video/mp4"
	, "man"   : "text/troff"
	, "mathml"  : "application/mathml+xml"
	, "mbox"  : "application/mbox"
	, "mdoc"  : "text/troff"
	, "me"    : "text/troff"
	, "mid"   : "audio/midi"
	, "midi"  : "audio/midi"
	, "mime"  : "message/rfc822"
	, "mml"   : "application/mathml+xml"
	, "mng"   : "video/x-mng"
	, "mov"   : "video/quicktime"
	, "mp3"   : "audio/mpeg"
	, "mp4"   : "video/mp4"
	, "mp4v"  : "video/mp4"
	, "mpeg"  : "video/mpeg"
	, "mpg"   : "video/mpeg"
	, "ms"    : "text/troff"
	, "msi"   : "application/x-msdownload"
	, "odp"   : "application/vnd.oasis.opendocument.presentation"
	, "ods"   : "application/vnd.oasis.opendocument.spreadsheet"
	, "odt"   : "application/vnd.oasis.opendocument.text"
	, "ogg"   : "application/ogg"
	, "p"     : "text/x-pascal"
	, "pas"   : "text/x-pascal"
	, "pbm"   : "image/x-portable-bitmap"
	, "pdf"   : "application/pdf"
	, "pem"   : "application/x-x509-ca-cert"
	, "pgm"   : "image/x-portable-graymap"
	, "pgp"   : "application/pgp-encrypted"
	, "pkg"   : "application/octet-stream"
	, "pl"    : "text/x-script.perl"
	, "pm"    : "text/x-script.perl-module"
	, "png"   : "image/png"
	, "pnm"   : "image/x-portable-anymap"
	, "ppm"   : "image/x-portable-pixmap"
	, "pps"   : "application/vnd.ms-powerpoint"
	, "ppt"   : "application/vnd.ms-powerpoint"
	, "ps"    : "application/postscript"
	, "psd"   : "image/vnd.adobe.photoshop"
	, "py"    : "text/x-script.python"
	, "qt"    : "video/quicktime"
	, "ra"    : "audio/x-pn-realaudio"
	, "rake"  : "text/x-script.ruby"
	, "ram"   : "audio/x-pn-realaudio"
	, "rar"   : "application/x-rar-compressed"
	, "rb"    : "text/x-script.ruby"
	, "rdf"   : "application/rdf+xml"
	, "roff"  : "text/troff"
	, "rpm"   : "application/x-redhat-package-manager"
	, "rss"   : "application/rss+xml"
	, "rtf"   : "application/rtf"
	, "ru"    : "text/x-script.ruby"
	, "s"     : "text/x-asm"
	, "sgm"   : "text/sgml"
	, "sgml"  : "text/sgml"
	, "sh"    : "application/x-sh"
	, "sig"   : "application/pgp-signature"
	, "snd"   : "audio/basic"
	, "so"    : "application/octet-stream"
	, "svg"   : "image/svg+xml"
	, "svgz"  : "image/svg+xml"
	, "swf"   : "application/x-shockwave-flash"
	, "t"     : "text/troff"
	, "tar"   : "application/x-tar"
	, "tbz"   : "application/x-bzip-compressed-tar"
	, "tcl"   : "application/x-tcl"
	, "tex"   : "application/x-tex"
	, "texi"  : "application/x-texinfo"
	, "texinfo" : "application/x-texinfo"
	, "text"  : "text/plain"
	, "tif"   : "image/tiff"
	, "tiff"  : "image/tiff"
	, "torrent" : "application/x-bittorrent"
	, "tr"    : "text/troff"
	, "txt"   : "text/plain"
	, "vcf"   : "text/x-vcard"
	, "vcs"   : "text/x-vcalendar"
	, "vrml"  : "model/vrml"
	, "war"   : "application/java-archive"
	, "wav"   : "audio/x-wav"
	, "wma"   : "audio/x-ms-wma"
	, "wmv"   : "video/x-ms-wmv"
	, "wmx"   : "video/x-ms-wmx"
	, "woff"  : "application/font-woff"
	, "wrl"   : "model/vrml"
	, "wsdl"  : "application/wsdl+xml"
	, "xbm"   : "image/x-xbitmap"
	, "xhtml" : "application/xhtml+xml"
	, "xls"   : "application/vnd.ms-excel"
	, "xml"   : "application/xml"
	, "xpm"   : "image/x-xpixmap"
	, "xsl"   : "application/xml"
	, "xslt"  : "application/xslt+xml"
	, "yaml"  : "text/yaml"
	, "yml"   : "text/yaml"
	, "zip"   : "application/zip"
}


function getExt(path)
{
	var i = path.lastIndexOf('.');
	return (i < 0) ? '' : path.substr(i+1);
}

function getContentType(ext)
{
	return extTypes[ext.toLowerCase()] || 'application/octet-stream';
}


function respondRedirect(response, path)
{
	response.writeHead(302, {'Location': path});
	response.end();
}

function respondBadRequest(response, message)
{
	response.writeHead(400, {'Content-Type': 'text/plain' });
	response.end(message);
}

function respondNotFound(response)
{
	response.writeHead(404, {'Content-Type': 'text/plain' });
	response.end('404');
}

function respondConflict(response, message)
{
	response.writeHead(409, {'Content-Type': 'text/plain' });
	response.end(message);
}

function respondDir(response, subpath, dirstat)
{
	var page = "<html><body>" + subpath + '<br>';
	for (var i = 0; i < dirstat.length; i++)
	{
		var name = dirstat[i].name;
		page += '<a href="' + name + '">' + name + '</a><br>';
	}
	page += '</body></html>'

	response.writeHead(200, {'Content-Type': 'text/html' });
	response.end(page);
}

function handleFileLoad(response, pathname, stat, start, end)
{
	//console.log(ext.getExt(pathname));
	//console.log(ext.getContentType(ext.getExt(pathname)));
	var headers = {
		'Content-Type': getContentType(getExt(pathname))
	};
	if (stat)
	{
		headers['Content-Length'] = stat.size;
		if (start && end)
		{
			headers['Content-Range'] = start + '-' + end + '/' + stat.size;
		}
	}
	var rs = fs.createReadStream(pathname, { start : start, end : end });
	response.writeHead(200, headers);
	rs.on('data', function (chunk) {
		if(!response.write(chunk)){
			rs.pause();
		}
	});
	rs.on('end', function () {
		response.end();
	});
	response.on("drain", function () {
		rs.resume();
	});
}

function handleFileSave(request, response, pathname)
{
	try
	{
		console.log('openSync ' + pathname);
		var fd = fs.openSync(pathname, 'w');
		console.log('creatingWriteStream');
		var writable = fs.createWriteStream(pathname, {fd: fd});
		console.log('piping');
		request.pipe(writable);
		writable.on('error', function (e) {
			console.log('writable.error');
			//console.log(e);
			//console.log('sending error');
			respondBadRequest(response, e.message);
			//console.log('unpiping');
			request.unpipe(writable);
		});
		writable.on('finish', function (e) {
			console.log('writable.finish');
		});
		request.on('end', function () {
			console.log('req.end');
			response.writeHead(201, {'Content-Type': 'text/plain' });
			response.end("file written");
		});
		request.on('close', function () {
			console.log('req.close');
		});
		request.on('error', function (e) {
			console.log('req.error');
			respondBadRequest(response, e.message);
		});
		//response.writeHead(200, {'Content-Type': 'text/plain' });
		//response.end("file write request accepted");
		console.log('done');
	}
	catch (e)
	{
		console.log(e);
		respondBadRequest(response, e.message);
	}
}

module.exports.getExt = getExt;
module.exports.getContentType = getContentType;
module.exports.respondRedirect = respondRedirect;
module.exports.respondBadRequest = respondBadRequest;
module.exports.respondNotFound = respondNotFound;
module.exports.respondConflict = respondConflict;
module.exports.respondDir = respondDir;
module.exports.handleFileLoad = handleFileLoad;
module.exports.handleFileSave = handleFileSave;

