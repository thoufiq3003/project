package com.example.Turf.repository;

import com.example.Turf.model.SavedTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavedTeamRepository extends JpaRepository<SavedTeam, Long> {
    List<SavedTeam> findByUserId(Long userId);
}