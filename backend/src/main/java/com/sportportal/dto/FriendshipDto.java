package com.sportportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FriendshipDto {
    private Long id;
    private Long userId;
    private String username;
    private Long friendId;
    private String friendUsername;
    private String status;
    private LocalDateTime createdAt;
}
