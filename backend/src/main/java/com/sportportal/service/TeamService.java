package com.sportportal.service;

import com.sportportal.dto.TeamDto;
import com.sportportal.dto.UserDto;
import com.sportportal.entity.Club;
import com.sportportal.entity.Team;
import com.sportportal.entity.User;
import com.sportportal.exception.BadRequestException;
import com.sportportal.exception.ResourceNotFoundException;
import com.sportportal.repository.TeamRepository;
import com.sportportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final ClubService clubService;
    private final UserService userService;
    private final UserRepository userRepository;

    public List<TeamDto> getTeamsByClub(Long clubId) {
        return teamRepository.findByClubId(clubId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public TeamDto getTeamById(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public TeamDto createTeam(TeamDto dto) {
        Club club = clubService.findById(dto.getClubId());
        User captain = userService.getCurrentUser();

        Team team = Team.builder()
                .name(dto.getName())
                .club(club)
                .captain(captain)
                .build();
        team.getMembers().add(captain);
        teamRepository.save(team);
        return toDto(team);
    }

    @Transactional
    public TeamDto addMember(Long teamId, Long userId) {
        Team team = findById(teamId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (team.getMembers().contains(user)) {
            throw new BadRequestException("User is already a team member");
        }
        team.getMembers().add(user);
        teamRepository.save(team);
        return toDto(team);
    }

    @Transactional
    public TeamDto removeMember(Long teamId, Long userId) {
        Team team = findById(teamId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!team.getMembers().contains(user)) {
            throw new BadRequestException("User is not a team member");
        }
        team.getMembers().remove(user);
        teamRepository.save(team);
        return toDto(team);
    }

    @Transactional
    public void deleteTeam(Long id) {
        Team team = findById(id);
        User user = userService.getCurrentUser();
        if (!team.getCaptain().getId().equals(user.getId())
                && !team.getClub().getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("Only team captain or club owner can delete a team");
        }
        teamRepository.delete(team);
    }

    private Team findById(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", id));
    }

    private TeamDto toDto(Team team) {
        List<UserDto> memberDtos = team.getMembers().stream()
                .map(userService::toDto)
                .collect(Collectors.toList());

        return TeamDto.builder()
                .id(team.getId())
                .name(team.getName())
                .clubId(team.getClub().getId())
                .clubName(team.getClub().getName())
                .captainId(team.getCaptain() != null ? team.getCaptain().getId() : null)
                .captainUsername(team.getCaptain() != null ? team.getCaptain().getUsername() : null)
                .members(memberDtos)
                .createdAt(team.getCreatedAt())
                .build();
    }
}
