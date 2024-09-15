import { KeyboardObserver } from "./KeyboardObserver.mjs";

export class InputController {
	/**
	 * @param {KeyboardObserver} keyboardEventProvider
	 * @returns {InputController}
	 */
	constructor(keyboardEventProvider) {
		this.#keyboardEventProvider = keyboardEventProvider;
		this.boundedHandler = this.#controlKeyHandler.bind(this);
	}

	/**
	 * @description Setup keyboard events.
	 */
	setControllerListener() {
		this.#keyboardEventProvider
			.addEventListener("keydown", this.boundedHandler);
		this.#keyboardEventProvider
			.addEventListener("keyup", this.boundedHandler);
	}

	/**
	 * @description Remove keyboard events.
	 */
	unsetControllerListener() {
		this.#keyboardEventProvider
			.removeEventListener("keydown", this.boundedHandler);
		this.#keyboardEventProvider
			.removeEventListener("keyup", this.boundedHandler);
		this.#clearKeymap();
	}

	/**
	 * @param {KeyboardObserver} #keyboardEventProvider
	 */
	#keyboardEventProvider;

	/**
	 * @param {Object} #keymap
	 */
	#keymap = {
		"KeyW": false,
		"KeyA": false,
		"KeyS": false,
		"KeyD": false,
		"Enter": false
	}

	/**
	 * @param {Object} #actions
	 */
	#actions = {
		"move_up": ["KeyW"],
		"move_down": ["KeyS"],
		"move_left": ["KeyA"],
		"move_right": ["KeyD"]
	}

	/**
	 * @description Handler to for keyboard events.
	 * @param {Object} event
	 */
	#controlKeyHandler(event) {
		if (this.#keymap[event.code] !== "underfined") {
			this.#keymap[event.code] = event.type === "keydown";
		}
	}

	/**
	 * @description Check action key is active.
	 * @param {String} action
	 * @returns {Boolean} Check is action key pressed.
	 */
	checkAction(action) {
		if (this.#actions[action] === undefined) {
			return false;
		}
		else {
			return this.#actions[action].some(
				(keycode) => this.#keymap[keycode]);
		}
	}

	/**
	 * @description Add collection of keycodes to handling.
	 * @param {Array} keycodes Collection of keycodes that must be handled.
	 */
	#addKeyHandler(keycodes) {
		keycodes.forEach((keycode) => { this.#keymap[keycode] = false; });
	}

	/**
	 * @description Add keys to action.
	 * @param {String} action
	 * @param {Array} keycodes Collection of keycodes for binding with action.
	 */
	addKeyToActionMapper(action, keycodes) {
		this.#addKeyHandler(keycodes);
		if (this.#actions[action] !== undefined) {
			const actionKeys = this.#actions[action];
			keycodes.forEach((keycode) => {
				if (actionKeys.every((actionKeycode) => 
					{ actionKeycode != keycode; }))
				{
					actionKeys.push(keycode);
				}
			});
			
		}
		else {
			this.#actions[action] = keycodes;
		}
	}

	/**
	 * @description Set all key to false.
	 */
	#clearKeymap() {
		for (let key in this.#keymap) {
			this.#keymap[key] = false;
		}
	}
}
