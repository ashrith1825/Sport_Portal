package com.sportportal.controller;

import com.sportportal.dto.ApiResponse;
import com.sportportal.dto.FriendshipDto;
import com.sportportal.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*") 
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @PostMapping("/request/{friendId}")
    public ResponseEntity<FriendshipDto> sendFriendRequest(@PathVariable Long friendId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(friendshipService.sendFriendRequest(friendId));
    }

    @PostMapping("/request/code/{friendCode}")
    public ResponseEntity<FriendshipDto> sendFriendRequestByCode(@PathVariable String friendCode) {
        return ResponseEntity.status(HttpStatus.CREATED).body(friendshipService.sendFriendRequestByCode(friendCode));
    }

    @PutMapping("/accept/{friendshipId}")
    public ResponseEntity<FriendshipDto> acceptFriendRequest(@PathVariable Long friendshipId) {
        return ResponseEntity.ok(friendshipService.acceptFriendRequest(friendshipId));
    }

    @PutMapping("/reject/{friendshipId}")
    public ResponseEntity<FriendshipDto> rejectFriendRequest(@PathVariable Long friendshipId) {
        return ResponseEntity.ok(friendshipService.rejectFriendRequest(friendshipId));
    }

    @GetMapping
    public ResponseEntity<List<FriendshipDto>> getMyFriends() {
        return ResponseEntity.ok(friendshipService.getMyFriends());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<FriendshipDto>> getPendingRequests() {
        return ResponseEntity.ok(friendshipService.getPendingRequests());
    }

    @DeleteMapping("/{friendshipId}")
    public ResponseEntity<ApiResponse> removeFriend(@PathVariable Long friendshipId) {
        friendshipService.removeFriend(friendshipId);
        return ResponseEntity.ok(new ApiResponse(true, "Friend removed successfully"));
    }
}
