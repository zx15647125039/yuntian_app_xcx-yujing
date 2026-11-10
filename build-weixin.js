const fs = require('fs');
const path = require('path');

function buildWeixinApp() {
  try {
    // 读取pages.json
    let pagesJsonContent = fs.readFileSync('./pages.json', 'utf8');
    // 移除JSON中的注释
    pagesJsonContent = pagesJsonContent.replace(/\/\/.*$/gm, '');
    const pagesJson = JSON.parse(pagesJsonContent);

    // 创建app.json
    const appJson = {
      pages: pagesJson.pages.map(page => page.path),
      subPackages: pagesJson.subPackages || [],
      window: pagesJson.globalStyle || {},
      tabBar: pagesJson.tabBar || {},
      usingComponents: {},
      permission: {
        "scope.userLocation": {
          desc: "您的位置信息将用于隐患上报时选择真实地理位置"
        }
      },
      requiredPrivateInfos: [
        "getLocation",
        "chooseLocation"
      ]
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
  <view class="title">${page.style?.navigationBarTitleText || '页面'}</view>
  <view>页面内容</view>
</view>`;
      fs.writeFileSync(path.join(pageDir, `${path.basename(pagePath)}.wxml`), wxmlContent);
      
      // 创建基本的js文件
      const jsContent = `Page({
  data: {
    title: '${page.style?.navigationBarTitleText || '页面'}'
  },
  onLoad(options) {
    console.log('页面加载', options);
  },
  onShow() {
    console.log('页面显示');
  }
});`;
      fs.writeFileSync(path.join(pageDir, `${path.basename(pagePath)}.js`), jsContent);
      
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
      fs.writeFileSync(path.join(pageDir, `${path.basename(pagePath)}.wxss`), wxssContent);
      
      // 创建基本的json文件
      const jsonContent = JSON.stringify({
        navigationBarTitleText: page.style?.navigationBarTitleText || '页面',
        usingComponents: {}
      }, null, 2);
      fs.writeFileSync(path.join(pageDir, `${path.basename(pagePath)}.json`), jsonContent);
    });

    // 创建app.js
    const appJsContent = `App({
  onLaunch(options) {
    console.log('小程序初始化', options);
  },
  onShow(options) {
    console.log('小程序显示', options);
  },
  globalData: {
    userInfo: null
  }
});`;
    fs.writeFileSync(path.join(outputDir, 'app.js'), appJsContent);

    // 创建app.wxss
    const appWxssContent = `page {
  background-color: #EBECF0;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}`;
    fs.writeFileSync(path.join(outputDir, 'app.wxss'), appWxssContent);

    // 创建project.config.json（如果不存在）
    const projectConfigPath = path.join(outputDir, 'project.config.json');
    if (!fs.existsSync(projectConfigPath)) {
      const projectConfig = {
        description: "观天下小程序-派单与隐患上报",
        packOptions: {
          ignore: []
        },
        setting: {
          urlCheck: false,
          es6: true,
          enhance: true,
          postcss: true,
          preloadBackgroundData: false,
          minified: true,
          newFeature: false,
          coverView: true,
          nodeModules: false,
          autoAudits: false,
          showShadowRootInWxmlPanel: true,
          scopeDataCheck: false,
          uglifyFileName: false,
          checkInvalidKey: true,
          checkSiteMap: true,
          uploadWithSourceMap: true,
          compileHotReLoad: false,
          useMultiFrameRuntime: true,
          useApiHook: true,
          useApiHostProcess: true
        },
        compileType: "miniprogram",
        libVersion: "2.24.0",
        appid: "wx0485359fffbe84b6",
        projectname: "GuanTianXia",
        condition: {}
      };
      fs.writeFileSync(projectConfigPath, JSON.stringify(projectConfig, null, 2));
    }

    // 创建sitemap.json（微信要求）
    const sitemapContent = {
      desc: "关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/framework/sitemap.html",
      rules: [{
        action: "allow",
        page: "*"
      }]
    };
    fs.writeFileSync(path.join(outputDir, 'sitemap.json'), JSON.stringify(sitemapContent, null, 2));

    console.log('✅ 小程序构建完成！');
    console.log('📁 输出目录:', path.resolve(outputDir));
    
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

// 运行构建
buildWeixinApp();