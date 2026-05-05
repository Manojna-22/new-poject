package com.hmi.alarm.dto;

import com.hmi.alarm.entity.AlarmEvent;
import com.hmi.alarm.entity.AlarmState;
import com.hmi.alarm.entity.Severity;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public class AlarmEventDto {

    public static class CreateRequest {
        @NotNull(message = "alarmId is required")
        private Long alarmId;

        @NotNull(message = "state is required")
        private AlarmState state;

        @Size(max = 500)
        private String note;

        public Long getAlarmId() { return alarmId; }
        public void setAlarmId(Long alarmId) { this.alarmId = alarmId; }

        public AlarmState getState() { return state; }
        public void setState(AlarmState state) { this.state = state; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }

    public static class AcknowledgeRequest {
        @Size(max = 500)
        private String note;
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }

    public static class Response {
        private Long id;
        private Long alarmId;
        private String alarmCode;
        private String alarmMessage;
        private Severity severity;
        private Instant ts;
        private AlarmState state;
        private String acknowledgedBy;
        private Instant acknowledgedAt;
        private String note;

        public static Response from(AlarmEvent e) {
            Response r = new Response();
            r.id = e.getId();
            r.alarmId = e.getAlarm().getId();
            r.alarmCode = e.getAlarm().getCode();
            r.alarmMessage = e.getAlarm().getMessage();
            r.severity = e.getAlarm().getSeverity();
            r.ts = e.getTs();
            r.state = e.getState();
            r.acknowledgedBy = e.getAcknowledgedBy();
            r.acknowledgedAt = e.getAcknowledgedAt();
            r.note = e.getNote();
            return r;
        }

        public Long getId() { return id; }
        public Long getAlarmId() { return alarmId; }
        public String getAlarmCode() { return alarmCode; }
        public String getAlarmMessage() { return alarmMessage; }
        public Severity getSeverity() { return severity; }
        public Instant getTs() { return ts; }
        public AlarmState getState() { return state; }
        public String getAcknowledgedBy() { return acknowledgedBy; }
        public Instant getAcknowledgedAt() { return acknowledgedAt; }
        public String getNote() { return note; }
    }
}
