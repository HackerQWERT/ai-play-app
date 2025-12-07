// 定义后端返回的 SSE 事件结构
export type AgentEvent =
    | {
        event: "delta";
        data: string;
    }
    | {
        event: "tool_call";
        data: {
            name: string;
            inputs: any;
        };
    }
    | {
        event: "tool_result";
        data: {
            name: string;
            content: string;
            status: string;
        };
    }
    | {
        event: "interrupt"; // 新增：中断事件
        data: any;
    }
    | {
        event: "error";
        data: any;
    };

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    toolCalls?: Array<{
        name: string;
        status: "calling" | "done"
    }>;
    isStreaming?: boolean;
}

// ... (TOOL_NAME_MAP 和 getReadableToolInfo 保持不变，可以继续使用之前的文件内容) ...
export const TOOL_NAME_MAP: Record<string, string> = {
    transfer_to_booking_team: "联络预订中心",
    transfer_to_planner_agent: "咨询旅行规划师",
    transfer_to_query_agent: "转接订单查询专员",
    transfer_to_flight_agent: "分配给机票专员",
    transfer_to_hotel_agent: "分配给酒店专员",
    transfer_to_ticket_agent: "分配给门票专员",
    get_weather: "正在获取天气数据",
    search_travel_guides: "正在搜索旅行攻略",
    query_flights: "正在检索航班信息",
    query_hotels: "正在检索酒店订单",
    book_flight: "正在执行机票预订",
    book_hotel: "正在执行酒店预订",
    book_ticket: "正在执行门票预订",
};

export const getReadableToolInfo = (name: string, status: "calling" | "done") => {
    let displayName = TOOL_NAME_MAP[name];
    if (!displayName) {
        displayName = name
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
    const isTransfer = name.startsWith("transfer_to_");
    if (status === "calling") {
        return {
            text: isTransfer ? `正在${displayName}...` : displayName,
            iconColor: "#3b82f6",
        };
    } else {
        return {
            text: isTransfer ? `${displayName}已就绪` : `${displayName}已完成`,
            iconColor: "#52c41a",
        };
    }
};