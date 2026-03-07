package com.sportportal.repository;

import com.sportportal.entity.Event;
import com.sportportal.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByOrganizerId(Long organizerId);

    List<Event> findByStatus(EventStatus status);

    List<Event> findBySportTypeIgnoreCase(String sportType);

    List<Event> findByEventDateAfterOrderByEventDateAsc(LocalDateTime date);

    List<Event> findByTitleContainingIgnoreCase(String keyword);
}
