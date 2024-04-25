const { runCode } = require("./run-code");
const { supportedLanguages } = require("./run-code/instructions");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 8000;
const cors = require("cors");
const { info } = require("./run-code/info");
const socketIO = require("socket.io");
const { runCodeViaSocket } = require("./run-code/use-socket");

const corsOptions = {
	origin: "*",
};

app.use(cors(corsOptions));

const server = require("node:http").createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const io = socketIO(server, corsOptions);

io.on("connection", (socket) => {
	console.log("a user connected");
	socket.on("code", async ({ code, language, input = "" }) => {
		try {
			console.log("code received");
			await runCodeViaSocket(socket, { code, language, input });
		} catch (err) {
			console.log(err);
			const timeStamp = Date.now();

			socket.emit("error", {
				timeStamp,
				status: err?.status || 500,
				...err,
			});
			socket.disconnect();
		}
	});
});

const sendResponse = (res, statusCode, body) => {
	const timeStamp = Date.now();

	res.status(statusCode).send({
		timeStamp,
		status: statusCode,
		...body,
	});
};

app.post("/", async (req, res) => {
	try {
		const output = await runCode(req.body);
		sendResponse(res, 200, output);
	} catch (err) {
		sendResponse(res, err?.status || 500, err);
	}
});

app.get("/list", async (req, res) => {
	const body = [];

	for (const language of supportedLanguages) {
		body.push({
			language,
			info: await info(language),
		});
	}

	sendResponse(res, 200, { supportedLanguages: body });
});

server.listen(port);
