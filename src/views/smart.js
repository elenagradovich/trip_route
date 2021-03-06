import Abstract from './abstract';

export default class Smart extends Abstract {
  constructor() {
    if(new.target === Smart) {
      throw new Error('Can\'t instantiate Abstract, only concrete one.');
    }
    super();
  }

  updateData(update, justDataUpdating) {
    if (!update) {
      return;
    }

    this._state = {...this._state, ...update};

    if (justDataUpdating) {
      return;
    }

    this.updateElement();
  }

  updateElement() {
    const prevElement = this.getElement();
    const parent = prevElement.parentElement;
    this.removeElement();

    const newElement = this.getElement();

    parent.replaceChild(newElement, prevElement);

    this.restoreHandlers();
  }

  restoreHandlers() {
    throw new Error('Abstract method not implemented: resetHandlers');
  }
}
