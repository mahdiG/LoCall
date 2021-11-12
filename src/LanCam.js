/* eslint-disable class-methods-use-this */
import { LitElement, html, css } from "lit";

// const logo = new URL("../assets/open-wc-logo.svg", import.meta.url).href;

let ws;

export class LanCam extends LitElement {
  static get properties() {
    return {
      text: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        font-size: calc(10px + 2vmin);
        color: #1a2b42;
        max-width: 960px;
        margin: 0 auto;
        text-align: center;
        background-color: var(--lan-cam-background-color);
      }

      main {
        flex-grow: 1;
      }

      .logo {
        margin-top: 36px;
        animation: app-logo-spin infinite 20s linear;
      }

      @keyframes app-logo-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .app-footer {
        font-size: calc(12px + 0.5vmin);
        align-items: center;
      }

      .app-footer a {
        margin-left: 5px;
      }
    `;
  }

  constructor() {
    super();
    this.text = "";

    this.startWS();
    this.getMedia();
  }

  startWS() {
    // ws = new WebSocket("ws://localhost:8000");
    // ws = new WebSocket("ws://0.0.0.0:8080");
    ws = new WebSocket("ws://192.168.1.35:8080");

    ws.onopen = function (event) {
      ws.send("Here's some text that the server is urgently awaiting!");
    };
    console.log("ws:", ws);
    ws.onmessage = function (event) {
      console.log("ws message:", event.data);
    };

    return this;
  }

  echo(e) {
    const { value } = e.target;
    ws.send(value);
    this.text = value;
  }

  async getMedia() {
    let stream = null;
    const constraints = {
      video: true,
      audio: false,
    };

    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("stream:", stream);
      /* use the stream */
    } catch (err) {
      console.error("failed to get media access: ", err);
      /* handle the error */
    }
  }

  render() {
    return html`
      <input @input=${this.echo} />

      <button @click=${this.echo}>hi</button>
      <a href="https://pwa-webrtc-16283.firebaseapp.com/">aaaaaa</a>
    `;
  }
}
