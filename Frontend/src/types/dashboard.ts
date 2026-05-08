export type SecurityEvent = {
    id: number;
    timestamp: string;
    event_type: string;
    source_ip: string;
    path: string;
    detail: string;
    severity: 'low' | 'medium' | 'high' | 'critical' | (string & {});
};

export type Alert = {
    id: number;
    timestamp: string;
    alert_type: string;
    source_ip: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical' | (string & {});
};

export type Attack = {
    start_time: string;
    end_time: string;
    source_ip: string;
    events: SecurityEvent[];
    event_count: number;
    event_types: string[];
    severity: 'low' | 'medium' | 'high' | 'critical' | (string & {});
    classification: string;
};
