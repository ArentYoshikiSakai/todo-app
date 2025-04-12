const { execSync } = require('child_process');

console.log('Firestoreセキュリティルールをデプロイします...');

try {
  // Firestoreルールをデプロイ
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  console.log('セキュリティルールのデプロイが完了しました！');
} catch (error) {
  console.error('エラーが発生しました:', error);
  process.exit(1);
} 