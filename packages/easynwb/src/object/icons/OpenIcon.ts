
import { html } from 'lit';
import { Icon } from './Icon';

export class OpenIcon extends Icon {

    constructor() {
      super();
    }

    render() {
        return html`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960"><path d="M489 936v-60h291V276H489v-60h291q24 0 42 18t18 42v600q0 24-18 42t-42 18H489Zm-78-185-43-43 102-102H120v-60h348L366 444l43-43 176 176-174 174Z"/></svg>
        `
    }
  }
  
  customElements.get('open-icon') || customElements.define('open-icon',  OpenIcon);