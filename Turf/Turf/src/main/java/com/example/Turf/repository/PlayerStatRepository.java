package com.example.Turf.repository;

import com.example.Turf.model.PlayerStat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlayerStatRepository extends JpaRepository<PlayerStat, Long> {
    List<PlayerStat> findByMatchId(Long matchId);
    PlayerStat findByMatchIdAndPlayerName(Long matchId, String playerName);
}
