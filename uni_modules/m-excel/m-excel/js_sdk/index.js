import xlsx from './xlsx.mini.min.js'


const m_excel = {
	read(){
		let that = this
		return new Promise((resolve,reject)=>{
			let platform = uni.getSystemInfoSync().uniPlatform 
			if(platform != 'mp-weixin' && platform != 'web'){
				resolve({success:0,msg:'仅支持网页和微信小程序小程序 其它端请自行实现',error:''})
			}
			if(platform == 'mp-weixin'){
				 uni.chooseMessageFile({
					 count:1,
					 extension:['xlsx','csv','xls','xlsb','xlsm'],
					 success(e){   
						that.read_file(e.tempFiles[0],(e)=>{
							resolve(e)
						}) 
					 },
					 fail(e){
						 resolve({success:0,msg:'小程序选取文件失败',error:e})
					 }
				 })
			}else{
				 uni.chooseFile({
					count:1,
					extension:['xlsx','csv','xls','xlsb','xlsm'],
					success(e) {
						that.read_file(e.tempFiles[0],(e)=>{
							resolve(e)
						})
					},
					fail(e){
						resolve({success:0,msg:'网页选取文件失败',error:e})
					}
					
				 })
			}
			
			 
		}) 
	},
	 async read_file(file,fun){
		let platform = uni.getSystemInfoSync().uniPlatform
		if(platform =='mp-weixin'){
			 const fs = wx.getFileSystemManager()
			 fs.readFile({
				 filePath:file.path,
				 success(e){ 
						const workbook = xlsx.read(new Uint8Array(e.data), { type: 'array' })
						let list = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) //保持前端一致
						fun({success:1,msg:'读取成功',error:'',data:list})
				 },
				 fail(e){
					 fun({success:0,msg:'读取失败',error:'',data:list}) 
				 }
			 })
		}
		if(platform =='web' || platform =='h5'){
			const data = await file.arrayBuffer(); 
			const workbook = xlsx.read(data); 
			let list = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])  
			fun({success:1,msg:'读取成功',error:'',data:list})
		}  
	},
	put(json,isopen = true){
		let that = this
		return new Promise((resolve,reject)=>{
			
			if(!json || typeof json != 'object'){
				resolve({success:0,msg:'请传入对象数据',error:''})
			}
			
			let platform = uni.getSystemInfoSync().uniPlatform 
			if(platform != 'mp-weixin' && platform != 'web'){
				resolve({success:0,msg:'仅支持网页和微信小程序小程序 其它端请自行实现',error:''})
			}  
			//转换方法 json => sheet
			let mySheet= xlsx.utils.json_to_sheet(json);  
			let workBook = {
			  SheetNames: ['mySheet'],
			  Sheets: { 
			    mySheet
			  },
			  Props: {}
			};
			
			// 组成配置输出
			var workBookOutPotion = {
			  //bookType 工作簿类型
			  bookType: 'xlsx',
			  //bookSST 生成共享字符串表
			  bookSST: false,
			  //type 输出数据编码
			  type: 'array'// ["base64", "binary", "string", "buffer", "file"]
			};
			  
			if(platform == 'mp-weixin'){
				workBookOutPotion['type'] = 'base64'
				workBookOutPotion['bookSST'] = true
				var fileData = xlsx.write(workBook, workBookOutPotion); 
				let filePath = `${wx.env.USER_DATA_PATH}/${new Date().getTime()}.xlsx`
				
				// 写文件
				const fs = wx.getFileSystemManager()
				fs.writeFile({
				  filePath: filePath,
				  data: fileData,
				  encoding: 'base64',
				  bookSST: true,
				  success(e) { 
					const sysInfo = wx.getSystemInfoSync()
					// 导出
					if (sysInfo.platform.toLowerCase().indexOf('windows') >= 0) {
					  // 电脑PC端导出
					  wx.saveFileToDisk({
						filePath: filePath,
						success(e) {
						  resolve({success:1,msg:'导出成功并打开',error:''})
						},
						fail(e) {  
						  resolve({success:1,msg:'导出失败',error:e})
						}
					  })
					} else {
						if(isopen){
							// 手机端导出  打开文档
							wx.openDocument({
								filePath: filePath,
								showMenu: true,
								success: function (e) {
									resolve({success:1,msg:'导出成功并打开',error:''})
								},
								fail(e){
									resolve({success:0,msg:'打开文件失败',error:e}) 
								}
							})
						}else{
							resolve({success:1,msg:'导出成功',error:''})
						} 
					}
			
				  },
				  fail(e) { 
					resolve({success:0,msg:'文档已打开，请先关闭',error:e})  
				  }
				})
				return
			}
			
			
			if(platform == 'web'||platform == 'h5'){ 
				xlsx.writeFile(workBook,  '下载.xlsx' );
				resolve({success:1,msg:'导出成功',error:''})
			} 
			 
		}) 
	}
}

export default m_excel