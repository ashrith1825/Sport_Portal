package com.sportportal.repository;

import com.sportportal.entity.Journal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalRepository extends JpaRepository<Journal, Long> {

    List<Journal> findByAuthorId(Long authorId);

    List<Journal> findBySportTypeIgnoreCase(String sportType);

    List<Journal> findByTitleContainingIgnoreCase(String keyword);

    List<Journal> findAllByOrderByCreatedAtDesc();
}
