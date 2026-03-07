package com.sportportal.service;

import com.sportportal.dto.ClubDto;
import com.sportportal.entity.Club;
import com.sportportal.entity.User;
import com.sportportal.exception.BadRequestException;
import com.sportportal.exception.ResourceNotFoundException;
import com.sportportal.repository.ClubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRepository clubRepository;
    private final UserService userService;

    public List<ClubDto> getAllClubs() {
        return clubRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public ClubDto getClubById(Long id) {
        return toDto(findById(id));
    }

    public List<ClubDto> getClubsBySport(String sportType) {
        return clubRepository.findBySportTypeIgnoreCase(sportType)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ClubDto> searchClubs(String keyword) {
        return clubRepository.findByNameContainingIgnoreCase(keyword)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ClubDto> getMyClubs() {
        User user = userService.getCurrentUser();
        return clubRepository.findByMembersId(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ClubDto createClub(ClubDto dto) {
        User owner = userService.getCurrentUser();
        Club club = Club.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .sportType(dto.getSportType())
                .logoUrl(dto.getLogoUrl())
                .owner(owner)
                .build();
        club.getMembers().add(owner); // Owner is auto-member
        clubRepository.save(club);
        return toDto(club);
    }

    @Transactional
    public ClubDto updateClub(Long id, ClubDto dto) {
        Club club = findById(id);
        User user = userService.getCurrentUser();
        if (!club.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("You can only update your own clubs");
        }
        club.setName(dto.getName());
        club.setDescription(dto.getDescription());
        club.setSportType(dto.getSportType());
        if (dto.getLogoUrl() != null) club.setLogoUrl(dto.getLogoUrl());
        clubRepository.save(club);
        return toDto(club);
    }

    @Transactional
    public void deleteClub(Long id) {
        Club club = findById(id);
        User user = userService.getCurrentUser();
        if (!club.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own clubs");
        }
        clubRepository.delete(club);
    }

    @Transactional
    public ClubDto joinClub(Long clubId) {
        Club club = findById(clubId);
        User user = userService.getCurrentUser();
        if (club.getMembers().contains(user)) {
            throw new BadRequestException("You are already a member of this club");
        }
        club.getMembers().add(user);
        clubRepository.save(club);
        return toDto(club);
    }

    @Transactional
    public ClubDto leaveClub(Long clubId) {
        Club club = findById(clubId);
        User user = userService.getCurrentUser();
        if (club.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("Owner cannot leave the club. Transfer ownership or delete the club.");
        }
        if (!club.getMembers().contains(user)) {
            throw new BadRequestException("You are not a member of this club");
        }
        club.getMembers().remove(user);
        clubRepository.save(club);
        return toDto(club);
    }

    public Club findById(Long id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club", "id", id));
    }

    private ClubDto toDto(Club club) {
        return ClubDto.builder()
                .id(club.getId())
                .name(club.getName())
                .description(club.getDescription())
                .sportType(club.getSportType())
                .logoUrl(club.getLogoUrl())
                .ownerId(club.getOwner().getId())
                .ownerUsername(club.getOwner().getUsername())
                .memberCount(club.getMembers().size())
                .teamCount(club.getTeams().size())
                .memberIds(club.getMembers().stream().map(User::getId).collect(Collectors.toList()))
                .createdAt(club.getCreatedAt())
                .build();
    }
}
