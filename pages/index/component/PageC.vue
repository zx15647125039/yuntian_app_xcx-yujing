<template>
  <view class="template-clock">
    <!-- 顶部我的待办概览与关键词搜索栏 -->
    <view class="top-tab-wrapper neu-outset">
      <!-- Scope 三栏切换：todo=待办(默认) / done=历史(终态) / all=全部 -->
      <view class="dual-tabs">
        <view
          :class="['dual-tab-item', queryParams.scope === 'todo' && queryParams.status === '' ? 'tab-active neu-inset' : '']"
          @click="switchScope('todo')"
        >
          <text class="tab-label">待办工单</text>
          <view class="tab-badge" v-if="profile.todoCount > 0">{{ profile.todoCount }}</view>
        </view>
        <view
          :class="['dual-tab-item', queryParams.scope === 'done' && queryParams.status === '' ? 'tab-active neu-inset' : '']"
          @click="switchScope('done')"
        >
          <text class="tab-label">历史归档</text>
        </view>
        <view
          :class="['dual-tab-item', queryParams.scope === 'all' && queryParams.status === '' ? 'tab-active neu-inset' : '']"
          @click="switchScope('all')"
        >
          <text class="tab-label">全部工单</text>
        </view>
      </view>

      <!-- 关键词搜索栏 (模糊匹配工单编号 ticketNo / 标题 title) -->
      <view class="search-box neu-inset">
        <text class="search-icon">🔍</text>
        <input
          type="text"
          v-model="queryParams.keyword"
          placeholder="搜索工单编号 (如 WO20261106) 或标题..."
          class="search-input"
          @confirm="fetchTicketPage(true)"
        />
        <text v-if="queryParams.keyword" class="clear-btn" @click="clearKeyword">✕</text>
        <view class="search-btn" @click="fetchTicketPage(true)">查询</view>
      </view>

      <!-- 复合筛选栏：按状态 status (传了覆盖 scope) + 按优先级 priority -->
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">状态:</text>
          <picker :range="statusOptionLabels" :value="statusFilterIdx" @change="onStatusFilterChange">
            <view class="filter-picker neu-inset">
              <text class="filter-val">{{ statusOptionLabels[statusFilterIdx] }}</text>
              <text class="picker-caret">▼</text>
            </view>
          </picker>
        </view>

        <view class="filter-item">
          <text class="filter-label">优先级:</text>
          <picker :range="priorityOptionLabels" :value="priorityFilterIdx" @change="onPriorityFilterChange">
            <view class="filter-picker neu-inset">
              <text class="filter-val">{{ priorityOptionLabels[priorityFilterIdx] }}</text>
              <text class="picker-caret">▼</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 工单分页统计提示条 -->
    <view class="summary-bar">
      <text class="summary-text">
        共 {{ totalCount }} 条工单 · 处置人: {{ profile.nickname || '咸宁巡检01' }}
      </text>
      <text v-if="profile.overdueCount > 0" class="overdue-summary-pill">
        ⚠️ 已超期 {{ profile.overdueCount }} 单
      </text>
    </view>

    <!-- 工单卡片列表 (严格使用服务端返回的 statusLabel / priorityLabel / levelLabel / resultTypeLabel) -->
    <view class="order-list">
      <view v-if="ticketList.length === 0" class="empty-state neu-outset">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无符合条件的巡检工单</text>
      </view>

      <view
        v-for="item in ticketList"
        :key="item.id"
        class="order-card neu-outset"
        @click="openTicketDetail(item.id)"
      >
        <!-- 卡片头部: 业务编号 ticketNo + 优先级 priorityLabel + 状态 statusLabel -->
        <view class="card-head">
          <view class="id-row">
            <text class="order-id">{{ item.ticketNo }}</text>
            <text :class="['priority-tag', getPriorityClass(item.priority)]">
              {{ item.priorityLabel }}
            </text>
            <text v-if="item.levelLabel" :class="['level-tag', getLevelClass(item.level)]">
              {{ item.levelLabel }}
            </text>
          </view>
          <text :class="['status-badge', getStatusBadgeClass(item.status)]">
            {{ item.statusLabel }}
          </text>
        </view>

        <!-- 卡片主体: 标题、告警分类、项目与巡检报告、时限与超期红标 -->
        <view class="card-body">
          <view class="hazard-title-row">
            <text class="hazard-badge">{{ item.eventType || '巡检' }}</text>
            <text class="ticket-title">{{ item.title }}</text>
          </view>

          <!-- 项目与报告信息 -->
          <view class="meta-grid">
            <text class="meta-item">📁 项目: {{ item.projectName || '-' }}</text>
            <text class="meta-item" v-if="item.reportNo">📑 报告: {{ item.reportNo }}</text>
          </view>

          <!-- 处置时限与超期状态 (overdue=true 直接标红；minutesToDeadline 负数=已超期) -->
          <view :class="['deadline-row', item.overdue ? 'deadline-overdue' : '']">
            <text class="deadline-text">⏱ 处置时限: {{ item.deadlineLabel || item.deadline || '无时限' }}</text>
            <text v-if="item.overdue" class="overdue-badge">
              已超期 {{ item.minutesToDeadline !== null ? Math.abs(item.minutesToDeadline) + ' 分钟' : '' }}
            </text>
            <text v-else-if="item.minutesToDeadline !== null && item.minutesToDeadline !== undefined" class="remain-badge">
              剩余 {{ item.minutesToDeadline }} 分钟
            </text>
          </view>

          <!-- 经纬度位置与导航 -->
          <view class="location-box neu-inset" @click.stop="openNavigation(item)">
            <view class="loc-left">
              <text class="loc-icon">📍</text>
              <text class="loc-address">
                {{ item.projectName }} ({{ item.longitude }}, {{ item.latitude }})
              </text>
            </view>
            <text class="nav-hint">导航 ➔</text>
          </view>
        </view>

        <!-- 告警封面图与派单时间 / 处置结果分类标签 -->
        <view class="card-thumb-row">
          <view v-if="item.coverImageUrl" class="thumb-wrap neu-inset" @click.stop="previewPhoto(item.coverImageUrl)">
            <image :src="item.coverImageUrl" mode="aspectFill" class="thumb-img"></image>
            <text class="thumb-label">告警封面</text>
          </view>
          <view class="card-meta-text">
            <text class="meta-line">派单时间: {{ formatTimeStr(item.createdAt) }}</text>
            <text class="meta-line" v-if="item.resultTypeLabel">
              处置结果分类: <text class="text-blue-bold">{{ item.resultTypeLabel }}</text>
            </text>
            <text class="meta-line" v-else>处置结果分类: 未采集</text>
          </view>
        </view>

        <!-- 卡片底部操作入口 -->
        <view class="card-foot">
          <button
            v-if="item.status === 1 || item.status === 5"
            class="btn-primary"
            @click.stop="quickAcceptTicket(item)"
          >
            {{ item.status === 5 ? '重新接单' : '立即接单' }}
          </button>
          <button
            v-else-if="item.status === 2"
            class="btn-primary"
            @click.stop="openTicketDetail(item.id, true)"
          >
            去提交处置
          </button>
          <button class="btn-secondary" @click.stop="openTicketDetail(item.id, false)">
            工单详情与流转记录 ›
          </button>
        </view>
      </view>
    </view>

    <!-- ================================================================== -->
    <!-- 工单详情 + 处置三件套 + 流转记录 弹窗 (GET /ticket/get & /ticket/log) -->
    <!-- ================================================================== -->
    <view v-if="showDetailModal && ticketDetail" class="modal-mask">
      <view class="handle-modal-card">
        <!-- 弹窗头部 -->
        <view class="modal-header">
          <view class="modal-title-col">
            <view class="modal-id-row">
              <text class="modal-title">{{ ticketDetail.ticketNo }}</text>
              <text :class="['status-badge', getStatusBadgeClass(ticketDetail.status)]">
                {{ ticketDetail.statusLabel }}
              </text>
              <text :class="['priority-tag', getPriorityClass(ticketDetail.priority)]">
                {{ ticketDetail.priorityLabel }}
              </text>
            </view>
            <text class="modal-subtitle">{{ ticketDetail.title }}</text>
          </view>
          <text class="modal-close" @click="closeDetailModal">✕</text>
        </view>

        <scroll-view scroll-y class="handle-scroll">
          <!-- 若状态为 5 已退回 或有复核意见 (disposal.reviewResult)，醒目展示复核意见/退回理由 -->
          <view
            v-if="ticketDetail.disposal && ticketDetail.disposal.reviewResult"
            :class="['review-banner', ticketDetail.status === 5 ? 'review-reject-banner' : 'review-pass-banner']"
          >
            <text class="review-banner-title">
              {{ ticketDetail.status === 5 ? '⚠️ 复核未通过 · 已退回需重新接单处置' : '✅ 复核意见' }}
            </text>
            <text class="review-banner-desc">{{ ticketDetail.disposal.reviewResult }}</text>
          </view>

          <!-- 1) 重新设计的「工单派发信息」高对比度结构化卡片 -->
          <view class="detail-section">
            <view class="section-head-flex">
              <view class="section-title-left">
                <view class="section-accent-bar"></view>
                <text class="section-label-clean">工单派发信息</text>
              </view>
              <text class="section-time-pill">{{ formatTimeStr(ticketDetail.createdAt) }}</text>
            </view>

            <!-- 人员指派双栏卡片 (执行处置人 vs 派单指派人) -->
            <view class="dispatch-people-row">
              <view class="person-box person-box-primary">
                <text class="person-role-tag tag-blue">执行处置人</text>
                <text class="person-name-val">{{ ticketDetail.assigneeName || '咸宁巡检01' }}</text>
              </view>
              <view class="person-box person-box-secondary">
                <text class="person-role-tag tag-slate">派单指派人</text>
                <text class="person-name-val">{{ ticketDetail.assignerName || '调度中心' }}</text>
              </view>
            </view>

            <!-- 处置时限醒目状态条 -->
            <view :class="['deadline-banner', ticketDetail.overdue ? 'deadline-banner-overdue' : 'deadline-banner-normal']">
              <view class="deadline-banner-left">
                <text class="deadline-banner-label">要求处置时限</text>
                <text v-if="ticketDetail.overdue" class="deadline-overdue-pill">已超期</text>
              </view>
              <text class="deadline-banner-val">
                {{ ticketDetail.deadlineLabel || formatTimeStr(ticketDetail.deadline) }}
              </text>
            </view>

            <!-- 结构化左标题右内容列表 -->
            <view class="dispatch-kv-list">
              <view class="kv-row" v-if="ticketDetail.project || ticketDetail.projectName">
                <text class="kv-label">所属项目</text>
                <text class="kv-val">
                  {{ (ticketDetail.project && ticketDetail.project.name) || ticketDetail.projectName }}
                </text>
              </view>
              <view class="kv-row" v-if="ticketDetail.task">
                <text class="kv-label">关联任务</text>
                <text class="kv-val">
                  {{ ticketDetail.task.name }}
                </text>
              </view>
              <view class="kv-row" v-if="ticketDetail.report">
                <text class="kv-label">巡检报告</text>
                <text class="kv-code-badge">
                  {{ ticketDetail.report.reportNo }}
                </text>
              </view>
            </view>

            <!-- 现场情况说明高亮框 -->
            <view class="scene-desc-box">
              <text class="scene-desc-title">现场情况说明</text>
              <text class="scene-desc-text">{{ ticketDetail.content || '请前往现场核实告警点位并完成标准处置。' }}</text>
            </view>
          </view>

          <!-- 2) 关联告警事件详情与告警帧列表 (event & event.frames[]) -->
          <view v-if="ticketDetail.event" class="detail-section">
            <view class="section-head-flex">
              <text class="section-label">🚨 关联告警事件 ({{ ticketDetail.event.eventNo }})</text>
              <text :class="['level-tag', getLevelClass(ticketDetail.event.level)]">
                {{ ticketDetail.event.levelLabel }}
              </text>
            </view>
            <view class="info-row">
              <text class="info-k">识别算法:</text>
              <text class="info-v">{{ ticketDetail.event.algorithmName }} ({{ ticketDetail.event.eventCode }})</text>
            </view>
            <view class="info-row">
              <text class="info-k">告警消息:</text>
              <text class="info-v text-red-bold">{{ ticketDetail.event.message }}</text>
            </view>
            <view class="info-row">
              <text class="info-k">空间坐标:</text>
              <text class="info-v">
                {{ ticketDetail.event.longitude }}, {{ ticketDetail.event.latitude }} (海拔 {{ ticketDetail.event.altitude }}m)
              </text>
            </view>
            <view class="info-row">
              <text class="info-k">发现时间:</text>
              <text class="info-v">{{ formatTimeStr(ticketDetail.event.discoveredAt) }}</text>
            </view>

            <!-- 告警抓拍帧列表 frames[] -->
            <view v-if="ticketDetail.event.frames && ticketDetail.event.frames.length" class="frames-box">
              <text class="sub-label">抓拍帧序列 (点击图片放大):</text>
              <view class="frames-grid">
                <view
                  v-for="frame in ticketDetail.event.frames"
                  :key="frame.id"
                  class="frame-item"
                  @click="previewPhoto(frame.url)"
                >
                  <image :src="frame.url" mode="aspectFill" class="frame-img"></image>
                  <text v-if="frame.isOrigin" class="origin-frame-badge">触发帧</text>
                  <text class="frame-time">{{ formatTimeStr(frame.frameTime) }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 3) 已提交的处置记录回显 (disposal) -->
          <view
            v-if="ticketDetail.disposal && ticketDetail.disposal.submittedAt"
            class="detail-section"
          >
            <text class="section-label">🛠 已采集现场处置记录</text>
            <view class="info-row">
              <text class="info-k">结果分类:</text>
              <text class="info-v text-blue-bold">{{ ticketDetail.disposal.resultTypeLabel }}</text>
            </view>
            <view class="info-row">
              <text class="info-k">原因归类:</text>
              <text class="info-v">{{ ticketDetail.disposal.causeTypeLabel }}</text>
            </view>
            <view class="info-row">
              <text class="info-k">处置说明:</text>
              <text class="info-v">{{ ticketDetail.disposal.result }}</text>
            </view>
            <view class="info-row">
              <text class="info-k">提交时间:</text>
              <text class="info-v">{{ formatTimeStr(ticketDetail.disposal.submittedAt) }}</text>
            </view>
            <view class="info-row" v-if="ticketDetail.disposal.closedAt">
              <text class="info-k">闭环时间:</text>
              <text class="info-v">{{ formatTimeStr(ticketDetail.disposal.closedAt) }}</text>
            </view>
            <view
              v-if="ticketDetail.disposal.evidenceUrls && ticketDetail.disposal.evidenceUrls.length"
              class="frames-box"
            >
              <text class="sub-label">现场处置照片 ({{ ticketDetail.disposal.evidenceUrls.length }}张):</text>
              <view class="frames-grid">
                <view
                  v-for="(imgUrl, idx) in ticketDetail.disposal.evidenceUrls"
                  :key="idx"
                  class="frame-item"
                  @click="previewPhoto(imgUrl)"
                >
                  <image :src="imgUrl" mode="aspectFill" class="frame-img"></image>
                </view>
              </view>
            </view>
          </view>

          <!-- 4) 现场处置「三件套 + 1~9张现场照片」采集表单 (当 process 动作可用时显示) -->
          <view v-if="isActionEnabled('process')" class="detail-section disposal-form-box">
            <view class="form-header-row">
              <text class="section-label">✍️ 填写现场处置 (处置三件套必填)</text>
              <text class="required-hint">提交后进入「待复核」</text>
            </view>

            <!-- 必填 1: 处置结果分类 resultType (0 已修复 / 1 需返场 / 2 误报 / 3 无法处置) -->
            <view class="form-field">
              <text class="field-title">1. 处置结果分类 <text class="req-star">*</text></text>
              <view class="chip-group">
                <view
                  v-for="opt in resultTypeOptions"
                  :key="opt.value"
                  :class="['enum-chip', processForm.resultType === opt.value ? 'enum-chip-active' : 'neu-inset']"
                  @click="processForm.resultType = opt.value"
                >
                  {{ opt.label }}
                </view>
              </view>
            </view>

            <!-- 必填 2: 原因归类 causeType (0 设备故障 / 1 环境因素 / 2 人为因素 / 3 其他) -->
            <view class="form-field">
              <text class="field-title">2. 原因归类 <text class="req-star">*</text></text>
              <view class="chip-group">
                <view
                  v-for="opt in causeTypeOptions"
                  :key="opt.value"
                  :class="['enum-chip', processForm.causeType === opt.value ? 'enum-chip-active' : 'neu-inset']"
                  @click="processForm.causeType = opt.value"
                >
                  {{ opt.label }}
                </view>
              </view>
            </view>

            <!-- 必填 3: 处置说明 result -->
            <view class="form-field">
              <text class="field-title">3. 处置说明 <text class="req-star">*</text></text>
              <view class="textarea-box neu-inset">
                <textarea
                  v-model="processForm.result"
                  placeholder="请输入现场具体处置措施、修复结果或无法处置说明..."
                  class="modal-textarea"
                />
              </view>
            </view>

            <!-- 必填 4: 现场照片 evidenceUrls (1~9张) -->
            <view class="form-field">
              <view class="photo-title-row">
                <text class="field-title">4. 现场照片 (1~9张) <text class="req-star">*</text></text>
                <text class="photo-count">{{ processForm.evidenceUrls.length }} / 9</text>
              </view>
              <view class="evidence-grid">
                <view
                  v-for="(img, idx) in processForm.evidenceUrls"
                  :key="idx"
                  class="evidence-item neu-inset"
                >
                  <image :src="img" mode="aspectFill" class="evidence-img" @click="previewPhoto(img)"></image>
                  <view class="evidence-del" @click.stop="removeEvidencePhoto(idx)">✕</view>
                </view>
                <view
                  v-if="processForm.evidenceUrls.length < 9"
                  class="evidence-add neu-inset"
                  @click="addEvidencePhoto"
                >
                  <text class="add-icon">📷</text>
                  <text class="add-txt">上传照片</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 5) 工单流转记录时间轴 (GET /intoclouds/mobile/staff/ticket/log?ticketId=...) -->
          <view class="detail-section">
            <text class="section-label">🕒 工单流转记录 (按时间升序)</text>
            <view v-if="ticketLogs.length === 0" class="empty-log-txt">暂无流转记录</view>
            <view class="log-timeline">
              <view v-for="(log, lIdx) in ticketLogs" :key="lIdx" class="log-item">
                <view class="log-dot"></view>
                <view class="log-content">
                  <view class="log-head">
                    <text class="log-action-label">{{ log.actionLabel }}</text>
                    <text class="log-operator">{{ log.operatorName }}</text>
                    <text class="log-time">{{ formatTimeStr(log.createTime) }}</text>
                  </view>
                  <text v-if="log.remark" class="log-remark">{{ log.remark }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 底部动作栏：严格按服务端返回的 actions[] 渲染按钮与置灰原因 reason -->
        <view class="modal-footer-actions">
          <view
            v-for="act in ticketDetail.actions"
            :key="act.key"
            class="action-btn-wrapper"
          >
            <button
              :class="['btn-action-item', act.enabled ? (act.key === 'accept' ? 'btn-act-accept' : 'btn-act-process') : 'btn-act-disabled']"
              @click="handleActionClick(act)"
            >
              {{ act.label }}
            </button>
            <text v-if="!act.enabled && act.reason" class="action-disable-reason">
              {{ act.reason }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-placeholder"></view>
  </view>
</template>

<script>
import api from '@/api/index.js';

export default {
  name: 'PageC',
  data() {
    return {
      profile: {
        userId: null,
        nickname: '',
        tenantId: null,
        tenantName: '',
        todoCount: 0,
        overdueCount: 0,
        unreadCount: 0
      },
      queryParams: {
        scope: 'todo',
        status: '',
        priority: '',
        keyword: '',
        pageNo: 1,
        pageSize: 20
      },
      statusOptionLabels: ['全部状态(按Scope)', '1-待接单', '2-处理中', '3-待复核', '4-已闭环', '5-已退回', '9-已关闭'],
      statusOptionValues: ['', 1, 2, 3, 4, 5, 9],
      statusFilterIdx: 0,

      priorityOptionLabels: ['全部优先级', '0-紧急', '1-高', '2-中', '3-低'],
      priorityOptionValues: ['', 0, 1, 2, 3],
      priorityFilterIdx: 0,

      totalCount: 0,
      ticketList: [],

      showDetailModal: false,
      ticketDetail: null,
      ticketLogs: [],

      // 处置三件套枚举 (§5)
      resultTypeOptions: [
        { value: 0, label: '已修复' },
        { value: 1, label: '需返场' },
        { value: 2, label: '误报' },
        { value: 3, label: '无法处置' }
      ],
      causeTypeOptions: [
        { value: 0, label: '设备故障' },
        { value: 1, label: '环境因素' },
        { value: 2, label: '人为因素' },
        { value: 3, label: '其他' }
      ],
      processForm: {
        result: '',
        resultType: null,
        causeType: null,
        evidenceUrls: []
      }
    };
  },
  mounted() {
    this.initPageData();
    uni.$on('refreshTickets', () => {
      this.initPageData();
    });
    uni.$on('switchTicketScope', (scope) => {
      if (scope && ['todo', 'done', 'all'].includes(scope)) {
        this.switchScope(scope);
      }
    });
    uni.$on('openTicketFromHome', (ticketId) => {
      if (ticketId) {
        const realId = typeof ticketId === 'object' ? ticketId.id : ticketId;
        if (realId) this.openTicketDetail(realId);
      }
    });
  },
  beforeDestroy() {
    uni.$off('refreshTickets');
    uni.$off('switchTicketScope');
    uni.$off('openTicketFromHome');
  },
  methods: {
    async initPageData() {
      await this.fetchProfile();
      await this.fetchTicketPage(true);
    },

    async fetchProfile() {
      try {
        const res = await api.getStaffProfile();
        if (res && res.code === 0 && res.data) {
          this.profile = res.data;
          uni.$emit('profileUpdated', res.data);
        }
      } catch (e) {
        console.error('fetchProfile error:', e);
      }
    },

    async fetchTicketPage(resetPage = false) {
      if (resetPage) {
        this.queryParams.pageNo = 1;
      }
      try {
        const res = await api.getTicketPage(this.queryParams);
        if (res && res.code === 0 && res.data) {
          this.totalCount = res.data.total || 0;
          this.ticketList = res.data.list || [];
        } else if (res && res.msg) {
          uni.showToast({ title: res.msg, icon: 'none' });
        }
      } catch (e) {
        console.error('fetchTicketPage error:', e);
      }
    },

    switchScope(scope) {
      this.queryParams.scope = scope;
      // 切换 scope 时清空具体 status 覆盖
      this.statusFilterIdx = 0;
      this.queryParams.status = '';
      this.fetchTicketPage(true);
    },

    clearKeyword() {
      this.queryParams.keyword = '';
      this.fetchTicketPage(true);
    },

    onStatusFilterChange(e) {
      const idx = Number(e.detail.value);
      this.statusFilterIdx = idx;
      this.queryParams.status = this.statusOptionValues[idx];
      this.fetchTicketPage(true);
    },

    onPriorityFilterChange(e) {
      const idx = Number(e.detail.value);
      this.priorityFilterIdx = idx;
      this.queryParams.priority = this.priorityOptionValues[idx];
      this.fetchTicketPage(true);
    },

    formatTimeStr(str) {
      if (!str) return '-';
      return String(str).replace('T', ' ');
    },

    getStatusBadgeClass(status) {
      if (status === 1) return 'badge-amber';
      if (status === 2) return 'badge-blue';
      if (status === 3) return 'badge-indigo';
      if (status === 4) return 'badge-emerald';
      if (status === 5) return 'badge-red';
      return 'badge-gray';
    },

    getPriorityClass(priority) {
      if (priority === 0) return 'prio-urgent';
      if (priority === 1) return 'prio-high';
      if (priority === 2) return 'prio-medium';
      return 'prio-low';
    },

    getLevelClass(level) {
      if (level === 2) return 'lvl-danger';
      if (level === 1) return 'lvl-warn';
      return 'lvl-info';
    },

    previewPhoto(url) {
      if (!url) return;
      uni.previewImage({ urls: [url] });
    },

    openNavigation(item) {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);
      if (!lat || !lng) {
        uni.showToast({ title: '暂无有效坐标信息', icon: 'none' });
        return;
      }
      if (typeof uni !== 'undefined' && typeof uni.openLocation === 'function') {
        uni.openLocation({
          latitude: lat,
          longitude: lng,
          name: item.title || item.projectName || '巡检告警位置',
          address: `${item.projectName || ''} (${lng}, ${lat})`,
          fail: () => {
            uni.showToast({
              title: `导航目标: ${lng}, ${lat}`,
              icon: 'none'
            });
          }
        });
      }
    },

    async openTicketDetail(id) {
      const realId = typeof id === 'object' ? id.id : id;
      try {
        const [detailRes, logRes] = await Promise.all([
          api.getTicketDetail(realId),
          api.getTicketLogs(realId)
        ]);
        if (detailRes && detailRes.code === 0 && detailRes.data) {
          this.ticketDetail = detailRes.data;
          const d = detailRes.data.disposal || {};
          // 预填或初始化处置三件套表单（使用真实服务端数据，不注入模拟图片）
          this.processForm = {
            result: d.result || '',
            resultType: d.resultType !== null && d.resultType !== undefined ? d.resultType : 0,
            causeType: d.causeType !== null && d.causeType !== undefined ? d.causeType : 0,
            evidenceUrls: Array.isArray(d.evidenceUrls) ? [...d.evidenceUrls] : []
          };
          this.showDetailModal = true;
        } else {
          uni.showToast({
            title: (detailRes && detailRes.msg) || '工单不存在 (1007039000)',
            icon: 'none'
          });
        }

        if (logRes && logRes.code === 0 && Array.isArray(logRes.data)) {
          this.ticketLogs = logRes.data;
        } else {
          this.ticketLogs = [];
        }
      } catch (e) {
        console.error('openTicketDetail error:', e);
      }
    },

    closeDetailModal() {
      this.showDetailModal = false;
      this.ticketDetail = null;
    },

    isActionEnabled(key) {
      if (!this.ticketDetail || !Array.isArray(this.ticketDetail.actions)) return false;
      const found = this.ticketDetail.actions.find(a => a.key === key);
      return Boolean(found && found.enabled);
    },

    async quickAcceptTicket(item) {
      try {
        const res = await api.acceptTicket(item.id);
        if (res && res.code === 0) {
          uni.showToast({
            title: `已接单，状态流转为「${res.data.statusLabel}」`,
            icon: 'success'
          });
          await this.initPageData();
          await this.openTicketDetail(item.id);
        }
      } catch (e) {
        console.error('quickAcceptTicket error:', e);
      }
    },

    async handleActionClick(act) {
      if (!act.enabled) {
        uni.showToast({
          title: act.reason || '当前状态不可执行该操作',
          icon: 'none'
        });
        return;
      }

      if (act.key === 'accept') {
        const res = await api.acceptTicket(this.ticketDetail.id);
        if (res && res.code === 0) {
          uni.showToast({
            title: `接单成功 (${res.data.statusLabel})`,
            icon: 'success'
          });
          await this.openTicketDetail(this.ticketDetail.id);
          await this.initPageData();
        }
      } else if (act.key === 'process') {
        await this.submitProcessTicket();
      }
    },

    addEvidencePhoto() {
      if (this.processForm.evidenceUrls.length >= 9) {
        uni.showToast({ title: '现场照片最多 9 张 (1007039003)', icon: 'none' });
        return;
      }
      if (typeof uni !== 'undefined' && typeof uni.chooseImage === 'function') {
        uni.chooseImage({
          count: 9 - this.processForm.evidenceUrls.length,
          sizeType: ['compressed'],
          sourceType: ['camera', 'album'],
          success: async (res) => {
            const files = res.tempFilePaths || [];
            for (const filePath of files) {
              try {
                const upRes = await api.uploadEvidenceFile(filePath);
                if (upRes && (upRes.code === 0 || upRes.code === 200) && upRes.data) {
                  const uploadedUrl = typeof upRes.data === 'string' ? upRes.data : upRes.data.url;
                  this.processForm.evidenceUrls.push(uploadedUrl || filePath);
                } else {
                  this.processForm.evidenceUrls.push(filePath);
                }
              } catch (err) {
                this.processForm.evidenceUrls.push(filePath);
              }
            }
          }
        });
      }
    },

    removeEvidencePhoto(idx) {
      this.processForm.evidenceUrls.splice(idx, 1);
    },

    // 3.5 提交处置：严格按 result → resultType → causeType → evidenceUrls 顺序校验并提交
    async submitProcessTicket() {
      const payload = {
        id: this.ticketDetail.id,
        result: this.processForm.result,
        resultType: this.processForm.resultType,
        causeType: this.processForm.causeType,
        evidenceUrls: this.processForm.evidenceUrls
      };

      const res = await api.processTicket(payload);
      if (res && res.code === 0) {
        uni.showToast({
          title: `已提交处置，进入「${res.data.statusLabel}」`,
          icon: 'success'
        });
        await this.openTicketDetail(this.ticketDetail.id);
        await this.initPageData();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.template-clock {
  min-height: 100vh;
  width: 100%;
  background-color: #EBECF0;
  box-sizing: border-box;
  padding: 20rpx 24rpx;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.top-tab-wrapper {
  border-radius: 24rpx;
  padding: 18rpx;
  margin-bottom: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.dual-tabs {
  display: flex;
  gap: 12rpx;
}

.dual-tab-item {
  flex: 1;
  padding: 16rpx 0;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.tab-label {
  font-size: 26rpx;
  font-weight: 700;
  color: #334155;
}

.tab-active .tab-label {
  color: #1E6FFF;
  font-weight: 800;
}

.tab-badge {
  background-color: #EF4444;
  color: #FFF;
  font-size: 20rpx;
  font-weight: bold;
  padding: 2rpx 10rpx;
  border-radius: 20rpx;
}

.search-box {
  display: flex;
  align-items: center;
  padding: 10rpx 16rpx;
  border-radius: 16rpx;
  gap: 10rpx;
}

.search-icon {
  font-size: 26rpx;
}

.search-input {
  flex: 1;
  font-size: 24rpx;
  color: #0F172A;
}

.clear-btn {
  font-size: 24rpx;
  color: #64748B;
  padding: 0 8rpx;
}

.search-btn {
  background-color: #1E6FFF;
  color: #FFF;
  font-size: 22rpx;
  font-weight: bold;
  padding: 8rpx 20rpx;
  border-radius: 12rpx;
}

.filter-row {
  display: flex;
  gap: 14rpx;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.filter-label {
  font-size: 22rpx;
  color: #1E293B;
  font-weight: 800;
  white-space: nowrap;
}

.filter-picker {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10rpx 14rpx;
  border-radius: 14rpx;
}

.filter-val {
  font-size: 22rpx;
  color: #0F172A;
  font-weight: 700;
}

.picker-caret {
  font-size: 18rpx;
  color: #475569;
}

.summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8rpx 14rpx;
}

.summary-text {
  font-size: 22rpx;
  color: #475569;
  font-weight: 600;
}

.overdue-summary-pill {
  font-size: 20rpx;
  color: #DC2626;
  background-color: #FEE2E2;
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
  font-weight: 800;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.empty-state {
  padding: 60rpx 20rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.empty-icon {
  font-size: 64rpx;
}

.empty-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #334155;
}

.order-card {
  padding: 22rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(186, 190, 204, 0.35);
  padding-bottom: 12rpx;
}

.id-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
}

.order-id {
  font-size: 25rpx;
  font-weight: 800;
  font-family: monospace;
  color: #0F172A;
}

.priority-tag {
  font-size: 20rpx;
  font-weight: 800;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}

.prio-urgent { background-color: #FEE2E2; color: #DC2626; }
.prio-high { background-color: #FFEDD5; color: #EA580C; }
.prio-medium { background-color: #DBEAFE; color: #1D4ED8; }
.prio-low { background-color: #E2E8F0; color: #475569; }

.level-tag {
  font-size: 20rpx;
  font-weight: 800;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}

.lvl-danger { background-color: #DC2626; color: #FFF; }
.lvl-warn { background-color: #F59E0B; color: #FFF; }
.lvl-info { background-color: #3B82F6; color: #FFF; }

.status-badge {
  font-size: 22rpx;
  font-weight: 800;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.badge-amber { background-color: #FEF3C7; color: #B45309; }
.badge-blue { background-color: #DBEAFE; color: #1D4ED8; }
.badge-indigo { background-color: #E0E7FF; color: #4338CA; }
.badge-emerald { background-color: #D1FAE5; color: #047857; }
.badge-red { background-color: #FEE2E2; color: #DC2626; }
.badge-gray { background-color: #E2E8F0; color: #475569; }

.hazard-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 6rpx;
}

.hazard-badge {
  font-size: 22rpx;
  font-weight: 800;
  color: #1E6FFF;
  background-color: #DBEAFE;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.ticket-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #0F172A;
  flex: 1;
}

.meta-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 6rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #334155;
  font-weight: 600;
}

.deadline-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 14rpx;
  border-radius: 12rpx;
  background-color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8rpx;
}

.deadline-overdue {
  background-color: #FEE2E2;
  border: 1px solid #FCA5A5;
}

.deadline-text {
  font-size: 22rpx;
  color: #1E293B;
  font-weight: 700;
}

.deadline-overdue .deadline-text {
  color: #B91C1C;
}

.overdue-badge {
  font-size: 20rpx;
  font-weight: 800;
  color: #FFF;
  background-color: #DC2626;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}

.remain-badge {
  font-size: 20rpx;
  font-weight: 700;
  color: #059669;
}

.location-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 16rpx;
  border-radius: 14rpx;
}

.loc-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
}

.loc-icon {
  font-size: 26rpx;
}

.loc-address {
  font-size: 22rpx;
  color: #0F172A;
  font-weight: 600;
}

.nav-hint {
  font-size: 20rpx;
  color: #1E6FFF;
  font-weight: bold;
}

.card-thumb-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.thumb-wrap {
  width: 130rpx;
  height: 92rpx;
  border-radius: 12rpx;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.thumb-img {
  width: 100%;
  height: 100%;
}

.thumb-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: #FFF;
  font-size: 16rpx;
  text-align: center;
  padding: 2rpx 0;
}

.card-meta-text {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.meta-line {
  font-size: 22rpx;
  color: #475569;
  font-weight: 600;
}

.text-blue-bold {
  color: #1E6FFF;
  font-weight: 800;
}

.text-red-bold {
  color: #DC2626;
  font-weight: 800;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14rpx;
  border-top: 1px dashed rgba(186, 190, 204, 0.45);
  padding-top: 14rpx;
}

.btn-secondary {
  font-size: 22rpx;
  color: #1E293B;
  background-color: #E2E8F0;
  border: none;
  font-weight: 700;
  padding: 10rpx 22rpx;
  border-radius: 14rpx;
  line-height: 1.4;
}

.btn-primary {
  font-size: 22rpx;
  color: #FFF;
  background-color: #1E6FFF;
  border: none;
  font-weight: bold;
  padding: 10rpx 26rpx;
  border-radius: 14rpx;
  line-height: 1.4;
}

/* 详情与处置弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
}

.handle-modal-card {
  width: 100%;
  max-width: 700rpx;
  max-height: 88vh;
  border-radius: 30rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #F1F5F9;
  box-shadow: 0 24rpx 60rpx rgba(15, 23, 42, 0.38);
  border: 1px solid #FFFFFF;
}

.modal-header {
  padding: 26rpx 28rpx;
  background-color: #FFFFFF;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid #E2E8F0;
}

.modal-title-col {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  flex: 1;
}

.modal-id-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.modal-title {
  font-size: 27rpx;
  font-weight: 900;
  font-family: monospace;
  color: #0F172A;
}

.modal-subtitle {
  font-size: 33rpx;
  font-weight: 900;
  color: #0F172A;
  line-height: 1.35;
}

.modal-close {
  font-size: 32rpx;
  color: #0F172A;
  padding: 4rpx 14rpx;
  font-weight: 900;
  background-color: #F1F5F9;
  border: 1px solid #CBD5E1;
  border-radius: 50%;
}

.handle-scroll {
  padding: 22rpx 24rpx;
  box-sizing: border-box;
  max-height: 64vh;
}

.review-banner {
  padding: 20rpx 22rpx;
  border-radius: 18rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.review-reject-banner {
  background-color: #FEF2F2;
  border: 1px solid #FCA5A5;
}

.review-pass-banner {
  background-color: #ECFDF5;
  border: 1px solid #6EE7B7;
}

.review-banner-title {
  font-size: 26rpx;
  font-weight: 900;
  color: #991B1B;
}

.review-pass-banner .review-banner-title {
  color: #065F46;
}

.review-banner-desc {
  font-size: 25rpx;
  color: #7F1D1D;
  line-height: 1.5;
  font-weight: 700;
}

.review-pass-banner .review-banner-desc {
  color: #064E3B;
}

.detail-section {
  padding: 24rpx;
  border-radius: 22rpx;
  margin-bottom: 20rpx;
  background-color: #FFFFFF;
  border: 1px solid #CBD5E1;
  box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.05);
}

.section-head-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14rpx;
  margin-bottom: 16rpx;
  border-bottom: 1px solid #E2E8F0;
}

.section-title-left {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.section-accent-bar {
  width: 8rpx;
  height: 28rpx;
  border-radius: 4rpx;
  background-color: #1D4ED8;
}

.section-label-clean {
  font-size: 28rpx;
  font-weight: 900;
  color: #0F172A;
}

.section-time-pill {
  font-size: 22rpx;
  color: #334155;
  background-color: #F1F5F9;
  padding: 6rpx 14rpx;
  border-radius: 10rpx;
  font-weight: 700;
  font-family: monospace;
}

.dispatch-people-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
  margin-bottom: 16rpx;
}

.person-box {
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.person-box-primary {
  background-color: #EFF6FF;
  border: 1px solid #BFDBFE;
}

.person-box-secondary {
  background-color: #F8FAFC;
  border: 1px solid #CBD5E1;
}

.person-role-tag {
  font-size: 22rpx;
  font-weight: 800;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  align-self: flex-start;
}

.tag-blue {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.tag-slate {
  background-color: #E2E8F0;
  color: #334155;
}

.person-name-val {
  font-size: 28rpx;
  font-weight: 900;
  color: #0F172A;
}

.deadline-banner {
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.deadline-banner-normal {
  background-color: #F8FAFC;
  border: 1px solid #CBD5E1;
}

.deadline-banner-overdue {
  background-color: #FEF2F2;
  border: 1px solid #FCA5A5;
}

.deadline-banner-left {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.deadline-banner-label {
  font-size: 25rpx;
  font-weight: 800;
  color: #1E293B;
}

.deadline-banner-overdue .deadline-banner-label {
  color: #991B1B;
}

.deadline-overdue-pill {
  font-size: 20rpx;
  font-weight: 800;
  background-color: #DC2626;
  color: #FFFFFF;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
}

.deadline-banner-val {
  font-size: 26rpx;
  font-weight: 900;
  color: #0F172A;
  font-family: monospace;
}

.deadline-banner-overdue .deadline-banner-val {
  color: #DC2626;
}

.dispatch-kv-list {
  display: flex;
  flex-direction: column;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 16rpx;
  padding: 4rpx 18rpx;
  margin-bottom: 16rpx;
}

.kv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1px dashed #CBD5E1;
  gap: 14rpx;
}

.kv-row:last-child {
  border-bottom: none;
}

.kv-label {
  font-size: 25rpx;
  color: #334155;
  font-weight: 800;
  flex-shrink: 0;
}

.kv-val {
  font-size: 26rpx;
  color: #0F172A;
  font-weight: 800;
  text-align: right;
}

.kv-code-badge {
  font-size: 24rpx;
  font-weight: 800;
  color: #1E3A8A;
  background-color: #DBEAFE;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  font-family: monospace;
}

.scene-desc-box {
  background-color: #F8FAFC;
  border: 1px solid #CBD5E1;
  border-left: 8rpx solid #1D4ED8;
  border-radius: 14rpx;
  padding: 16rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.scene-desc-title {
  font-size: 24rpx;
  font-weight: 900;
  color: #1E3A8A;
}

.scene-desc-text {
  font-size: 26rpx;
  color: #0F172A;
  font-weight: 700;
  line-height: 1.55;
}

.section-label {
  font-size: 27rpx;
  font-weight: 900;
  color: #0F172A;
  margin-bottom: 14rpx;
  display: block;
}

.info-row {
  display: flex;
  margin-bottom: 12rpx;
  font-size: 25rpx;
}

.info-k {
  width: 150rpx;
  color: #334155;
  font-weight: 800;
  flex-shrink: 0;
}

.info-v {
  flex: 1;
  color: #0F172A;
  font-weight: 700;
  line-height: 1.5;
}

.frames-box {
  margin-top: 14rpx;
}

.sub-label {
  font-size: 24rpx;
  color: #334155;
  font-weight: 800;
  margin-bottom: 10rpx;
  display: block;
}

.frames-grid {
  display: flex;
  gap: 14rpx;
  flex-wrap: wrap;
}

.frame-item {
  width: 170rpx;
  height: 126rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
}

.frame-img {
  width: 100%;
  height: 100%;
}

.origin-frame-badge {
  position: absolute;
  top: 6rpx;
  left: 6rpx;
  background-color: #DC2626;
  color: #FFF;
  font-size: 16rpx;
  font-weight: bold;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
}

.frame-time {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.65);
  color: #FFF;
  font-size: 16rpx;
  text-align: center;
  padding: 2rpx 0;
}

/* 处置三件套表单 */
.disposal-form-box {
  border: 1px solid rgba(30, 111, 255, 0.25);
}

.form-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.required-hint {
  font-size: 20rpx;
  color: #1E6FFF;
  font-weight: 700;
}

.form-field {
  margin-bottom: 18rpx;
}

.field-title {
  font-size: 23rpx;
  font-weight: 800;
  color: #1E293B;
  margin-bottom: 10rpx;
  display: block;
}

.req-star {
  color: #DC2626;
}

.chip-group {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10rpx;
}

.enum-chip {
  padding: 12rpx 6rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 700;
  color: #334155;
  text-align: center;
}

.enum-chip-active {
  background-color: #1E6FFF;
  color: #FFF;
  box-shadow: 0 4rpx 10rpx rgba(30, 111, 255, 0.3);
}

.textarea-box {
  padding: 14rpx;
  border-radius: 14rpx;
}

.modal-textarea {
  width: 100%;
  height: 120rpx;
  font-size: 23rpx;
  color: #0F172A;
}

.photo-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.photo-count {
  font-size: 22rpx;
  color: #475569;
  font-weight: 700;
}

.evidence-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.evidence-item {
  width: 140rpx;
  height: 140rpx;
  border-radius: 14rpx;
  position: relative;
  overflow: hidden;
}

.evidence-img {
  width: 100%;
  height: 100%;
}

.evidence-del {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background-color: rgba(220, 38, 38, 0.9);
  color: #FFF;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.evidence-add {
  width: 140rpx;
  height: 140rpx;
  border-radius: 14rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.add-icon {
  font-size: 36rpx;
}

.add-txt {
  font-size: 20rpx;
  color: #475569;
  font-weight: 700;
}

/* 流转日志时间线 */
.empty-log-txt {
  font-size: 22rpx;
  color: #64748B;
}

.log-timeline {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding-left: 8rpx;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  position: relative;
}

.log-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #1E6FFF;
  margin-top: 8rpx;
  flex-shrink: 0;
}

.log-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.log-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.log-action-label {
  font-size: 23rpx;
  font-weight: 800;
  color: #0F172A;
}

.log-operator {
  font-size: 21rpx;
  color: #1E6FFF;
  font-weight: 700;
}

.log-time {
  font-size: 20rpx;
  color: #64748B;
  font-family: monospace;
}

.log-remark {
  font-size: 22rpx;
  color: #334155;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
}

/* 模拟复核区 */
.simulate-review-box {
  border: 1px dashed #6366F1;
}

.sim-desc {
  font-size: 21rpx;
  color: #475569;
  margin-bottom: 12rpx;
  display: block;
}

.sim-btn-row {
  display: flex;
  gap: 14rpx;
}

.btn-sim-reject {
  flex: 1;
  font-size: 22rpx;
  font-weight: bold;
  background-color: #FEE2E2;
  color: #DC2626;
  border-radius: 12rpx;
  padding: 12rpx 0;
}

.btn-sim-pass {
  flex: 1;
  font-size: 22rpx;
  font-weight: bold;
  background-color: #D1FAE5;
  color: #047857;
  border-radius: 12rpx;
  padding: 12rpx 0;
}

/* 底部服务端驱动 actions[] 按钮栏 */
.modal-footer-actions {
  padding: 18rpx 24rpx;
  border-top: 1px solid rgba(186, 190, 204, 0.45);
  display: flex;
  gap: 16rpx;
}

.action-btn-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.btn-action-item {
  width: 100%;
  font-size: 25rpx;
  font-weight: 800;
  border-radius: 16rpx;
  padding: 16rpx 0;
  border: none;
  line-height: 1.4;
}

.btn-act-accept {
  background-color: #1E6FFF;
  color: #FFF;
}

.btn-act-process {
  background-color: #059669;
  color: #FFF;
}

.btn-act-disabled {
  background-color: #CBD5E1;
  color: #64748B;
}

.action-disable-reason {
  font-size: 19rpx;
  color: #DC2626;
  font-weight: 600;
  text-align: center;
}

.neu-outset {
  background-color: #EBECF0;
  box-shadow: -3px -3px 7px #FFFFFF, 3px 3px 7px #BABECC;
}

.neu-inset {
  background-color: #EBECF0;
  box-shadow: inset -2px -2px 5px #FFFFFF, inset 2px 2px 5px #BABECC;
}

.bottom-placeholder {
  height: 140rpx;
}
</style>