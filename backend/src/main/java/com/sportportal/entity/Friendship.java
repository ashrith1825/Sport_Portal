package com.sportportal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "friendships", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "friend_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Friendship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "friend_id", nullable = false)
    private User friend;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FriendshipStatus status = FriendshipStatus.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
