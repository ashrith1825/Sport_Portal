package com.sportportal.repository;

import com.sportportal.entity.Friendship;
import com.sportportal.entity.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    @Query("SELECT f FROM Friendship f WHERE (f.user.id = :uid AND f.friend.id = :fid) OR (f.user.id = :fid AND f.friend.id = :uid)")
    Optional<Friendship> findByUserIds(@Param("uid") Long userId, @Param("fid") Long friendId);

    @Query("SELECT f FROM Friendship f WHERE (f.user.id = :uid OR f.friend.id = :uid) AND f.status = :status")
    List<Friendship> findAllByUserIdAndStatus(@Param("uid") Long userId, @Param("status") FriendshipStatus status);

    @Query("SELECT f FROM Friendship f WHERE f.friend.id = :uid AND f.status = 'PENDING'")
    List<Friendship> findPendingRequestsForUser(@Param("uid") Long userId);
}
