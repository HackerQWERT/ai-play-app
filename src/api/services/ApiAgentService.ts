/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatRequest } from '../models/ChatRequest';
import type { ConfirmRequest } from '../models/ConfirmRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiAgentService {
    /**
     * Vibe Stream
     * 使用 Server-Sent Events (SSE) 流式返回旅行代理的响应。
     * 接收 JSON 格式的消息列表 (List[Message])。
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static vibeStreamApiAgentVibeStreamPost(
        requestBody: ChatRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/agent/vibe/stream',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Vibe Confirm
     * 用户确认继续或提供补充信息。
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static vibeConfirmApiAgentVibeConfirmPost(
        requestBody: ConfirmRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/agent/vibe/confirm',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
