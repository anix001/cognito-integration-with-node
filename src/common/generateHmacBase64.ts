export default async function generateHmacBase64(clientSecretKey:string, username:string, clientId:string) {
    // Concatenate the username and client ID
    const data = username + clientId;

    // Convert the key and data to ArrayBuffer
    const enc = new TextEncoder();
    const keyData = enc.encode(clientSecretKey);
    const dataBuffer = enc.encode(data);

    // Import the key for HMAC-SHA-256
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Generate the HMAC
    const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);

    // Convert the signature to a Base64 string
    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));

    return base64Signature;
  }