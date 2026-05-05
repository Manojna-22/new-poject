package com.hmi.alarm.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "alarm_events", indexes = {
        @Index(name = "idx_event_alarm", columnList = "alarm_id"),
        @Index(name = "idx_event_state", columnList = "state"),
        @Index(name = "idx_event_ts", columnList = "ts")
})
public class AlarmEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "alarm_id", nullable = false)
    private Alarm alarm;

    @Column(name = "ts", nullable = false)
    private Instant ts;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlarmState state;

    @Column(name = "acknowledged_by", length = 50)
    private String acknowledgedBy;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

    @Column(name = "note", length = 500)
    private String note;

    @PrePersist
    void prePersist() {
        if (ts == null) ts = Instant.now();
    }

    public AlarmEvent() {}

    public AlarmEvent(Alarm alarm, AlarmState state) {
        this.alarm = alarm;
        this.state = state;
        this.ts = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Alarm getAlarm() { return alarm; }
    public void setAlarm(Alarm alarm) { this.alarm = alarm; }

    public Instant getTs() { return ts; }
    public void setTs(Instant ts) { this.ts = ts; }

    public AlarmState getState() { return state; }
    public void setState(AlarmState state) { this.state = state; }

    public String getAcknowledgedBy() { return acknowledgedBy; }
    public void setAcknowledgedBy(String acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }

    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(Instant acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AlarmEvent e)) return false;
        return Objects.equals(id, e.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }
}
