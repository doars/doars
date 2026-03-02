export default ({ updateContextName }, updater) => {
	const id = updater.getId();
	const proxy = updater.getProxy();
	const time = updater.getTime();

	return {
		name: updateContextName,

		create: (_component, attribute, _update, options) => {
			let destroy = null;
			if (!options || options.accessed) {
				// Create access handler.
				const onGet = (_target, path) => {
					attribute.accessed(id, path.join("."));
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
