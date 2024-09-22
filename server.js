const http = require("http");
const fs = require("fs");
const PORT = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
	url = request.url == "/" ? "/doom.html" : request.url;
	fs.readFile("./" + url,  (err, data) => {
		if (err) {
			console.error('There was an error reading the file!', err);
			return;
		}

		let contentType = "text/html";
		const splitedUrl = url.split(".");
		if (splitedUrl[splitedUrl.length - 1] == "js") {
			contentType = "text/javascript";	
		}
		else if (splitedUrl[splitedUrl.length - 1] == "mjs") {
			contentType = "text/javascript";	
		}

		response.writeHead(200, {"Content-Type": contentType});
		response.write(data);

		return response.end();
	});
});

server.listen(PORT);
