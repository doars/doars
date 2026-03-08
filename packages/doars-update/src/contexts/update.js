export default ({ updateContextName }, updater) => {
	const id = updater.getId();
	const proxy = updater.getProxy();
	const time = updater.getTime();

	return {
		global: true,

		name: updateContextName,

		create: (component, _attribute, options) => {
			const library = component.getLibrary();

			let destroy;
			if (!options || options.accessed) {
				// Create access handler.
				const onGet = (_target, path) => {
					library.accessed(`${id}:${path.join(".")}`);
				};
				proxy.addEventListener("get", onGet);

				// Remove event listeners.
				destroy = () => {
					proxy.removeEventListener("get", onGet);
				};
			}

			return {
				value: time,

				destroy,
			};
		},
	};
};
