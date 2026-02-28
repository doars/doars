let buttons = null;

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

		rootNode.setAttribute(
			"x-data",
			JSON.stringify({
				todos,
			}),
		);
		rootNode.innerHTML = `
      <ul>
        <template x-for="todo in todos" :key="todo.id">
          <li :class="todo.completed ? 'completed' : ''">
            <span x-text="todo.text + ' (' + (todo.completed ? 'completed' : 'pending') + ')'"></span>
            <button @click="todo.completed = !todo.completed"></button>
          </li>
        </template>
      </ul>
		`;

		window.alpine.start();

		buttons = Array.from(rootNode.querySelectorAll("button"));
	},

	run: async () => {
		const event = new CustomEvent("click");
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].dispatchEvent(event);
		}
		await Promise.resolve();
	},

	cleanup: async ({ rootNode }) => {
		rootNode.innerHTML = "";
	},
};
