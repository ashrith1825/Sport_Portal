package com.sportportal.service;

import com.sportportal.dto.UserDto;
import com.sportportal.entity.User;
import com.sportportal.exception.ResourceNotFoundException;
import com.sportportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    public UserDto getCurrentUserDto() {
        return toDto(getCurrentUser());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return toDto(user);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateProfile(UserDto dto) {
        User user = getCurrentUser();
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getBio() != null) user.setBio(dto.getBio());
        if (dto.getAvatarUrl() != null) user.setAvatarUrl(dto.getAvatarUrl());
        userRepository.save(user);
        return toDto(user);
    }

    public UserDto getUserByFriendCode(String friendCode) {
        User user = userRepository.findByFriendCode(friendCode.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "friendCode", friendCode));
        return toDto(user);
    }

    public UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .friendCode(user.getFriendCode())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
