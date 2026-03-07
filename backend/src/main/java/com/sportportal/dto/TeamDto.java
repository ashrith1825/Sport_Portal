package com.sportportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TeamDto {
    private Long id;

    @NotBlank
    private String name;

    @NotNull
    private Long clubId;

    private String clubName;
    private Long captainId;
    private String captainUsername;
    private List<UserDto> members;
    private LocalDateTime createdAt;
}
