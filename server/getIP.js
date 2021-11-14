const { networkInterfaces } = require("os");

module.exports = {
  getLocalIP() {
    const nets = networkInterfaces();
    let localIPs = [];

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === "IPv4" && !net.internal) {
          localIPs = [...localIPs, net.address];
        }
      }
    }

    const intIPs = localIPs.map(ip => {
      const noDots = ip.split(".").join("");

      return Number(noDots);
    });
    const smallestIndex = intIPs.findIndex(num => num === Math.min(...intIPs));
    const localIP = localIPs[smallestIndex];

    return localIP;
  },
};
