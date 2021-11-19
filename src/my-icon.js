import { LitElement, html, css } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

class Icon extends LitElement {
  static get properties() {
    return {
      color: { type: String },
      icon: { type: String },
    };
  }

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super();

    this.icon = "";
  }

  // eslint-disable-next-line consistent-return
  renderIcon() {
    const { icon } = this;
    switch (icon) {
      case "flip-camera":
        return unsafeSVG(`
          <g><rect fill="none" height="24" width="24" /></g>
            <g>
              <g>
                <path
                  d="M20,5h-3.17L15,3H9L7.17,5H4C2.9,5,2,5.9,2,7v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V7C22,5.9,21.1,5,20,5z M12,18 c-2.76,0-5-2.24-5-5H5l2.5-2.5L10,13H8c0,2.21,1.79,4,4,4c0.58,0,1.13-0.13,1.62-0.35l0.74,0.74C13.65,17.76,12.86,18,12,18z M16.5,15.5L14,13h2c0-2.21-1.79-4-4-4c-0.58,0-1.13,0.13-1.62,0.35L9.64,8.62C10.35,8.24,11.14,8,12,8c2.76,0,5,2.24,5,5h2 L16.5,15.5z"
                />
              </g>
            </g>`);

      case "fullscreen":
        return unsafeSVG(`
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
          />
        `);

      case "phone":
        return unsafeSVG(`
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
          d="M6.54 5c.06.89.21 1.76.45 2.59l-1.2 1.2c-.41-1.2-.67-2.47-.76-3.79h1.51m9.86 12.02c.85.24 1.72.39 2.6.45v1.49c-1.32-.09-2.59-.35-3.8-.75l1.2-1.19M7.5 3H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.49c0-.55-.45-1-1-1-1.24 0-2.45-.2-3.57-.57-.1-.04-.21-.05-.31-.05-.26 0-.51.1-.71.29l-2.2 2.2c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1z"
        />
        `);

      default:
        break;
    }
  }

  render() {
    return html`
      <svg
        id="icon"
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="#000000"
      >
        ${this.renderIcon()}
      </svg>
    `;
  }

  static get styles() {
    return css`
      :host {
        --color: black;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      #icon {
        fill: var(--color);
      }
    `;
  }
}

customElements.define("my-icon", Icon);
