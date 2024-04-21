const { commandMap, supportedLanguages } = require("./instructions");
const { createCodeFile } = require("../file-system/createCodeFile");
const { removeCodeFile } = require("../file-system/removeCodeFile");
const { info } = require("./info");

const { spawn } = require("child_process");

const { addExecutingProcess, removeProcess } = require("./processDict");

const eventHandler = require("./eventHandler");

async function runCode({ language = "", code = "", input = "" }) {
	const timeout = 120;

	if (code === "")
		throw {
			status: 400,
			error: "No Code found to execute.",
		};

	if (!supportedLanguages.includes(language))
		throw {
			status: 400,
			error: `Please enter a valid language.`,
		};

	const { jobID } = await createCodeFile(language, code);
	const {
		compileCodeCommand,
		compilationArgs,
		executeCodeCommand,
		executionArgs,
		outputExt,
	} = commandMap(jobID, language);

	if (compileCodeCommand) {
		await new Promise((resolve, reject) => {
			const compileCode = spawn(
				compileCodeCommand,
				compilationArgs || []
			);
			compileCode.stderr.on("data", (error) => {
				reject({
					status: 200,
					output: "",
					error: error.toString(),
					language,
				});
			});
			compileCode.on("exit", () => {
				resolve();
			});
		});
	}
	const removeFile = async () => {
		await removeCodeFile(jobID, language, outputExt);
		removeProcess(jobID);
	};

	const executeCodeAsync = async () => {
		const executeCode = spawn(executeCodeCommand, executionArgs || []);

		const timer = setTimeout(async () => {
			executable.kill("SIGHUP");
			console.log("this");
			await removeCodeFile(jobID, language, outputExt);
			console.log("this");
			reject({
				status: 408,
				error: `CodeX API Timed Out. Your code took too long to execute, over ${timeout} seconds. Make sure you are sending input as payload if your code expects an input.`,
			});
		}, timeout * 1000);

		const processIndex = addExecutingProcess({
			jobID,
			executeCode,
			timer,
			removeFile,
		});

		return await eventHandler(processIndex, input, removeFile);
	};

	const result = await new Promise((resolve, reject) => {
		executeCodeAsync()
			.then((output) => {
				resolve(output);
			})
			.catch(reject);
	});

	if (result.complete) removeFile();

	return {
		...result,
		language,
		jobID,
		info: await info(language),
	};
}

module.exports = { runCode };
