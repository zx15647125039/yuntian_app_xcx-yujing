<template>
  <view class="template-clock">
    <!-- 标志性 3D 新拟态环形表盘 (巡检指挥中枢 Dial) -->
    <view class="clock-section">
      <view class="clock">
        <view class="clock-core">
          <view class="radar-sweep"></view>
          <view class="center-emblem">
            <image src="/static/images/home.png" mode="aspectFit" class="emblem-img"></image>
            <text class="center-title">{{ profile.tenantName || '预警中心' }}</text>
            <text class="center-sub">{{ profile.nickname || '咸宁巡检01' }} · 在岗</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 调度统计看板 (3列核心指标：待办工单 / 已超期 / 已闭环，不显示未读消息) -->
    <view class="stats-grid">
      <view class="stat-card neu-outset" @click="goToTicketTab('todo')">
        <text class="stat-val text-blue font-mono">{{ profile.todoCount }}</text>
        <text class="stat-label">待办工单</text>
      </view>
      <view class="stat-card neu-outset" @click="goToTicketTab('todo')">
        <text class="stat-val text-red font-mono">{{ profile.overdueCount }}</text>
        <text class="stat-label">已超期</text>
      </view>
      <view class="stat-card neu-outset" @click="goToTicketTab('done')">
        <text class="stat-val text-emerald font-mono">{{ doneCount }}</text>
        <text class="stat-label">已闭环</text>
      </view>
    </view>

    <!-- 实时调度巡检快讯卡片 -->
    <view class="broadcast-card neu-outset">
      <view class="broadcast-head">
        <view class="broadcast-title-row">
          <text class="broadcast-title">实时调度巡检快讯</text>
        </view>
        <text class="broadcast-tag">{{ profile.tenantName || '实时监控中' }}</text>
      </view>
      <view class="broadcast-body">
        <view class="bulletin-item" v-for="(news, nIdx) in newsList" :key="nIdx">
          <text :class="['bulletin-dot', news.dotClass]"></text>
          <text class="bulletin-text">{{ news.text }}</text>
        </view>
      </view>
    </view>

    <!-- 我的待办巡检工单 (同步 GET /intoclouds/mobile/staff/ticket/page?scope=todo) -->
    <view class="recent-section">
      <view class="section-head">
        <view class="section-title-box">
          <text class="section-title">我的待办巡检工单</text>
          <text class="section-count font-mono">({{ todoTickets.length }})</text>
        </view>
        <text class="section-hint" @click="goToTicketTab('todo')">全部工单 ›</text>
      </view>

      <!-- 空状态 -->
      <view v-if="todoTickets.length === 0" class="empty-card neu-inset">
        <text class="empty-title">当前暂无待办巡检工单</text>
        <text class="empty-sub">辖区巡检任务均已闭环处理</text>
      </view>

      <!-- 待办工单卡片列表 -->
      <view
        v-for="item in todoTickets"
        :key="item.id"
        class="order-card neu-outset"
        @click="openOrderModal(item)"
      >
        <!-- 第一行：工单号 + 优先级/超期信息 + 状态标签 -->
        <view class="order-card-header">
          <view class="header-left-meta">
            <text :class="['prio-tag', getPriorityClass(item.priority)]">
              {{ item.priorityLabel || '高' }}
            </text>
            <text class="order-id-mono font-mono">{{ item.ticketNo }}</text>
            <text v-if="item.overdue" class="overdue-badge">已超期</text>
          </view>
          <text :class="['order-status-badge', getStatusClass(item.status)]">
            {{ item.statusLabel }}
          </text>
        </view>

        <!-- 第二行：封面缩略图 + 标题 + 项目与告警分类 -->
        <view class="order-card-body">
          <image
            v-if="item.coverImageUrl"
            :src="item.coverImageUrl"
            mode="aspectFill"
            class="order-thumb"
          ></image>
          <view class="order-main-info">
            <text class="order-hazard-title">{{ item.title }}</text>
            <text class="order-project-line">
              {{ item.projectName || '咸宁高新区巡检' }}
              {{ item.eventType ? ' · ' + item.eventType + '巡检' : '' }}
              {{ item.levelLabel ? ' · ' + item.levelLabel + '级告警' : '' }}
            </text>
            <text class="order-deadline-line font-mono" :class="{ 'text-red-strong': item.overdue }">
              时限：{{ item.deadlineLabel || formatTimeStr(item.deadline) }}
            </text>
          </view>
        </view>

        <!-- 第三行：流转提示 + 详情按钮 -->
        <view class="order-card-footer">
          <text class="footer-step-hint">{{ getNextStepHint(item) }}</text>
          <view class="view-detail-btn neu-outset">
            <text class="btn-text">工单详情</text>
            <text class="btn-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 优化后的待办巡检工单详情弹窗 (高对比度清晰排版 + 结构化工单派发信息) -->
    <view v-if="selectedTicket" class="modal-mask" @click.stop="closeOrderModal">
      <view class="detail-dialog" @click.stop>
        <!-- 弹窗头部：工单编号、状态、优先级与关闭按钮 -->
        <view class="dialog-header">
          <view class="dialog-header-top">
            <view class="dialog-title-group">
              <text :class="['prio-tag', getPriorityClass(selectedTicket.priority)]">
                {{ selectedTicket.priorityLabel || '高' }}优先级
              </text>
              <text class="dialog-ticket-no font-mono">{{ selectedTicket.ticketNo }}</text>
              <text v-if="selectedTicket.overdue" class="overdue-badge">已超期</text>
            </view>
            <view class="dialog-header-right">
              <text :class="['order-status-badge', getStatusClass(selectedTicket.status)]">
                {{ selectedTicket.statusLabel }}
              </text>
              <view class="dialog-close-btn" @click="closeOrderModal">
                <text class="dialog-close-icon">✕</text>
              </view>
            </view>
          </view>
          <text class="dialog-main-title">{{ selectedTicket.title }}</text>
        </view>

        <!-- 弹窗主体滚动区 -->
        <scroll-view scroll-y class="dialog-scroll">
          <!-- 1. 审核退回理由横幅 (status=5 已退回 或存在复核意见时醒目展示) -->
          <view
            v-if="selectedTicket.disposal && selectedTicket.disposal.reviewResult"
            :class="['review-banner', selectedTicket.status === 5 ? 'review-banner-reject' : 'review-banner-pass']"
          >
            <view class="review-banner-head">
              <text class="review-banner-title">
                {{ selectedTicket.status === 5 ? '审核退回意见（需重新接单处置）' : '后台复核意见' }}
              </text>
            </view>
            <text class="review-banner-content">{{ selectedTicket.disposal.reviewResult }}</text>
          </view>

          <!-- 2. 重新设计的「工单派发信息」高对比度结构化卡片 -->
          <view class="detail-section-card">
            <view class="section-sub-header">
              <view class="section-title-left">
                <view class="section-accent-bar"></view>
                <text class="section-sub-title">工单派发信息</text>
              </view>
              <text class="section-time-pill font-mono">
                {{ formatTimeStr(selectedTicket.createdAt) }}
              </text>
            </view>

            <!-- A. 人员指派双栏胶囊卡 (执行人 vs 派单人) -->
            <view class="dispatch-people-row">
              <view class="person-box person-box-primary">
                <view class="person-box-top">
                  <text class="person-role-tag tag-blue">执行处置人</text>
                </view>
                <text class="person-name-val">{{ selectedTicket.assigneeName || profile.nickname || '咸宁巡检01' }}</text>
              </view>
              <view class="person-box person-box-secondary">
                <view class="person-box-top">
                  <text class="person-role-tag tag-slate">派单指派人</text>
                </view>
                <text class="person-name-val">{{ selectedTicket.assignerName || '调度中心' }}</text>
              </view>
            </view>

            <!-- B. 处置时限醒目状态条 -->
            <view :class="['deadline-banner', selectedTicket.overdue ? 'deadline-banner-overdue' : 'deadline-banner-normal']">
              <view class="deadline-banner-left">
                <text class="deadline-banner-label">要求处置时限</text>
                <text v-if="selectedTicket.overdue" class="deadline-overdue-pill">已超期</text>
              </view>
              <text class="deadline-banner-val font-mono">
                {{ selectedTicket.deadlineLabel || formatTimeStr(selectedTicket.deadline) }}
              </text>
            </view>

            <!-- C. 结构化左标题右内容对齐列表 -->
            <view class="dispatch-kv-list">
              <view class="kv-row">
                <text class="kv-label">所属项目</text>
                <text class="kv-val">
                  {{ (selectedTicket.project && selectedTicket.project.name) || selectedTicket.projectName || '咸宁高新区巡检' }}
                </text>
              </view>
              <view class="kv-row">
                <text class="kv-label">关联任务</text>
                <text class="kv-val">
                  {{ (selectedTicket.task && selectedTicket.task.name) || (selectedTicket.eventType ? selectedTicket.eventType + '常态化巡检' : '高新区日常巡检') }}
                </text>
              </view>
              <view class="kv-row" v-if="(selectedTicket.report && selectedTicket.report.reportNo) || selectedTicket.reportNo">
                <text class="kv-label">巡检报告</text>
                <text class="kv-code-badge font-mono">
                  {{ (selectedTicket.report && selectedTicket.report.reportNo) || selectedTicket.reportNo }}
                </text>
              </view>
            </view>

            <!-- D. 现场情况说明高亮信息框 -->
            <view class="scene-desc-box">
              <text class="scene-desc-title">现场情况说明</text>
              <text class="scene-desc-text">
                {{ selectedTicket.content || (selectedTicket.event && selectedTicket.event.message) || '请前往现场核实告警点位并完成标准处置。' }}
              </text>
            </view>
          </view>

          <!-- 3. 关联告警事件与抓拍帧序列 (event & event.frames[]) -->
          <view v-if="selectedTicket.event" class="detail-section-card">
            <view class="section-sub-header">
              <view class="section-title-left">
                <view class="section-accent-bar bar-red"></view>
                <text class="section-sub-title">关联 AI 告警事件</text>
              </view>
              <text class="event-code-pill font-mono">{{ selectedTicket.event.eventNo }}</text>
            </view>

            <view class="dispatch-kv-list">
              <view class="kv-row">
                <text class="kv-label">识别算法</text>
                <view class="kv-val-inline">
                  <text class="kv-val">{{ selectedTicket.event.algorithmName || selectedTicket.event.eventType || '-' }}</text>
                  <text v-if="selectedTicket.event.levelLabel" class="alarm-level-pill">
                    {{ selectedTicket.event.levelLabel }}
                  </text>
                </view>
              </view>
              <view class="kv-row" v-if="selectedTicket.event.message">
                <text class="kv-label">告警内容</text>
                <text class="kv-val text-red-strong">{{ selectedTicket.event.message }}</text>
              </view>
              <view class="kv-row" v-if="selectedTicket.event.longitude">
                <text class="kv-label">空间坐标</text>
                <text class="kv-val font-mono">
                  {{ selectedTicket.event.longitude }}, {{ selectedTicket.event.latitude }}
                  {{ selectedTicket.event.altitude ? ' (' + selectedTicket.event.altitude + 'm)' : '' }}
                </text>
              </view>
            </view>

            <!-- 告警抓拍帧列表 (优先展示 frames[]，兜底展示 imageUrl) -->
            <view class="frames-wrapper" v-if="eventFrames.length > 0">
              <text class="frames-header-label">告警抓拍画面（点击图片全屏查看）</text>
              <view :class="['frames-grid', eventFrames.length === 1 ? 'frames-grid-single' : '']">
                <view
                  v-for="(frame, fIdx) in eventFrames"
                  :key="fIdx"
                  class="frame-card"
                  @click="previewEventFrames(fIdx)"
                >
                  <image :src="frame.url" mode="aspectFill" class="frame-img"></image>
                  <view class="frame-caption">
                    <text class="frame-tag">{{ frame.isOrigin ? '告警原帧' : '抓拍帧 #' + (fIdx + 1) }}</text>
                    <text class="frame-time font-mono">{{ formatShortTime(frame.frameTime) }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 4. 已填写的处置记录回显 (当存在 disposal.result 时展示) -->
          <view
            v-if="selectedTicket.disposal && selectedTicket.disposal.result"
            class="detail-section-card"
          >
            <view class="section-sub-header">
              <view class="section-title-left">
                <view class="section-accent-bar bar-emerald"></view>
                <text class="section-sub-title">已提交处置记录</text>
              </view>
              <text class="section-time-pill font-mono">{{ formatTimeStr(selectedTicket.disposal.submittedAt) }}</text>
            </view>
            <view class="dispatch-kv-list">
              <view class="kv-row">
                <text class="kv-label">结果分类</text>
                <text class="kv-val text-blue">{{ selectedTicket.disposal.resultTypeLabel || '-' }}</text>
              </view>
              <view class="kv-row">
                <text class="kv-label">原因归类</text>
                <text class="kv-val">{{ selectedTicket.disposal.causeTypeLabel || '-' }}</text>
              </view>
            </view>
            <view class="scene-desc-box">
              <text class="scene-desc-title">处置说明</text>
              <text class="scene-desc-text">{{ selectedTicket.disposal.result }}</text>
            </view>
            <view
              v-if="selectedTicket.disposal.evidenceUrls && selectedTicket.disposal.evidenceUrls.length"
              class="evidence-row"
            >
              <image
                v-for="(imgUrl, eIdx) in selectedTicket.disposal.evidenceUrls"
                :key="eIdx"
                :src="imgUrl"
                mode="aspectFill"
                class="evidence-thumb"
                @click="previewPhotoList(selectedTicket.disposal.evidenceUrls, eIdx)"
              ></image>
            </view>
          </view>

          <!-- 5. 工单流转记录时间轴 (GET /intoclouds/mobile/staff/ticket/log?ticketId=...) -->
          <view class="detail-section-card" v-if="selectedTicketLogs.length > 0">
            <view class="section-sub-header">
              <view class="section-title-left">
                <view class="section-accent-bar"></view>
                <text class="section-sub-title">工单流转记录</text>
              </view>
              <text class="section-time-pill">共 {{ selectedTicketLogs.length }} 条</text>
            </view>
            <view class="timeline-list">
              <view
                v-for="(log, lIdx) in selectedTicketLogs"
                :key="lIdx"
                class="timeline-item"
              >
                <view :class="['timeline-dot', lIdx === selectedTicketLogs.length - 1 ? 'dot-active' : '']"></view>
                <view class="timeline-content">
                  <view class="timeline-top">
                    <text class="timeline-action">{{ log.actionLabel }}</text>
                    <text class="timeline-time font-mono">{{ formatTimeStr(log.createTime || log.createdAt) }}</text>
                  </view>
                  <text class="timeline-operator">操作人：{{ log.operatorName || '-' }}</text>
                  <text v-if="log.remark" class="timeline-remark">{{ log.remark }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 弹窗底部操作区：支持一键接单或前往处置台填写处置三件套 -->
        <view class="dialog-footer">
          <button class="btn-dialog-secondary" @click="closeOrderModal">关闭</button>
          <button
            v-if="canAcceptSelected"
            class="btn-dialog-accept"
            :disabled="submittingAccept"
            @click="handleQuickAccept"
          >
            {{ selectedTicket.status === 5 ? '重新接单 (5→2)' : '立即接单 (1→2)' }}
          </button>
          <button class="btn-dialog-confirm" @click="jumpToHandleTicket">
            {{ selectedTicket.status === 2 ? '去填处置三件套 ›' : '进入处置工作台 ›' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>
  </view>
</template>

<script>
import api from '@/api/index.js';

export default {
  name: 'PageA',
  props: {
    deptIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      profile: {
        userId: null,
        nickname: '',
        tenantId: null,
        tenantName: '',
        todoCount: 0,
        overdueCount: 0
      },
      doneCount: 0,
      todoTickets: [],
      selectedTicket: null,
      selectedTicketLogs: [],
      submittingAccept: false
    };
  },
  computed: {
    newsList() {
      if (Array.isArray(this.todoTickets) && this.todoTickets.length > 0) {
        return this.todoTickets.slice(0, 3).map((item) => ({
          dotClass: item.overdue ? 'dot-amber' : item.status === 1 ? 'dot-blue' : 'dot-emerald',
          text: `【${item.statusLabel || '待办'}】${item.ticketNo || ''} ${item.title || ''}`
        }));
      }
      return [
        {
          dotClass: 'dot-emerald',
          text: '当前暂无待办巡检告警快讯'
        }
      ];
    },
    eventFrames() {
      if (!this.selectedTicket || !this.selectedTicket.event) return [];
      const ev = this.selectedTicket.event;
      if (Array.isArray(ev.frames) && ev.frames.length > 0) {
        return ev.frames.map((f) => ({
          url: f.url || f.imageUrl,
          frameTime: f.frameTime || f.capturedAt || ev.discoveredAt,
          isOrigin: Boolean(f.isOrigin)
        }));
      }
      if (ev.imageUrl) {
        return [
          {
            url: ev.imageUrl,
            frameTime: ev.discoveredAt || this.selectedTicket.createdAt,
            isOrigin: true
          }
        ];
      }
      return [];
    },
    canAcceptSelected() {
      if (!this.selectedTicket) return false;
      if (Array.isArray(this.selectedTicket.actions)) {
        const acceptAct = this.selectedTicket.actions.find((a) => a.key === 'accept');
        if (acceptAct) return Boolean(acceptAct.enabled);
      }
      return this.selectedTicket.status === 1 || this.selectedTicket.status === 5;
    }
  },
  mounted() {
    this.loadHomeData();
    uni.$on('profileUpdated', (prof) => {
      if (prof) this.profile = prof;
    });
    uni.$on('refreshTickets', () => {
      this.loadHomeData();
    });
  },
  beforeDestroy() {
    uni.$off('profileUpdated');
  },
  methods: {
    async loadHomeData() {
      try {
        const [profRes, todoRes, doneRes] = await Promise.all([
          api.getStaffProfile().catch(() => null),
          api.getTicketPage({ scope: 'todo', pageNo: 1, pageSize: 10 }).catch(() => null),
          api.getTicketPage({ scope: 'done', pageNo: 1, pageSize: 10 }).catch(() => null)
        ]);
        if (profRes && profRes.code === 0 && profRes.data) {
          this.profile = profRes.data;
        }
        if (todoRes && todoRes.code === 0 && todoRes.data && Array.isArray(todoRes.data.list)) {
          this.todoTickets = todoRes.data.list;
        } else {
          this.todoTickets = [];
        }
        if (doneRes && doneRes.code === 0 && doneRes.data) {
          this.doneCount = doneRes.data.total || 0;
        }
      } catch (e) {
        console.error('loadHomeData error:', e);
      }
    },
    formatTimeStr(str) {
      if (!str) return '-';
      return String(str).replace('T', ' ').slice(0, 19);
    },
    formatShortTime(str) {
      if (!str) return '';
      const clean = String(str).replace('T', ' ');
      return clean.length > 11 ? clean.slice(11, 19) : clean;
    },
    getStatusClass(status) {
      if (status === 1) return 'badge-amber';
      if (status === 2) return 'badge-blue';
      if (status === 3) return 'badge-indigo';
      if (status === 4) return 'badge-emerald';
      if (status === 5) return 'badge-red';
      return 'badge-blue';
    },
    getPriorityClass(priority) {
      if (priority === 0) return 'prio-urgent';
      if (priority === 1) return 'prio-high';
      if (priority === 2) return 'prio-medium';
      return 'prio-low';
    },
    getNextStepHint(item) {
      if (item.status === 1) return '待接单 · 点击核验并立即接单';
      if (item.status === 2) return '处理中 · 待提交处置三件套与现场照片';
      if (item.status === 3) return '待复核 · 已提交处置，等待后台审核';
      if (item.status === 5) return '已退回 · 请查看退回原因并重新接单';
      return '点击查看工单详情';
    },
    async openOrderModal(item) {
      this.selectedTicket = { ...item };
      this.selectedTicketLogs = [];

      try {
        const [detailRes, logRes] = await Promise.all([
          api.getTicketDetail(item.id).catch(() => null),
          api.getTicketLogs(item.id).catch(() => null)
        ]);
        if (detailRes && detailRes.code === 0 && detailRes.data) {
          this.selectedTicket = detailRes.data;
        }
        if (logRes && logRes.code === 0 && Array.isArray(logRes.data)) {
          this.selectedTicketLogs = logRes.data;
        }
      } catch (e) {
        console.error(e);
      }
    },
    closeOrderModal() {
      this.selectedTicket = null;
      this.selectedTicketLogs = [];
    },
    async handleQuickAccept() {
      if (!this.selectedTicket || this.submittingAccept) return;
      this.submittingAccept = true;
      try {
        const res = await api.acceptTicket(this.selectedTicket.id);
        if (res && res.code === 0) {
          uni.showToast({
            title: '接单成功，已转入处理中',
            icon: 'none'
          });
          await this.loadHomeData();
          const [detailRes, logRes] = await Promise.all([
            api.getTicketDetail(this.selectedTicket.id).catch(() => null),
            api.getTicketLogs(this.selectedTicket.id).catch(() => null)
          ]);
          if (detailRes && detailRes.code === 0 && detailRes.data) {
            this.selectedTicket = detailRes.data;
          }
          if (logRes && logRes.code === 0 && Array.isArray(logRes.data)) {
            this.selectedTicketLogs = logRes.data;
          }
          uni.$emit('refreshTickets');
        }
      } catch (e) {
        uni.showToast({
          title: '接单请求失败，请检查网络',
          icon: 'none'
        });
      } finally {
        this.submittingAccept = false;
      }
    },
    goToTicketTab(scope = 'todo') {
      uni.$emit('changeTabbar', 2);
      if (scope) {
        setTimeout(() => {
          uni.$emit('switchTicketScope', scope);
        }, 60);
      }
    },
    jumpToHandleTicket() {
      const ticketId = this.selectedTicket ? this.selectedTicket.id : null;
      this.selectedTicket = null;
      uni.$emit('changeTabbar', 2);
      if (ticketId) {
        setTimeout(() => {
          uni.$emit('openTicketFromHome', ticketId);
        }, 80);
      }
    },
    previewEventFrames(index = 0) {
      const urls = this.eventFrames.map((f) => f.url).filter(Boolean);
      if (!urls.length) return;
      uni.previewImage({
        current: urls[index] || urls[0],
        urls
      });
    },
    previewPhotoList(urls, index = 0) {
      if (!urls || !urls.length) return;
      uni.previewImage({
        current: urls[index] || urls[0],
        urls
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.template-clock {
  width: 100%;
  background-color: #EBECF0;
  box-sizing: border-box;
  padding: 16rpx 24rpx;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.clock-section {
  display: flex;
  justify-content: center;
  margin: 12rpx 0 20rpx 0;
}

.clock {
  margin: 0 auto;
  box-shadow: 0 -0.8em 0.8em rgba(0, 0, 0, 0.22) inset, 
              0 0.4em 0.8em rgba(255, 255, 255, 0.6) inset, 
              0 -0.4em 0.8em rgba(255, 255, 255, 0.7), 
              0 0.8em 0.8em rgba(0, 0, 0, 0.22);
  position: relative;
  width: 13.5em;
  height: 13.5em;
  border-radius: 50%;
  background-color: #EBECF0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clock:before {
  content: "";
  display: block;
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 0 0.8em 0.4em rgba(0, 0, 0, 0.1) inset, 
              0 -0.4em 0.8em 0.4em rgba(0, 0, 0, 0.08);
  top: 1.8em;
  left: 1.8em;
  width: 9.9em;
  height: 9.9em;
  pointer-events: none;
}

.clock-core {
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background-color: #EBECF0;
  box-shadow: -4px -4px 8px #FFFFFF, 4px 4px 8px #BABECC;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.radar-sweep {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, rgba(30, 111, 255, 0.02) 0%, rgba(30, 111, 255, 0.16) 100%);
}

.center-emblem {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.emblem-img {
  width: 68rpx;
  height: 68rpx;
  margin-bottom: 6rpx;
}

.center-title {
  font-size: 25rpx;
  font-weight: 900;
  color: #0F172A;
}

.center-sub {
  font-size: 20rpx;
  color: #1E6FFF;
  font-weight: 700;
  margin-top: 4rpx;
}

/* 3列核心指标看板（移除未读消息统计） */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.stat-card {
  padding: 22rpx 12rpx;
  border-radius: 22rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-val {
  font-size: 40rpx;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 23rpx;
  color: #0F172A;
  font-weight: 700;
}

.text-blue { color: #1D4ED8; }
.text-emerald { color: #047857; }
.text-red { color: #DC2626; }
.text-red-strong { color: #DC2626; font-weight: 800; }

.broadcast-card {
  padding: 24rpx;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.broadcast-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(186, 190, 204, 0.4);
  padding-bottom: 12rpx;
}

.broadcast-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.broadcast-title {
  font-size: 28rpx;
  font-weight: 900;
  color: #0F172A;
}

.broadcast-tag {
  font-size: 20rpx;
  color: #15803D;
  font-weight: 800;
}

.broadcast-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.bulletin-item {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
}

.bulletin-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  margin-top: 12rpx;
  flex-shrink: 0;
}

.dot-blue { background-color: #1D4ED8; }
.dot-amber { background-color: #D97706; }
.dot-emerald { background-color: #059669; }

.bulletin-text {
  font-size: 24rpx;
  color: #1E293B;
  font-weight: 600;
  line-height: 1.45;
}

.recent-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4rpx;
}

.section-title-box {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 900;
  color: #0F172A;
}

.section-count {
  font-size: 24rpx;
  font-weight: 800;
  color: #1D4ED8;
}

.section-hint {
  font-size: 23rpx;
  color: #1E6FFF;
  font-weight: 800;
}

.empty-card {
  padding: 40rpx 24rpx;
  border-radius: 24rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.empty-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #334155;
}

.empty-sub {
  font-size: 22rpx;
  color: #64748B;
}

/* 优化后的待办巡检工单卡片 */
.order-card {
  padding: 24rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.order-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14rpx;
  border-bottom: 1px solid rgba(186, 190, 204, 0.35);
}

.header-left-meta {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.prio-tag {
  font-size: 22rpx;
  font-weight: 800;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
}

.prio-urgent {
  background-color: #DC2626;
  color: #FFFFFF;
}

.prio-high {
  background-color: #FFEDD5;
  color: #C2410C;
  border: 1px solid #FDBA74;
}

.prio-medium {
  background-color: #DBEAFE;
  color: #1D4ED8;
}

.prio-low {
  background-color: #E2E8F0;
  color: #334155;
}

.order-id-mono {
  font-size: 25rpx;
  color: #0F172A;
  font-weight: 800;
}

.overdue-badge {
  font-size: 21rpx;
  background-color: #DC2626;
  color: #FFFFFF;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-weight: 800;
}

.order-status-badge {
  font-size: 23rpx;
  font-weight: 800;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.badge-amber { background-color: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; }
.badge-blue { background-color: #DBEAFE; color: #1D4ED8; border: 1px solid #BFDBFE; }
.badge-indigo { background-color: #E0E7FF; color: #4338CA; border: 1px solid #C7D2FE; }
.badge-emerald { background-color: #D1FAE5; color: #047857; border: 1px solid #A7F3D0; }
.badge-red { background-color: #FEE2E2; color: #DC2626; border: 1px solid #FECACA; }

.order-card-body {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.order-thumb {
  width: 124rpx;
  height: 124rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  background-color: #CBD5E1;
}

.order-main-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.order-hazard-title {
  font-size: 29rpx;
  font-weight: 900;
  color: #0F172A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-project-line {
  font-size: 24rpx;
  color: #334155;
  font-weight: 700;
}

.order-deadline-line {
  font-size: 23rpx;
  color: #1E293B;
  font-weight: 700;
}

.order-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10rpx;
  border-top: 1px solid rgba(186, 190, 204, 0.25);
}

.footer-step-hint {
  font-size: 23rpx;
  color: #475569;
  font-weight: 700;
}

.view-detail-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.btn-text {
  font-size: 23rpx;
  font-weight: 800;
  color: #1D4ED8;
}

.btn-arrow {
  font-size: 24rpx;
  font-weight: 900;
  color: #1D4ED8;
}

/* ============================================================
   深度优化后的工单详情弹窗 (纯白内衬卡片 + 高对比度大字号排版)
   ============================================================ */
.modal-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.68);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
}

.detail-dialog {
  width: 100%;
  max-width: 700rpx;
  max-height: 88vh;
  border-radius: 32rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #F1F5F9;
  box-shadow: 0 24rpx 60rpx rgba(15, 23, 42, 0.38);
  border: 1px solid #FFFFFF;
}

.dialog-header {
  padding: 28rpx 30rpx 24rpx;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.dialog-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-title-group {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.dialog-ticket-no {
  font-size: 27rpx;
  font-weight: 900;
  color: #0F172A;
  letter-spacing: 0.5rpx;
}

.dialog-header-right {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.dialog-close-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: #F1F5F9;
  border: 1px solid #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-close-icon {
  font-size: 28rpx;
  color: #0F172A;
  font-weight: 900;
}

.dialog-main-title {
  font-size: 34rpx;
  font-weight: 900;
  color: #0F172A;
  line-height: 1.4;
}

.dialog-scroll {
  padding: 22rpx 24rpx;
  box-sizing: border-box;
  max-height: 64vh;
}

.review-banner {
  padding: 22rpx 24rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.review-banner-reject {
  background-color: #FEF2F2;
  border: 1px solid #FCA5A5;
}

.review-banner-pass {
  background-color: #ECFDF5;
  border: 1px solid #6EE7B7;
}

.review-banner-title {
  font-size: 26rpx;
  font-weight: 900;
  color: #991B1B;
  display: block;
  margin-bottom: 8rpx;
}

.review-banner-pass .review-banner-title {
  color: #065F46;
}

.review-banner-content {
  font-size: 26rpx;
  color: #7F1D1D;
  line-height: 1.55;
  font-weight: 700;
}

.review-banner-pass .review-banner-content {
  color: #064E3B;
}

/* 纯白高对比度分组卡片，彻底解决灰底灰字看不清问题 */
.detail-section-card {
  padding: 26rpx;
  border-radius: 24rpx;
  margin-bottom: 22rpx;
  background-color: #FFFFFF;
  border: 1px solid #CBD5E1;
  box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.section-sub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14rpx;
  border-bottom: 1px solid #E2E8F0;
}

.section-title-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.section-accent-bar {
  width: 8rpx;
  height: 28rpx;
  border-radius: 4rpx;
  background-color: #1D4ED8;
}

.bar-red {
  background-color: #DC2626;
}

.bar-emerald {
  background-color: #059669;
}

.section-sub-title {
  font-size: 29rpx;
  font-weight: 900;
  color: #0F172A;
}

.section-time-pill {
  font-size: 23rpx;
  color: #334155;
  background-color: #F1F5F9;
  padding: 6rpx 14rpx;
  border-radius: 10rpx;
  font-weight: 700;
}

.event-code-pill {
  font-size: 23rpx;
  color: #1D4ED8;
  background-color: #EFF6FF;
  border: 1px solid #BFDBFE;
  padding: 6rpx 14rpx;
  border-radius: 10rpx;
  font-weight: 800;
}

/* 人员指派双栏卡片 (执行处置人 vs 派单指派人) */
.dispatch-people-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.person-box {
  padding: 18rpx 20rpx;
  border-radius: 18rpx;
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

.person-box-top {
  display: flex;
  align-items: center;
}

.person-role-tag {
  font-size: 22rpx;
  font-weight: 800;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
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
  font-size: 29rpx;
  font-weight: 900;
  color: #0F172A;
  padding-left: 2rpx;
}

/* 处置时限醒目横幅 */
.deadline-banner {
  padding: 18rpx 22rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  font-size: 26rpx;
  font-weight: 800;
  color: #1E293B;
}

.deadline-banner-overdue .deadline-banner-label {
  color: #991B1B;
}

.deadline-overdue-pill {
  font-size: 21rpx;
  font-weight: 800;
  background-color: #DC2626;
  color: #FFFFFF;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
}

.deadline-banner-val {
  font-size: 27rpx;
  font-weight: 900;
  color: #0F172A;
}

.deadline-banner-overdue .deadline-banner-val {
  color: #DC2626;
}

/* 结构化左标签右值列表 */
.dispatch-kv-list {
  display: flex;
  flex-direction: column;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 18rpx;
  padding: 6rpx 20rpx;
}

.kv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1px dashed #CBD5E1;
  gap: 16rpx;
}

.kv-row:last-child {
  border-bottom: none;
}

.kv-label {
  font-size: 26rpx;
  color: #334155;
  font-weight: 800;
  flex-shrink: 0;
}

.kv-val {
  font-size: 27rpx;
  color: #0F172A;
  font-weight: 800;
  text-align: right;
  word-break: break-all;
}

.kv-val-inline {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10rpx;
  flex-wrap: wrap;
}

.kv-code-badge {
  font-size: 25rpx;
  font-weight: 800;
  color: #1E3A8A;
  background-color: #DBEAFE;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
}

.alarm-level-pill {
  font-size: 22rpx;
  font-weight: 800;
  background-color: #FEE2E2;
  color: #DC2626;
  border: 1px solid #FCA5A5;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
}

/* 现场情况说明高亮框 */
.scene-desc-box {
  background-color: #F8FAFC;
  border: 1px solid #CBD5E1;
  border-left: 8rpx solid #1D4ED8;
  border-radius: 16rpx;
  padding: 18rpx 22rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.scene-desc-title {
  font-size: 25rpx;
  font-weight: 900;
  color: #1E3A8A;
}

.scene-desc-text {
  font-size: 27rpx;
  color: #0F172A;
  font-weight: 700;
  line-height: 1.6;
}

.frames-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 4rpx;
}

.frames-header-label {
  font-size: 25rpx;
  color: #334155;
  font-weight: 800;
}

.frames-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.frames-grid-single {
  grid-template-columns: 1fr;
}

.frame-card {
  border-radius: 18rpx;
  overflow: hidden;
  position: relative;
  border: 1px solid #CBD5E1;
  background-color: #0F172A;
}

.frame-img {
  width: 100%;
  height: 220rpx;
  display: block;
}

.frames-grid-single .frame-img {
  height: 280rpx;
}

.frame-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10rpx 16rpx;
  background-color: #0F172A;
}

.frame-tag {
  font-size: 23rpx;
  color: #FFFFFF;
  font-weight: 800;
}

.frame-time {
  font-size: 22rpx;
  color: #E2E8F0;
  font-weight: 700;
}

.evidence-row {
  display: flex;
  gap: 14rpx;
  flex-wrap: wrap;
  padding-top: 6rpx;
}

.evidence-thumb {
  width: 140rpx;
  height: 140rpx;
  border-radius: 14rpx;
  border: 1px solid #CBD5E1;
}

/* 流转日志时间轴 */
.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.timeline-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background-color: #64748B;
  margin-top: 12rpx;
  flex-shrink: 0;
}

.dot-active {
  background-color: #1D4ED8;
  box-shadow: 0 0 0 6rpx rgba(29, 78, 216, 0.2);
}

.timeline-content {
  flex: 1;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.timeline-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}

.timeline-action {
  font-size: 27rpx;
  font-weight: 900;
  color: #0F172A;
}

.timeline-time {
  font-size: 22rpx;
  color: #334155;
  font-weight: 700;
}

.timeline-operator {
  font-size: 25rpx;
  color: #1E293B;
  font-weight: 700;
}

.timeline-remark {
  font-size: 25rpx;
  color: #0F172A;
  font-weight: 600;
  line-height: 1.5;
}

.dialog-footer {
  padding: 22rpx 28rpx;
  background-color: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  display: flex;
  gap: 16rpx;
}

.btn-dialog-secondary {
  flex: 1;
  background-color: #E2E8F0;
  color: #0F172A;
  font-size: 26rpx;
  font-weight: 900;
  border-radius: 18rpx;
  padding: 20rpx 0;
  border: none;
}

.btn-dialog-accept {
  flex: 1.4;
  background-color: #059669;
  color: #FFFFFF;
  font-size: 26rpx;
  font-weight: 900;
  border-radius: 18rpx;
  padding: 20rpx 0;
  border: none;
}

.btn-dialog-confirm {
  flex: 1.6;
  background-color: #1D4ED8;
  color: #FFFFFF;
  font-size: 26rpx;
  font-weight: 900;
  border-radius: 18rpx;
  padding: 20rpx 0;
  border: none;
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