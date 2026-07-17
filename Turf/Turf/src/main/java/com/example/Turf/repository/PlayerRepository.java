package com.example.Turf.repository;

import com.example.Turf.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlayerRepository extends JpaRepository<Player, Long> {
    List<Player> findByUserId(Long userId);
}
