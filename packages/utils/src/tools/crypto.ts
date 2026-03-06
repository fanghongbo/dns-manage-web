// @ts-ignore
import * as cryptoJs from 'crypto-js';

export const encryptDes = (message: string, key: string) => {
  const keyHex = cryptoJs.enc.Utf8.parse(key);
  const option = { mode: cryptoJs.mode.ECB, padding: cryptoJs.pad.Pkcs7 };
  const encrypted = cryptoJs.DES.encrypt(message, keyHex, option);
  return encrypted.ciphertext.toString();
};

export const decryptDes = (message: any, key: any) => {
  const keyHex = cryptoJs.enc.Utf8.parse(key);
  const decrypted = cryptoJs.DES.decrypt(
    {
      ciphertext: cryptoJs.enc.Hex.parse(message),
    },
    keyHex,
    {
      mode: cryptoJs.mode.ECB,
      padding: cryptoJs.pad.Pkcs7,
    },
  );
  return decrypted.toString(cryptoJs.enc.Utf8);
};
