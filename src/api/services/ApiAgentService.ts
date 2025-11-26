/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiAgentService {
    /**
     * Vibe Stream
     * 使用 Server-Sent Events (SSE) 流式返回旅行代理的响应。
     * 前端可以使用 EventSource 连接此接口。
     * @param query
     * @returns any Successful Response
     * @throws ApiError
     */
    public static vibeStreamApiAgentVibeStreamGet(
        query: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/agent/vibe/stream',
            query: {
                'query': query,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Vibe
     * 调用旅行代理处理用户查询 (非流式，仅用于调试或简单客户端)
     * @param query
     * @returns any Successful Response
     * @throws ApiError
     */
    public static vibeApiAgentVibePost(
        query: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/agent/vibe',
            query: {
                'query': query,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
