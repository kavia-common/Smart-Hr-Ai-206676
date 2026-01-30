
const API_Base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// --- EMPLOYEES ---

export interface EmployeeOut {
    id: string;
    org_id: string;
    user_id: string;
    employee_code: string;
    first_name: string;
    last_name: string | null;
    work_email: string | null;
    phone: string | null;
    job_title: string | null;
    department: string | null;
    location: string | null;
    employment_type: string | null;
    status: string;
    date_of_joining: string | null;
    manager_employee_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface ListEmployeesParams {
    token: string;
    limit?: number;
    offset?: number;
}

export async function listEmployees({
    token,
    limit = 50,
    offset = 0,
}: ListEmployeesParams): Promise<EmployeeOut[]> {
    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
    });

    const res = await fetch(`${API_Base}/employees?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch employees");
    }

    return res.json();
}

// --- LEAVES ---

export interface LeaveRequestOut {
    id: string;
    org_id: string;
    employee_id: string;
    leave_type_id: string;
    start_date: string;
    end_date: string;
    unit: string;
    quantity: number;
    reason: string | null;
    status: string;
    requested_at: string;
    decided_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface LeaveBalanceOut {
    leave_type_id: string;
    balance: number;
}

export interface ApplyLeaveParams {
    token: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    quantity: number;
    reason: string | null;
}

export async function applyLeave({
    token,
    leaveTypeId,
    startDate,
    endDate,
    quantity,
    reason,
}: ApplyLeaveParams): Promise<LeaveRequestOut> {
    const res = await fetch(`${API_Base}/leaves/requests`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            leave_type_id: leaveTypeId,
            start_date: startDate,
            end_date: endDate,
            unit: "days", // defaulting to days as per UI simplicity
            quantity,
            reason,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to apply for leave");
    }

    return res.json();
}

export interface ListLeaveRequestsParams {
    token: string;
    status?: string;
}

export async function listLeaveRequests({
    token,
    status,
}: ListLeaveRequestsParams): Promise<LeaveRequestOut[]> {
    const params = new URLSearchParams();
    if (status) params.append("status_filter", status);

    const res = await fetch(`${API_Base}/leaves/requests?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Failed to list leave requests");
    }

    return res.json();
}

export interface DecideLeaveParams {
    token: string;
    leaveRequestId: string;
    decision: "approved" | "rejected";
    comment?: string;
}

export async function decideLeave({
    token,
    leaveRequestId,
    decision,
    comment,
}: DecideLeaveParams): Promise<LeaveRequestOut> {
    const res = await fetch(`${API_Base}/leaves/requests/${leaveRequestId}/decision`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            decision,
            comment: comment || null,
        }),
    });

    if (!res.ok) {
        throw new Error("Failed to submit decision");
    }

    return res.json();
}

export interface MyLeaveBalancesParams {
    token: string;
}

export async function myLeaveBalances({
    token,
}: MyLeaveBalancesParams): Promise<LeaveBalanceOut[]> {
    const res = await fetch(`${API_Base}/leaves/balances/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch leave balances");
    }

    return res.json();
}

// --- ATTENDANCE ---

export interface AttendanceSessionOut {
    id: string;
    org_id: string;
    employee_id: string;
    session_date: string;
    work_mode: string;
    clock_in_at: string;
    clock_out_at: string | null;
    minutes_worked: number;
    source: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface ClockInParams {
    token: string;
    workMode: string;
    source?: string;
    notes?: string | null;
}

export async function clockIn({
    token,
    workMode,
    source = "web",
    notes,
}: ClockInParams): Promise<AttendanceSessionOut> {
    const res = await fetch(`${API_Base}/attendance/clock-in`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            work_mode: workMode,
            source,
            notes: notes || null,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Clock-in failed");
    }

    return res.json();
}

export interface ClockOutParams {
    token: string;
    notes?: string | null;
}

export async function clockOut({
    token,
    notes,
}: ClockOutParams): Promise<AttendanceSessionOut> {
    const res = await fetch(`${API_Base}/attendance/clock-out`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            notes: notes || null,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Clock-out failed");
    }

    return res.json();
}

export interface ListAttendanceSessionsParams {
    token: string;
    startDate: string;
    endDate: string;
}

export async function listAttendanceSessions({
    token,
    startDate,
    endDate,
}: ListAttendanceSessionsParams): Promise<AttendanceSessionOut[]> {
    const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
    });

    const res = await fetch(`${API_Base}/attendance/sessions?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Failed to list attendance sessions");
    }

    return res.json();
}

// --- AUDIT ---

export interface AuditLogOut {
    id: string;
    org_id: string;
    actor_user_id: string;
    actor_employee_id: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    ip: string | null;
    user_agent: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface ListAuditLogsParams {
    token: string;
    limit?: number;
}

export async function listAuditLogs({
    token,
    limit = 200,
}: ListAuditLogsParams): Promise<AuditLogOut[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    const res = await fetch(`${API_Base}/audit/logs?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to list audit logs");
    }

    return res.json();
}

// --- HOLIDAYS ---

export interface HolidayOut {
    id: string;
    org_id: string;
    calendar_id: string;
    holiday_date: string;
    name: string;
    type: string;
}

export interface ListHolidaysParams {
    token: string;
    startDate: string;
    endDate: string;
}

export async function listHolidays({
    token,
    startDate,
    endDate,
}: ListHolidaysParams): Promise<HolidayOut[]> {
    const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
    });

    const res = await fetch(`${API_Base}/holidays?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to list holidays");
    }

    return res.json();
}

// --- PAYROLL ---

export interface PayrollCycleOut {
    id: string;
    org_id: string;
    code: string;
    start_date: string;
    end_date: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ListPayrollCyclesParams {
    token: string;
}

export async function listPayrollCycles({
    token,
}: ListPayrollCyclesParams): Promise<PayrollCycleOut[]> {
    const res = await fetch(`${API_Base}/payroll/cycles`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to list payroll cycles");
    }

    return res.json();
}
