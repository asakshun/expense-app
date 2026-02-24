/**
 * LINEリッチメニュー設定スクリプト
 * 
 * 使い方:
 * 1. LINE_CHANNEL_ACCESS_TOKENとLIFF_URLを設定
 * 2. node scripts/setup-rich-menu.js を実行
 */

const https = require('https');
const fs = require('fs');

// ============================================
// 設定: ここを編集してください
// ============================================

const LINE_CHANNEL_ACCESS_TOKEN = 'YOUR_LINE_CHANNEL_ACCESS_TOKEN';
const LIFF_URL = 'https://liff.line.me/YOUR-LIFF-ID'; // LINE Developers ConsoleのLIFFタブから取得

// ============================================
// リッチメニュー作成
// ============================================

async function createRichMenu() {
  const richMenuData = {
    size: {
      width: 2500,
      height: 1686
    },
    selected: true,
    name: '支出管理メニュー',
    chatBarText: 'メニュー',
    areas: [
      {
        bounds: {
          x: 0,
          y: 0,
          width: 2500,
          height: 1686
        },
        action: {
          type: 'uri',
          label: '支出を確認',
          uri: LIFF_URL
        }
      }
    ]
  };

  const postData = JSON.stringify(richMenuData);

  const options = {
    hostname: 'api.line.me',
    port: 443,
    path: '/v2/bot/richmenu',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
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
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ リッチメニュー作成成功');
          console.log('リッチメニューID:', response.richMenuId);
          resolve(response.richMenuId);
        } else {
          console.error('❌ リッチメニュー作成失敗');
          console.error('ステータスコード:', res.statusCode);
          console.error('レスポンス:', data);
          reject(new Error(data));
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

async function setDefaultRichMenu(richMenuId) {
  const options = {
    hostname: 'api.line.me',
    port: 443,
    path: `/v2/bot/user/all/richmenu/${richMenuId}`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ デフォルトリッチメニュー設定成功');
        resolve();
      } else {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          console.error('❌ デフォルトリッチメニュー設定失敗');
          console.error('ステータスコード:', res.statusCode);
          console.error('レスポンス:', data);
          reject(new Error(data));
        });
      }
    });

    req.on('error', (error) => {
      console.error('❌ リクエストエラー:', error.message);
      reject(error);
    });

    req.end();
  });
}

// メイン処理
async function main() {
  console.log('\n🚀 LINEリッチメニュー設定ツール\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 設定チェック
  if (LINE_CHANNEL_ACCESS_TOKEN === 'YOUR_LINE_CHANNEL_ACCESS_TOKEN') {
    console.error('❌ エラー: LINE_CHANNEL_ACCESS_TOKENを設定してください\n');
    process.exit(1);
  }

  if (LIFF_URL === 'https://liff.line.me/YOUR-LIFF-ID') {
    console.error('❌ エラー: LIFF_URLを設定してください');
    console.error('LINE Developers ConsoleのLIFFタブから取得できます\n');
    process.exit(1);
  }

  try {
    // リッチメニュー作成
    console.log('📝 リッチメニューを作成中...\n');
    const richMenuId = await createRichMenu();
    
    // デフォルトリッチメニューに設定
    console.log('\n⚙️  デフォルトリッチメニューに設定中...\n');
    await setDefaultRichMenu(richMenuId);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ 完了しました！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  注意: リッチメニューの画像をアップロードする必要があります');
    console.log('LINE Official Account Manager (https://manager.line.biz/) から');
    console.log('画像をアップロードしてください。\n');
    console.log('または、以下のコマンドで画像をアップロード:');
    console.log(`curl -X POST https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content \\`);
    console.log(`  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" \\`);
    console.log(`  -H "Content-Type: image/png" \\`);
    console.log(`  --data-binary @richmenu-image.png\n`);
    
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    console.error('\n💡 トラブルシューティング:');
    console.error('  1. LINE_CHANNEL_ACCESS_TOKENが正しいか確認');
    console.error('  2. LIFF_URLが正しいか確認');
    console.error('  3. チャネルアクセストークンの権限を確認\n');
    process.exit(1);
  }
}

// 実行
main();
