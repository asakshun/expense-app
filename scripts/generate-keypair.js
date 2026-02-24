/**
 * アサーション署名キーのキーペア生成スクリプト
 * 
 * 使い方:
 * node scripts/generate-keypair.js
 */

const crypto = require('crypto');

console.log('\n🔐 アサーション署名キー生成ツール\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// RSAキーペアを生成
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'jwk'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'jwk'
  }
});

// JWK形式に変換
const privateJWK = {
  ...privateKey,
  alg: 'RS256',
  use: 'sig'
};

const publicJWK = {
  ...publicKey,
  alg: 'RS256',
  use: 'sig'
};

console.log('✅ キーペア生成成功！\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 手順1: 以下の公開鍵をLINE Developers Consoleに登録');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('公開鍵 (PUBLIC KEY):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(JSON.stringify(publicJWK, null, 2));
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📝 登録手順:');
console.log('  1. LINE Developers Console (https://developers.line.biz/console/) にアクセス');
console.log('  2. チャネルを選択');
console.log('  3. 「チャネル基本設定」タブを開く');
console.log('  4. 「アサーション署名キー」セクションで「公開鍵を登録する」をクリック');
console.log('  5. 上記の公開鍵をコピー＆ペーストして登録');
console.log('  6. 登録後に表示される「KID (キーID)」をメモ\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔑 手順2: 以下の秘密鍵を generate-line-token.js に設定');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('秘密鍵 (PRIVATE KEY):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(JSON.stringify(privateJWK, null, 2));
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('⚠️  重要: 秘密鍵は絶対に公開しないでください！');
console.log('⚠️  秘密鍵は安全な場所に保管してください！\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 次のステップ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('1. 上記の公開鍵をLINE Developers Consoleに登録');
console.log('2. 登録後に表示されるKID（キーID）をメモ');
console.log('3. scripts/generate-line-token.js を開く');
console.log('4. CHANNEL_ID、KID、PRIVATE_KEYを設定');
console.log('5. node scripts/generate-line-token.js を実行\n');

console.log('✨ 完了！\n');
