const CHARACTER_SET =
	"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";

export const createIdFactory = (characterSet = CHARACTER_SET) => {
	const characterDepth = characterSet.length;

	let index = 0;
	return () => {
		let identifierIndex = index;
		index++;

		let identifier = "";
		do {
			identifier = characterSet[identifierIndex % characterDepth] + identifier;
			identifierIndex = Math.floor(identifierIndex / characterDepth);
		} while (identifierIndex > 0);
		return identifier;
	};
};

export default {
	createIdFactory,
};
