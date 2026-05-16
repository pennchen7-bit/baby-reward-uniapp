#!/usr/bin/env node

/**
 * 微信小程序上传脚本
 * 使用 miniprogram-ci 不依赖微信开发者工具 GUI 登录
 */

const ci = require('miniprogram-ci');
const path = require('path');

const CONFIG = {
  appid: 'wx641c37512334834c',
  privateKeyPath: path.resolve('/Users/clovey-macmini/.openclaw/credentials/wechat-mini-ci-key.key'),
  projectPath: path.resolve('/Users/clovey-macmini/.openclaw/workspace/code/baby-reward-uniapp/dist/build/mp-weixin'),
  version: '1.0.14',
  desc: '家长批准后宝宝首页直接显示抽奖卡片，需自己点按钮抽奖',
};

const project = new ci.Project({
  appid: CONFIG.appid,
  type: 'miniProgram',
  projectPath: CONFIG.projectPath,
  privateKeyPath: CONFIG.privateKeyPath,
  ignores: ['node_modules/**/*'],
});

async function main() {
  console.log('🚀 开始上传...');
  console.log(`   AppID: ${CONFIG.appid}`);
  console.log(`   版本:  ${CONFIG.version}`);
  console.log(`   描述:  ${CONFIG.desc}`);
  console.log(`   路径:  ${CONFIG.projectPath}`);

  try {
    const result = await ci.upload({
      project,
      version: CONFIG.version,
      desc: CONFIG.desc,
      robot: 1,
      setting: { es6: true, es7: true, minify: true, autoPrefixWXSS: true },
    });

    console.log('\n✅ 上传成功！');
    if (result?.subPackageInfo) {
      result.subPackageInfo.forEach(p => {
        console.log(`   ${p.name || '主包'}: ${(p.size / 1024 / 1024).toFixed(2)} MB`);
      });
    }
  } catch (err) {
    console.error(`\n❌ 上传失败: ${err.message}`);
    process.exit(1);
  }
}

main();
