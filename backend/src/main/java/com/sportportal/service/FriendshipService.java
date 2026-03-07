package com.sportportal.service;

import com.sportportal.dto.FriendshipDto;
import com.sportportal.entity.Friendship;
import com.sportportal.entity.FriendshipStatus;
import com.sportportal.entity.User;
import com.sportportal.exception.BadRequestException;
import com.sportportal.exception.ResourceNotFoundException;
import com.sportportal.repository.FriendshipRepository;
import com.sportportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public FriendshipDto sendFriendRequest(Long friendId) {
        User currentUser = userService.getCurrentUser();
        if (currentUser.getId().equals(friendId)) {
            throw new BadRequestException("Cannot send friend request to yourself");
        }

        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", friendId));

        Optional<Friendship> existing = friendshipRepository.findByUserIds(currentUser.getId(), friendId);
        if (existing.isPresent()) {
            throw new BadRequestException("Friendship already exists or request pending");
        }

        Friendship friendship = Friendship.builder()
                .user(currentUser)
                .friend(friend)
                .status(FriendshipStatus.PENDING)
                .build();
        friendshipRepository.save(friendship);
        return toDto(friendship);
    }

    @Transactional
    public FriendshipDto sendFriendRequestByCode(String friendCode) {
        User currentUser = userService.getCurrentUser();
        User friend = userRepository.findByFriendCode(friendCode.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "friendCode", friendCode));

        if (currentUser.getId().equals(friend.getId())) {
            throw new BadRequestException("Cannot send friend request to yourself");
        }

        Optional<Friendship> existing = friendshipRepository.findByUserIds(currentUser.getId(), friend.getId());
        if (existing.isPresent()) {
            throw new BadRequestException("Friendship already exists or request pending");
        }

        Friendship friendship = Friendship.builder()
                .user(currentUser)
                .friend(friend)
                .status(FriendshipStatus.PENDING)
                .build();
        friendshipRepository.save(friendship);
        return toDto(friendship);
    }

    @Transactional
    public FriendshipDto acceptFriendRequest(Long friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship", "id", friendshipId));
        User currentUser = userService.getCurrentUser();

        if (!friendship.getFriend().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only accept requests sent to you");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        friendshipRepository.save(friendship);
        return toDto(friendship);
    }

    @Transactional
    public FriendshipDto rejectFriendRequest(Long friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship", "id", friendshipId));
        User currentUser = userService.getCurrentUser();

        if (!friendship.getFriend().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only reject requests sent to you");
        }

        friendship.setStatus(FriendshipStatus.REJECTED);
        friendshipRepository.save(friendship);
        return toDto(friendship);
    }

    public List<FriendshipDto> getMyFriends() {
        User currentUser = userService.getCurrentUser();
        return friendshipRepository.findAllByUserIdAndStatus(currentUser.getId(), FriendshipStatus.ACCEPTED)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<FriendshipDto> getPendingRequests() {
        User currentUser = userService.getCurrentUser();
        return friendshipRepository.findPendingRequestsForUser(currentUser.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public void removeFriend(Long friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship", "id", friendshipId));
        friendshipRepository.delete(friendship);
    }

    private FriendshipDto toDto(Friendship f) {
        return FriendshipDto.builder()
                .id(f.getId())
                .userId(f.getUser().getId())
                .username(f.getUser().getUsername())
                .friendId(f.getFriend().getId())
                .friendUsername(f.getFriend().getUsername())
                .status(f.getStatus().name())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
