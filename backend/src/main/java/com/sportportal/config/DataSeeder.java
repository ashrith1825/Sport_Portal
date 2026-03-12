package com.sportportal.config;

import com.sportportal.entity.*;
import com.sportportal.repository.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final JournalRepository journalRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {

        log.info("Running data seeder...");

        /*
         ─────────────────────────────────────────────
         Ensure admin user exists first
         ─────────────────────────────────────────────
        */

        User admin = userRepository.findByUsername("sportadmin")
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .username("sportadmin")
                                .email("admin@sportportal.com")
                                .password(passwordEncoder.encode("Admin@123"))
                                .firstName("Sport")
                                .lastName("Admin")
                                .bio("Platform administrator.")
                                .role(Role.ROLE_ADMIN)
                                .active(true)
                                .build()
                ));

        if (admin.getFriendCode() == null) {
            admin.generateFriendCode();
            userRepository.save(admin);
        }

        /*
         ─────────────────────────────────────────────
         Fix orphaned records safely
         ─────────────────────────────────────────────
        */

        try {

            int fixedEvents = entityManager.createNativeQuery(
                    "UPDATE events SET organizer_id = :adminId " +
                    "WHERE organizer_id NOT IN (SELECT id FROM users)")
                    .setParameter("adminId", admin.getId())
                    .executeUpdate();

            int fixedClubs = entityManager.createNativeQuery(
                    "UPDATE clubs SET owner_id = :adminId " +
                    "WHERE owner_id NOT IN (SELECT id FROM users)")
                    .setParameter("adminId", admin.getId())
                    .executeUpdate();

            int fixedJournals = entityManager.createNativeQuery(
                    "UPDATE journals SET author_id = :adminId " +
                    "WHERE author_id NOT IN (SELECT id FROM users)")
                    .setParameter("adminId", admin.getId())
                    .executeUpdate();

            if (fixedEvents + fixedClubs + fixedJournals > 0) {
                log.info("Fixed orphan records → events:{}, clubs:{}, journals:{}",
                        fixedEvents, fixedClubs, fixedJournals);
            }

        } catch (Exception e) {
            log.warn("Skipping orphan cleanup: {}", e.getMessage());
        }

        /*
         ─────────────────────────────────────────────
         Generate friend codes if missing
         ─────────────────────────────────────────────
        */

        userRepository.findAll().forEach(user -> {
            if (user.getFriendCode() == null || user.getFriendCode().isBlank()) {
                user.generateFriendCode();
                userRepository.save(user);
            }
        });

        /*
         ─────────────────────────────────────────────
         Stop if data already exists
         ─────────────────────────────────────────────
        */

        if (clubRepository.count() > 0 ||
                eventRepository.count() > 0 ||
                journalRepository.count() > 0) {

            log.info("Seed data already exists — skipping creation.");
            return;
        }

        log.info("Seeding database with sample data...");

        /*
         ─────────────────────────────────────────────
         Clubs
         ─────────────────────────────────────────────
        */

        Club soccerClub = clubRepository.save(
                Club.builder()
                        .name("City Football Club")
                        .description("Competitive football club.")
                        .sportType("Football")
                        .owner(admin)
                        .build()
        );

        Club basketballClub = clubRepository.save(
                Club.builder()
                        .name("Downtown Basketball Association")
                        .description("Pickup games and tournaments.")
                        .sportType("Basketball")
                        .owner(admin)
                        .build()
        );

        /*
         ─────────────────────────────────────────────
         Events
         ─────────────────────────────────────────────
        */

        eventRepository.save(
                Event.builder()
                        .title("Spring Football Championship")
                        .sportType("Football")
                        .location("City Sports Complex")
                        .latitude(40.7580)
                        .longitude(-73.9855)
                        .eventDate(LocalDateTime.now().plusDays(10))
                        .endDate(LocalDateTime.now().plusDays(10).plusHours(6))
                        .maxParticipants(120)
                        .status(EventStatus.UPCOMING)
                        .organizer(admin)
                        .build()
        );

        eventRepository.save(
                Event.builder()
                        .title("Street Basketball Tournament")
                        .sportType("Basketball")
                        .location("Downtown Court")
                        .latitude(40.7831)
                        .longitude(-73.9712)
                        .eventDate(LocalDateTime.now().plusDays(20))
                        .endDate(LocalDateTime.now().plusDays(20).plusHours(6))
                        .maxParticipants(60)
                        .status(EventStatus.UPCOMING)
                        .organizer(admin)
                        .build()
        );

        /*
         ─────────────────────────────────────────────
         Journals
         ─────────────────────────────────────────────
        */

        journalRepository.save(
                Journal.builder()
                        .title("First Football Season")
                        .content("Joining City Football Club was amazing...")
                        .sportType("Football")
                        .author(admin)
                        .build()
        );

        journalRepository.save(
                Journal.builder()
                        .title("Training for a Marathon")
                        .content("10 week running training plan...")
                        .sportType("Running")
                        .author(admin)
                        .build()
        );

        log.info("Seed completed → clubs:{}, events:{}, journals:{}",
                clubRepository.count(),
                eventRepository.count(),
                journalRepository.count());
    }
}