import { KeyboardObserver } from "../../KeyboardObserver.mjs";

export class KeyboardObserverMock extends KeyboardObserver {
	constructor() {
		super();
	}

	#listeners = {};

	addEventListener(type, listener) {
		if (this.#listeners[type] === undefined) {
			this.#listeners[type] = [listener];
		}
		else if (this.#listeners[type].findIndex(listener) == -1) {
			this.#listeners[type].push(listener);
		}
	}

	removeEventListener(type, listener) {
		if (this.#listeners[type] === undefined) {
			return;
			//throw error;
		}
		const listenerIdx = this.#listeners[type]
			.findIndex((value) => Object.is(listener, value));
		if (listenerIdx != -1) {
			this.#listeners[type] = this.#listeners[type]
				.filter((value) => !Object.is(listener, value));
		}
	}

	dispatchEvent(type, args) {
		args["type"] = type;
		const listeners = this.#listeners[type];
		if (listeners !== undefined) {
			listeners.forEach((listener) => { listener(args); });
		}
	}
}
