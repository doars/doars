let doars = null,
	buttons = null;

window.benchmark = {
	setup: async ({ complexity, rootNode }) => {
		const todos = [];
		for (let i = 0; i < complexity * 100; i++) {
			todos.push({
				text: `todo ${i}`,
				id: i,
				completed: false,
			});
		}

		doars = new window.Doars({
			root: rootNode,
		});

		rootNode.setAttribute(
			"d-state",
			JSON.stringify({
				todos,
			}),
		);
		rootNode.innerHTML = `
      <ul>
        <template d-for="todo in todos">
          <li d-attribute:class="todo.completed ? 'completed' : ''">
            <span d-text="todo.text + ' (' + (todo.completed ? 'completed' : 'pending') + ')'"></span>
            <button d-on:click.capture="todo.completed = !todo.completed"></button>
          </li>
        </template>
      </ul>
		`;

		await doars.enable();

		buttons = Array.from(rootNode.querySelectorAll("button"));

		// if (buttons.length) {
		// 	console.log(buttons.length);
		// 	console.log(buttons[1].parentNode.outerHTML);
		// 	console.log(buttons[buttons.length - 1].parentNode.outerHTML);
		// }
	},

	run: async () => {
		const event = new CustomEvent("click");
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].dispatchEvent(event);
		}
		await doars.update();

		// if (buttons.length) {
		// 	console.log(buttons[1].parentNode.outerHTML);
		// 	console.log(buttons[buttons.length - 1].parentNode.outerHTML);
		// }
	},

	cleanup: async ({ rootNode }) => {
		doars.disable();
		doars = null;

		rootNode.innerHTML = "";
	},
};
