package com.hmi.alarm.dto;

import com.hmi.alarm.entity.Severity;

import java.util.Map;

public class StatsResponse {
    private long total;
    private long active;
    private long acknowledged;
    private long cleared;
    private Map<Severity, Long> bySeverity;

    public StatsResponse(long total, long active, long acknowledged, long cleared, Map<Severity, Long> bySeverity) {
        this.total = total;
        this.active = active;
        this.acknowledged = acknowledged;
        this.cleared = cleared;
        this.bySeverity = bySeverity;
    }

    public long getTotal() { return total; }
    public long getActive() { return active; }
    public long getAcknowledged() { return acknowledged; }
    public long getCleared() { return cleared; }
    public Map<Severity, Long> getBySeverity() { return bySeverity; }
}
