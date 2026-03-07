package com.sportportal.repository;

import com.sportportal.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    List<Club> findByOwnerId(Long ownerId);

    List<Club> findByMembersId(Long userId);

    List<Club> findBySportTypeIgnoreCase(String sportType);

    List<Club> findByNameContainingIgnoreCase(String keyword);
}
