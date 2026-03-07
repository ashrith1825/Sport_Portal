package com.sportportal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "clubs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    private String sportType;

    private String logoUrl;

    /* ---- Relationships ---- */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToMany
    @JoinTable(
            name = "club_members",
            joinColumns = @JoinColumn(name = "club_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> members = new HashSet<>();

    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Team> teams = new HashSet<>();

    /* ---- Timestamps ---- */

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
