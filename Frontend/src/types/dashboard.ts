export type Event = {
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
    events: Event[];
    event_count: number;
    event_types: string[];
    severity: 'low' | 'medium' | 'high' | 'critical' | (string & {});
    classification: string;
    risk_score: number;
};

export type Stats = {
    events_per_hour: Record<string, number>;
    average_events: number;
    events_today: number;
    events_by_type: Record<string, number>;
    critical_alerts: number;
    alerts_today: number;
    total_alerts: number;
    contact_messages_today: number;
    uploads_today: number;
};
