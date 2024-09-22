import { KeyboardObserver } from "../../KeyboardObserver.mjs";

export class DocumentToKeyboardAdapter extends KeyboardObserver {
	/**
	 * @param {Document} doc
	 */
	constructor(doc) {
		super();
		this.#document = doc;
	}

	/**
	 * param {Document} #document
	 */
	#document;

	/**
	 * @description Add listener.
	 * @param {String} type Observable event.
	 * @param {Function} listener Event listener.
	 */
	addEventListener(type, listener) {
		this.#document.addEventListener(type, listener);
	}

	/**
	 * @description Remove listener.
	 * @param {String} type Observable event.
	 * @param {Function} listener Event listener.
	 */
	removeEventListener(type, listener) {
		this.#document.removeEventListener(type, listener);
	}

}
