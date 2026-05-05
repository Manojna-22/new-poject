package com.hmi.alarm.repository;

import com.hmi.alarm.entity.Alarm;
import com.hmi.alarm.entity.AlarmEvent;
import com.hmi.alarm.entity.AlarmState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlarmEventRepository extends JpaRepository<AlarmEvent, Long> {

    Page<AlarmEvent> findByState(AlarmState state, Pageable pageable);

    long countByState(AlarmState state);

    @Query("SELECT e FROM AlarmEvent e WHERE e.alarm = :alarm ORDER BY e.ts DESC")
    List<AlarmEvent> findLatestByAlarm(@Param("alarm") Alarm alarm, Pageable pageable);

    /**
     * Latest event for a given alarm (used to compute current state).
     */
    @Query("SELECT e FROM AlarmEvent e WHERE e.alarm.id = :alarmId ORDER BY e.ts DESC")
    List<AlarmEvent> findLatestByAlarmId(@Param("alarmId") Long alarmId, Pageable pageable);

    default Optional<AlarmEvent> findLatestForAlarm(Long alarmId, Pageable topOne) {
        List<AlarmEvent> list = findLatestByAlarmId(alarmId, topOne);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
