const { changeTimer, getExecutingProcessByIndex } = require("./processDict");

async function eventHandler(processIndex, input) {
	const { executeCode, timer, removeFile, jobID } =
		getExecutingProcessByIndex(processIndex);

	return await new Promise((resolve, reject) => {
		const timeout = 120;
		let output = "",
			error = "";

		if (input !== "") {
			input.split("\n").forEach((line) => {
				executeCode.stdin.write(`${line}\n`);
			});
		}

		let dataLogSendTimeout;

		executeCode.stdin.on("error", (err) => {
			console.log("stdin err", err);
		});

		executeCode.stdout.on("data", (data) => {
			output += data.toString();
			if (dataLogSendTimeout) clearTimeout(dataLogSendTimeout);
			dataLogSendTimeout = setTimeout(() => {
				clearTimeout(timer);
				const newTimer = setTimeout(async () => {
					executeCode.kill("SIGHUP");
					console.log("this");
					await removeFile();
					console.log("this");
					reject({
						status: 408,
						error: `CodeX API Timed Out. Your code took too long to execute, over ${timeout} seconds. Make sure you are sending input as payload if your code expects an input.`,
					});
				}, timeout * 1000);
				changeTimer(processIndex, newTimer);
				resolve({ output, error, complete: false });
			}, 1000);
		});

		executeCode.stderr.on("data", (data) => {
			error += data.toString();
		});

		executeCode.on("exit", (err) => {
			clearTimeout(timer);
			if (dataLogSendTimeout) clearTimeout(dataLogSendTimeout);
			resolve({ output, error, complete: true });
		});
	});
}

module.exports = eventHandler;
