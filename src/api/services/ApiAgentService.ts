/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiAgentService {
    /**
     * Vibe
     * 调用旅行代理处理用户查询
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
