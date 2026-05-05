package com.hmi.alarm.controller;

import com.hmi.alarm.dto.AlarmEventDto;
import com.hmi.alarm.dto.MessageResponse;
import com.hmi.alarm.entity.AlarmState;
import com.hmi.alarm.security.UserDetailsImpl;
import com.hmi.alarm.service.AlarmEventService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class AlarmEventController {

    private final AlarmEventService alarmEventService;

    public AlarmEventController(AlarmEventService alarmEventService) {
        this.alarmEventService = alarmEventService;
    }

    @GetMapping
    public ResponseEntity<Page<AlarmEventDto.Response>> list(
            @RequestParam(required = false) AlarmState state,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "ts") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        page = Math.max(0, page);
        size = Math.min(Math.max(size, 1), 200);

        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(alarmEventService.list(state, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlarmEventDto.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(alarmEventService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_OPERATOR')")
    public ResponseEntity<AlarmEventDto.Response> create(
            @Valid @RequestBody AlarmEventDto.CreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(alarmEventService.create(request, currentUser.getUsername()));
    }

    /** Convenience endpoint for the AckButton in the UI. */
    @PostMapping("/acknowledge/{alarmId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_OPERATOR')")
    public ResponseEntity<AlarmEventDto.Response> acknowledge(
            @PathVariable Long alarmId,
            @Valid @RequestBody(required = false) AlarmEventDto.AcknowledgeRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        String note = request == null ? null : request.getNote();
        return ResponseEntity.ok(alarmEventService.acknowledge(alarmId, currentUser.getUsername(), note));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        alarmEventService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Event deleted successfully"));
    }
}
