package com.hmi.alarm.service;

import com.hmi.alarm.dto.AlarmEventDto;
import com.hmi.alarm.entity.AlarmEvent;
import com.hmi.alarm.entity.AlarmState;
import com.hmi.alarm.exception.ResourceNotFoundException;
import com.hmi.alarm.repository.AlarmEventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AlarmEventService {

    private final AlarmEventRepository alarmEventRepository;
    private final AlarmService alarmService;

    public AlarmEventService(AlarmEventRepository alarmEventRepository, AlarmService alarmService) {
        this.alarmEventRepository = alarmEventRepository;
        this.alarmService = alarmService;
    }

    @Transactional
    public AlarmEventDto.Response create(AlarmEventDto.CreateRequest req, String currentUser) {
        AlarmEvent event = switch (req.getState()) {
            case ACTIVE -> alarmService.raise(req.getAlarmId(), req.getNote());
            case ACKNOWLEDGED -> alarmService.acknowledge(req.getAlarmId(), currentUser, req.getNote());
            case CLEARED -> alarmService.clear(req.getAlarmId(), req.getNote());
        };
        return AlarmEventDto.Response.from(event);
    }

    @Transactional
    public AlarmEventDto.Response acknowledge(Long alarmId, String currentUser, String note) {
        AlarmEvent event = alarmService.acknowledge(alarmId, currentUser, note);
        return AlarmEventDto.Response.from(event);
    }

    @Transactional(readOnly = true)
    public Page<AlarmEventDto.Response> list(AlarmState state, Pageable pageable) {
        Page<AlarmEvent> page = (state == null)
                ? alarmEventRepository.findAll(pageable)
                : alarmEventRepository.findByState(state, pageable);
        return page.map(AlarmEventDto.Response::from);
    }

    @Transactional(readOnly = true)
    public AlarmEventDto.Response getById(Long id) {
        AlarmEvent e = alarmEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
        return AlarmEventDto.Response.from(e);
    }

    @Transactional
    public void delete(Long id) {
        AlarmEvent e = alarmEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
        alarmEventRepository.delete(e);
    }
}
