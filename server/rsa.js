const bigInt = require("big-integer");
const bigintCryptoUtils = require("bigint-crypto-utils");
class RSA {
  static multiplicativeInverse(e, phi) {
    var d = 0;
    var x1 = 0;
    var x2 = 0;
    var y1 = 1;
    var tempPhi = phi;

    while (e > 0) {
      var temp1 = Math.floor(tempPhi / e);
      var temp2 = tempPhi - temp1 * e;
      tempPhi = e;
      e = temp2;

      var x = x2 - temp1 * x1;
      var y = d - temp1 * y1;

      x2 = x1;
      x1 = x;
      d = y1;
      y1 = y;

      if (tempPhi == 1) {
        return d + phi;
      }
    }
  }

  static isPrime(num) {
    if (num === 2) {
      return true;
    } else if (num > 1) {
      for (var i = 2; i < num; i++) {
        if (num % i !== 0) {
          return true;
        } else if (num === i * 1) {
          return false;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  static generateKeyPair(p, q, r, s) {
    if (
      !(RSA.isPrime(p) && RSA.isPrime(q) && RSA.isPrime(r) && RSA.isPrime(s))
    ) {
      throw "All numbers must be prime";
    } else if (p === q || r === q || s === q || p === r || s === r || p === s) {
      throw "numbers cannot be equal";
    }
    var n = p * q * r * s;
    var phi = (p - 1) * (q - 1) * (r - 1) * (s - 1);
    var e = Math.floor(Math.random() * (phi - 1)) + 1;
    var g = bigInt.gcd(e, phi);
    while (g != 1) {
      e = Math.floor(Math.random() * (phi - 1)) + 1;
      g = bigInt.gcd(e, phi);
    }
    var d = RSA.multiplicativeInverse(e, phi);
    console.log(d);
    console.log(e);

    return [
      [e, n],
      [d, n],
    ];
  }

  static encrypt(pk, plaintText) {
    var key = pk[0];
    var n = pk[1];

    var cipher = "";
    for (var i = 0; i < plaintText.length; i++) {
      cipher +=
        bigInt(bigintCryptoUtils.modPow(plaintText.charCodeAt(i), key, n)) +
        "-";
      console.log(cipher);
    }
    cipher = cipher.slice(0, -1);

    return cipher;
  }

  static decrypt(pk, cipherText) {
    var key = pk[0];
    var n = pk[1];
    var plain = "";
    let preparedCipherText = cipherText.split("-");
    for (var i = 0; i < preparedCipherText.length; ++i) {
      preparedCipherText[i] = BigInt(preparedCipherText[i]);
      plain += String.fromCharCode(
        parseInt(
          bigInt(
            bigintCryptoUtils.modPow(
              BigInt(preparedCipherText[i].toString()),
              BigInt(key.toString()),
              BigInt(n.toString())
            )
          ),
          toString()
        )
      );
    }
    return plain;
  }

  static testRsa() {
    console.log("RSA test");
    var p = 557;
    var q = 739;
    var r = 941;
    var s = 449;
    console.log("Generating key pairs now...");
    var keyPair = RSA.generateKeyPair(p, q, r, s);
    var publicKey = keyPair[0];
    var privateKey = keyPair[1];
    console.log("Public key is", publicKey);
    console.log("Private key is", privateKey);
    var message = "hello";
    var encryptedMsg = RSA.encrypt(privateKey, message);
    console.log("Encrypted msg: ");
    console.log(encryptedMsg);
    console.log("Decrypting msg with public key:", publicKey);
    console.log("Your msg is: ");
    console.log(RSA.decrypt(publicKey, encryptedMsg));
  }
}
module.exports = RSA;
