#!/usr/bin/env node

/**
 * 微信小程序上传脚本
 */
const ci = require('miniprogram-ci');
const path = require('path');

const CONFIG = {
  appid: 'wx641c37512334834c',
  privateKeyPath: path.resolve('/Users/clovey-macmini/.openclaw/credentials/wechat-mini-ci-key.key'),
  projectPath: path.resolve('/Users/clovey-macmini/.openclaw/workspace/code/baby-reward-uniapp/dist/build/mp-weixin'),
  robot: 1,
};

async function main() {
  console.log('📋 上传配置:');
  console.log(`   AppID:       ${CONFIG.appid}`);
  console.log(`   项目路径:    ${CONFIG.projectPath}`);
  console.log(`   机器人编号:  ${CONFIG.robot}`);
  console.log(`   版本号:      1.0.14`);
  console.log(`   版本描述:    家庭信息移至成员页面，成员页面改名为我的家庭`);

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
      desc: '家庭信息移至成员页面，成员页面改名为我的家庭',
      robot: CONFIG.robot,
      setting: { es6: true, es7: true, minify: true, autoPrefixWXSS: true },
    });

    console.log('\n✅ 上传成功！');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`\n❌ 上传失败: ${err.message}`);
    process.exit(1);
  }
}

main();