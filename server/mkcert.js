const mkcert = require("mkcert");
const { networkInterfaces } = require("os");

console.log("mkcert ifle");

function getLocalIP() {
  const nets = networkInterfaces();
  console.log(networkInterfaces());
  const results = Object.create(null); // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  console.log(results);
}

module.exports = {
  async createCert() {
    console.log("creating cert??");
    // create a certificate authority
    const ca = await mkcert.createCA({
      organization: "Hello CA",
      countryCode: "NP",
      state: "Bagmati",
      locality: "Kathmandu",
      validityDays: 365,
    });

    getLocalIP();

    // then create a tls certificate
    const cert = await mkcert.createCert({
      domains: ["127.0.0.1", "localhost"],
      validityDays: 365,
      caKey: ca.key,
      caCert: ca.cert,
    });

    // console.log(cert.key, cert.cert); // certificate info
    // console.log(`${cert.cert}\n${ca.cert}`); // create a full chain certificate by merging CA and domain certificates

    return cert;
  },
};
