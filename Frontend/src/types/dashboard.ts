export type SecurityEvent = {
    id: number;
    timestamp: string;
    event_type: string;
    source_ip: string;
    path: string;
    detail: string;
    severity: 'low' | 'medium' | 'high' | 'critical' | (string & {});
};
