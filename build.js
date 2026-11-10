const fs = require('fs');
const path = require('path');

// 读取pages.json
let pagesJsonContent = fs.readFileSync('./pages.json', 'utf8');
// 移除JSON中的注释
pagesJsonContent = pagesJsonContent.replace(/\/\/.*$/gm, '');
const pagesJson = JSON.parse(pagesJsonContent);

// 创建app.json
const appJson = {
  pages: pagesJson.pages.map(page => page.path),
  subPackages: [],
  window: pagesJson.globalStyle,
  usingComponents: {}
};

// 确保输出目录存在
const outputDir = './unpackage/dist/dev/mp-weixin';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 写入app.json
fs.writeFileSync(path.join(outputDir, 'app.json'), JSON.stringify(appJson, null, 2));

// 为每个页面创建基本文件
pagesJson.pages.forEach(page => {
  const pagePath = page.path;
  const pageDir = path.join(outputDir, pagePath);
  
  // 确保页面目录存在
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  
  // 创建基本的wxml文件
  const wxmlContent = `<view class="container">
  <view class="title">${page.style.navigationBarTitleText}</view>
</view>`;
  fs.writeFileSync(path.join(pageDir, `${pagePath.split('/').pop()}.wxml`), wxmlContent);
  
  // 创建基本的js文件
  const jsContent = `Page({
  data: {
    
  },
  onLoad() {
    
  }
});`;
  fs.writeFileSync(path.join(pageDir, `${pagePath.split('/').pop()}.js`), jsContent);
  
  // 创建基本的wxss文件
  const wxssContent = `.container {
  padding: 20rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
}`;
  fs.writeFileSync(path.join(pageDir, `${pagePath.split('/').pop()}.wxss`), wxssContent);
  
  // 创建基本的json文件
  const jsonContent = JSON.stringify({
    ...page.style,
    usingComponents: {}
  }, null, 2);
  fs.writeFileSync(path.join(pageDir, `${pagePath.split('/').pop()}.json`), jsonContent);
});

// 创建app.js
const appJsContent = `App({
  onLaunch() {
    // 小程序初始化
  },
  globalData: {
    
  }
});`;
fs.writeFileSync(path.join(outputDir, 'app.js'), appJsContent);

// 创建app.wxss
const appWxssContent = `page {
  background-color: #F8F8F8;
}`;
fs.writeFileSync(path.join(outputDir, 'app.wxss'), appWxssContent);

// 创建project.config.json
const projectConfig = {
  description: "云天学堂-学员端",
  packOptions: {
    ignore: []
  },
  setting: {
    bundle: false,
    userConfirmedBundleSwitch: false,
    urlCheck: true,
    scopeDataCheck: false,
    coverView: true,
    es6: true,
    enhance: true,
    showShadowRootInWxmlPanel: true,
    packNpmManually: false,
    packNpmRelationList: [],
    minifyWXSS: true
  },
  compileType: "miniprogram",
  libVersion: "2.24.0",
  appid: "wx0485359fffbe84b6",
  projectname: "MuGuang",
  condition: {}
};
fs.writeFileSync(path.join(outputDir, 'project.config.json'), JSON.stringify(projectConfig, null, 2));

console.log('小程序构建完成！');