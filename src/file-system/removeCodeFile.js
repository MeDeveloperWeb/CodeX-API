const { unlinkSync } = require("fs"),
	{ join } = require("path");

const removeCodeFile = async (uuid, lang, outputExt) => {
	try {
		const codeFile = join(process.cwd(), `codes/${uuid}.${lang}`),
			outputFile = join(process.cwd(), `outputs/${uuid}.${outputExt}`);

		await unlinkSync(codeFile);

		if (outputExt) await unlinkSync(outputFile);
	} catch (err) {
		console.log(err);
	}
};

module.exports = {
	removeCodeFile,
};
