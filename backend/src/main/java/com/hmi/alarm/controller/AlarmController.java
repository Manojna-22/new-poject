package com.hmi.alarm.controller;

import com.hmi.alarm.dto.AlarmRequest;
import com.hmi.alarm.dto.AlarmResponse;
import com.hmi.alarm.dto.MessageResponse;
import com.hmi.alarm.dto.StatsResponse;
import com.hmi.alarm.entity.Severity;
import com.hmi.alarm.service.AlarmService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alarms")
public class AlarmController {

    private final AlarmService alarmService;

    public AlarmController(AlarmService alarmService) {
        this.alarmService = alarmService;
    }

    /** List alarms (any authenticated user). */
    @GetMapping
    public ResponseEntity<Page<AlarmResponse>> list(
            @RequestParam(required = false) Severity severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        page = Math.max(0, page);
        size = Math.min(Math.max(size, 1), 100);

        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(alarmService.list(severity, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlarmResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(alarmService.getById(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> stats() {
        return ResponseEntity.ok(alarmService.getStats());
    }

    /** Add an alarm - both ADMIN and OPERATOR can add. */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_OPERATOR')")
    public ResponseEntity<AlarmResponse> create(@Valid @RequestBody AlarmRequest request) {
        return ResponseEntity.ok(alarmService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_OPERATOR')")
    public ResponseEntity<AlarmResponse> update(@PathVariable Long id, @Valid @RequestBody AlarmRequest request) {
        return ResponseEntity.ok(alarmService.update(id, request));
    }

    /** Delete - ADMIN only. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        alarmService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Alarm deleted successfully"));
    }
}
