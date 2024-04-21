const processDict = [];

const getExecutingProcessIndex = (id) =>
	processDict.findIndex(({ jobID }) => jobID === id);

const addExecutingProcess = ({ jobID, executeCode, timer, removeFile }) =>
	processDict.push({ jobID, executeCode, timer, removeFile }) - 1;

const removeProcess = (id) =>
	processDict.splice(getExecutingProcessIndex(id), 1);

const changeTimer = (index, timer) => {
	try {
		processDict[index].timer = timer;
	} catch (err) {
		console.log(err);
	}
};

const getExecutingProcessByIndex = (i) => processDict[i];

module.exports = {
	getExecutingProcessIndex,
	addExecutingProcess,
	removeProcess,
	changeTimer,
	getExecutingProcessByIndex,
};
