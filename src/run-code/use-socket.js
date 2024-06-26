const {commandMap, supportedLanguages} = require("./instructions")
const {createCodeFile} = require("../file-system/createCodeFile")
const {removeCodeFile} = require("../file-system/removeCodeFile")
const {info} = require("./info")

const {spawn} = require("child_process");

async function runCodeViaSocket(socket, {language = "", code = "", input = ""}) {
	if (!socket) {
		throw {
            status: 500,
            error: "Could not establish a socket connection."
        }
	}

    const timeout = 120;

    if (code === "")
        throw {
            status: 400,
            error: "No Code found to execute."
        }

    if (!supportedLanguages.includes(language))
        throw {
            status: 400,
            error: `Please enter a valid language. Check documentation for more details: https://github.com/Jaagrav/CodeX-API#readme. The languages currently supported are: ${supportedLanguages.join(', ')}.`
        }

    const {jobID} = await createCodeFile(language, code);
    const {compileCodeCommand, compilationArgs, executeCodeCommand, executionArgs, outputExt} = commandMap(jobID, language);

    if (compileCodeCommand) {
        await new Promise((resolve, reject) => {
            const compileCode = spawn(compileCodeCommand, compilationArgs || [])
            compileCode.stderr.on('data', (error) => {
                reject({
                    status: 200,
                    output: '',
                    error: error.toString(),
                    language
                })
            });
            compileCode.on('exit', () => {
                resolve()
            })
        })
    }

    const result = await new Promise((resolve, reject) => {
        const executeCode = spawn(executeCodeCommand, executionArgs || []);
        let output = "", error = "";

        const timer = setTimeout(async () => {
            executeCode.kill("SIGHUP");

            await removeCodeFile(jobID, language, outputExt);

            reject({
                status: 408,
                error: `CodeX API Timed Out. Your code took too long to execute, over ${timeout} seconds. Make sure you are sending input as payload if your code expects an input.`
            })
        }, timeout * 1000);

        if (input !== "") {
            input.split('\n').forEach((line) => {
                executeCode.stdin.write(`${line}\n`);
            });
			// Not ending stream to allow incoming data
            // executeCode.stdin.end();
        }

		// Allow more data through socket emit
		socket.on("input", (input) => {
			executeCode.stdin.write(`${input}\n`)
		})

        executeCode.stdin.on('error', (err) => {
			
            console.log('stdin err', err);
        });

        executeCode.stdout.on('data', (data) => {
            output += data.toString();
			socket.emit('output', {
				output: data.toString(),
				executionStatus: true
			})
        });

        executeCode.stderr.on('data', (data) => {
            error += data.toString();
			socket.emit('error', {
				error: data.toString(),
				executionStatus: true
			})
        });

        executeCode.on('exit', (err) => {
            clearTimeout(timer);
			socket.emit('exit', {
				output,
				error,
				executionStatus: false
			})
            resolve({output, error});
        });
    })

    await removeCodeFile(jobID, language, outputExt);

    return {
        ...result,
        language,
        info: await info(language)
    }
}

module.exports = {runCodeViaSocket}