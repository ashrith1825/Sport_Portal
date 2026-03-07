package com.sportportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String friendCode;
    private String firstName;
    private String lastName;
    private String phone;
    private String avatarUrl;
    private String bio;
    private String role;
    private LocalDateTime createdAt;
}
