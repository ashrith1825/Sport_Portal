package com.sportportal.controller;

import com.sportportal.dto.UserDto;
import com.sportportal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*") 
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserDto());
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UserDto dto) {
        return ResponseEntity.ok(userService.updateProfile(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/code/{friendCode}")
    public ResponseEntity<UserDto> getUserByFriendCode(@PathVariable String friendCode) {
        return ResponseEntity.ok(userService.getUserByFriendCode(friendCode));
    }
}
