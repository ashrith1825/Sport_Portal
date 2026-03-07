package com.sportportal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "events")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    private String sportType;

    private String location;

    private Double latitude;
    private Double longitude;

    @NotNull
    private LocalDateTime eventDate;

    private LocalDateTime endDate;

    private Integer maxParticipants;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EventStatus status = EventStatus.UPCOMING;

    /* ---- Relationships ---- */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @ManyToMany
    @JoinTable(
            name = "event_participants",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> participants = new HashSet<>();

    /* ---- Timestamps ---- */

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
