<template>
	<view>
		<view class="filter-container" v-if="!filterVisiable">
			<!-- 下拉框多选 listQuery.country 为true, class 为 select + selected 
			@tap 比 @click 更敏感是 uni-app 特有的指令，可以更快地响应用户的触摸操作 -->
			<view class="item">
				<view :class="['select', listQuery.country.length > 0 ? 'selected' : '']"
					@tap="handleMultiple(countrySelectMultiple, listQuery.country)">
					{{listQuery.country.length > 0 ? listQuery.country.toString() : '国家'}}
				</view>
				<!-- 模拟清除按钮 -->
				<uni-icons v-if="listQuery.country.length > 0" type="clear" size="22" color="#999" class="close-btn"
					@tap="clearSelection(countrySelectMultiple, 'country')"></uni-icons>
				<uni-icons v-else type="down" size="15" color="#999" class="close-btn"
					@tap="handleMultiple(countrySelectMultiple, listQuery.country)"></uni-icons>

				<!-- 多选组件 -->
				<curry-multi-select title="请选择" :show="countrySelectMultiple.show" :columns="countrySelectMultiple.columns"
					:defaultIndex="countrySelectMultiple.index"
					@confirm="confirmMultiple(countrySelectMultiple, 'country', $event)"
					@cancel="countrySelectMultiple.show = false"></curry-multi-select>
			</view>
			
			<!-- offer名称单选 -->
			<view class="item">
				<view :class="['select', listQuery.offerName != '' ? 'selected' : '']"
					@tap="handleMultiple(offerNameSelectMultiple, listQuery.offerName)">
					{{listQuery.offerName != ''? listQuery.offerName : 'offer名称'}}
				</view>
				<uni-icons v-if="listQuery.offerName != ''" type="clear" size="22" color="#999" class="close-btn"
					@tap="clearSelection(offerNameSelectMultiple, 'offerName')"></uni-icons>
				<uni-icons v-else type="down" size="15" color="#999" class="close-btn"
					@tap="handleMultiple(offerNameSelectMultiple, listQuery.offerName)"></uni-icons>
			
				<curry-multi-select title="请选择" :show="offerNameSelectMultiple.show" :columns="offerNameSelectMultiple.columns"
					:defaultIndex="offerNameSelectMultiple.index"
					:isMultiSelect="false"
					@confirm="confirmMultiple(offerNameSelectMultiple, 'offerName', $event)"
					@cancel="offerNameSelectMultiple.show = false"></curry-multi-select>
			</view>
		</view>
		
		<!-- 筛选框按钮 -->
		<view>
			<uni-button style="margin-left: 10px;" type="primary" size="mini" plain="true"
				@click="filterVisiable = !filterVisiable">
				<uni-icons :type="!filterVisiable ? 'eye' : 'eye-slash'" size="mini" style="margin-right: 5px;"
					color="#2979ff"></uni-icons>
				筛选
			</uni-button>

			<uni-button style="margin-left: 10px;" type="primary" size="mini" @click="getList()">
				<uni-icons :type="listLoading ? 'spinner-cycle' : 'search'" size="mini" style="margin-right: 5px;"
					color="white"></uni-icons>
				搜索
			</uni-button>
			
			<uni-button v-if="selectedRowIds.length > 0" style="margin-left: 10px;" type="warn" size="mini" @click="multiUpdateOffer(1)">
				批量开启
			</uni-button>
			
			<uni-button v-if="selectedRowIds.length > 0" style="margin-left: 10px;" type="warn" size="mini" @click="multiUpdateOffer(0)">
				批量关闭
			</uni-button>
			
		</view>
		
		<!-- 提示窗 -->
		<view>
			<!-- 确认对话弹窗 -->
			<uni-popup ref="alertDialog" type="dialog">
				<uni-popup-dialog :type="msgType" cancelText="取消" confirmText="确认" title="操作" :content="content" @confirm="dialogConfirm"
					@close="dialogClose"></uni-popup-dialog>
			</uni-popup>
			<!-- 提示信息弹窗 -->
			<uni-popup ref="message" type="message">
				<uni-popup-message :type="msgType" :message="messageText" :duration="2000"></uni-popup-message>
			</uni-popup>
			<!-- 提示操作失败 -->
			<uni-popup ref="errMsg" type="message">
				<uni-popup-message type="error" message="操作失败" :duration="2000"></uni-popup-message>
			</uni-popup>
		</view>

		<view class="table-box"  :style="listLoading ? 'overflow: hidden;' : 'overflow: auto;'">

			<table id="CustomTable" ref="CustomTable" cellspacing="0px" cellpadding="0px">
				<thead>
					<tr class="table-new-line" >
						<th class="hold1 zd">
						    <checkbox :checked="!allSelected" @click="selectAllRows"  backgroundColor="#ffffff" style="transform:scale(0.7)" />
						</th>
						<th class="hold1 zd" style="width: 80px;">姓名</th>
						<th style="text-align: center; vertical-align: middle;">
						    <div style="display: flex; flex-direction: row; align-items: center;justify-content: center;">
						        年龄
						        <div style="display: flex; flex-direction: column; align-items: center;margin-left: 3px;">
						            <uni-icons type="up" size="10" @click="sortByAge(0)"></uni-icons>
						            <uni-icons type="down" size="10" @click="sortByAge(1)"></uni-icons>
						        </div>
						    </div>
						</th>
						<th style="text-align: center; vertical-align: middle;">
						    <div style="display: flex; flex-direction: row; align-items: center;justify-content: center;">
						        语文
						        <div style="display: flex; flex-direction: column; align-items: center;margin-left: 3px;">
						            <uni-icons type="up" size="10" @click="sortByChinese(0)"></uni-icons>
						            <uni-icons type="down" size="10" @click="sortByChinese(1)"></uni-icons>
						        </div>
						    </div>
						</th>
						<th>数学</th>
						<th>英语</th>
						<th>政治</th>
						<th>历史</th>
						<th>地理</th>
						<th>物理</th>
						<th>化学</th>
						<th>生物</th>
					</tr>
				</thead>
				<view v-if="listLoading" class="loading-indicator" style="font-size: 20px;">
				          加载中...
				</view>
				<tbody>
					<tr class="table-new-line" v-for="(item, index) in list" :key="index">
						<td>
							<checkbox :checked="selectedRows[index]" @click="selectRow(index)" backgroundColor="#ffffff" style="transform:scale(0.7)" />
						</td>
						<td>{{ item.name }}</td>
						<td>{{ item.age }}</td>
						<td>{{ item.chinese }}</td>
						<td>{{ item.math }}</td>
						<td>{{ item.english }}</td>
						<td>{{ item.politics }}</td>
						<td>{{ item.history }}</td>
						<td>{{ item.geography }}</td>
						<td>{{ item.physics }}</td>
						<td>{{ item.chemical }}</td>
						<td>{{ item.biology }}</td>
					</tr>
					<tr class="bottom-row">
						<td style="z-index: 1;background-color: skyblue">-</td>
						<td style="z-index: 1;background-color: skyblue">合计</td>
						<td>{{totalObj.chinese}}</td>
						<td>{{totalObj.math}}</td>
						<td>{{totalObj.english}}</td>
						<td>-</td>
						<td>-</td>
						<td>-</td>
						<td>-</td>
						<td>-</td>
						<td>-</td>
						<td>-</td>
					</tr>
				</tbody>
			</table>
		</view>
	</view>
</template>


<script>
	
	export default {
		data() {
			return {
				countrySelectMultiple: {
					show: false,
					index: [],
					columns: [
						{
							"label": "印尼",
							"value": "id"
						},
						{
							"label": "中国",
							"value": "cn"
						},
						{
							"label": "日本",
							"value": "jp"
						},
						{
							"label": "马来西亚",
							"value": "my"
						},
						{
							"label": "美国",
							"value": "usa"
						}
					]
				},
				offerNameSelectMultiple: {
					show: false,
					index: [],
					columns: [
						{
							"label": "offer1",
							"value": "1"
						},
						{
							"label": "offer2",
							"value": "2"
						},
						{
							"label": "offer3",
							"value": "3"
						},
					]
				},
				listQuery: {
					country: [],
					offerName: ''
				},
				selectedRows: [], // 存储选中的行数据
			    selectedRowIds: [], // 存储选中的行的id
				allSelected: true,
				filterVisiable: false,
				msgType: 'success',
				messageText: '消息提示',
				content: '对话框内容',
				listLoading: false,
				list: [],
				totalObj: {
					chinese: 0,
					math: 0,
					english: 0
				}
			}
		},
		onLoad() {
		},
		methods: {
			multiUpdateOffer(type) {
				if (type === 1) {
					this.content = '是否确认批量开启!'
					this.messageText = '批量开启成功'
				} else {
					this.content = '是否确认批量关闭!'
					this.messageText = '批量关闭成功'
				}
				this.$refs.alertDialog.open()
			},
			dialogConfirm() {
				let status = this.messageText === '批量关闭成功' ? 0 : 1;
				this.$refs.message.open()
				this.getList()
			},
			dialogClose() {
				console.log('点击关闭')
			},
			selectRow(index) {
			  // 使用splice直接修改数组中的元素(响应式更新问题：在Vue中直接修改数组的某个索引可能不会触发响应式更新)  this.selectedRows[index] = !this.selectedRows[index];这样会有bug导致渲染不及时 
			  this.selectedRows.splice(index, 1, !this.selectedRows[index]);

			  // 更新选中行的ID列表
			  const id = this.list[index].id;
			  const idIndex = this.selectedRowIds.indexOf(id);
			  if (this.selectedRows[index]) {
				if (idIndex === -1) {
				  this.selectedRowIds.push(id);
				}
			  } else {
				if (idIndex !== -1) {
				  // 更新全选状态
				  this.allSelected = true
				  this.selectedRowIds.splice(idIndex, 1);
				}
			  }
			  console.log(this.selectedRowIds)
			},
			selectAllRows() {
			  // 处理全选逻辑
			  this.allSelected = !this.allSelected;
			  this.selectedRows = this.list.map(() => !this.allSelected);
			  this.selectedRowIds = !this.allSelected ? this.list.map(row => row.id) : [];
			  console.log(this.selectedRowIds)
			},
			sortByAge(type) {
				if (type === 0) {
					// 升序
					this.list = this.list.sort((a, b) => (a.age > b.age) ? 1 : -1);
				} else {
					this.list = this.list.sort((a, b) => (a.age < b.age) ? 1 : -1);
				}
			},
			sortByChinese(type) {
				if (type === 0) {
					// 升序
					this.list = this.list.sort((a, b) => (a.chinese > b.chinese) ? 1 : -1);
				} else {
					this.list = this.list.sort((a, b) => (a.chinese < b.chinese) ? 1 : -1);
				}
			},
			clearSelection(selectMultiple, prop) {
				// 阻止事件冒泡
				selectMultiple.index = []
				if (prop === 'country') {
					this.listQuery.country = [];
				} else if (prop === 'offerName') {
					this.listQuery.offerName = '';
				}
			},
			handleMultiple(selectMultiple, val) {
				console.log(val)
				if (typeof val === 'string') {
					let arr = [];
					if (val !== '') {
						arr.push(val)
					}
				    selectMultiple.index = arr;
				} else {
					selectMultiple.index = val || [];
				}
				selectMultiple.show = true;
			},
			confirmMultiple(selectMultiple, prop, e) {
				// 直接传递 this.listQuery.country 属性过来无法绑定 country 值, 传递的是副本不是引用只能修改 listQuery 对象
				if (prop === 'country') {
					this.listQuery.country = [];
					e.value.forEach(item => {
						this.listQuery.country.push(item);
					})
				} else if (prop === 'offerName') {
					this.listQuery.offerName = '';
					this.listQuery.offerName = e.value[0]
				}
				selectMultiple.show = false;
			},
			getList() {
				this.listLoading = true
				  this.list = [
{"id":"fddeb185-5109-416c-9fa9-2a1c5b92c0b6", "name":"C", "age":8, "chinese":50, "math":26, "english":23, "politics":85, "history":63, "geography":48, "physics":89, "chemical":90, "biology":92},
{"id":"93bc1603-8b46-4a08-9504-0c9698ac8d8d", "name":"A", "age":11, "chinese":67, "math":40, "english":57, "politics":76, "history":81, "geography":46, "physics":98, "chemical":41, "biology":51},
{"id":"cceff90c-4077-4b6d-88a1-37db35a9a35e", "name":"C", "age":17, "chinese":72, "math":75, "english":15, "politics":18, "history":40, "geography":85, "physics":12, "chemical":78, "biology":34},
{"id":"b7fde243-5050-4124-b06f-ac625ca489f2", "name":"A", "age":15, "chinese":90, "math":18, "english":83, "politics":31, "history":55, "geography":89, "physics":58, "chemical":99, "biology":11},
{"id":"435aafbc-b27f-4bde-a7e1-82c8a1ab9d55", "name":"A", "age":16, "chinese":61, "math":44, "english":84, "politics":72, "history":19, "geography":64, "physics":14, "chemical":61, "biology":77},
{"id":"79e9f42e-b343-4bdf-9871-6f015765e7f8", "name":"C", "age":12, "chinese":29, "math":77, "english":89, "politics":54, "history":97, "geography":63, "physics":57, "chemical":76, "biology":38},
{"id":"fa1dfefe-22d0-464e-9445-0c3572000398", "name":"C", "age":10, "chinese":90, "math":38, "english":24, "politics":78, "history":74, "geography":66, "physics":11, "chemical":38, "biology":34},
{"id":"ebe9c25c-e64e-41ca-9fc5-3deddae776de", "name":"C", "age":11, "chinese":80, "math":11, "english":40, "politics":61, "history":23, "geography":62, "physics":61, "chemical":83, "biology":57},
{"id":"36ab7cfa-3332-4261-b342-5b92e3158fe4", "name":"B", "age":9, "chinese":46, "math":19, "english":23, "politics":15, "history":72, "geography":88, "physics":94, "chemical":49, "biology":46},
{"id":"cc37ff20-5839-4437-9ae2-86984e7f8a43", "name":"C", "age":13, "chinese":27, "math":23, "english":87, "politics":65, "history":56, "geography":34, "physics":30, "chemical":97, "biology":34},
{"id":"244c53ba-f1c4-458d-9550-c15e053a8bb8", "name":"B", "age":17, "chinese":32, "math":46, "english":83, "politics":59, "history":36, "geography":46, "physics":75, "chemical":94, "biology":65},
{"id":"34e229bd-8b18-4708-a7ea-943e3ddaac86", "name":"C", "age":9, "chinese":21, "math":29, "english":88, "politics":65, "history":22, "geography":41, "physics":72, "chemical":18, "biology":44},
{"id":"d59ea8d0-226b-4429-930e-f297e9c90bfe", "name":"A", "age":15, "chinese":17, "math":41, "english":36, "politics":56, "history":92, "geography":71, "physics":87, "chemical":95, "biology":67},
{"id":"b508a834-2554-4e93-8f32-61375ed55e40", "name":"C", "age":16, "chinese":46, "math":99, "english":74, "politics":65, "history":75, "geography":99, "physics":38, "chemical":49, "biology":37},
{"id":"2bf8d5b4-5377-4db5-b083-4d08ac924b2d", "name":"B", "age":12, "chinese":95, "math":87, "english":63, "politics":56, "history":36, "geography":96, "physics":70, "chemical":50, "biology":21},
{"id":"86e5a538-21ec-4ec1-af41-269087ebb841", "name":"C", "age":16, "chinese":70, "math":27, "english":81, "politics":66, "history":71, "geography":84, "physics":47, "chemical":29, "biology":72},
{"id":"8698209d-e5ae-4ec1-aae7-df3bbe00bce5", "name":"A", "age":14, "chinese":34, "math":48, "english":71, "politics":90, "history":26, "geography":58, "physics":58, "chemical":71, "biology":34},
{"id":"220eae87-f1a6-40bb-ad7e-acdb05d1f123", "name":"C", "age":15, "chinese":59, "math":86, "english":82, "politics":63, "history":76, "geography":12, "physics":61, "chemical":67, "biology":19},
{"id":"64952880-e9e2-472a-b34c-246b62ff6f28", "name":"C", "age":16, "chinese":87, "math":88, "english":79, "politics":74, "history":31, "geography":45, "physics":97, "chemical":46, "biology":93},
{"id":"571cd215-7b08-4b2b-a7db-70dad11bab7b", "name":"C", "age":12, "chinese":28, "math":87, "english":83, "politics":26, "history":42, "geography":36, "physics":65, "chemical":64, "biology":65},
{"id":"ebd3955d-8c43-47f6-83cf-0b6032cc5835", "name":"B", "age":13, "chinese":69, "math":80, "english":37, "politics":84, "history":88, "geography":65, "physics":50, "chemical":17, "biology":63},
{"id":"939992f4-8ffa-4993-bb4b-fd6864abaf87", "name":"B", "age":10, "chinese":81, "math":98, "english":96, "politics":85, "history":91, "geography":94, "physics":92, "chemical":34, "biology":16},
{"id":"ad0923d3-8ecf-40a3-9271-e5face789aa0", "name":"A", "age":13, "chinese":42, "math":88, "english":49, "politics":89, "history":54, "geography":84, "physics":72, "chemical":33, "biology":33},
{"id":"b36e071c-a328-459c-b040-4a28b810b58e", "name":"C", "age":16, "chinese":78, "math":32, "english":21, "politics":69, "history":61, "geography":89, "physics":19, "chemical":90, "biology":69},
{"id":"58a65e7e-4cb5-4a43-9efe-9002cce98722", "name":"A", "age":10, "chinese":31, "math":16, "english":97, "politics":53, "history":36, "geography":40, "physics":44, "chemical":95, "biology":77},
{"id":"ba522699-fbd6-46e1-a9cb-22badf8e262c", "name":"A", "age":14, "chinese":87, "math":84, "english":60, "politics":79, "history":68, "geography":42, "physics":49, "chemical":21, "biology":61},
{"id":"eae8cb0d-9d6e-4383-8bf5-11b02a5a7db7", "name":"A", "age":16, "chinese":86, "math":84, "english":81, "politics":32, "history":51, "geography":13, "physics":38, "chemical":26, "biology":88},
{"id":"8b30da57-f894-4c03-bfc1-5e1792890603", "name":"B", "age":14, "chinese":41, "math":58, "english":93, "politics":76, "history":50, "geography":90, "physics":10, "chemical":72, "biology":79},
{"id":"6188dbc3-63c0-44ed-b1ba-e14658764b2d", "name":"B", "age":13, "chinese":76, "math":50, "english":12, "politics":93, "history":69, "geography":23, "physics":81, "chemical":59, "biology":54},
{"id":"2821bfe5-0826-47dc-bbea-cc2363823cd9", "name":"A", "age":11, "chinese":99, "math":44, "english":60, "politics":48, "history":67, "geography":58, "physics":57, "chemical":84, "biology":96},
{"id":"8046283b-0522-439e-8abf-6f28dd2d00eb", "name":"B", "age":9, "chinese":91, "math":42, "english":72, "politics":29, "history":23, "geography":74, "physics":96, "chemical":84, "biology":33},
{"id":"63258353-5411-431c-9a46-c9dee358b750", "name":"B", "age":9, "chinese":69, "math":42, "english":97, "politics":32, "history":39, "geography":56, "physics":40, "chemical":89, "biology":79},
{"id":"c92e7898-a239-413c-8cf7-b685ea4aa0c0", "name":"A", "age":13, "chinese":91, "math":83, "english":18, "politics":53, "history":74, "geography":83, "physics":34, "chemical":49, "biology":16},
{"id":"e02efc2a-0f40-4296-b654-505d1a35ff1e", "name":"A", "age":14, "chinese":87, "math":88, "english":83, "politics":40, "history":69, "geography":92, "physics":91, "chemical":65, "biology":71},
{"id":"6edad4b1-a35d-43fc-99df-25763960021b", "name":"A", "age":8, "chinese":52, "math":16, "english":16, "politics":78, "history":14, "geography":93, "physics":47, "chemical":78, "biology":16},
{"id":"b8525f0b-ab10-4c98-b617-bc18516a7d40", "name":"A", "age":17, "chinese":24, "math":16, "english":92, "politics":16, "history":58, "geography":13, "physics":33, "chemical":56, "biology":19},
{"id":"ec374776-07f9-4850-8ede-9ffc5e438987", "name":"C", "age":14, "chinese":20, "math":90, "english":35, "politics":77, "history":89, "geography":14, "physics":85, "chemical":33, "biology":20},
{"id":"d0be13cf-da22-4f8d-9ed1-fbf5bd14fcab", "name":"B", "age":8, "chinese":89, "math":19, "english":94, "politics":82, "history":91, "geography":52, "physics":73, "chemical":51, "biology":51},
{"id":"31d0dc9a-fac7-45f5-9a55-a790b539e715", "name":"A", "age":17, "chinese":70, "math":60, "english":16, "politics":42, "history":31, "geography":23, "physics":26, "chemical":37, "biology":77},
{"id":"5a73be06-883b-4d07-a331-8b7f5de2f429", "name":"A", "age":17, "chinese":77, "math":54, "english":92, "politics":29, "history":90, "geography":19, "physics":38, "chemical":80, "biology":47},
{"id":"9fc8a245-44e9-47c7-8a56-131d9ef9bfa6", "name":"C", "age":14, "chinese":90, "math":19, "english":72, "politics":84, "history":31, "geography":98, "physics":22, "chemical":43, "biology":37},
{"id":"76685268-71bb-4f4b-b91b-c3267630bfde", "name":"C", "age":10, "chinese":72, "math":24, "english":58, "politics":66, "history":24, "geography":52, "physics":18, "chemical":11, "biology":94},
{"id":"c160bf41-43d0-4d57-9417-942a6fa545f3", "name":"A", "age":9, "chinese":45, "math":43, "english":52, "politics":83, "history":97, "geography":66, "physics":73, "chemical":77, "biology":38},
{"id":"1a44a6bd-5502-49b1-835a-ebcb8cadb650", "name":"C", "age":11, "chinese":73, "math":11, "english":83, "politics":41, "history":48, "geography":26, "physics":91, "chemical":73, "biology":13},
{"id":"65ad0d7c-bad8-44f3-94b4-6d4fdb047b82", "name":"C", "age":13, "chinese":11, "math":67, "english":54, "politics":28, "history":87, "geography":96, "physics":22, "chemical":54, "biology":27},
{"id":"7277cdb1-2f1c-4272-8a94-8ac96405f74a", "name":"A", "age":16, "chinese":62, "math":66, "english":79, "politics":40, "history":73, "geography":17, "physics":51, "chemical":93, "biology":67},
{"id":"0d592a7a-2e14-4990-8e62-8546987c7db8", "name":"B", "age":11, "chinese":14, "math":60, "english":38, "politics":69, "history":96, "geography":59, "physics":90, "chemical":78, "biology":13},
{"id":"9a4e2094-b067-49e1-9825-be46a472934b", "name":"A", "age":13, "chinese":67, "math":90, "english":25, "politics":80, "history":79, "geography":98, "physics":13, "chemical":78, "biology":30},
{"id":"09e37dbd-7c59-462c-8b6e-328952588632", "name":"A", "age":17, "chinese":66, "math":59, "english":40, "politics":37, "history":47, "geography":77, "physics":19, "chemical":83, "biology":66},
{"id":"81ad2d22-ae3b-4856-bfb5-3152365cfa74", "name":"A", "age":11, "chinese":93, "math":57, "english":69, "politics":67, "history":70, "geography":25, "physics":55, "chemical":34, "biology":45},
{"id":"3626c562-a0e6-4a16-bff5-6365454c8a28", "name":"A", "age":11, "chinese":58, "math":70, "english":55, "politics":26, "history":71, "geography":56, "physics":87, "chemical":13, "biology":98},
{"id":"d5610c1e-8ee7-41aa-a54a-3d2be2431003", "name":"B", "age":16, "chinese":68, "math":28, "english":90, "politics":19, "history":27, "geography":37, "physics":29, "chemical":64, "biology":44},
{"id":"d8d8d0d6-b8f7-437e-8568-45efd9bf54a7", "name":"B", "age":8, "chinese":42, "math":39, "english":25, "politics":81, "history":15, "geography":66, "physics":30, "chemical":57, "biology":44},
{"id":"b81adf32-991b-4bb1-85af-eb4d697d79b2", "name":"C", "age":11, "chinese":95, "math":37, "english":37, "politics":35, "history":17, "geography":39, "physics":18, "chemical":86, "biology":39},
{"id":"d0e7b700-cb0d-4944-9008-94eb2bd796e8", "name":"B", "age":14, "chinese":56, "math":61, "english":20, "politics":29, "history":20, "geography":81, "physics":95, "chemical":67, "biology":94},
{"id":"f19aa7d6-85e9-4893-b626-9940483b48da", "name":"C", "age":17, "chinese":12, "math":53, "english":10, "politics":11, "history":66, "geography":75, "physics":66, "chemical":19, "biology":23},
{"id":"476132f0-4169-462b-8867-abf8c76a49c5", "name":"A", "age":16, "chinese":15, "math":75, "english":52, "politics":28, "history":53, "geography":73, "physics":71, "chemical":65, "biology":86},
{"id":"3dd635ae-9b08-4f2c-ab20-833735ed93e1", "name":"A", "age":14, "chinese":25, "math":74, "english":22, "politics":46, "history":43, "geography":29, "physics":10, "chemical":80, "biology":32},
{"id":"1ee5e3fd-e632-47ee-85d1-3af2cae1f281", "name":"B", "age":9, "chinese":65, "math":80, "english":19, "politics":93, "history":37, "geography":22, "physics":16, "chemical":37, "biology":91},
{"id":"c322a1fa-6202-4b34-bbf6-fceddb2ca033", "name":"A", "age":12, "chinese":48, "math":73, "english":94, "politics":44, "history":81, "geography":89, "physics":64, "chemical":16, "biology":19},
{"id":"75ad49c4-08aa-40fc-969f-aa9a86b6adfe", "name":"C", "age":11, "chinese":35, "math":36, "english":49, "politics":92, "history":24, "geography":58, "physics":62, "chemical":78, "biology":51},
{"id":"71047308-b9f2-431c-a39e-6f2be2632cab", "name":"B", "age":16, "chinese":67, "math":42, "english":45, "politics":45, "history":26, "geography":84, "physics":92, "chemical":78, "biology":26},
{"id":"db8dd373-6737-4ba1-9295-073a0a25e293", "name":"C", "age":15, "chinese":17, "math":14, "english":56, "politics":23, "history":79, "geography":47, "physics":39, "chemical":38, "biology":74},
{"id":"72691de0-56b6-4c9c-8537-656a2cfb2eab", "name":"C", "age":13, "chinese":91, "math":55, "english":29, "politics":70, "history":32, "geography":94, "physics":51, "chemical":81, "biology":48},
{"id":"da0bea23-45ad-4e7f-a957-ae930f7d4a15", "name":"B", "age":10, "chinese":92, "math":59, "english":18, "politics":23, "history":66, "geography":56, "physics":70, "chemical":59, "biology":22},
{"id":"c797ddbd-4518-4d1c-830d-2c956d7d3b65", "name":"C", "age":13, "chinese":41, "math":91, "english":66, "politics":89, "history":72, "geography":59, "physics":43, "chemical":21, "biology":38},
{"id":"565bdbd5-0b2e-4fec-9293-2c14cd70f8d4", "name":"B", "age":9, "chinese":62, "math":75, "english":18, "politics":21, "history":65, "geography":39, "physics":18, "chemical":90, "biology":15},
{"id":"3e0b88a2-cb6e-4f38-8911-93c807272ecd", "name":"C", "age":17, "chinese":37, "math":37, "english":15, "politics":41, "history":94, "geography":88, "physics":73, "chemical":97, "biology":26},
{"id":"f33cf8db-158f-4727-b384-93578082f2f7", "name":"B", "age":10, "chinese":66, "math":46, "english":38, "politics":85, "history":11, "geography":94, "physics":74, "chemical":13, "biology":66},
{"id":"7965831f-4055-4909-a124-d028ca34e042", "name":"C", "age":11, "chinese":85, "math":22, "english":53, "politics":66, "history":70, "geography":79, "physics":14, "chemical":61, "biology":96},
{"id":"656b9b33-2479-47ec-85e0-1e87f6d9f428", "name":"C", "age":15, "chinese":59, "math":51, "english":63, "politics":57, "history":90, "geography":66, "physics":57, "chemical":53, "biology":55},
{"id":"5f59cc91-9d49-4e84-90e6-4213409b60b7", "name":"C", "age":12, "chinese":33, "math":70, "english":64, "politics":94, "history":24, "geography":96, "physics":75, "chemical":23, "biology":62},
{"id":"60283283-e17a-4c32-a7d5-32d0ce87f559", "name":"B", "age":13, "chinese":29, "math":27, "english":39, "politics":19, "history":17, "geography":85, "physics":35, "chemical":63, "biology":94},
{"id":"99e60ded-7203-41ba-b44c-4e442001560d", "name":"B", "age":17, "chinese":86, "math":95, "english":79, "politics":10, "history":18, "geography":15, "physics":23, "chemical":32, "biology":40},
{"id":"32df7a44-47ec-45da-ad47-978ce7bb8ec0", "name":"B", "age":10, "chinese":83, "math":89, "english":42, "politics":68, "history":35, "geography":44, "physics":69, "chemical":35, "biology":14},
{"id":"f4e957d4-89a6-4d91-982d-4d36c04d2aa4", "name":"A", "age":12, "chinese":81, "math":14, "english":80, "politics":19, "history":66, "geography":84, "physics":80, "chemical":83, "biology":98},
{"id":"43680dc8-d2ae-4468-aa63-a22b4f4566f0", "name":"C", "age":12, "chinese":86, "math":59, "english":59, "politics":21, "history":64, "geography":34, "physics":95, "chemical":66, "biology":64},
{"id":"db960d6b-601e-4ca9-9143-2fa08e3770ae", "name":"A", "age":15, "chinese":99, "math":28, "english":82, "politics":74, "history":32, "geography":87, "physics":78, "chemical":53, "biology":20},
{"id":"c0383b71-87f7-45a8-a075-3485599dcb71", "name":"A", "age":8, "chinese":21, "math":37, "english":46, "politics":54, "history":16, "geography":59, "physics":49, "chemical":11, "biology":21},
{"id":"1a25f6b4-a40a-4f57-8d06-adbf8e3f6382", "name":"B", "age":9, "chinese":27, "math":55, "english":16, "politics":82, "history":87, "geography":64, "physics":97, "chemical":64, "biology":30}]
				  this.selectedRows = this.list.map(() => false);
				  this.getSummaries(this.list);
				  this.listLoading = false
				
			},
			getSummaries(list) {
				// 需要计算合计的属性
				const totalList = {
					chinese: 0,
					math: 0,
					english: 0
				};
				for (var i = 0; i < list.length; i++) {
				  var item = list[i];
				  for (var key in totalList) {
				    if (totalList.hasOwnProperty(key) && item.hasOwnProperty(key)) {
				      totalList[key] += parseFloat(item[key]);
				    }
				  }
				}
				// 在需要显示时，将总和值格式化为两位小数的字符串
				for (var key in totalList) {
				  if (totalList.hasOwnProperty(key)) {
				    totalList[key] = totalList[key].toFixed(2);
				  }
				}
				this.totalObj = totalList
			}
		}
	}
</script>


<style>

	.uni-group {
		display: flex;
		align-items: center;
	}

	.filter-container {
		background-color: white;
		margin: 10px;
	}

	.item {
		width: 100%;
		padding: 10rpx 0;
		position: relative;
		/* 添加这行，为 .close-btn 提供定位上下文 */
		display: flex;
		/* 使用flex布局来水平排列 .select 和 .close-btn */
		align-items: center;
		/* 垂直居中子元素 */

		.select {
			flex-grow: 1;
			/* .select 占据剩余空间 */
			border: 1px solid #dadbde;
			padding-top: 6px;
			padding-bottom: 6px;
			padding-left: 9px;
			padding-right: 9px;
			border-radius: 4px;
			font-size: 12px;
			box-sizing: border-box;
			color: #6a6a6a;
			line-height: 26px;

			&.selected {
				color: black;
				font-size: 15px;
			}
		}

		.close-btn {
			/* width: 10%; 不再需要设置宽度 */
			position: absolute;
			/* 绝对定位 */
			right: 8px;
			/* 右侧定位 */
			top: 50%;
			/* 顶部50%定位 */
			transform: translateY(-50%);
			/* Y轴偏移-50%，确保垂直居中 */
			color: red;
			/* X按钮的颜色 */
			cursor: pointer;
			/* 鼠标悬停时变成手型图标 */
		}
	}
</style>

<style scoped lang="scss">
		.table-box{
			position: relative;
			margin: auto;
            width: 100vw;
            overflow:auto;
            height:70vh;  /* 设置固定高度 视口高度的70% 合计行的展示底部位置*/
        }
        table#CustomTable {
			/* 去除间隔 */
			border-collapse:collapse;
			/* 打开间隔 */
			/* border-collapse : separate; */
            table-layout: fixed;
			text-align:center;
			font-size: 20rpx;
			/* 固定宽度 */
            width: 180rpx;
			height:45rpx;
			thead tr th{
			     position:sticky;
			     top:0; /* 首行固定在头部  */
		    };
			td, th {
			    /* 设置td,th宽度高度 */
				border-width: 0px 0.5px 0.5px 0px; /* 上 右 下 左 */
				border-color: white;
				border-style: solid;
				/* background-color: #ffffff; */
				width: 100rpx;
			    height:55rpx;
			};
			th {
				z-index: 0;
			    background-color:#ecf5ff;
			};
			// 固定首列
			th:nth-child(1), td:nth-child(1){
				position:sticky;
				left:0;
				z-index:1;
				width: 50rpx;
				background-color: #c7e2d5; 
			}
			th:nth-child(2), td:nth-child(2){
				position:sticky;
				left:50rpx;
				z-index:1;
				width: 180rpx;
				background-color: #c7e2d5; 
			}
			th.zd{
				 z-index:2;
			}
        }

		.table-new-line{
			overflow : hidden;
			text-overflow: ellipsis;
			word-wrap:break-word;
			word-break:break-all;
		}
		
		.bottom-row {
			background-color: skyblue; 
			position:sticky;
			z-index: 1;
			bottom:0; /* 首行固定在头部  */
		}
		
		/* 样式用于加载状态的占位元素 */
		.loading-indicator {
		  top: 0;
		  left: 0;
		  display: flex;
		  justify-content: center;
		  align-items: center;
		  position: sticky;
		  margin: auto;
		  width: 100vw;
		  overflow:auto;
		  height:100vh;
		  // 设置为3可以实现半透明但是统计框会被遮蔽
		  z-index: 2;
		  background-color: rgba(227, 227, 227, 0.7); /* 半透明背景，可以根据需要调整 */
		}

</style>
