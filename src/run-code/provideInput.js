const eventHandler = require("./eventHandler");
const { getExecutingProcessIndex } = require("./processDict");

async function provideInput(jobId, input) {
	const processIndex = getExecutingProcessIndex(jobId);
	return await eventHandler(processIndex, input);
}

module.exports = provideInput;
