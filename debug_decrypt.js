import crypto from 'crypto';

const key = Buffer.from('abcdefghijklmnop', 'utf8');
const encryptedBase64 = '6j7DGc828eAYYqA7w4ZMmQ==';

try {
    const decipher = crypto.createDecipheriv('aes-128-ecb', key, null);
    decipher.setAutoPadding(true);

    let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    console.log('Decrypted:', decrypted);
} catch (err) {
    console.error('Error:', err.message);
}
