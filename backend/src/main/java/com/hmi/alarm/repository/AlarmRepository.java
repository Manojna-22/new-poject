package com.hmi.alarm.repository;

import com.hmi.alarm.entity.Alarm;
import com.hmi.alarm.entity.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlarmRepository extends JpaRepository<Alarm, Long> {

    Optional<Alarm> findByCode(String code);

    boolean existsByCode(String code);

    Page<Alarm> findBySeverity(Severity severity, Pageable pageable);

    long countBySeverity(Severity severity);
}
