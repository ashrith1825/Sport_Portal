package com.sportportal.service;

import com.sportportal.dto.JournalDto;
import com.sportportal.entity.Journal;
import com.sportportal.entity.User;
import com.sportportal.exception.BadRequestException;
import com.sportportal.exception.ResourceNotFoundException;
import com.sportportal.repository.JournalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalRepository journalRepository;
    private final UserService userService;

    public List<JournalDto> getAllJournals() {
        return journalRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public JournalDto getJournalById(Long id) {
        return toDto(findById(id));
    }

    public List<JournalDto> getJournalsBySport(String sportType) {
        return journalRepository.findBySportTypeIgnoreCase(sportType)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<JournalDto> searchJournals(String keyword) {
        return journalRepository.findByTitleContainingIgnoreCase(keyword)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<JournalDto> getMyJournals() {
        User user = userService.getCurrentUser();
        return journalRepository.findByAuthorId(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public JournalDto createJournal(JournalDto dto) {
        User author = userService.getCurrentUser();
        Journal journal = Journal.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .sportType(dto.getSportType())
                .imageUrl(dto.getImageUrl())
                .author(author)
                .build();
        journalRepository.save(journal);
        return toDto(journal);
    }

    @Transactional
    public JournalDto updateJournal(Long id, JournalDto dto) {
        Journal journal = findById(id);
        User user = userService.getCurrentUser();
        if (!journal.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You can only update your own journals");
        }
        journal.setTitle(dto.getTitle());
        journal.setContent(dto.getContent());
        journal.setSportType(dto.getSportType());
        if (dto.getImageUrl() != null) journal.setImageUrl(dto.getImageUrl());
        journalRepository.save(journal);
        return toDto(journal);
    }

    @Transactional
    public void deleteJournal(Long id) {
        Journal journal = findById(id);
        User user = userService.getCurrentUser();
        if (!journal.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own journals");
        }
        journalRepository.delete(journal);
    }

    private Journal findById(Long id) {
        return journalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journal", "id", id));
    }

    private JournalDto toDto(Journal journal) {
        return JournalDto.builder()
                .id(journal.getId())
                .title(journal.getTitle())
                .content(journal.getContent())
                .sportType(journal.getSportType())
                .imageUrl(journal.getImageUrl())
                .authorId(journal.getAuthor().getId())
                .authorUsername(journal.getAuthor().getUsername())
                .createdAt(journal.getCreatedAt())
                .updatedAt(journal.getUpdatedAt())
                .build();
    }
}
