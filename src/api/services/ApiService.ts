/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiService {
    /**
     * Read Root
     * @returns any Successful Response
     * @throws ApiError
     */
    public static readRootApiGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/',
        });
    }
    /**
     * Book Flight Endpoint
     * @param fromAirport
     * @param toAirport
     * @returns any Successful Response
     * @throws ApiError
     */
    public static bookFlightEndpointApiBookFlightPost(
        fromAirport: string,
        toAirport: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/book-flight',
            query: {
                'from_airport': fromAirport,
                'to_airport': toAirport,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Book Hotel Endpoint
     * @param hotelName
     * @returns any Successful Response
     * @throws ApiError
     */
    public static bookHotelEndpointApiBookHotelPost(
        hotelName: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/book-hotel',
            query: {
                'hotel_name': hotelName,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Flights Endpoint
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getFlightsEndpointApiFlightsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/flights',
        });
    }
    /**
     * Get Hotels Endpoint
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getHotelsEndpointApiHotelsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hotels',
        });
    }
    /**
     * Agent Endpoint
     * 调用旅行代理处理用户查询
     * @param query
     * @returns any Successful Response
     * @throws ApiError
     */
    public static agentEndpointApiAgentPost(
        query: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/agent',
            query: {
                'query': query,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
