#!/usr/bin/env node

/**
 * 微信小程序上传脚本
 * 使用 miniprogram-ci 上传代码至微信后台
 */

const ci = require('miniprogram-ci');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  appid: 'wx641c37512334834c',
  privateKeyPath: '/Users/clovey-macmini/.openclaw/credentials/wechat-mini-ci-key.key',
  projectPath: '/Users/clovey-macmini/.openclaw/workspace/code/baby-reward-uniapp/dist/build/mp-weixin',
  robot: 1,
};

async function main() {
  console.log('🔍 校验配置...');
  
  if (!fs.existsSync(CONFIG.privateKeyPath)) {
    console.error(`❌ 密钥文件不存在: ${CONFIG.privateKeyPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(CONFIG.projectPath)) {
    console.error(`❌ 项目路径不存在: ${CONFIG.projectPath}`);
    process.exit(1);
  }

  console.log('\n📋 上传配置:');
  console.log(`   AppID:       ${CONFIG.appid}`);
  console.log(`   项目路径:    ${CONFIG.projectPath}`);
  console.log(`   机器人编号:  ${CONFIG.robot}`);

  const project = new ci.Project({
    appid: CONFIG.appid,
    type: 'miniProgram',
    projectPath: CONFIG.projectPath,
    privateKeyPath: CONFIG.privateKeyPath,
    ignores: ['node_modules/**/*'],
  });

  console.log('\n🚀 上传代码...');
  try {
    const result = await ci.upload({
      project,
      version: '1.0.14',
      desc: '版本记录已优化，后续上传更规范',
      robot: CONFIG.robot,
      setting: { es6: true, es7: true, minify: true, autoPrefixWXSS: true },
      onProgressUpdate: (info) => { if (typeof info === 'string') console.log(`   ${info}`); },
    });

    console.log('\n✅ 上传成功！');
    if (result?.subPackageInfo) {
      console.log('\n📦 包大小:');
      result.subPackageInfo.forEach(p => console.log(`   ${p.name || '主包'}: ${(p.size / 1024 / 1024).toFixed(2)} MB`));
    }
  } catch (err) {
    console.error(`\n❌ 上传失败: ${err.message}`);
    if (err.message.includes('invalid ip')) console.error('💡 请将当前 IP 添加到微信后台白名单');
    process.exit(1);
  }
}

main();