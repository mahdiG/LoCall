/* eslint-disable class-methods-use-this */
import { LitElement, html, css } from "lit";

// const logo = new URL("../assets/open-wc-logo.svg", import.meta.url).href;

let ws;
let pc;
let localStream;

export class LanCam extends LitElement {
  static get properties() {
    return {
      text: { type: String },
    };
  }

  constructor() {
    super();
    this.text = "";

    this.startWS();
  }

  firstUpdated() {
    super.firstUpdated();
    this.getMedia();
  }

  wsSend(object) {
    ws.send(JSON.stringify(object));
  }

  wsGet() {
    ws.onmessage = event => {
      console.log("event.data:", event.data);
      const parsed = JSON.parse(event.data);
      if (event.data) {
        console.log("parsed: ", parsed);
      }
      // our call has been answered
      if (parsed.answer) {
        this.setRemoteDescription(parsed.answer);
      }
      // we're offered a call and now we answer it :)
      if (parsed.offer) {
        this.answer(parsed.offer);
      }
      if (parsed.newIceCandidate) {
        this.addIceCandidate(parsed.newIceCandidate);
      }
    };
  }

  startWS() {
    // ws = new WebSocket("ws://localhost:8000");
    // ws = new WebSocket("ws://0.0.0.0:8080");
    console.log("location:", window.location);
    const { host, hostname, port } = window.location;

    let wsUrl = `wss://${host}`;

    // ws port is 3000 but in dev server, location port is 8000
    // this is only for dev env purposes
    if (port !== "3000") {
      wsUrl = `wss://${hostname}:3000`;
      ws = new WebSocket(wsUrl);
    }

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // ws.send("Hi I'm client and I just connected");
      this.wsSend({ msg: "toast" });
    };
    console.log("ws:", ws);
    // ws.onmessage = function (event) {
    //   console.log("ws message:", event.data);
    // };
    this.wsGet();

    return this;
  }

  echo(e) {
    const { value } = e.target;
    this.wsSend({ msg: value });
    this.text = value;
  }

  async getMedia() {
    const constraints = {
      video: {
        deviceId: this.videoSource ? { exact: this.videoSource } : undefined,
      },
      audio: false,
    };

    try {
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      // const devices = await navigator.mediaDevices.enumerateDevices();
      // console.log("devices:", devices);

      console.log("localStream:", localStream);
      /* use the localStream */
      this.showLocalCamera(localStream);
    } catch (err) {
      console.error("failed to get media access: ", err);
      /* handle the error */
    }
  }

  showLocalCamera(mediaStream) {
    const video = this.shadowRoot.querySelector("#local-video");
    console.log("video:", video);
    video.srcObject = mediaStream;
    video.onloadedmetadata = () => {
      video.play();
    };
  }

  addLocalStreamToPC() {
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });
  }

  addRemoteStreamToVideo() {
    const remoteStream = new MediaStream();
    const remoteVideo = this.shadowRoot.querySelector("#remote-video");
    remoteVideo.srcObject = remoteStream;

    pc.addEventListener("track", async event => {
      remoteStream.addTrack(event.track, remoteStream);
    });
  }

  async makeCall() {
    console.log("making call");
    const configuration = {};
    pc = new RTCPeerConnection(configuration);

    this.addLocalStreamToPC();
    this.addRemoteStreamToVideo();

    this.onIceCandidate();

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.wsSend({ offer });
  }

  async setRemoteDescription(answer) {
    console.log("setRemoteDescription");
    const remoteDesc = new RTCSessionDescription(answer);
    await pc.setRemoteDescription(remoteDesc);
  }

  async answer(offer) {
    console.log("answering");
    pc = new RTCPeerConnection();

    this.addLocalStreamToPC();
    this.addRemoteStreamToVideo();

    this.onIceCandidate();

    pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.wsSend({ answer });
  }

  onIceCandidate() {
    console.log("send pc:", pc);

    // Listen for local ICE candidates on the local RTCPeerConnection
    pc.addEventListener("icecandidate", event => {
      if (event.candidate) {
        console.log("sending ice candy");
        this.wsSend({ newIceCandidate: event.candidate });
      }
    });

    console.log("send pc after:", pc);

    // Listen for connectionstatechange on the local RTCPeerConnection
    pc.addEventListener("connectionstatechange", () => {
      if (pc.connectionState === "connected") {
        // Peers connected!
      }
    });
  }

  async addIceCandidate(iceCandidate) {
    console.log("addIceCandidate: ", iceCandidate);
    try {
      await pc.addIceCandidate(iceCandidate);
    } catch (e) {
      console.error("Error adding received ice candidate", e);
    }
  }

  render() {
    return html`
      <input @input=${this.echo} />

      <button @click=${this.echo}>hi</button>

      <button @click=${this.makeCall}>call!!</button>

      <video
        id="local-video"
        class="video-local"
        width="250"
        height="250"
        autoplay
      ></video>

      <video
        id="remote-video"
        class="video-local"
        width="250"
        height="250"
        autoplay
      ></video>
    `;
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

      .video-local {
        width: 50rem;
        height: 50rem;
      }
    `;
  }
}
