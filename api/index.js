//封装具体接口调用
import http from "./request.js";
export default {
	// ============================================================
	// 现场处置 · 手机端核心接口 (D162 + D164：必须复核 + 处置三件套)
	// ============================================================

	/**
	 * 1.1 换出租户列表 (POST /system/auth/prelogin)
	 * @param {Object} data { username, password }
	 */
	prelogin(data) {
		return http.post("/system/auth/prelogin", data, false);
	},

	/**
	 * 1.2 登录 (POST /system/auth/login)
	 * Header: tenant-id: {上一步选中的 tenantId}
	 * @param {Object} data { username, password }
	 * @param {Number|String} tenantId
	 */
	staffLogin(data, tenantId) {
		return http.post("/system/auth/login", data, false, {
			header: {
				"tenant-id": String(tenantId || 164)
			}
		});
	},

	/**
	 * 3.1 我的信息 + 待办角标 (GET /intoclouds/mobile/staff/profile)
	 */
	getStaffProfile() {
		return http.get("/intoclouds/mobile/staff/profile", {}, true);
	},

	/**
	 * 3.2 我的工单分页 (GET /intoclouds/mobile/staff/ticket/page)
	 * @param {Object} params { scope: 'todo'|'done'|'all', status, keyword, priority, pageNo, pageSize }
	 */
	getTicketPage(params = {}) {
		const query = {
			scope: params.scope || 'todo',
			pageNo: params.pageNo || 1,
			pageSize: params.pageSize || 20
		};
		if (params.status !== undefined && params.status !== null && params.status !== '') {
			query.status = params.status;
		}
		if (params.keyword !== undefined && params.keyword !== null && String(params.keyword).trim() !== '') {
			query.keyword = String(params.keyword).trim();
		}
		if (params.priority !== undefined && params.priority !== null && params.priority !== '') {
			query.priority = params.priority;
		}
		return http.get("/intoclouds/mobile/staff/ticket/page", query, true);
	},

	/**
	 * 3.3 工单详情 (GET /intoclouds/mobile/staff/ticket/get?id=88)
	 * @param {Number|String} id 工单编号
	 */
	getTicketDetail(id) {
		return http.get("/intoclouds/mobile/staff/ticket/get", { id }, true);
	},

	/**
	 * 3.4 接单 (POST /intoclouds/mobile/staff/ticket/accept)
	 * 状态迁移：1 待接单 → 2 处理中；5 已退回 → 2 处理中（重新接单）
	 * @param {Number|String} id 工单编号
	 */
	acceptTicket(id) {
		return http.post("/intoclouds/mobile/staff/ticket/accept", { id: Number(id) }, true);
	},

	/**
	 * 3.5 提交处置 (POST /intoclouds/mobile/staff/ticket/process)
	 * 必须带处置三件套 (result + resultType + causeType) + 1~9 张现场照片 evidenceUrls
	 * 状态迁移：2 处理中 → 3 待复核
	 * @param {Object} data { id, result, resultType, causeType, evidenceUrls }
	 */
	processTicket(data) {
		return http.post("/intoclouds/mobile/staff/ticket/process", data, true);
	},

	/**
	 * 3.6 工单流转记录 (GET /intoclouds/mobile/staff/ticket/log?ticketId=88)
	 * 注意：参数名是 ticketId，不是 id
	 * @param {Number|String} ticketId 工单编号
	 */
	getTicketLogs(ticketId) {
		return http.get("/intoclouds/mobile/staff/ticket/log", { ticketId }, true);
	},

	/**
	 * 现场取证照片上传 (POST /infra/file/upload)
	 * @param {String} filePath 本地图片路径
	 */
	uploadEvidenceFile(filePath) {
		return http.upload("/infra/file/upload", filePath, true);
	}
};
