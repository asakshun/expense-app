/**
 * LINE Channel Access Token v2.1 発行スクリプト
 * 
 * 使い方:
 * 1. このファイルの設定セクションを編集
 * 2. node scripts/generate-line-token.js を実行
 */

const jose = require('node-jose');
const https = require('https');

// ============================================
// 設定: ここを編集してください
// ============================================

// LINE Developers Consoleから取得したチャネルID
const CHANNEL_ID = 'YOUR_CHANNEL_ID_HERE';

// LINE Developers Consoleで公開鍵を登録した際に取得したKID
const KID = 'YOUR_KID_HERE';

// 生成した秘密鍵（JSON形式）
const PRIVATE_KEY = {
  "alg": "RS256",
  "d": "YOUR_PRIVATE_KEY_D_HERE",
  "dp": "YOUR_PRIVATE_KEY_DP_HERE",
  "dq": "YOUR_PRIVATE_KEY_DQ_HERE",
  "e": "AQAB",
  "kty": "RSA",
  "n": "YOUR_PRIVATE_KEY_N_HERE",
  "p": "YOUR_PRIVATE_KEY_P_HERE",
  "q": "YOUR_PRIVATE_KEY_Q_HERE",
  "qi": "YOUR_PRIVATE_KEY_QI_HERE",
  "use": "sig"
};

// トークンの有効期間（秒）: 最大30日 = 2592000秒
const TOKEN_EXPIRATION = 60 * 60 * 24 * 30; // 30日

// ============================================
// JWT生成とトークン発行
// ============================================

async function generateJWT() {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: KID
  };

  const payload = {
    iss: CHANNEL_ID,
    sub: CHANNEL_ID,
    aud: 'https://api.line.me/',
    exp: Math.floor(Date.now() / 1000) + (60 * 30), // JWT自体の有効期限: 30分
    token_exp: TOKEN_EXPIRATION
  };

  console.log('📝 JWT生成中...');
  console.log('ペイロード:', JSON.stringify(payload, null, 2));

  try {
    const jwt = await jose.JWS.createSign(
      { format: 'compact', fields: header },
      PRIVATE_KEY
    )
      .update(JSON.stringify(payload))
      .final();

    console.log('✅ JWT生成成功\n');
    return jwt;
  } catch (error) {
    console.error('❌ JWT生成エラー:', error.message);
    throw error;
  }
}

async function issueChannelAccessToken(jwt) {
  console.log('🔑 チャネルアクセストークン発行中...\n');

  const postData = new URLSearchParams({
    grant_type: 'client_credentials',
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    client_assertion: jwt
  }).toString();

  const options = {
    hostname: 'api.line.me',
    port: 443,
    path: '/oauth2/v2.1/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ トークン発行成功！\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📋 以下のトークンを .env.local に設定してください:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            console.log('LINE_CHANNEL_ACCESS_TOKEN=' + response.access_token);
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📊 トークン情報:');
            console.log('  - トークンタイプ:', response.token_type);
            console.log('  - 有効期限:', response.expires_in, '秒 (' + Math.floor(response.expires_in / 86400) + '日)');
            console.log('  - キーID:', response.key_id);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            resolve(response);
          } else {
            console.error('❌ トークン発行失敗');
            console.error('ステータスコード:', res.statusCode);
            console.error('レスポンス:', JSON.stringify(response, null, 2));
            reject(new Error(`トークン発行失敗: ${response.error_description || response.error}`));
          }
        } catch (error) {
          console.error('❌ レスポンス解析エラー:', error.message);
          console.error('生データ:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ リクエストエラー:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// メイン処理
async function main() {
  console.log('\n🚀 LINE Channel Access Token v2.1 発行ツール\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 設定チェック
  if (CHANNEL_ID === 'YOUR_CHANNEL_ID_HERE') {
    console.error('❌ エラー: CHANNEL_IDを設定してください');
    console.error('LINE Developers Consoleの「Basic settings」タブから取得できます\n');
    process.exit(1);
  }

  if (KID === 'YOUR_KID_HERE') {
    console.error('❌ エラー: KIDを設定してください');
    console.error('公開鍵を登録した際に表示されたキーIDです\n');
    process.exit(1);
  }

  if (PRIVATE_KEY.d === 'YOUR_PRIVATE_KEY_D_HERE') {
    console.error('❌ エラー: PRIVATE_KEYを設定してください');
    console.error('生成した秘密鍵のJSON全体を貼り付けてください\n');
    process.exit(1);
  }

  try {
    // JWT生成
    const jwt = await generateJWT();
    
    // トークン発行
    const tokenResponse = await issueChannelAccessToken(jwt);
    
    console.log('✨ 完了しました！');
    console.log('上記のトークンを .env.local ファイルにコピーしてください。\n');
    
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    console.error('\n💡 トラブルシューティング:');
    console.error('  1. CHANNEL_ID、KID、PRIVATE_KEYが正しく設定されているか確認');
    console.error('  2. 公開鍵がLINE Developers Consoleに正しく登録されているか確認');
    console.error('  3. チャネルIDとKIDが一致しているか確認\n');
    process.exit(1);
  }
}

// 実行
main();
