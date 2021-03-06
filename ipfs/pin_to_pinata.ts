/**
 * Take the CID of some data pushed on a local IPFS node as input,
 * and pin the data to Pinata.cloud services.
 * NB: You need a .env file with the PINATA_JWT variable set.
 */

import * as IPFS from "ipfs-http-client";

import dotenv from "dotenv";
dotenv.config();

export const pinToPinata = async (CID: string, pinName: string) => {
  if (process.env.PINATA_JWT === undefined) {
    throw new Error("Error: you must add a PINATA_JWT variable in .env");
  }

  const ipfs = await IPFS.create(); //fallback to default API address

  // Check if the Pinata service is already registered
  const services = await ipfs.pin.remote.service.ls();
  if (services.filter((elem) => elem.service === "pinata").length === 0) {
    // Add the Pinata service
    await ipfs.pin.remote.service.add("pinata", {
      endpoint: new URL("https://api.pinata.cloud/psa"),
      key: process.env.PINATA_JWT,
    });
  }

  // Pin the data to Pinata
  const pinnedData = await ipfs.pin.remote.add(IPFS.CID.parse(CID), {
    service: "pinata",
    name: pinName,
  });
  return pinnedData;
};

const _pinToPinata = async () => {
  const myArgs = process.argv.slice(2);
  if (myArgs.length != 2) {
    console.log(
      "Error: you must provide two argument: the CID of your data to pin AND a folder name for deployment."
    );
    return;
  }
  await pinToPinata(myArgs[0], myArgs[1]);
  console.log("done.");
};

// check if this file is run directly
if (require.main === module) {
  _pinToPinata();
}
