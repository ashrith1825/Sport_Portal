package com.sportportal.controller;

import com.sportportal.dto.ApiResponse;
import com.sportportal.dto.TeamDto;
import com.sportportal.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<TeamDto>> getTeamsByClub(@PathVariable Long clubId) {
        return ResponseEntity.ok(teamService.getTeamsByClub(clubId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamDto> getTeamById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @PostMapping
    public ResponseEntity<TeamDto> createTeam(@Valid @RequestBody TeamDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.createTeam(dto));
    }

    @PostMapping("/{teamId}/members/{userId}")
    public ResponseEntity<TeamDto> addMember(@PathVariable Long teamId, @PathVariable Long userId) {
        return ResponseEntity.ok(teamService.addMember(teamId, userId));
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<TeamDto> removeMember(@PathVariable Long teamId, @PathVariable Long userId) {
        return ResponseEntity.ok(teamService.removeMember(teamId, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.ok(new ApiResponse(true, "Team deleted successfully"));
    }
}
