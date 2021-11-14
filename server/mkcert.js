const mkcert = require("mkcert");
const { getLocalIP } = require("./getIP.js");

module.exports = {
  async createCert() {
    // create a certificate authority
    const ca = await mkcert.createCA({
      organization: "Hello CA",
      countryCode: "NP",
      state: "Bagmati",
      locality: "Kathmandu",
      validityDays: 365,
    });

    const localIP = getLocalIP();

    // then create a tls certificate
    const cert = await mkcert.createCert({
      // domains: ["127.0.0.1", "localhost"],
      domains: [localIP],
      validityDays: 365,
      caKey: ca.key,
      caCert: ca.cert,
    });

    // console.log(cert.key, cert.cert); // certificate info
    // console.log(`${cert.cert}\n${ca.cert}`); // create a full chain certificate by merging CA and domain certificates

    return cert;
  },
};
