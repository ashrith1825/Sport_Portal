package com.sportportal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "friendCode")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(min = 3, max = 50)
    private String username;

    @NotBlank @Email @Size(max = 100)
    private String email;

    @NotBlank @Size(min = 6, max = 120)
    private String password;

    @Column(unique = true, length = 8)
    private String friendCode;

    @Size(max = 50)
    private String firstName;

    @Size(max = 50)
    private String lastName;

    private String phone;

    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private Role role = Role.ROLE_USER;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /* ---- Relationships ---- */

    @ManyToMany(mappedBy = "participants")
    @Builder.Default
    private Set<Event> joinedEvents = new HashSet<>();

    @ManyToMany(mappedBy = "members")
    @Builder.Default
    private Set<Club> joinedClubs = new HashSet<>();

    @ManyToMany(mappedBy = "members")
    @Builder.Default
    private Set<Team> joinedTeams = new HashSet<>();

    /* ---- Timestamps ---- */

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    public void generateFriendCode() {
        if (this.friendCode == null || this.friendCode.isEmpty()) {
            this.friendCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
}
