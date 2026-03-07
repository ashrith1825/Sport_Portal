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

        // ── Fix orphaned events (events with missing organizers) ──────────
        int orphanedEventsFixed = entityManager.createNativeQuery(
            "UPDATE events e SET e.organizer_id = (SELECT MIN(id) FROM users WHERE role = 'ROLE_ADMIN') " +
            "WHERE e.organizer_id NOT IN (SELECT id FROM users)"
        ).executeUpdate();
        if (orphanedEventsFixed > 0) {
            log.info("Fixed {} orphaned events", orphanedEventsFixed);
        }
        
        // Also fix orphaned clubs and journals
        entityManager.createNativeQuery(
            "UPDATE clubs c SET c.owner_id = (SELECT MIN(id) FROM users WHERE role = 'ROLE_ADMIN') " +
            "WHERE c.owner_id NOT IN (SELECT id FROM users)"
        ).executeUpdate();
        entityManager.createNativeQuery(
            "UPDATE journals j SET j.author_id = (SELECT MIN(id) FROM users WHERE role = 'ROLE_ADMIN') " +
            "WHERE j.author_id NOT IN (SELECT id FROM users)"
        ).executeUpdate();

        // ── Generate friend codes for users that don't have them ──────────
        userRepository.findAll().forEach(user -> {
            if (user.getFriendCode() == null || user.getFriendCode().isEmpty()) {
                user.generateFriendCode();
                userRepository.save(user);
                log.info("Generated friend code {} for user {}", user.getFriendCode(), user.getUsername());
            }
        });

        // ── Create seed user (or reuse existing) ──────────────────────────
        User seedUser = userRepository.findByUsername("sportadmin")
                .map(existing -> {
                    // Ensure existing user has correct password and active flag
                    existing.setPassword(passwordEncoder.encode("Admin@123"));
                    existing.setActive(true);
                    if (existing.getFriendCode() == null) existing.generateFriendCode();
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .username("sportadmin")
                        .email("admin@sportportal.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .firstName("Sport")
                        .lastName("Admin")
                        .bio("Platform administrator and sports enthusiast.")
                        .role(Role.ROLE_ADMIN)
                        .active(true)
                        .build()));

        if (clubRepository.count() > 0 || eventRepository.count() > 0 || journalRepository.count() > 0) {
            log.info("Seed data already exists — updating events with coordinates if missing.");
            
            // Update existing events with coordinates if they don't have them
            // Also fix any events with missing organizers
            eventRepository.findAll().forEach(event -> {
                try {
                    // Check if organizer exists - if not, assign to admin
                    if (event.getOrganizer() == null || event.getOrganizer().getId() == null) {
                        event.setOrganizer(seedUser);
                    }
                    
                    if (event.getLatitude() == null || event.getLongitude() == null) {
                        // Assign default coordinates based on event title or use fallback
                        switch (event.getTitle()) {
                            case "Spring Football Championship 2026" -> { event.setLatitude(40.7580); event.setLongitude(-73.9855); }
                            case "3-on-3 Basketball Streetball Showdown" -> { event.setLatitude(40.7831); event.setLongitude(-73.9712); }
                            case "Tennis Singles Open" -> { event.setLatitude(40.7484); event.setLongitude(-73.9857); }
                            case "Swim-a-Thon Charity Relay" -> { event.setLatitude(40.7614); event.setLongitude(-73.9776); }
                            case "Weekend Cricket Blast — T20 Edition" -> { event.setLatitude(40.6892); event.setLongitude(-74.0445); }
                            case "City Marathon 2026" -> { event.setLatitude(40.7128); event.setLongitude(-74.0060); }
                            default -> { event.setLatitude(40.7580 + Math.random() * 0.1 - 0.05); event.setLongitude(-73.9855 + Math.random() * 0.1 - 0.05); }
                        }
                        eventRepository.save(event);
                        log.info("Updated coordinates for event: {}", event.getTitle());
                    }
                } catch (Exception e) {
                    log.warn("Could not update event {}: {}", event.getId(), e.getMessage());
                }
            });
            return;
        }

        log.info("Seeding database with sample data...");

        // ── Clubs ─────────────────────────────────────────────────────────
        Club soccerClub = clubRepository.save(Club.builder()
                .name("City Football Club")
                .description("A competitive football club for players of all skill levels. We train twice a week and participate in local leagues every season.")
                .sportType("Football")
                .logoUrl("https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400")
                .owner(seedUser)
                .build());

        Club basketballClub = clubRepository.save(Club.builder()
                .name("Downtown Basketball Association")
                .description("Join us for pickup games, tournaments, and skill development sessions. Open to beginners and experienced players alike.")
                .sportType("Basketball")
                .logoUrl("https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400")
                .owner(seedUser)
                .build());

        Club tennisClub = clubRepository.save(Club.builder()
                .name("Ace Tennis Club")
                .description("Premium tennis club offering coaching, round-robins, and inter-club competitions. Courts available for members year-round.")
                .sportType("Tennis")
                .logoUrl("https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400")
                .owner(seedUser)
                .build());

        Club swimmingClub = clubRepository.save(Club.builder()
                .name("AquaStroke Swimming Club")
                .description("Swim training programs for fitness and competition. Lap swimming, stroke clinics, and open-water events throughout the year.")
                .sportType("Swimming")
                .logoUrl("https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400")
                .owner(seedUser)
                .build());

        Club cricketClub = clubRepository.save(Club.builder()
                .name("Premier Cricket League")
                .description("Weekend cricket matches, net practice sessions, and annual tournaments. All formats — T20, ODI, and Test style matches.")
                .sportType("Cricket")
                .logoUrl("https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400")
                .owner(seedUser)
                .build());

        // ── Events ────────────────────────────────────────────────────────
        eventRepository.save(Event.builder()
                .title("Spring Football Championship 2026")
                .description("Annual inter-club football tournament with teams from across the city. Prizes for top 3 teams. Registration closes one week before the event.")
                .sportType("Football")
                .location("City Sports Complex, Main Ground")
                .latitude(40.7580)
                .longitude(-73.9855)
                .eventDate(LocalDateTime.of(2026, 4, 15, 9, 0))
                .endDate(LocalDateTime.of(2026, 4, 15, 18, 0))
                .maxParticipants(120)
                .status(EventStatus.UPCOMING)
                .organizer(seedUser)
                .build());

        eventRepository.save(Event.builder()
                .title("3-on-3 Basketball Streetball Showdown")
                .description("Fast-paced 3v3 basketball tournament played outdoors. Single elimination format. Cash prizes and trophies for winners.")
                .sportType("Basketball")
                .location("Riverside Outdoor Courts")
                .latitude(40.7831)
                .longitude(-73.9712)
                .eventDate(LocalDateTime.of(2026, 3, 22, 10, 0))
                .endDate(LocalDateTime.of(2026, 3, 22, 17, 0))
                .maxParticipants(48)
                .status(EventStatus.UPCOMING)
                .organizer(seedUser)
                .build());

        eventRepository.save(Event.builder()
                .title("Tennis Singles Open")
                .description("Open-level singles tournament for club members and guests. Best-of-three sets. Refreshments and lunch provided.")
                .sportType("Tennis")
                .location("Ace Tennis Club, Courts 1-6")
                .latitude(40.7484)
                .longitude(-73.9857)
                .eventDate(LocalDateTime.of(2026, 5, 10, 8, 30))
                .endDate(LocalDateTime.of(2026, 5, 10, 16, 0))
                .maxParticipants(32)
                .status(EventStatus.UPCOMING)
                .organizer(seedUser)
                .build());

        eventRepository.save(Event.builder()
                .title("Swim-a-Thon Charity Relay")
                .description("Swim relay event raising funds for local youth sports programs. Teams of 4 compete in medley and freestyle relays.")
                .sportType("Swimming")
                .location("Municipal Aquatic Center")
                .latitude(40.7614)
                .longitude(-73.9776)
                .eventDate(LocalDateTime.of(2026, 4, 5, 7, 0))
                .endDate(LocalDateTime.of(2026, 4, 5, 13, 0))
                .maxParticipants(80)
                .status(EventStatus.UPCOMING)
                .organizer(seedUser)
                .build());

        eventRepository.save(Event.builder()
                .title("Weekend Cricket Blast — T20 Edition")
                .description("Fast-format T20 cricket matches every weekend. Team registrations open. Umpires and streaming provided.")
                .sportType("Cricket")
                .location("Greenfield Cricket Stadium")
                .latitude(40.6892)
                .longitude(-74.0445)
                .eventDate(LocalDateTime.of(2026, 3, 28, 14, 0))
                .endDate(LocalDateTime.of(2026, 3, 29, 18, 0))
                .maxParticipants(100)
                .status(EventStatus.UPCOMING)
                .organizer(seedUser)
                .build());

        eventRepository.save(Event.builder()
                .title("City Marathon 2026")
                .description("Full and half-marathon through scenic downtown routes. Chip-timed, finisher medals, and hydration stations every 3 km.")
                .sportType("Running")
                .location("City Hall Start Line")
                .latitude(40.7128)
                .longitude(-74.0060)
                .eventDate(LocalDateTime.of(2026, 6, 1, 6, 0))
                .endDate(LocalDateTime.of(2026, 6, 1, 14, 0))
                .maxParticipants(500)
                .status(EventStatus.UPCOMING)
                .organizer(seedUser)
                .build());

        // ── Journals ──────────────────────────────────────────────────────
        journalRepository.save(Journal.builder()
                .title("My First Football Season — Lessons Learned")
                .content("Joining City Football Club was the best decision I made this year. As someone who hadn't played competitively since high school, I was nervous stepping onto the pitch for the first practice. But the coaches and teammates were incredibly welcoming.\n\nOver the 12-week season, I improved my stamina, passing accuracy, and game awareness. The biggest takeaway? Consistency beats talent when talent doesn't show up consistently. We finished third in the local league — not bad for a rebuilt squad!\n\nTips for newcomers:\n- Don't skip warm-ups. Seriously.\n- Communication on the field is half the game.\n- Celebrate small wins with your team.")
                .sportType("Football")
                .imageUrl("https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600")
                .author(seedUser)
                .build());

        journalRepository.save(Journal.builder()
                .title("Training for a Half Marathon — Week-by-Week Guide")
                .content("After years of casual jogging, I decided to sign up for the City Marathon half-marathon distance. Here's how my 10-week training plan went:\n\n**Weeks 1-3:** Base building — 3 runs per week, 5K-8K distances. Focus on conversational pace.\n**Weeks 4-6:** Tempo runs introduced. One long run per week pushed to 12K. Started hill repeats.\n**Weeks 7-9:** Peak mileage. Long run hit 18K. Added speed intervals on Tuesdays.\n**Week 10:** Taper week. Reduced volume by 40%, focused on rest and nutrition.\n\nRace day result: 1:52:34 — smashed my goal of sub-2 hours! The key was trusting the process and not overtraining.")
                .sportType("Running")
                .imageUrl("https://images.unsplash.com/photo-1461896836934-bd45ba688509?w=600")
                .author(seedUser)
                .build());

        journalRepository.save(Journal.builder()
                .title("Basketball Drills That Actually Improved My Game")
                .content("I've been playing recreational basketball for three years, but I plateaued hard. Here are the five drills that finally broke through:\n\n1. **Mikan Drill** — Simple layup drill alternating hands. Did 50 per session. My finishing at the rim went from ~60% to ~80%.\n2. **Full-court dribble series** — Crossovers, behind-the-back, hesitations at each cone. Handles feel entirely different now.\n3. **Spot-up shooting (catch & shoot)** — 10 shots from 5 spots. Track percentage weekly.\n4. **Defensive slides** — 30 seconds on, 15 off, 6 sets. Lateral quickness improved noticeably.\n5. **Free throws under fatigue** — Shoot 10 after sprints. Simulates game pressure.\n\nConsistency over two months made all the difference.")
                .sportType("Basketball")
                .imageUrl("https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600")
                .author(seedUser)
                .build());

        journalRepository.save(Journal.builder()
                .title("Why I Switched from Gym to Swimming — And Never Looked Back")
                .content("After 5 years of weight training, I was dealing with recurring joint pain and workout monotony. A friend convinced me to try lap swimming, and within a month I was hooked.\n\nBenefits I noticed:\n- **Joint-friendly:** Zero impact. My knees and shoulders actually feel better.\n- **Full-body workout:** Every stroke engages arms, core, and legs simultaneously.\n- **Mental clarity:** Something about being in water quiets the mind. It's almost meditative.\n- **Cardiovascular gains:** My resting heart rate dropped from 72 to 61 in three months.\n\nI now swim 4 days a week — freestyle and backstroke primarily. I've signed up for the Swim-a-Thon Charity Relay in April. If you're burned out on the gym, give the pool a chance.")
                .sportType("Swimming")
                .imageUrl("https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600")
                .author(seedUser)
                .build());

        journalRepository.save(Journal.builder()
                .title("Cricket Strategy: Reading the Game Like a Captain")
                .content("Captaining our club's T20 side this season taught me more about cricket than a decade of batting practice. Here are the strategic lessons:\n\n**Field placement is everything.** Study each batter's wagon wheel from previous innings. Move fielders proactively, not reactively.\n\n**Bowling changes win matches.** Don't wait for a bowler to get hammered. Rotate early, keep batters guessing.\n\n**Powerplay aggression.** In T20, the first 6 overs set the tempo. Use your best new-ball bowlers even if they're also your death bowlers — worry about the end later.\n\n**Run-rate pressure.** In the chase, even 1-2 dot balls in a row creates panic. Defensive fields during those moments amplify the pressure.\n\nWe won 7 of 10 matches this season. Cricket is a thinking person's game.")
                .sportType("Cricket")
                .imageUrl("https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600")
                .author(seedUser)
                .build());

        journalRepository.save(Journal.builder()
                .title("Beginner's Guide to Tennis — Gear, Grips, and Groundstrokes")
                .content("Starting tennis can be overwhelming with all the gear options and technique advice out there. Here's what I wish someone told me on day one:\n\n**Racket:** Don't spend $300 on your first racket. A mid-range ($80-120) pre-strung racket with a larger head size (100+ sq in) is perfect for learning.\n\n**Grips:** Learn the Eastern forehand grip first — it's the most versatile for beginners. The Continental grip is essential for serves and volleys.\n\n**Groundstrokes:** Focus on consistent contact point and follow-through before adding power. Rally 100 balls in a row before worrying about winners.\n\n**Footwork:** Tennis is 70% footwork. Split-step before every shot. Get to the ball early rather than reaching.\n\n**Serve:** Start with a flat serve. Toss slightly in front of your hitting shoulder. The motion is more like throwing than hitting.\n\nSix months in, I can rally confidently and even won a few club matches!")
                .sportType("Tennis")
                .imageUrl("https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600")
                .author(seedUser)
                .build());

        log.info("Seed data loaded: {} clubs, {} events, {} journals",
                clubRepository.count(), eventRepository.count(), journalRepository.count());
    }
}
