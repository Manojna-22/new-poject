package com.hmi.alarm.dto;

import com.hmi.alarm.entity.Alarm;
import com.hmi.alarm.entity.AlarmState;
import com.hmi.alarm.entity.Severity;

import java.time.Instant;

public class AlarmResponse {

    private Long id;
    private String code;
    private String message;
    private Severity severity;
    private AlarmState currentState;
    private Long latestEventId;
    private Instant latestEventTs;
    private String acknowledgedBy;
    private Instant createdAt;
    private Instant updatedAt;

    public static AlarmResponse from(Alarm alarm, AlarmState currentState,
                                     Long latestEventId, Instant latestEventTs,
                                     String acknowledgedBy) {
        AlarmResponse r = new AlarmResponse();
        r.id = alarm.getId();
        r.code = alarm.getCode();
        r.message = alarm.getMessage();
        r.severity = alarm.getSeverity();
        r.currentState = currentState;
        r.latestEventId = latestEventId;
        r.latestEventTs = latestEventTs;
        r.acknowledgedBy = acknowledgedBy;
        r.createdAt = alarm.getCreatedAt();
        r.updatedAt = alarm.getUpdatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getMessage() { return message; }
    public Severity getSeverity() { return severity; }
    public AlarmState getCurrentState() { return currentState; }
    public Long getLatestEventId() { return latestEventId; }
    public Instant getLatestEventTs() { return latestEventTs; }
    public String getAcknowledgedBy() { return acknowledgedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
