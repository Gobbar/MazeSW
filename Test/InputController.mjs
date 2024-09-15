import { InputController } from '../InputController.mjs';
import { KeyboardObserverMock } from './Mocks/KeyboardObserverMock.mjs';
import { strict as assert } from 'node:assert';

const keyboardObserverMock = new KeyboardObserverMock();
const inputController = new InputController(keyboardObserverMock);

describe("Basic state", function() {
	it("Default", function() {
		assert.equal(inputController.checkAction("move_up"), false);
	});
	it("Keydown", function() {
		keyboardObserverMock.dispatchEvent("keydown", { "code": "KeyW" });
		assert.equal(inputController.checkAction("move_up"), false);
	});
	it("Keyup", function() {
		keyboardObserverMock.dispatchEvent("keyup", { "code": "KeyW" });
		assert.equal(inputController.checkAction("move_up"), false);
	});
});

describe("Set controller listener method", function() {
	it("Keydown", function() {
		inputController.setControllerListener();
		keyboardObserverMock.dispatchEvent("keydown", { "code": "KeyW" });
		assert.equal(inputController.checkAction("move_up"), true);
	});
	it("Keyup", function() {
		keyboardObserverMock.dispatchEvent("keyup", { "code": "KeyW" });
		assert.equal(inputController.checkAction("move_up"), false);
	});
});

describe("Unset controller listener method", function() {
	it("Keydown", function() {
		inputController.unsetControllerListener();
		keyboardObserverMock.dispatchEvent("keydown", { "code": "KeyW" });
		assert.equal(inputController.checkAction("move_up"), false);
	});
	it("Keyup", function() {
		keyboardObserverMock.dispatchEvent("keyup", { "code": "KeyW" });
		assert.equal(inputController.checkAction("move_up"), false);
	});
});

describe("Add key to action mapper method", function() {
	it("Not existed action", function() {
		inputController.setControllerListener();
		assert.equal(inputController.checkAction("some_action"), false);
	});
	it("Add action", function() {
		inputController.addKeyToActionMapper("some_action", ["KeyZ"]);
		keyboardObserverMock.dispatchEvent("keydown", { "code": "KeyZ" });
		assert.equal(inputController.checkAction("some_action"), true);
		keyboardObserverMock.dispatchEvent("keyup", { "code": "KeyZ" });
		assert.equal(inputController.checkAction("some_action"), false);
	});
});

describe("Set after unset with action", function() {
	it("First set", function() {
		inputController.setControllerListener();
		keyboardObserverMock.dispatchEvent("keydown", { "code": "KeyW" });
		assert.equal(inputController.checkAction("move_up"), true);
	});
	it("Unset", function() {
		inputController.unsetControllerListener();
		assert.equal(inputController.checkAction("move_up"), false);
	});
	it("Secont set", function() {
		inputController.setControllerListener();
		assert.equal(inputController.checkAction("move_up"), false);
	});
});
