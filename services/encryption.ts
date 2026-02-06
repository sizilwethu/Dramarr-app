
// encryption.ts
// Handles End-to-End Encryption using Web Crypto API (ECDH + AES-GCM)

const KEY_PAIR_ALG = { name: "ECDH", namedCurve: "P-256" };
const ENC_ALG = { name: "AES-GCM", length: 256 };

export const encryptionService = {
  // Generate a new Public/Private Key pair
  generateKeyPair: async (): Promise<{ publicKey: string; privateKey: CryptoKey }> => {
    const keyPair = await window.crypto.subtle.generateKey(
      KEY_PAIR_ALG,
      true,
      ["deriveKey", "deriveBits"]
    );

    const exportedPublic = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
    
    // We store the private key in IndexedDB or LocalStorage (Stringified JWK for simplicity here)
    // In a real production app, use IndexedDB for better security/size handling
    const exportedPrivate = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
    localStorage.setItem('dramarr_private_key', JSON.stringify(exportedPrivate));

    return { 
      publicKey: JSON.stringify(exportedPublic), 
      privateKey: keyPair.privateKey 
    };
  },

  // Get local private key
  getLocalPrivateKey: async (): Promise<CryptoKey | null> => {
    const stored = localStorage.getItem('dramarr_private_key');
    if (!stored) return null;
    try {
      const jwk = JSON.parse(stored);
      return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        KEY_PAIR_ALG,
        true,
        ["deriveKey", "deriveBits"]
      );
    } catch (e) {
      console.error("Failed to load private key", e);
      return null;
    }
  },

  // Import a remote user's public key string
  importPublicKey: async (publicKeyStr: string): Promise<CryptoKey | null> => {
    try {
      const jwk = JSON.parse(publicKeyStr);
      return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        KEY_PAIR_ALG,
        true,
        []
      );
    } catch (e) {
      console.error("Invalid public key format", e);
      return null;
    }
  },

  // Derive a shared AES key from Local Private + Remote Public
  deriveSharedKey: async (privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> => {
    return await window.crypto.subtle.deriveKey(
      { name: "ECDH", public: publicKey },
      privateKey,
      ENC_ALG,
      false,
      ["encrypt", "decrypt"]
    );
  },

  // Encrypt text
  encrypt: async (text: string, sharedKey: CryptoKey): Promise<string> => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      sharedKey,
      encoded
    );

    // Combine IV and Ciphertext for storage: IV:Ciphertext (Base64)
    const ivStr = btoa(String.fromCharCode(...new Uint8Array(iv)));
    const cipherStr = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
    return `${ivStr}:${cipherStr}`;
  },

  // Decrypt text
  decrypt: async (encryptedData: string, sharedKey: CryptoKey): Promise<string> => {
    try {
      const [ivStr, cipherStr] = encryptedData.split(':');
      if (!ivStr || !cipherStr) return encryptedData; // Return original if not formatted correctly

      const iv = Uint8Array.from(atob(ivStr), c => c.charCodeAt(0));
      const ciphertext = Uint8Array.from(atob(cipherStr), c => c.charCodeAt(0));

      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        sharedKey,
        ciphertext
      );

      return new TextDecoder().decode(decrypted);
    } catch (e) {
      // Return original text if decryption fails (e.g., old unencrypted messages)
      return "🔒 Encrypted Message";
    }
  }
};
