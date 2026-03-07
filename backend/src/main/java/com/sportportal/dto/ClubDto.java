package com.sportportal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ClubDto {
    private Long id;

    @NotBlank
    private String name;

    private String description;

    @NotBlank
    private String sportType;

    private String logoUrl;

    // Read-only
    private Long ownerId;
    private String ownerUsername;
    private int memberCount;
    private int teamCount;
    private List<Long> memberIds;
    private LocalDateTime createdAt;
}
