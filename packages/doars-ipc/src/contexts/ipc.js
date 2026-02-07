export default ({ ipcContextName, ipcInstance }) => ({
	name: ipcContextName,

	create: () => ({
		value: ipcInstance,
	}),
});
