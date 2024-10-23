// import bigInt from "../libs/BigInteger.min.js";
// import bigintCryptoUtils from "bigint-crypto-utils";
importScripts("../libs/BigInteger.min.js");
importScripts("../libs/bundle.iife.js");

function encrypt(pk, plaintText) {
  var key = pk[0];
  var n = pk[1];

  var cipher = "";
  for (var i = 0; i < plaintText.length; i++) {
    cipher +=
      bigInt(bigintCryptoUtils.modPow(plaintText.charCodeAt(i), key, n)) + "-";
  }
  cipher = cipher.slice(0, -1);

  return cipher;
}
