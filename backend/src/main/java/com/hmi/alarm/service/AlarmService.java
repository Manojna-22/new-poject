package com.hmi.alarm.service;

import com.hmi.alarm.dto.AlarmRequest;
import com.hmi.alarm.dto.AlarmResponse;
import com.hmi.alarm.dto.StatsResponse;
import com.hmi.alarm.entity.*;
import com.hmi.alarm.exception.BadRequestException;
import com.hmi.alarm.exception.ResourceNotFoundException;
import com.hmi.alarm.repository.AlarmEventRepository;
import com.hmi.alarm.repository.AlarmRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.EnumMap;
import java.util.Map;

/**
 * Core domain service for managing alarms.
 * Implements the OOP requirement of Raise() / Clear() / Acknowledge() operations
 * which produce immutable AlarmEvent records (event-sourced state).
 */
@Service
public class AlarmService {

    private static final Logger log = LoggerFactory.getLogger(AlarmService.class);

    private final AlarmRepository alarmRepository;
    private final AlarmEventRepository alarmEventRepository;

    public AlarmService(AlarmRepository alarmRepository, AlarmEventRepository alarmEventRepository) {
        this.alarmRepository = alarmRepository;
        this.alarmEventRepository = alarmEventRepository;
    }

    /* -------------------- CRUD -------------------- */

    @Transactional
    public AlarmResponse create(AlarmRequest req) {
        if (alarmRepository.existsByCode(req.getCode())) {
            throw new BadRequestException("Alarm code already exists: " + req.getCode());
        }
        Alarm alarm = new Alarm(req.getCode(), req.getMessage(), req.getSeverity());
        alarm = alarmRepository.save(alarm);
        log.info("Alarm created id={} code={} severity={}", alarm.getId(), alarm.getCode(), alarm.getSeverity());
        return toResponse(alarm);
    }

    @Transactional
    public AlarmResponse update(Long id, AlarmRequest req) {
        Alarm alarm = alarmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alarm not found: " + id));

        if (!alarm.getCode().equals(req.getCode()) && alarmRepository.existsByCode(req.getCode())) {
            throw new BadRequestException("Alarm code already exists: " + req.getCode());
        }
        alarm.setCode(req.getCode());
        alarm.setMessage(req.getMessage());
        alarm.setSeverity(req.getSeverity());
        alarm = alarmRepository.save(alarm);
        return toResponse(alarm);
    }

    @Transactional
    public void delete(Long id) {
        Alarm alarm = alarmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alarm not found: " + id));
        alarmRepository.delete(alarm);
        log.info("Alarm deleted id={}", id);
    }

    @Transactional(readOnly = true)
    public AlarmResponse getById(Long id) {
        Alarm alarm = alarmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alarm not found: " + id));
        return toResponse(alarm);
    }

    @Transactional(readOnly = true)
    public Page<AlarmResponse> list(Severity severity, Pageable pageable) {
        Page<Alarm> page = (severity == null)
                ? alarmRepository.findAll(pageable)
                : alarmRepository.findBySeverity(severity, pageable);
        return page.map(this::toResponse);
    }

    /* -------------------- Domain operations -------------------- */

    /**
     * Raise an alarm - generates an ACTIVE event.
     * Idempotent: raising an already-active alarm just creates another ACTIVE event (audit trail).
     */
    @Transactional
    public AlarmEvent raise(Long alarmId, String note) {
        Alarm alarm = alarmRepository.findById(alarmId)
                .orElseThrow(() -> new ResourceNotFoundException("Alarm not found: " + alarmId));
        AlarmEvent event = new AlarmEvent(alarm, AlarmState.ACTIVE);
        event.setNote(note);
        event = alarmEventRepository.save(event);
        log.info("Alarm RAISED id={} code={}", alarm.getId(), alarm.getCode());
        return event;
    }

    /**
     * Acknowledge an alarm - generates an ACKNOWLEDGED event.
     */
    @Transactional
    public AlarmEvent acknowledge(Long alarmId, String acknowledgedBy, String note) {
        Alarm alarm = alarmRepository.findById(alarmId)
                .orElseThrow(() -> new ResourceNotFoundException("Alarm not found: " + alarmId));

        AlarmState current = currentStateOf(alarm.getId());
        if (current != AlarmState.ACTIVE) {
            throw new BadRequestException("Only ACTIVE alarms can be acknowledged. Current state: " + current);
        }
        AlarmEvent event = new AlarmEvent(alarm, AlarmState.ACKNOWLEDGED);
        event.setAcknowledgedBy(acknowledgedBy);
        event.setAcknowledgedAt(Instant.now());
        event.setNote(note);
        event = alarmEventRepository.save(event);
        log.info("Alarm ACK id={} code={} by={}", alarm.getId(), alarm.getCode(), acknowledgedBy);
        return event;
    }

    /**
     * Clear an alarm - generates a CLEARED event.
     */
    @Transactional
    public AlarmEvent clear(Long alarmId, String note) {
        Alarm alarm = alarmRepository.findById(alarmId)
                .orElseThrow(() -> new ResourceNotFoundException("Alarm not found: " + alarmId));
        AlarmEvent event = new AlarmEvent(alarm, AlarmState.CLEARED);
        event.setNote(note);
        event = alarmEventRepository.save(event);
        log.info("Alarm CLEARED id={} code={}", alarm.getId(), alarm.getCode());
        return event;
    }

    /* -------------------- Stats / Queries -------------------- */

    @Transactional(readOnly = true)
    public StatsResponse getStats() {
        long total = alarmRepository.count();
        long active = alarmEventRepository.countByState(AlarmState.ACTIVE);
        long acknowledged = alarmEventRepository.countByState(AlarmState.ACKNOWLEDGED);
        long cleared = alarmEventRepository.countByState(AlarmState.CLEARED);

        Map<Severity, Long> bySeverity = new EnumMap<>(Severity.class);
        for (Severity s : Severity.values()) {
            bySeverity.put(s, alarmRepository.countBySeverity(s));
        }
        return new StatsResponse(total, active, acknowledged, cleared, bySeverity);
    }

    /* -------------------- Helpers -------------------- */

    private AlarmState currentStateOf(Long alarmId) {
        return alarmEventRepository.findLatestForAlarm(alarmId, PageRequest.of(0, 1))
                .map(AlarmEvent::getState)
                .orElse(AlarmState.CLEARED); // no events => treat as cleared/inactive
    }

    private AlarmResponse toResponse(Alarm alarm) {
        return alarmEventRepository.findLatestForAlarm(alarm.getId(), PageRequest.of(0, 1))
                .map(e -> AlarmResponse.from(alarm, e.getState(), e.getId(), e.getTs(), e.getAcknowledgedBy()))
                .orElseGet(() -> AlarmResponse.from(alarm, AlarmState.CLEARED, null, null, null));
    }
}
