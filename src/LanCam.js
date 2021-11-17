/* eslint-disable class-methods-use-this */
import { LitElement, html, css } from "lit";
import "./flip-camera-icon.js";

// const logo = new URL("../assets/open-wc-logo.svg", import.meta.url).href;
const switchIcon = new URL("../assets/switch-icon.svg", import.meta.url).href;
const cameraIcon = new URL("../assets/camera-icon.svg", import.meta.url).href;

let ws;
let pc;
let localStream;
let constraints = {
  audio: false,
  video: {
    // width: { ideal: 1920 },
    // height: { ideal: 1080 },
  },
};
let readyToCall = false;

// let constraints = {
//   audio: false,
//   video: {
//     width: { min: 1920 },
//     height: { min: 1080 },
//   },
// };

export class LanCam extends LitElement {
  static get properties() {
    return {
      text: { type: String },
      serverIP: { type: String },
      isInCall: { type: Boolean },
      isDesktop: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.text = "";
    this.isInCall = false;
    this.isDesktop = false;

    this.checkIfDesktop();
    this.startWS();
  }

  firstUpdated() {
    super.firstUpdated();
    this.getMedia();
  }

  checkIfDesktop() {
    const { hostname } = window.location;
    if (hostname === "localhost") {
      this.isDesktop = true;
    }
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
        this.isInCall = true;
        setTimeout(() => {
          this.answer(parsed.offer);
        }, 2000);
      }
      if (parsed.newIceCandidate) {
        this.addIceCandidate(parsed.newIceCandidate);
      }
      if (parsed.ip) {
        console.log("ip: ", parsed.ip);
        this.serverIP = parsed.ip;
      }
      if (parsed.msg === "MAKE_CALL") {
        this.isInCall = true;
        setTimeout(() => {
          console.log("caaaaaaaaaaaaaaaaaaaaaaaaallll");
          this.makeCall();
        }, 2000);
      }
    };
  }

  startWS() {
    // ws = new WebSocket("ws://localhost:8000");
    // ws = new WebSocket("ws://0.0.0.0:8080");
    const { host, hostname, port } = window.location;

    let wsUrl = `wss://${host}`;

    // ws port is 3000 but in dev server, location port is 8000
    // this is only for dev env purposes
    const isDev = port !== "3000";
    if (isDev) {
      // wsUrl = `wss://${hostname}:3000`;
      wsUrl = `ws://${hostname}:8080`;
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
    try {
      console.log(
        "navigator.mediaDevices: ",
        await navigator.mediaDevices.getSupportedConstraints()
      );
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      // const devices = await navigator.mediaDevices.enumerateDevices();
      // console.log("devices:", devices);

      console.log("localStream:", localStream);
      this.wsSend({ msg: "MAKE_CALL" });
      /* use the localStream */
      this.showLocalCamera(localStream);
    } catch (err) {
      console.error("failed to get media access: ", err);
      /* handle the error */
    }
  }

  showLocalCamera(mediaStream) {
    const video = this.shadowRoot.querySelector("#local-video");
    console.log("mediaStream:", mediaStream);
    console.log("mediaStream.getTracks():", mediaStream.getTracks());
    console.log(
      "mediaStream.getTracks()[0].getSettings():",
      mediaStream.getTracks()[0].getSettings()
    );
    this.wsSend({ OTHER_CAMERA: mediaStream.getTracks()[0].getSettings() });
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
      console.log("pc track event: ", event);
      remoteStream.addTrack(event.track, remoteStream);
    });
  }

  async makeCall() {
    console.log("making call");
    this.isInCall = true;
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
    this.isInCall = true;
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

  async getConnectedDevices(type) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === type);
  }

  async switchCamera() {
    console.log("switching camera");
    const videoCameras = await this.getConnectedDevices("videoinput");
    console.log("Cameras found:", videoCameras);

    const streamSettings = localStream.getTracks()[0].getSettings();

    const currentCamId = streamSettings.deviceId;
    console.log("currentcam: ", currentCamId);

    const newCam = videoCameras.find(cam => cam.deviceId !== currentCamId);
    console.log("newCam: ", newCam);

    localStream = await this.openCamera(newCam.deviceId);
    this.showLocalCamera(localStream);
    this.addLocalStreamToPC();
    this.changeSenderTrack(localStream);

    this.wsSend({ cam: streamSettings });
  }

  changeSenderTrack(stream) {
    const videoTrack = stream.getVideoTracks()[0];
    const sender = pc.getSenders().find(s => s.track.kind == videoTrack.kind);
    console.log("found sender:", sender);
    sender.replaceTrack(videoTrack);
  }

  openCamera(cameraId) {
    constraints = {
      ...constraints,
      video: {
        ...constraints.video,
        deviceId: cameraId || undefined,
      },
    };

    return navigator.mediaDevices.getUserMedia(constraints);
  }

  renderLaptop() {
    if (!this.isInCall) {
      return this.renderShowIP();
    }
    return html`
      <video
        id="local-video"
        class="video video-hide"
        autoplay
        playsinline
        ?controls=${false}
      ></video>

      <video
        id="remote-video"
        class="video"
        autoplay
        playsinline
        ?controls=${false}
      ></video>
    `;
  }

  renderMobile() {
    return html`
      <video
        id="local-video"
        class="video"
        autoplay
        playsinline
        ?controls=${false}
      ></video>

      <video
        id="remote-video"
        class="video video-hide"
        autoplay
        playsinline
        ?controls=${false}
      ></video>

      <button class="switch-camera-button" @click=${this.switchCamera}>
        <flip-camera-icon></flip-camera-icon>
      </button>
    `;
  }

  renderShowIP() {
    return html`
      <video
        id="local-video"
        class="video video-hide"
        autoplay
        playsinline
        ?controls=${false}
      ></video>
      <div class="show-ip-container">
        <h3>Open this in chrome on your phone :</h3>
        <h2>${this.serverIP}:3000</h2>
      </div>
    `;
  }

  render() {
    return html`
      <div class="background">
        <!-- <input @input=${this.echo} />
    
        <button @click=${this.echo}>hi</button>
    
        <button @click=${this.makeCall}>call!!</button> -->

        <!-- ${this.renderShowIP()} -->

        <!-- <button class="switch-camera-button" @click=${this.switchCamera}>
          switch
        </button>

        <button class="call-camera-button" @click=${this.makeCall}>call</button>

        <video
          id="local-video"
          class="video video-local"
          autoplay
          playsinline
          ?controls=${false}
        ></video>

        <video
          id="remote-video"
          class="video"
          autoplay
          playsinline
          ?controls=${false}
        ></video> -->

        <button class="call-camera-button" @click=${this.makeCall}>call</button>

        ${this.isDesktop ? this.renderLaptop() : this.renderMobile()}
        <!-- ${this.renderLaptop()} -->
        <!-- ${this.renderMobile()} -->
      </div>
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

      .background {
        position: relative;
        display: flex;
        background-color: black;
        width: 100vw;
        height: 100vh;
        justify-content: center;
        align-items: flex-end;
      }

      .video {
        flex-grow: 1;
        width: 100%;
        height: 100%;
      }
      .video-local {
        width: 4rem;
        height: 4rem;
      }
      .video-hide {
        width: 0;
        height: 0;
      }

      .switch-camera-button {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 2rem;
        height: 2rem;
        border-radius: 100%;
        position: absolute;
        margin-bottom: 1rem;
        /* right: 1rem; */
        border: none;
        cursor: pointer;
        z-index: 2;
      }
      flip-camera-icon {
        flex-grow: 1;
        --color: black;
      }

      .call-camera-button {
        position: absolute;
        z-index: 2;
        left: 0;
      }

      .show-ip-container {
        flex-grow: 1;
        display: flex;
        width: 100vw;
        height: 100vh;
        flex-direction: column;
        background-color: whitesmoke;
      }
    `;
  }
}
