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
			processor: "interpret",
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

		doars.enable();

		buttons = Array.from(rootNode.querySelectorAll("button"));
	},

	run: async () => {
		const event = new CustomEvent("click");
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].dispatchEvent(event);
		}
		await doars.update();
	},

	cleanup: async ({ rootNode }) => {
		doars.disable();
		doars = null;

		rootNode.innerHTML = "";
	},
};
