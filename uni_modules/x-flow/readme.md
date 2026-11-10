# x-flow

#### 参数配置

属性名 | 类型 | 可选值 | 默认值 | 说明
---|:--:|---:|---:|---:
propsOption | Object | | {name: 'name', flowNodeName: 'flowNodeName', status: 'status',date: 'date',remark: 'remark' } |
dotSlot | Boolean | true/false | false | 是否启用自定义圆点
detailsSlot | Boolean | true/false | false | 是否启用自定义描述、详情
setLineColorNextItem | Boolean | true/false | false | setLineColor参数item，是否用下一个item
setDotColor | Function |  |  | 自定义颜色 根据item里面的字段判断圆点显示什么颜色
setLineColor | Function |  |  | 自定义颜色 根据item里面的字段判断线显示什么颜色
setStatusColor | Function |  |  | 自定义颜色 根据item里面的字段判断状态字体显示什么颜色
list | Array |  |  | 数轴条数据，数组
direction | String | column/row | column | 数轴条数据，数组
borderStyle | String |  | solid | css borderStyle 参数
  
# 代码块

```
  <template>
  <view class="page-flow">
    <h2 style="padding: 0 30rpx">流程1</h2>
    <x-flow :list="list"
            direction="row"
            borderStyle="dashed"
            :setDotColor="setDotColor"
            :setStatusColor="setDotColor"
            :setLineColor="setLineColor"></x-flow>

    <h2 style="padding: 0 30rpx">流程2</h2>
    <x-flow :list="list1"
            :setDotColor="setDotColor"
            borderStyle="dashed"
            :setStatusColor="setDotColor"
            :setLineColor="setLineColor"></x-flow>

    <h2 style="padding: 0 30rpx">流程3</h2>
    <x-flow :list="list2"
            :setDotColor="setDotColor"
            :setStatusColor="setDotColor"
            :setLineColor="setLineColor"></x-flow>
  </view>
</template>

<script>
import XFlow from '../uni_modules/x-flow/components/x-flow/x-flow';

export default {
  components: {XFlow},
  data() {
    return {
      list: [
        {
          name: '张三',
          flowNodeName: '发起人',
          status: '(已通过)',
          date: '2023-04-13 11:00:00',
        },
        {
          name: '张三',
          flowNodeName: '发起人',
          status: '(已通过)',
          date: '2023-04-13 11:00:00',
        },
        {
          name: '张三三张三三',
          flowNodeName: '审批人',
          status: '(已通过)',
          date: '2023-04-13 11:00:00',
          remark: '备注|建议|描述备注|建议|描述备注|建议|描述备注|建议|描述'
        },
        {
          name: '张三',
          flowNodeName: '审批人',
          status: '(待审核)',
          date: '',
        },
        {
          name: '张三',
          flowNodeName: '审批人审批',
          status: '',
          date: '',
        }
      ],
      list1: [
        {
          name: '张三',
          flowNodeName: '发起人',
          status: '(已通过)',
          date: '2023-04-13 11:00:00',
        },
        {
          name: '张三',
          flowNodeName: '发起人',
          status: '(已通过)',
          date: '2023-04-13 11:00:00',
        },
        {
          name: '张三三',
          flowNodeName: '审批人',
          status: '(已通过)',
          date: '2023-04-13 11:00:00',
          remark: '备注|建议|描述备注|建议|描述备注|建议|描述备注|建议|描述'
        },
        {
          name: '张三张三',
          flowNodeName: '审批人',
          status: '(已驳回)',
          date: '2023-04-13 11:00:00',
        },
        // {
        //   name: '张三',
        //   flowNodeName: '审批人',
        //   status: '(待审核)',
        //   date: '',
        //   textColor: '#F79100'
        // },
        {
          name: '张三',
          flowNodeName: '审批人审批',
          status: '',
          date: '',
        }
      ],
      list2: [
        {
          name: '张三',
          flowNodeName: '发起人',
          status: '(已通过)',
          date: '2023-04-13 11:00:00',
        },
        {
          name: '张三',
          flowNodeName: '部门主管',
          status: '(已通过)',
          date: '2023-04-13 11:00:00',
        },
        {
          name: '李四黎',
          flowNodeName: '部门经理',
          status: '(已通过)',
          date: '2023-04-13 11:00:00',
        },
        {
          name: '李四黎',
          flowNodeName: '部门经理',
          status: '(已驳回)',
          date: '2023-04-13 11:00:00',
          remark: '备注|建议|描述备注|建议|描述备注|建议|描述备注|建议|描述'
        },
        {
          name: '张三张三',
          flowNodeName: '总经理'
        }
      ]
    }
  },
  methods: {
    setDotColor(item) {
      if (item.status === '(已通过)') {
        return '#50CA5E'
      }
      if (item.status === '(已驳回)') {
        return '#F56C6C'
      }
      if (item.status === '(待审核)') {
        return '#F79100'
      }
      return '';
    },
    setLineColor(item) {
      if (item.status === '(待审核)') {
        return '#F79100'
      }
      if (item.status === '(已通过)') {
        return '#50CA5E'
      }
      if (item.status === '(已驳回)') {
        return '#F56C6C'
      }
      return '';
    }
  }
}
</script>

<style scoped>
</style>

```