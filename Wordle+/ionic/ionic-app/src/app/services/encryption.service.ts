import { Injectable } from '@angular/core';
import { AES, enc } from 'crypto-js';
import env from '../../env.json';


@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
    private readonly encryptionKey = env.encryptionKey;

  encryptData(data: string): string {
    const encryptedData = AES.encrypt(data, this.encryptionKey).toString();
    return encryptedData;
  }

  decryptData(encryptedData: string): string {
    const decryptedData = AES.decrypt(encryptedData, this.encryptionKey).toString(enc.Utf8);
    return decryptedData;
  }
}
