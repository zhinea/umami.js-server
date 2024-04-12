import {TIME_UNIT} from "./date.ts";
import {
    COLLECTION_TYPE, DATA_TYPE,
    EVENT_TYPE,
    KAFKA_TOPIC,
    PERMISSIONS,
    REPORT_TYPES,
    ROLES,
} from "../libs/constants.ts";

type ObjectValues<T> = T[keyof T];

export type TimeUnit = ObjectValues<typeof TIME_UNIT>;
export type Permission = ObjectValues<typeof PERMISSIONS>;

export type CollectionType = ObjectValues<typeof COLLECTION_TYPE>;
export type Role = ObjectValues<typeof ROLES>;
export type EventType = ObjectValues<typeof EVENT_TYPE>;
export type DynamicDataType = ObjectValues<typeof DATA_TYPE>;
export type KafkaTopic = ObjectValues<typeof KAFKA_TOPIC>;
export type ReportType = ObjectValues<typeof REPORT_TYPES>;

export interface User {
    id: string;
    username: string;
    password?: string;
    role: string;
    createdAt?: Date;
}

export interface Website {
    id: string;
    userId: string;
    resetAt: Date;
    name: string;
    domain: string;
    shareId: string;
    createdAt: Date;
}

export interface Share {
    id: string;
    token: string;
}

export interface WebsiteActive {
    x: number;
}

export interface WebsiteMetric {
    x: string;
    y: number;
}

export interface WebsiteEventMetric {
    x: string;
    t: string;
    y: number;
}

export interface WebsiteEventData {
    eventName?: string;
    fieldName: string;
    dataType: number;
    fieldValue?: string;
    total: number;
}

export interface WebsitePageviews {
    pageviews: {
        t: string;
        y: number;
    };
    sessions: {
        t: string;
        y: number;
    };
}

export interface WebsiteStats {
    pageviews: { value: number; change: number };
    uniques: { value: number; change: number };
    bounces: { value: number; change: number };
    totalTime: { value: number; change: number };
}

export interface RealtimeInit {
    websites: Website[];
    token: string;
    data: RealtimeUpdate;
}

export interface RealtimeUpdate {
    pageviews: any[];
    sessions: any[];
    events: any[];
    timestamp: number;
}

export interface DateRange {
    value: string;
    startDate: Date;
    endDate: Date;
    unit?: TimeUnit;
    num?: number;
    offset?: number;
}

export interface QueryFilters {
    startDate?: Date;
    endDate?: Date;
    timezone?: string;
    unit?: string;
    eventType?: number;
    url?: string;
    referrer?: string;
    title?: string;
    query?: string;
    os?: string;
    browser?: string;
    device?: string;
    country?: string;
    region?: string;
    city?: string;
    language?: string;
    event?: string;
    search?: string;
}

export interface QueryOptions {
    joinSession?: boolean;
    columns?: { [key: string]: string };
    limit?: number;
}

export interface RealtimeData {
    pageviews: any[];
    sessions: any[];
    events: any[];
    timestamp: number;
    countries?: any[];
    visitors?: any[];
}

export interface DynamicData {
    [key: string]: number | string | DynamicData | number[] | string[] | DynamicData[];
}
